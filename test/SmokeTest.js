const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Commertize Contracts Suite", function () {
	let admin, agent, compliance, user;
	let identityRegistry, creToken, yieldDistributor, trustedForwarder;

	before(async function () {
		[admin, agent, compliance, user] = await ethers.getSigners();
	});

	it("Should deploy Identity Registry", async function () {
		const CREIdentityRegistry = await ethers.getContractFactory(
			"CREIdentityRegistry"
		);
		identityRegistry = await CREIdentityRegistry.deploy(admin.address);
		// await identityRegistry.deployed(); // Hardhat ethers v6 diff? assumes v5 for now or check package.json
		expect(
			await identityRegistry.hasRole(
				await identityRegistry.AGENT_ROLE(),
				admin.address
			)
		).to.be.true;
	});

	it("Should deploy Trusted Forwarder (Paymaster)", async function () {
		const TrustedForwarder =
			await ethers.getContractFactory("TrustedForwarder");
		trustedForwarder = await TrustedForwarder.deploy("CommertizeForwarder");
		// await trustedForwarder.deployed();
		expect(trustedForwarder.target).to.not.be.undefined;
	});

	it("Should deploy CREToken (Equity)", async function () {
		console.log("Debugging Factory...");
		const CREToken = await ethers.getContractFactory("CREToken");

		// Deploy Mock Compliance locally for this test
		const MockCompliance = await ethers.getContractFactory("MockCompliance");
		const complianceContract = await MockCompliance.deploy();

		// Deploy Forwarder locally for this test (or use dummy)
		const TrustedForwarder =
			await ethers.getContractFactory("TrustedForwarder");
		const forwarderContract = await TrustedForwarder.deploy(
			"CommertizeForwarder"
		);

		const args = [
			"Test Token",
			"TEST",
			"0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
			"0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
			complianceContract.target,
			"123 Test St",
			"APN123",
			"https://lien.uri",
			BigInt(1000000),
			BigInt(100000000),
			"US-DE",
			forwarderContract.target,
		];
		console.log("Attempting deploy with " + args.length + " args");
		try {
			creToken = await CREToken.deploy(...args);
			console.log("Deploy success");
			expect(await creToken.name()).to.equal("Test Token");
		} catch (e) {
			console.log("Deploy failed: " + e.message);
			throw e;
		}
	});

	// Revised Test Plan:
	// 1. Deploy Identity
	// 2. Deploy YieldDistributor (renamed from SponsorPaymaster)
});
