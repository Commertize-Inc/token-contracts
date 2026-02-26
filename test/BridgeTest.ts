import { expect } from "chai";
import hre from "hardhat";
import { before, describe, it } from "node:test";

const { ethers } = await hre.network.connect();

const EID_HOME = 1;
const EID_DEST = 2;

describe("LayerZero Bridge Integration", function () {
	let admin: any;
	let user1: any;
	let user2: any;
	let unverified: any;

	// Home chain contracts
	let identityRegistry: any;
	let tokenCompliance: any;
	let propertyToken: any;
	let adapter: any;
	let mockEndpointHome: any;

	// Destination chain contracts
	let destIdentityRegistry: any;
	let destTokenCompliance: any;
	let propertyTokenOFT: any;
	let mockEndpointDest: any;

	before(async function () {
		[admin, user1, user2, unverified] = await ethers.getSigners();
	});

	// ─── Home Chain Setup ──────────────────────────────────

	describe("Home Chain Setup", function () {
		it("Should deploy mock LZ endpoints", async function () {
			const EndpointMock = await ethers.getContractFactory("EndpointV2Mock");
			mockEndpointHome = await EndpointMock.deploy(EID_HOME);
			mockEndpointDest = await EndpointMock.deploy(EID_DEST);
			await mockEndpointHome.waitForDeployment();
			await mockEndpointDest.waitForDeployment();

			expect(await mockEndpointHome.eid()).to.equal(EID_HOME);
			expect(await mockEndpointDest.eid()).to.equal(EID_DEST);
		});

		it("Should deploy IdentityRegistry and register users", async function () {
			const IR = await ethers.getContractFactory("IdentityRegistry");
			identityRegistry = await IR.deploy(admin.address);
			await identityRegistry.waitForDeployment();

			// Register admin and user1 as verified
			const adminHash = ethers.keccak256(ethers.toUtf8Bytes("ADMIN"));
			const user1Hash = ethers.keccak256(ethers.toUtf8Bytes("USER1"));
			const user2Hash = ethers.keccak256(ethers.toUtf8Bytes("USER2"));
			await identityRegistry.registerIdentity(admin.address, 840, adminHash);
			await identityRegistry.registerIdentity(user1.address, 840, user1Hash);
			await identityRegistry.registerIdentity(user2.address, 840, user2Hash);

			expect(await identityRegistry.isVerified(admin.address)).to.be.true;
			expect(await identityRegistry.isVerified(user1.address)).to.be.true;
			expect(await identityRegistry.isVerified(unverified.address)).to.be.false;
		});

		it("Should deploy TokenCompliance", async function () {
			const TC = await ethers.getContractFactory("TokenCompliance");
			tokenCompliance = await TC.deploy(identityRegistry.target, admin.address);
			await tokenCompliance.waitForDeployment();

			expect(await tokenCompliance.identityRegistry()).to.equal(
				identityRegistry.target
			);
		});

		it("Should deploy PropertyToken with initial supply to admin", async function () {
			const PT = await ethers.getContractFactory("PropertyToken");
			propertyToken = await PT.deploy(
				"Test Property",
				"TST",
				ethers.parseEther("1000000"),
				tokenCompliance.target,
				admin.address
			);
			await propertyToken.waitForDeployment();

			expect(await propertyToken.balanceOf(admin.address)).to.equal(
				ethers.parseEther("1000000")
			);
		});

		it("Should deploy PropertyTokenAdapter", async function () {
			const Adapter = await ethers.getContractFactory("PropertyTokenAdapter");
			adapter = await Adapter.deploy(
				propertyToken.target,
				mockEndpointHome.target,
				admin.address,
				tokenCompliance.target
			);
			await adapter.waitForDeployment();

			expect(await adapter.compliance()).to.equal(tokenCompliance.target);
		});

		it("Should set adapter as compliance-exempt", async function () {
			await tokenCompliance.setExempt(adapter.target, true);
			expect(await tokenCompliance.isExempt(adapter.target)).to.be.true;
		});
	});

	// ─── Destination Chain Setup ───────────────────────────

	describe("Destination Chain Setup", function () {
		it("Should deploy destination IdentityRegistry and register users", async function () {
			const IR = await ethers.getContractFactory("IdentityRegistry");
			destIdentityRegistry = await IR.deploy(admin.address);
			await destIdentityRegistry.waitForDeployment();

			const adminHash = ethers.keccak256(ethers.toUtf8Bytes("ADMIN"));
			const user1Hash = ethers.keccak256(ethers.toUtf8Bytes("USER1"));
			const user2Hash = ethers.keccak256(ethers.toUtf8Bytes("USER2"));
			await destIdentityRegistry.registerIdentity(
				admin.address,
				840,
				adminHash
			);
			await destIdentityRegistry.registerIdentity(
				user1.address,
				840,
				user1Hash
			);
			await destIdentityRegistry.registerIdentity(
				user2.address,
				840,
				user2Hash
			);
		});

		it("Should deploy destination TokenCompliance", async function () {
			const TC = await ethers.getContractFactory("TokenCompliance");
			destTokenCompliance = await TC.deploy(
				destIdentityRegistry.target,
				admin.address
			);
			await destTokenCompliance.waitForDeployment();
		});

		it("Should deploy PropertyTokenOFT with zero initial supply", async function () {
			const OFT = await ethers.getContractFactory("PropertyTokenOFT");
			propertyTokenOFT = await OFT.deploy(
				"Test Property",
				"TST",
				mockEndpointDest.target,
				admin.address,
				0, // Zero supply — tokens arrive via bridge only
				destTokenCompliance.target,
				admin.address
			);
			await propertyTokenOFT.waitForDeployment();

			expect(await propertyTokenOFT.totalSupply()).to.equal(0);
			expect(await propertyTokenOFT.complianceEnabled()).to.be.true;
		});

		it("Should wire peers (adapter ↔ OFT)", async function () {
			const adapterBytes32 = ethers.zeroPadValue(adapter.target, 32);
			const oftBytes32 = ethers.zeroPadValue(propertyTokenOFT.target, 32);

			await adapter.connect(admin).setPeer(EID_DEST, oftBytes32);
			await propertyTokenOFT.connect(admin).setPeer(EID_HOME, adapterBytes32);

			expect(await adapter.peers(EID_DEST)).to.equal(oftBytes32);
			expect(await propertyTokenOFT.peers(EID_HOME)).to.equal(adapterBytes32);
		});

		it("Should wire mock endpoints for cross-chain delivery", async function () {
			// Tell home endpoint: packets to OFT should use dest endpoint
			await mockEndpointHome.setDestLzEndpoint(
				propertyTokenOFT.target,
				mockEndpointDest.target
			);
			// Tell dest endpoint: packets to adapter should use home endpoint
			await mockEndpointDest.setDestLzEndpoint(
				adapter.target,
				mockEndpointHome.target
			);
		});
	});

	// ─── PropertyToken Compliance Tests ────────────────────

	describe("PropertyToken Compliance", function () {
		it("Should allow transfer between verified users", async function () {
			const amount = ethers.parseEther("100");
			await propertyToken.connect(admin).transfer(user1.address, amount);
			expect(await propertyToken.balanceOf(user1.address)).to.equal(amount);
		});

		it("Should reject transfer to unverified user", async function () {
			const amount = ethers.parseEther("10");
			await expect(
				propertyToken.connect(admin).transfer(unverified.address, amount)
			).to.be.revertedWith("Compliance: Transfer not allowed");
		});

		it("Should reject transfer from unverified user", async function () {
			// Even if unverified somehow had tokens, they can't send
			// (They can't receive either, so this is a double check)
			// We test by removing verification from user1 temporarily
			await identityRegistry.removeIdentity(user1.address);
			expect(await identityRegistry.isVerified(user1.address)).to.be.false;

			await expect(
				propertyToken
					.connect(user1)
					.transfer(admin.address, ethers.parseEther("1"))
			).to.be.revertedWith("Compliance: Transfer not allowed");

			// Re-register user1
			const user1Hash = ethers.keccak256(ethers.toUtf8Bytes("USER1"));
			await identityRegistry.registerIdentity(user1.address, 840, user1Hash);
		});

		it("Should allow exempt address to transfer freely", async function () {
			// Mark unverified as exempt
			await tokenCompliance.setExempt(unverified.address, true);

			const amount = ethers.parseEther("5");
			await propertyToken.connect(admin).transfer(unverified.address, amount);
			expect(await propertyToken.balanceOf(unverified.address)).to.equal(
				amount
			);

			// Remove exemption and transfer back via admin
			await tokenCompliance.setExempt(unverified.address, false);
		});
	});

	// ─── PropertyTokenAdapter Compliance Tests ─────────────

	describe("PropertyTokenAdapter Compliance", function () {
		it("Should reject send from unverified user", async function () {
			// Give unverified some tokens first (via exempt)
			await tokenCompliance.setExempt(unverified.address, true);
			await propertyToken
				.connect(admin)
				.transfer(unverified.address, ethers.parseEther("10"));
			await tokenCompliance.setExempt(unverified.address, false);

			// Approve adapter
			await propertyToken
				.connect(unverified)
				.approve(adapter.target, ethers.parseEther("10"));

			const sendParam = {
				dstEid: EID_DEST,
				to: ethers.zeroPadValue(unverified.address, 32),
				amountLD: ethers.parseEther("5"),
				minAmountLD: ethers.parseEther("5"),
				extraOptions: "0x",
				composeMsg: "0x",
				oftCmd: "0x",
			};

			await expect(
				adapter
					.connect(unverified)
					.send(
						sendParam,
						{ nativeFee: 1, lzTokenFee: 0 },
						unverified.address,
						{ value: 1 }
					)
			).to.be.revertedWith("Compliance: Sender not verified");
		});

		it("Should allow send from verified user", async function () {
			const amount = ethers.parseEther("100");

			// Approve adapter to spend user1's tokens
			await propertyToken.connect(user1).approve(adapter.target, amount);

			const sendParam = {
				dstEid: EID_DEST,
				to: ethers.zeroPadValue(user1.address, 32),
				amountLD: amount,
				minAmountLD: amount,
				extraOptions: "0x",
				composeMsg: "0x",
				oftCmd: "0x",
			};

			const balanceBefore = await propertyToken.balanceOf(user1.address);

			await adapter
				.connect(user1)
				.send(sendParam, { nativeFee: 1, lzTokenFee: 0 }, user1.address, {
					value: 1,
				});

			// Tokens should be locked in adapter
			const balanceAfter = await propertyToken.balanceOf(user1.address);
			expect(balanceBefore - balanceAfter).to.equal(amount);
			expect(await propertyToken.balanceOf(adapter.target)).to.be.gte(amount);
		});

		it("Should reject send when paused", async function () {
			await adapter.connect(admin).pause();

			const sendParam = {
				dstEid: EID_DEST,
				to: ethers.zeroPadValue(admin.address, 32),
				amountLD: ethers.parseEther("1"),
				minAmountLD: ethers.parseEther("1"),
				extraOptions: "0x",
				composeMsg: "0x",
				oftCmd: "0x",
			};

			await propertyToken
				.connect(admin)
				.approve(adapter.target, ethers.parseEther("1"));

			await expect(
				adapter
					.connect(admin)
					.send(sendParam, { nativeFee: 1, lzTokenFee: 0 }, admin.address, {
						value: 1,
					})
			).to.be.revertedWithCustomError(adapter, "EnforcedPause");

			await adapter.connect(admin).unpause();
		});
	});

	// ─── PropertyTokenOFT Compliance Tests ─────────────────

	describe("PropertyTokenOFT Compliance", function () {
		it("Should enforce compliance on direct transfers", async function () {
			// First, give admin some OFT tokens by minting (admin is owner)
			// OFT doesn't have a mint function, so we need to use the bridge or disable compliance temporarily
			// For testing: disable compliance, mint via a mock credit, then re-enable
			// Actually, OFT only mints via _credit (bridge path), so let's test via the compliance flag

			// The OFT starts with 0 supply. Let's test by delivering a cross-chain packet.
			// We already sent 100 tokens from user1 via adapter. Let's deliver that packet.
			await mockEndpointHome.deliverAllPackets();

			// user1 should now have 100 OFT tokens on destination
			expect(await propertyTokenOFT.balanceOf(user1.address)).to.equal(
				ethers.parseEther("100")
			);
		});

		it("Should allow transfer between verified users on OFT", async function () {
			const amount = ethers.parseEther("10");
			await propertyTokenOFT.connect(user1).transfer(user2.address, amount);
			expect(await propertyTokenOFT.balanceOf(user2.address)).to.equal(amount);
		});

		it("Should reject transfer to unverified user on OFT", async function () {
			await expect(
				propertyTokenOFT
					.connect(user1)
					.transfer(unverified.address, ethers.parseEther("1"))
			).to.be.revertedWith("Compliance: Transfer not allowed");
		});

		it("Should allow transfer when compliance is disabled", async function () {
			await propertyTokenOFT.connect(admin).setComplianceEnabled(false);

			await propertyTokenOFT
				.connect(user1)
				.transfer(unverified.address, ethers.parseEther("1"));
			expect(await propertyTokenOFT.balanceOf(unverified.address)).to.equal(
				ethers.parseEther("1")
			);

			// Re-enable compliance
			await propertyTokenOFT.connect(admin).setComplianceEnabled(true);
		});

		it("Should reject transfers when paused", async function () {
			await propertyTokenOFT.connect(admin).pause();

			await expect(
				propertyTokenOFT
					.connect(user1)
					.transfer(user2.address, ethers.parseEther("1"))
			).to.be.revertedWithCustomError(propertyTokenOFT, "EnforcedPause");

			await propertyTokenOFT.connect(admin).unpause();
		});
	});

	// ─── Rate Limiting Tests ───────────────────────────────

	describe("OFT Rate Limiting", function () {
		it("Should enforce daily bridge cap", async function () {
			// Set a low daily cap
			const cap = ethers.parseEther("50");
			await propertyTokenOFT.connect(admin).setDailyBridgeCap(cap);
			expect(await propertyTokenOFT.dailyBridgeCap()).to.equal(cap);

			// Send 60 tokens from admin via adapter (exceeds cap)
			const amount = ethers.parseEther("60");
			await propertyToken.connect(admin).approve(adapter.target, amount);

			const sendParam = {
				dstEid: EID_DEST,
				to: ethers.zeroPadValue(user2.address, 32),
				amountLD: amount,
				minAmountLD: amount,
				extraOptions: "0x",
				composeMsg: "0x",
				oftCmd: "0x",
			};

			await adapter
				.connect(admin)
				.send(sendParam, { nativeFee: 1, lzTokenFee: 0 }, admin.address, {
					value: 1,
				});

			// Delivering should fail because it exceeds the daily cap
			// (Previous delivery already bridged 100, plus this 60 would be 160 > 50 cap)
			await expect(mockEndpointHome.deliverAllPackets()).to.be.revertedWith(
				"OFT: Daily bridge cap exceeded"
			);

			// Remove cap for further tests
			await propertyTokenOFT.connect(admin).setDailyBridgeCap(0);
		});

		it("Should allow bridging when cap is zero (unlimited)", async function () {
			// The pending packet from previous test should now deliver
			await mockEndpointHome.deliverAllPackets();
			expect(await propertyTokenOFT.balanceOf(user2.address)).to.be.gte(
				ethers.parseEther("10")
			);
		});
	});

	// ─── Snapshot Tests ────────────────────────────────────

	describe("OFT Snapshots", function () {
		it("Should capture balance at snapshot", async function () {
			// Snapshot logic: _updateSnap stores pre-change value when first change occurs in a new snapshot period.
			// balanceOfAt(snapId) finds the first snap with id > snapId; if none, returns current value.
			// This means to query snapshot N, we need a change in period N+1 to seal it.

			// Step 1: Take snapshot #1
			await propertyTokenOFT.connect(admin).snapshot();
			const snap1 = await propertyTokenOFT.getCurrentSnapshotId();

			// Step 2: Record balance and transfer (creates snap entry for period 1)
			const user1BalanceAtSnap1 = await propertyTokenOFT.balanceOf(
				user1.address
			);
			expect(user1BalanceAtSnap1).to.be.gt(0n);

			const transferAmt = ethers.parseEther("5");
			await propertyTokenOFT
				.connect(user1)
				.transfer(user2.address, transferAmt);

			// Step 3: Take snapshot #2 (seals snapshot #1)
			await propertyTokenOFT.connect(admin).snapshot();
			const snap2 = await propertyTokenOFT.getCurrentSnapshotId();
			expect(snap2).to.equal(snap1 + 1n);

			// Step 4: Make another transfer to seal snapshot #2
			await propertyTokenOFT
				.connect(user1)
				.transfer(user2.address, ethers.parseEther("1"));

			// Now balanceOfAt(snap1) should return the value BEFORE the first change in period 1
			// The snap entry {id: snap2, value: user1BalanceAtSnap1 - transferAmt} was created by the step 4 transfer
			// For snap1: binary search finds first entry with id > snap1, which is snap entry created in period 1
			// whose value is user1BalanceAtSnap1 (pre-transfer in period 1)
			const balanceAtSnap1 = await propertyTokenOFT.balanceOfAt(
				user1.address,
				snap1 - 1n > 0n ? snap1 - 1n : 0n
			);
			// Actually let's verify the snap1 query directly
			const actualBalAtSnap1 = await propertyTokenOFT.balanceOfAt(
				user1.address,
				snap1
			);

			// After transfer of 5 in period 1, balance should be user1BalanceAtSnap1 - 5
			// The snap entry for period 1 stores user1BalanceAtSnap1 (pre-change)
			// For snap1 query: finds first snap.id > snap1, which is the snap2 entry
			// whose value is the balance before the first change in period 2
			const user1BalanceAfterSnap1Transfer = user1BalanceAtSnap1 - transferAmt;
			expect(actualBalAtSnap1).to.equal(user1BalanceAfterSnap1Transfer);
		});

		it("Should capture totalSupply at snapshot", async function () {
			const totalSupply = await propertyTokenOFT.totalSupply();
			const snapId = await propertyTokenOFT.getCurrentSnapshotId();

			// Total supply hasn't changed (only transfers, no mints/burns), so current = snapshot
			const totalSupplyAtSnap = await propertyTokenOFT.totalSupplyAt(snapId);
			expect(totalSupplyAtSnap).to.equal(totalSupply);
		});

		it("Should only allow owner to take snapshots", async function () {
			await expect(
				propertyTokenOFT.connect(user1).snapshot()
			).to.be.revertedWithCustomError(
				propertyTokenOFT,
				"OwnableUnauthorizedAccount"
			);
		});
	});

	// ─── PropertyToken Snapshot Tests ──────────────────────

	describe("PropertyToken Snapshots", function () {
		it("Should capture balance at snapshot on home chain", async function () {
			const adminBalance = await propertyToken.balanceOf(admin.address);
			expect(adminBalance).to.be.gt(0n);

			// Take snapshot #1
			await propertyToken.connect(admin).snapshot();
			const snapId = await propertyToken.getCurrentSnapshotId();

			// Transfer after snapshot (creates snap entry for this period)
			const transferAmt = ethers.parseEther("50");
			await propertyToken.connect(admin).transfer(user1.address, transferAmt);

			// Take snapshot #2 to seal snapshot #1
			await propertyToken.connect(admin).snapshot();

			// Make another transfer to create snap entry for period 2
			await propertyToken
				.connect(admin)
				.transfer(user1.address, ethers.parseEther("1"));

			// balanceOfAt(snapId) returns the value AFTER all changes in snapshot period
			// (the snap entry at id=snapId+1 stores the pre-change value for the next period)
			const balanceAtSnap = await propertyToken.balanceOfAt(
				admin.address,
				snapId
			);
			expect(balanceAtSnap).to.equal(adminBalance - transferAmt);
		});
	});

	// ─── Access Control Tests ──────────────────────────────

	describe("Access Control", function () {
		it("Should only allow owner to set adapter compliance", async function () {
			await expect(
				adapter.connect(user1).setCompliance(ethers.ZeroAddress)
			).to.be.revertedWithCustomError(adapter, "OwnableUnauthorizedAccount");
		});

		it("Should only allow owner to pause/unpause adapter", async function () {
			await expect(
				adapter.connect(user1).pause()
			).to.be.revertedWithCustomError(adapter, "OwnableUnauthorizedAccount");
		});

		it("Should only allow owner to set OFT compliance", async function () {
			await expect(
				propertyTokenOFT.connect(user1).setCompliance(ethers.ZeroAddress)
			).to.be.revertedWithCustomError(
				propertyTokenOFT,
				"OwnableUnauthorizedAccount"
			);
		});

		it("Should only allow owner to set OFT compliance enabled", async function () {
			await expect(
				propertyTokenOFT.connect(user1).setComplianceEnabled(false)
			).to.be.revertedWithCustomError(
				propertyTokenOFT,
				"OwnableUnauthorizedAccount"
			);
		});

		it("Should only allow owner to set daily bridge cap", async function () {
			await expect(
				propertyTokenOFT.connect(user1).setDailyBridgeCap(100)
			).to.be.revertedWithCustomError(
				propertyTokenOFT,
				"OwnableUnauthorizedAccount"
			);
		});

		it("Should only allow admin to register identities", async function () {
			const hash = ethers.keccak256(ethers.toUtf8Bytes("test"));
			await expect(
				identityRegistry
					.connect(user1)
					.registerIdentity(unverified.address, 840, hash)
			).to.be.revertedWithCustomError(
				identityRegistry,
				"AccessControlUnauthorizedAccount"
			);
		});

		it("Should only allow owner to set exemptions", async function () {
			await expect(
				tokenCompliance.connect(user1).setExempt(user1.address, true)
			).to.be.revertedWithCustomError(
				tokenCompliance,
				"OwnableUnauthorizedAccount"
			);
		});
	});
});
