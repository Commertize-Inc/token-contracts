import { expect } from "chai";
import hre from "hardhat";

const { ethers } = await hre.network.connect();

const KYC = () => ethers.keccak256(ethers.toUtf8Bytes("KYC"));

describe("Cross-chain Identity Sync", function () {
	let admin: any;
	let user: any;
	let outsider: any;
	let routerSigner: any; // stands in for the CCIP router calling ccipReceive
	let identityRegistry: any;

	before(async function () {
		[admin, user, outsider, routerSigner] = await ethers.getSigners();
		const IdentityRegistry =
			await ethers.getContractFactory("IdentityRegistry");
		identityRegistry = await IdentityRegistry.deploy(admin.address);
		await identityRegistry.waitForDeployment();
	});

	describe("IdentityRegistry SYNC_ROLE", function () {
		it("admin registration still works via registerIdentity", async function () {
			await identityRegistry.registerIdentity(user.address, 840, KYC());
			expect(await identityRegistry.isVerified(user.address)).to.equal(true);
			await identityRegistry.removeIdentity(user.address);
			expect(await identityRegistry.isVerified(user.address)).to.equal(false);
		});

		it("syncRegisterIdentity requires SYNC_ROLE", async function () {
			await expect(
				identityRegistry
					.connect(outsider)
					.syncRegisterIdentity(user.address, 840, KYC())
			).to.be.revertedWithCustomError(
				identityRegistry,
				"AccessControlUnauthorizedAccount"
			);
		});

		it("a SYNC_ROLE holder can mirror register/remove", async function () {
			const SYNC_ROLE = await identityRegistry.SYNC_ROLE();
			await identityRegistry.grantRole(SYNC_ROLE, admin.address);
			await identityRegistry.syncRegisterIdentity(user.address, 840, KYC());
			expect(await identityRegistry.isVerified(user.address)).to.equal(true);
			await identityRegistry.syncRemoveIdentity(user.address);
			expect(await identityRegistry.isVerified(user.address)).to.equal(false);
			await identityRegistry.revokeRole(SYNC_ROLE, admin.address);
		});
	});

	describe("IdentitySyncReceiver", function () {
		let receiver: any;
		const SOURCE_SELECTOR = 3478487238524512106n;
		const trustedSenderAddr = "0x00000000000000000000000000000000000000A1";

		before(async function () {
			const Receiver = await ethers.getContractFactory("IdentitySyncReceiver");
			// router = routerSigner so we can invoke ccipReceive as the router
			receiver = await Receiver.deploy(
				routerSigner.address,
				identityRegistry.target,
				admin.address
			);
			await receiver.waitForDeployment();
			// grant the receiver SYNC_ROLE on the registry
			const SYNC_ROLE = await identityRegistry.SYNC_ROLE();
			await identityRegistry.grantRole(SYNC_ROLE, receiver.target);
			await receiver.setTrustedSender(SOURCE_SELECTOR, trustedSenderAddr);
		});

		function message(senderAddr: string, data: string) {
			return {
				messageId: ethers.ZeroHash,
				sourceChainSelector: SOURCE_SELECTOR,
				sender: ethers.AbiCoder.defaultAbiCoder().encode(
					["address"],
					[senderAddr]
				),
				data,
				destTokenAmounts: [],
			};
		}

		function payload(isRemoval: boolean, userAddr: string, country: number) {
			return ethers.AbiCoder.defaultAbiCoder().encode(
				["bool", "address", "uint16", "bytes32"],
				[isRemoval, userAddr, country, KYC()]
			);
		}

		it("rejects a call from a non-router caller", async function () {
			await expect(
				receiver
					.connect(outsider)
					.ccipReceive(
						message(trustedSenderAddr, payload(false, user.address, 840))
					)
			).to.be.revertedWithCustomError(receiver, "InvalidRouter");
		});

		it("rejects a message from an untrusted sender", async function () {
			await expect(
				receiver
					.connect(routerSigner)
					.ccipReceive(
						message(outsider.address, payload(false, user.address, 840))
					)
			).to.be.revertedWithCustomError(receiver, "UntrustedSource");
		});

		it("mirrors a registration from the trusted sender", async function () {
			await receiver
				.connect(routerSigner)
				.ccipReceive(
					message(trustedSenderAddr, payload(false, user.address, 840))
				);
			expect(await identityRegistry.isVerified(user.address)).to.equal(true);
		});

		it("mirrors a removal from the trusted sender", async function () {
			await receiver
				.connect(routerSigner)
				.ccipReceive(
					message(trustedSenderAddr, payload(true, user.address, 0))
				);
			expect(await identityRegistry.isVerified(user.address)).to.equal(false);
		});
	});

	describe("IdentitySyncSender", function () {
		let sender: any;
		let mockRouter: any;
		const SEL_A = 111n;
		const SEL_B = 222n;
		const recvA = "0x00000000000000000000000000000000000000B1";
		const recvB = "0x00000000000000000000000000000000000000B2";
		const FEE = ethers.parseEther("0.01");

		before(async function () {
			const MockRouter = await ethers.getContractFactory("MockCCIPRouter");
			mockRouter = await MockRouter.deploy(FEE);
			await mockRouter.waitForDeployment();

			const Sender = await ethers.getContractFactory("IdentitySyncSender");
			// native fee (feeToken = address(0))
			sender = await Sender.deploy(
				mockRouter.target,
				ethers.ZeroAddress,
				admin.address
			);
			await sender.waitForDeployment();
		});

		it("only owner can set destinations", async function () {
			await expect(
				sender.connect(outsider).setDestination(SEL_A, recvA)
			).to.be.revertedWithCustomError(sender, "OwnableUnauthorizedAccount");
		});

		it("reverts broadcast with no destinations", async function () {
			await expect(
				sender.broadcastRegister(user.address, 840, KYC())
			).to.be.revertedWithCustomError(sender, "NoDestinations");
		});

		it("broadcasts to all destinations and refunds native surplus", async function () {
			await sender.setDestination(SEL_A, recvA);
			await sender.setDestination(SEL_B, recvB);
			expect(await sender.destinationCount()).to.equal(2n);

			const before = await mockRouter.sendCount();
			// send more than 2*FEE; expect exact 2*FEE consumed, remainder refunded
			await sender.broadcastRegister(user.address, 840, KYC(), {
				value: FEE * 3n,
			});
			expect(await mockRouter.sendCount()).to.equal(before + 2n);
			// router keeps only the two exact fees
			expect(await ethers.provider.getBalance(mockRouter.target)).to.equal(
				FEE * 2n
			);
			// sender holds nothing (surplus refunded, fees forwarded)
			expect(await ethers.provider.getBalance(sender.target)).to.equal(0n);
		});

		it("reverts when native value cannot cover the fees", async function () {
			await expect(
				sender.broadcastRegister(user.address, 840, KYC(), { value: FEE })
			).to.be.revertedWithCustomError(sender, "InsufficientNativeFee");
		});

		it("enforces maxFeePerMessage across the loop", async function () {
			await sender.setMaxFeePerMessage(FEE); // exactly the current fee is ok
			await sender.broadcastRegister(user.address, 840, KYC(), {
				value: FEE * 2n,
			});
			// raise the router fee above the cap -> revert
			await mockRouter.setFee(FEE + 1n);
			await expect(
				sender.broadcastRegister(user.address, 840, KYC(), { value: FEE * 4n })
			).to.be.revertedWithCustomError(sender, "FeeExceedsMax");
			// reset
			await mockRouter.setFee(FEE);
			await sender.setMaxFeePerMessage(0n);
		});

		it("encodes a removal payload", async function () {
			await sender.broadcastRemove(user.address, { value: FEE * 2n });
			const decoded = ethers.AbiCoder.defaultAbiCoder().decode(
				["bool", "address", "uint16", "bytes32"],
				await mockRouter.lastData()
			);
			expect(decoded[0]).to.equal(true); // isRemoval
			expect(decoded[1]).to.equal(user.address);
		});
	});
});
