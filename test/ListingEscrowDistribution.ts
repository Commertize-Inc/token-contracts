import { expect } from "chai";
import hre from "hardhat";

const { ethers } = await hre.network.connect();

const KYC = () => ethers.keccak256(ethers.toUtf8Bytes("KYC"));
const DAY = 24 * 60 * 60;

// H3 regression: finalize() distributes in a loop through the token's
// compliance check; one investor whose KYC lapsed must not revert the whole
// distribution. Their share parks in pendingTokens for a claimTokens() pull.
describe("ListingEscrow distribution fault tolerance (H3 regression)", function () {
	let admin: any;
	let sponsor: any;
	let alice: any;
	let bob: any;
	let registry: any;
	let compliance: any;
	let token: any;
	let pay: any;
	let escrow: any;

	const TARGET = ethers.parseUnits("1000", 18);
	const SUPPLY = ethers.parseUnits("1000", 18);

	beforeEach(async function () {
		[admin, sponsor, alice, bob] = await ethers.getSigners();

		const IdentityRegistry = await ethers.getContractFactory("IdentityRegistry");
		registry = await IdentityRegistry.deploy(admin.address);
		await registry.waitForDeployment();

		const TokenCompliance = await ethers.getContractFactory("TokenCompliance");
		compliance = await TokenCompliance.deploy(
			await registry.getAddress(),
			admin.address
		);
		await compliance.waitForDeployment();

		for (const s of [admin, alice, bob]) {
			await registry.registerIdentity(s.address, 840, KYC());
		}

		const PropertyToken = await ethers.getContractFactory("PropertyToken");
		token = await PropertyToken.deploy(
			"Prop",
			"PROP",
			SUPPLY,
			await compliance.getAddress(),
			admin.address
		);
		await token.waitForDeployment();

		const MockERC20 = await ethers.getContractFactory("MockERC20");
		pay = await MockERC20.deploy();
		await pay.waitForDeployment();

		const Escrow = await ethers.getContractFactory("ListingEscrow");
		const now = BigInt((await ethers.provider.getBlock("latest"))!.timestamp);
		escrow = await Escrow.deploy(
			await token.getAddress(),
			await pay.getAddress(),
			sponsor.address,
			TARGET,
			now + BigInt(DAY),
			admin.address
		);
		await escrow.waitForDeployment();
		await compliance.setExempt(await escrow.getAddress(), true);
		await token.transfer(await escrow.getAddress(), SUPPLY);

		const half = TARGET / 2n;
		for (const s of [alice, bob]) {
			await pay.mint(s.address, half);
			await pay.connect(s).approve(await escrow.getAddress(), half);
			await escrow.connect(s).deposit(half);
		}

		await ethers.provider.send("evm_increaseTime", [DAY + 1]);
		await ethers.provider.send("evm_mine", []);
	});

	it("finalize survives a non-compliant investor and parks their share", async function () {
		// bob's KYC lapses between deposit and finalize
		await registry.removeIdentity(bob.address);

		await expect(escrow.finalize()).to.emit(escrow, "Finalized");

		// alice was paid directly; bob's share is pending, not lost
		expect(await token.balanceOf(alice.address)).to.equal(SUPPLY / 2n);
		expect(await token.balanceOf(bob.address)).to.equal(0n);
		expect(await escrow.pendingTokens(bob.address)).to.equal(SUPPLY / 2n);
		expect(await escrow.totalPendingTokens()).to.equal(SUPPLY / 2n);

		// the pending reserve is untouchable by admin distribution
		await expect(
			escrow
				.connect(admin)
				.adminDistributeTokens([alice.address], [SUPPLY / 2n])
		).to.be.revertedWith("Exceeds unreserved balance");

		// still unverified -> pull fails at the token's compliance check
		await expect(escrow.connect(bob).claimTokens()).to.be.revertedWith(
			"Compliance: Transfer not allowed"
		);
		// failed pull must not zero the pending balance
		expect(await escrow.pendingTokens(bob.address)).to.equal(SUPPLY / 2n);

		// re-KYC -> pull succeeds exactly once
		await registry.registerIdentity(bob.address, 840, KYC());
		await expect(escrow.connect(bob).claimTokens()).to.emit(
			escrow,
			"TokensClaimed"
		);
		expect(await token.balanceOf(bob.address)).to.equal(SUPPLY / 2n);
		expect(await escrow.totalPendingTokens()).to.equal(0n);
		await expect(escrow.connect(bob).claimTokens()).to.be.revertedWith(
			"Nothing to claim"
		);
	});

	it("distributes directly to everyone when all investors are compliant", async function () {
		await escrow.finalize();
		expect(await token.balanceOf(alice.address)).to.equal(SUPPLY / 2n);
		expect(await token.balanceOf(bob.address)).to.equal(SUPPLY / 2n);
		expect(await escrow.pendingTokens(alice.address)).to.equal(0n);
		expect(await escrow.pendingTokens(bob.address)).to.equal(0n);
	});

	it("blocks claimTokens before finalize", async function () {
		await expect(escrow.connect(alice).claimTokens()).to.be.revertedWith(
			"Not finalized"
		);
	});
});
