import { expect } from "chai";
import hre from "hardhat";

const { ethers } = await hre.network.connect();

const KYC = () => ethers.keccak256(ethers.toUtf8Bytes("KYC"));
const DAY = 24 * 60 * 60;

// Regression tests for the escrow refund brick (audit H4): refund() must not be
// callable on a SUCCESSFUL raise, or a single investor can flip `refunded` and
// permanently block finalize().
describe("ListingEscrow refund gating (H4 regression)", function () {
	let admin: any;
	let sponsor: any;
	let alice: any;
	let bob: any;
	let registry: any;
	let compliance: any;
	let token: any;
	let pay: any;

	const TARGET = ethers.parseUnits("1000", 18);
	const SUPPLY = ethers.parseUnits("1000", 18);

	async function deployEscrow(deadlineOffset: number) {
		const Escrow = await ethers.getContractFactory("ListingEscrow");
		const now = BigInt((await ethers.provider.getBlock("latest"))!.timestamp);
		const escrow = await Escrow.deploy(
			await token.getAddress(),
			await pay.getAddress(),
			sponsor.address,
			TARGET,
			now + BigInt(deadlineOffset),
			admin.address
		);
		await escrow.waitForDeployment();
		// Escrow must be compliance-exempt to hold/move the property token.
		await compliance.setExempt(await escrow.getAddress(), true);
		// Fund the escrow with the full token supply to distribute on finalize.
		await token.transfer(await escrow.getAddress(), SUPPLY);
		return escrow;
	}

	beforeEach(async function () {
		[admin, sponsor, alice, bob] = await ethers.getSigners();

		const IdentityRegistry =
			await ethers.getContractFactory("IdentityRegistry");
		registry = await IdentityRegistry.deploy(admin.address);
		await registry.waitForDeployment();

		const TokenCompliance =
			await ethers.getContractFactory("TokenCompliance");
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
		for (const s of [alice, bob]) {
			await pay.mint(s.address, ethers.parseUnits("1000", 18));
		}
	});

	it("blocks refund on a successful raise and lets finalize proceed", async function () {
		const escrow = await deployEscrow(DAY);
		await pay.connect(alice).approve(await escrow.getAddress(), TARGET);
		await escrow.connect(alice).deposit(TARGET); // meets target

		await ethers.provider.send("evm_increaseTime", [DAY + 1]);
		await ethers.provider.send("evm_mine", []);

		// The griefing attempt must now revert (previously it bricked finalize).
		await expect(escrow.connect(alice).refund()).to.be.revertedWith(
			"Refunds not open"
		);

		// Sponsor's finalize still works.
		await expect(escrow.finalize()).to.emit(escrow, "Finalized");
		expect(await token.balanceOf(alice.address)).to.equal(SUPPLY);
	});

	it("allows refund on a genuinely failed raise", async function () {
		const escrow = await deployEscrow(DAY);
		const half = TARGET / 2n;
		await pay.connect(alice).approve(await escrow.getAddress(), half);
		await escrow.connect(alice).deposit(half); // below target

		await ethers.provider.send("evm_increaseTime", [DAY + 1]);
		await ethers.provider.send("evm_mine", []);

		const before = await pay.balanceOf(alice.address);
		await expect(escrow.connect(alice).refund()).to.emit(escrow, "Refunded");
		expect(await pay.balanceOf(alice.address)).to.equal(before + half);
	});

	it("lets an admin open refunds deliberately via enableRefunds", async function () {
		const escrow = await deployEscrow(DAY);
		await pay.connect(alice).approve(await escrow.getAddress(), TARGET);
		await escrow.connect(alice).deposit(TARGET); // target met, before deadline

		// Investor cannot refund yet.
		await expect(escrow.connect(alice).refund()).to.be.revertedWith(
			"Refunds not open"
		);

		await expect(escrow.connect(admin).enableRefunds()).to.emit(
			escrow,
			"RefundsEnabled"
		);
		await expect(escrow.connect(alice).refund()).to.emit(escrow, "Refunded");
	});

	it("blocks a non-admin from opening refunds", async function () {
		const escrow = await deployEscrow(DAY);
		await expect(
			escrow.connect(alice).enableRefunds()
		).to.be.revertedWith("Not admin or owner");
	});
});
