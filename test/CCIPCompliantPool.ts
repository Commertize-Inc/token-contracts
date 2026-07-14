import { expect } from "chai";
import hre from "hardhat";

const { ethers } = await hre.network.connect();

describe("CCIP Bridged Token Suite", function () {
	let admin: any;
	let verifiedUser: any;
	let unverifiedUser: any;
	let exemptPool: any;
	let rmnProxy: any;
	let router: any;
	let identityRegistry: any;
	let tokenCompliance: any;
	let bridgedToken: any;

	before(async function () {
		[admin, verifiedUser, unverifiedUser, exemptPool, rmnProxy, router] =
			await ethers.getSigners();

		const IdentityRegistry =
			await ethers.getContractFactory("IdentityRegistry");
		identityRegistry = await IdentityRegistry.deploy(admin.address);
		await identityRegistry.waitForDeployment();

		const TokenCompliance = await ethers.getContractFactory("TokenCompliance");
		tokenCompliance = await TokenCompliance.deploy(
			identityRegistry.target,
			admin.address
		);
		await tokenCompliance.waitForDeployment();

		await identityRegistry.registerIdentity(
			verifiedUser.address,
			840,
			ethers.keccak256(ethers.toUtf8Bytes("KYC"))
		);
	});

	describe("PropertyToken CCT readiness", function () {
		it("exposes getCCIPAdmin() returning the owner", async function () {
			const PropertyToken = await ethers.getContractFactory("PropertyToken");
			const token = await PropertyToken.deploy(
				"Prop",
				"PROP",
				1000n,
				tokenCompliance.target,
				verifiedUser.address
			);
			await token.waitForDeployment();
			expect(await token.getCCIPAdmin()).to.equal(verifiedUser.address);
		});

		it("still blocks zero-value transfers between unverified parties", async function () {
			const PropertyToken = await ethers.getContractFactory("PropertyToken");
			const token = await PropertyToken.deploy(
				"Prop",
				"PROP",
				1000n,
				tokenCompliance.target,
				verifiedUser.address
			);
			await token.waitForDeployment();
			await expect(
				token.connect(unverifiedUser).transfer(admin.address, 0n)
			).to.be.revertedWith("Compliance: Transfer not allowed");
		});
	});

	describe("BridgedPropertyToken (mint-and-freeze)", function () {
		before(async function () {
			const BridgedPropertyToken = await ethers.getContractFactory(
				"BridgedPropertyToken"
			);
			bridgedToken = await BridgedPropertyToken.deploy(
				"Bridged Prop",
				"bPROP",
				tokenCompliance.target,
				admin.address
			);
			await bridgedToken.waitForDeployment();
			const MINTER_ROLE = await bridgedToken.MINTER_ROLE();
			await bridgedToken.grantRole(MINTER_ROLE, admin.address);
		});

		it("deploys with zero supply without owner verification", async function () {
			expect(await bridgedToken.totalSupply()).to.equal(0n);
		});

		it("mints to a VERIFIED receiver", async function () {
			await bridgedToken.mint(verifiedUser.address, 500n);
			expect(await bridgedToken.balanceOf(verifiedUser.address)).to.equal(500n);
		});

		it("mints to an UNVERIFIED receiver (CCIP delivery must not revert)", async function () {
			// This is the crux: the bridge must deliver exactly `amount` to the
			// receiver or CCIP's OffRamp reverts (ReleaseOrMintBalanceMismatch).
			await bridgedToken.mint(unverifiedUser.address, 300n);
			expect(await bridgedToken.balanceOf(unverifiedUser.address)).to.equal(
				300n
			);
		});

		it("freezes the unverified receiver: they cannot transfer until verified", async function () {
			await expect(
				bridgedToken.connect(unverifiedUser).transfer(verifiedUser.address, 1n)
			).to.be.revertedWith("Compliance: Transfer not allowed");

			// After verification the same transfer succeeds.
			await identityRegistry.registerIdentity(
				unverifiedUser.address,
				840,
				ethers.keccak256(ethers.toUtf8Bytes("KYC"))
			);
			await bridgedToken
				.connect(unverifiedUser)
				.transfer(verifiedUser.address, 100n);
			expect(await bridgedToken.balanceOf(verifiedUser.address)).to.equal(600n);
			// reset state for later tests
			await identityRegistry.removeIdentity(unverifiedUser.address);
		});

		it("rejects mint from an address without MINTER_ROLE", async function () {
			await expect(
				bridgedToken.connect(unverifiedUser).mint(verifiedUser.address, 100n)
			).to.be.revertedWithCustomError(
				bridgedToken,
				"AccessControlUnauthorizedAccount"
			);
		});

		it("burn(uint256) requires BURNER_ROLE and burns caller balance", async function () {
			await expect(
				bridgedToken.connect(verifiedUser)["burn(uint256)"](1n)
			).to.be.revertedWithCustomError(
				bridgedToken,
				"AccessControlUnauthorizedAccount"
			);
			const BURNER_ROLE = await bridgedToken.BURNER_ROLE();
			await bridgedToken.grantRole(BURNER_ROLE, admin.address);
			await bridgedToken.mint(admin.address, 100n); // mint-and-freeze: admin unverified, still delivered
			await bridgedToken["burn(uint256)"](40n);
			expect(await bridgedToken.balanceOf(admin.address)).to.equal(60n);
		});

		it("burn(address,uint256) spends allowance (no confiscation)", async function () {
			await expect(
				bridgedToken["burn(address,uint256)"](verifiedUser.address, 100n)
			).to.be.revertedWithCustomError(
				bridgedToken,
				"ERC20InsufficientAllowance"
			);
			await bridgedToken.connect(verifiedUser).approve(admin.address, 100n);
			await bridgedToken["burn(address,uint256)"](verifiedUser.address, 100n);
			expect(await bridgedToken.balanceOf(verifiedUser.address)).to.equal(500n);
			expect(
				await bridgedToken.allowance(verifiedUser.address, admin.address)
			).to.equal(0n);
		});

		it("outbound: only a verified holder can transfer to the (exempt) pool", async function () {
			await tokenCompliance.setExempt(exemptPool.address, true);
			// verified holder can send to the pool
			await bridgedToken
				.connect(verifiedUser)
				.transfer(exemptPool.address, 50n);
			expect(await bridgedToken.balanceOf(exemptPool.address)).to.equal(50n);
			// an unverified holder cannot (they hold frozen tokens)
			await bridgedToken.mint(unverifiedUser.address, 10n); // delivered but frozen
			await expect(
				bridgedToken.connect(unverifiedUser).transfer(exemptPool.address, 10n)
			).to.be.revertedWith("Compliance: Transfer not allowed");
		});
	});

	describe("CompliantPropertyTokenPool (source-side gating)", function () {
		let pool: any;

		before(async function () {
			const Pool = await ethers.getContractFactory(
				"CompliantPropertyTokenPool"
			);
			pool = await Pool.deploy(
				bridgedToken.target,
				18,
				[],
				rmnProxy.address,
				router.address
			);
			await pool.waitForDeployment();
		});

		it("constructs against the bridged token (decimals + wiring)", async function () {
			expect(await pool.getToken()).to.equal(bridgedToken.target);
		});

		function lockOrBurnIn(receiverAddr: string) {
			return {
				receiver: ethers.AbiCoder.defaultAbiCoder().encode(
					["address"],
					[receiverAddr]
				),
				remoteChainSelector: 1n,
				originalSender: verifiedUser.address,
				amount: 100n,
				localToken: bridgedToken.target,
			};
		}

		it("rejects bridging to an UNVERIFIED destination receiver (before burn)", async function () {
			await expect(
				pool.lockOrBurn.staticCall(lockOrBurnIn(unverifiedUser.address))
			)
				.to.be.revertedWithCustomError(pool, "ReceiverNotVerified")
				.withArgs(unverifiedUser.address);
		});

		it("rejects a non-EVM (non-32-byte) receiver", async function () {
			const badIn = {
				...lockOrBurnIn(verifiedUser.address),
				receiver: "0x1234", // 2 bytes
			};
			await expect(
				pool.lockOrBurn.staticCall(badIn)
			).to.be.revertedWithCustomError(pool, "NonEvmReceiver");
		});

		it("lets a VERIFIED receiver past the gate (then hits CCIP onRamp auth, not our gate)", async function () {
			// Our compliance gate passes for a verified receiver; the call then
			// reverts inside the base's _validateLockOrBurn because this test
			// signer is not a registered CCIP onRamp — proving the gate let it
			// through rather than rejecting on compliance.
			await expect(
				pool.lockOrBurn.staticCall(lockOrBurnIn(verifiedUser.address))
			).to.not.be.revertedWithCustomError(pool, "ReceiverNotVerified");
		});

		it("lets an EXEMPT receiver past the gate", async function () {
			await expect(
				pool.lockOrBurn.staticCall(lockOrBurnIn(exemptPool.address))
			).to.not.be.revertedWithCustomError(pool, "ReceiverNotVerified");
		});
	});
});
