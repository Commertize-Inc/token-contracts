const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Commertize Contracts Suite", function () {
	let admin, agent, compliance, user, sponsor;
	let identityRegistry, tokenCompliance, propertyFactory;
	let propertyToken, listingEscrow;

	before(async function () {
		[admin, agent, compliance, user, sponsor] = await ethers.getSigners();
	});

	it("Should deploy Identity Registry", async function () {
		const IdentityRegistry = await ethers.getContractFactory("IdentityRegistry");
		identityRegistry = await IdentityRegistry.deploy(admin.address);
		await identityRegistry.waitForDeployment();

		expect(await identityRegistry.owner()).to.equal(admin.address);
	});

	it("Should deploy Token Compliance", async function () {
        const TokenCompliance = await ethers.getContractFactory("TokenCompliance");
        tokenCompliance = await TokenCompliance.deploy(identityRegistry.target, admin.address);
        await tokenCompliance.waitForDeployment();

        expect(await tokenCompliance.identityRegistry()).to.equal(identityRegistry.target);
	});

	it("Should deploy Property Factory", async function () {
		const PropertyFactory = await ethers.getContractFactory("PropertyFactory");
		propertyFactory = await PropertyFactory.deploy(admin.address);
		await propertyFactory.waitForDeployment();

        expect(await propertyFactory.owner()).to.equal(admin.address);
	});

    it("Should deploy PropertyToken and Escrow via Factory", async function () {
        // Register Admin to allow minting (checking compliance)
        await identityRegistry.connect(admin).registerIdentity(admin.address, 840, ethers.keccak256(ethers.toUtf8Bytes("admin")));

        const tx = await propertyFactory.connect(admin).deployProperty(
            "Test Property",
            "TST",
            1000000,
            tokenCompliance.target
        );
        const receipt = await tx.wait();
        const event = receipt.logs.find(log => {
            try { return propertyFactory.interface.parseLog(log).name === 'PropertyDeployed'; }
            catch { return false; }
        });
        const propertyTokenAddress = propertyFactory.interface.parseLog(event).args.property;
        const PropertyToken = await ethers.getContractFactory("PropertyToken");
        propertyToken = PropertyToken.attach(propertyTokenAddress);

        expect(await propertyToken.name()).to.equal("Test Property");

        // Deploy Escrow
        const deadline = Math.floor(Date.now() / 1000) + 3600;
        const tx2 = await propertyFactory.connect(admin).deployEscrow(
            propertyTokenAddress,
            ethers.ZeroAddress,
            sponsor.address,
            ethers.parseEther("1.0"),
            deadline
        );
        const receipt2 = await tx2.wait();
        const event2 = receipt2.logs.find(log => {
            try { return propertyFactory.interface.parseLog(log).name === 'EscrowDeployed'; }
            catch { return false; }
        });
        const escrowAddress = propertyFactory.interface.parseLog(event2).args.escrow;

        expect(escrowAddress).to.not.equal(ethers.ZeroAddress);
    });
});
