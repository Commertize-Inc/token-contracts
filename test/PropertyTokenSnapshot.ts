import { expect } from "chai";
import hre from "hardhat";

const { ethers } = await hre.network.connect();

const KYC = () => ethers.keccak256(ethers.toUtf8Bytes("KYC"));

// Regression tests for the snapshot read bug (audit C1): balanceOfAt /
// totalSupplyAt on the LATEST snapshot must return the value frozen when the
// snapshot was taken, not the live balance — otherwise DividendVault can be
// drained by cycling tokens through wallets and re-claiming.
describe("PropertyToken snapshot correctness (C1 regression)", function () {
	let owner: any;
	let alice: any;
	let bob: any;
	let carol: any;
	let token: any;

	const SUPPLY = ethers.parseUnits("1000", 18);

	beforeEach(async function () {
		[owner, alice, bob, carol] = await ethers.getSigners();

		const IdentityRegistry =
			await ethers.getContractFactory("IdentityRegistry");
		const registry = await IdentityRegistry.deploy(owner.address);
		await registry.waitForDeployment();

		const TokenCompliance =
			await ethers.getContractFactory("TokenCompliance");
		const compliance = await TokenCompliance.deploy(
			await registry.getAddress(),
			owner.address
		);
		await compliance.waitForDeployment();

		for (const s of [owner, alice, bob, carol]) {
			await registry.registerIdentity(s.address, 840, KYC());
		}

		const PropertyToken = await ethers.getContractFactory("PropertyToken");
		token = await PropertyToken.deploy(
			"Prop",
			"PROP",
			SUPPLY,
			await compliance.getAddress(),
			owner.address
		);
		await token.waitForDeployment();
		await token.transfer(alice.address, ethers.parseUnits("100", 18));
	});

	it("freezes balances at the latest snapshot despite later transfers", async function () {
		const amt = ethers.parseUnits("100", 18);
		await token.snapshot(); // id = 1
		const id = await token.getCurrentSnapshotId();
		expect(id).to.equal(1);

		// Balances at snapshot time.
		expect(await token.balanceOfAt(alice.address, id)).to.equal(amt);
		expect(await token.balanceOfAt(bob.address, id)).to.equal(0);

		// Alice moves everything to Bob AFTER the snapshot.
		await token.connect(alice).transfer(bob.address, amt);

		// The snapshot must be unchanged — this is the drain guard.
		expect(await token.balanceOfAt(alice.address, id)).to.equal(amt);
		expect(await token.balanceOfAt(bob.address, id)).to.equal(0);

		// And Bob relaying to Carol must not create a third claimant either.
		await token.connect(bob).transfer(carol.address, amt);
		expect(await token.balanceOfAt(bob.address, id)).to.equal(0);
		expect(await token.balanceOfAt(carol.address, id)).to.equal(0);
	});

	it("keeps totalSupplyAt stable across a later snapshot's changes", async function () {
		await token.snapshot(); // id = 1
		const id = await token.getCurrentSnapshotId();
		const supplyAt = await token.totalSupplyAt(id);
		expect(supplyAt).to.equal(SUPPLY);

		// A transfer in the same period must not change totalSupplyAt(id).
		await token
			.connect(alice)
			.transfer(bob.address, ethers.parseUnits("10", 18));
		expect(await token.totalSupplyAt(id)).to.equal(SUPPLY);
	});

	it("returns correct historical values across multiple snapshots", async function () {
		const amt = ethers.parseUnits("100", 18);
		await token.snapshot(); // id 1: alice has 100
		await token.connect(alice).transfer(bob.address, ethers.parseUnits("40", 18));
		await token.snapshot(); // id 2: alice 60, bob 40
		await token.connect(bob).transfer(carol.address, ethers.parseUnits("40", 18));
		await token.snapshot(); // id 3: alice 60, bob 0, carol 40

		expect(await token.balanceOfAt(alice.address, 1)).to.equal(amt);
		expect(await token.balanceOfAt(bob.address, 1)).to.equal(0);

		expect(await token.balanceOfAt(alice.address, 2)).to.equal(
			ethers.parseUnits("60", 18)
		);
		expect(await token.balanceOfAt(bob.address, 2)).to.equal(
			ethers.parseUnits("40", 18)
		);

		expect(await token.balanceOfAt(bob.address, 3)).to.equal(0);
		expect(await token.balanceOfAt(carol.address, 3)).to.equal(
			ethers.parseUnits("40", 18)
		);
	});
});
