import { expect } from "chai";
import hre from "hardhat";

const { ethers } = await hre.network.connect();

const KYC_TYPE = ethers.keccak256(ethers.toUtf8Bytes("KYC"));
const AML_TYPE = ethers.keccak256(ethers.toUtf8Bytes("AML"));
const MAX_UINT40 = (1n << 40n) - 1n;

describe("Commertize Contracts Suite", function () {
	let admin: any;
	let user: any;
	let sponsor: any;
	let unauthorized: any;
	let identityRegistry: any;
	let credentialRegistry: any;
	let credentialCheckPolicy: any;
	let propertyFactory: any;
	let propertyToken: any;
	let escrowAddress: string;

	const adminCcid = ethers.keccak256(
		ethers.solidityPacked(["string", "string"], ["commertize", "ADMIN"])
	);
	const userCcid = ethers.keccak256(
		ethers.solidityPacked(["string", "string"], ["commertize", "USER1"])
	);

	before(async function () {
		[admin, user, sponsor, unauthorized] = await ethers.getSigners();
	});

	// MARK: Identity Layer

	it("Should deploy IdentityRegistry", async function () {
		const Factory = await ethers.getContractFactory("IdentityRegistry");
		identityRegistry = await Factory.deploy(admin.address);
		await identityRegistry.waitForDeployment();

		expect(
			await identityRegistry.hasRole(
				await identityRegistry.DEFAULT_ADMIN_ROLE(),
				admin.address
			)
		).to.be.true;
	});

	it("Should register identity with CCID", async function () {
		await identityRegistry
			.connect(admin)
			.registerIdentity(adminCcid, admin.address);
		expect(await identityRegistry.isRegistered(admin.address)).to.be.true;
		expect(await identityRegistry.getIdentity(admin.address)).to.equal(
			adminCcid
		);
	});

	it("Should deploy CredentialRegistry", async function () {
		const Factory = await ethers.getContractFactory("CredentialRegistry");
		credentialRegistry = await Factory.deploy(
			identityRegistry.target,
			admin.address
		);
		await credentialRegistry.waitForDeployment();
	});

	it("Should register KYC + AML credentials with expiry", async function () {
		await credentialRegistry
			.connect(admin)
			.registerCredential(adminCcid, KYC_TYPE, MAX_UINT40, "0x");
		await credentialRegistry
			.connect(admin)
			.registerCredential(adminCcid, AML_TYPE, MAX_UINT40, "0x");

		expect(
			await credentialRegistry.hasValidCredential(adminCcid, KYC_TYPE)
		).to.be.true;
		expect(
			await credentialRegistry.hasValidCredential(adminCcid, AML_TYPE)
		).to.be.true;
	});

	// MARK: Compliance Policy

	it("Should deploy CredentialCheckPolicy", async function () {
		const Factory = await ethers.getContractFactory(
			"CredentialCheckPolicy"
		);
		credentialCheckPolicy = await Factory.deploy(
			identityRegistry.target,
			credentialRegistry.target,
			[KYC_TYPE, AML_TYPE]
		);
		await credentialCheckPolicy.waitForDeployment();
	});

	// MARK: Token Layer

	it("Should deploy PropertyFactory", async function () {
		const Factory = await ethers.getContractFactory("PropertyFactory");
		propertyFactory = await Factory.deploy(admin.address);
		await propertyFactory.waitForDeployment();

		expect(await propertyFactory.owner()).to.equal(admin.address);
	});

	it("Should deploy PropertyToken via Factory", async function () {
		const tx = await propertyFactory
			.connect(admin)
			.deployProperty(
				"Test Property",
				"TST",
				1_000_000,
				credentialCheckPolicy.target
			);
		const receipt = await tx.wait();
		const event = receipt!.logs.find((log: any) => {
			try {
				return (
					propertyFactory.interface.parseLog(log)!.name ===
					"PropertyDeployed"
				);
			} catch {
				return false;
			}
		});
		const tokenAddress = propertyFactory.interface.parseLog(event!)!.args
			.property;
		const PT = await ethers.getContractFactory("PropertyToken");
		propertyToken = PT.attach(tokenAddress);

		expect(await propertyToken.name()).to.equal("Test Property");
		expect(await propertyToken.compliancePolicy()).to.equal(
			credentialCheckPolicy.target
		);
	});

	// MARK: Escrow

	it("Should deploy Escrow via Factory", async function () {
		const deadline = Math.floor(Date.now() / 1000) + 3600;
		const tx = await propertyFactory
			.connect(admin)
			.deployEscrow(
				propertyToken.target,
				ethers.ZeroAddress,
				sponsor.address,
				ethers.parseEther("1.0"),
				deadline,
				identityRegistry.target,
				credentialRegistry.target
			);
		const receipt = await tx.wait();
		const event = receipt!.logs.find((log: any) => {
			try {
				return (
					propertyFactory.interface.parseLog(log)!.name ===
					"EscrowDeployed"
				);
			} catch {
				return false;
			}
		});
		escrowAddress = propertyFactory.interface.parseLog(event!)!.args.escrow;
		expect(escrowAddress).to.not.equal(ethers.ZeroAddress);

		// Set escrow as exempt directly on the token
		await propertyToken
			.connect(admin)
			.setExempt(escrowAddress, true);
	});

	// MARK: Compliance Enforcement

	it("Should allow transfer between verified addresses", async function () {
		await identityRegistry
			.connect(admin)
			.registerIdentity(userCcid, user.address);
		await credentialRegistry
			.connect(admin)
			.registerCredential(userCcid, KYC_TYPE, MAX_UINT40, "0x");
		await credentialRegistry
			.connect(admin)
			.registerCredential(userCcid, AML_TYPE, MAX_UINT40, "0x");

		await propertyToken.connect(admin).transfer(user.address, 1000);
		expect(await propertyToken.balanceOf(user.address)).to.equal(1000);
	});

	it("Should block transfer to unverified address", async function () {
		await expect(
			propertyToken.connect(admin).transfer(unauthorized.address, 100)
		).to.be.revertedWith("Compliance: transfer not allowed");
	});

	it("Should allow exempt address to skip compliance", async function () {
		// Set unauthorized as exempt
		await propertyToken
			.connect(admin)
			.setExempt(unauthorized.address, true);

		// Transfer should work now (exempt bypasses credential check)
		await propertyToken
			.connect(admin)
			.transfer(unauthorized.address, 100);
		expect(await propertyToken.balanceOf(unauthorized.address)).to.equal(
			100
		);

		// Remove exemption
		await propertyToken
			.connect(admin)
			.setExempt(unauthorized.address, false);
	});

	// MARK: ERC-3643 Controls

	it("Should freeze an address", async function () {
		await propertyToken.connect(admin).setAddressFrozen(user.address, true);
		expect(await propertyToken.isFrozen(user.address)).to.be.true;

		await expect(
			propertyToken.connect(user).transfer(admin.address, 100)
		).to.be.revertedWith("Address frozen");

		await propertyToken
			.connect(admin)
			.setAddressFrozen(user.address, false);
	});

	it("Should enforce partial freeze", async function () {
		await propertyToken
			.connect(admin)
			.freezePartialTokens(user.address, 900);
		expect(await propertyToken.getFrozenTokens(user.address)).to.equal(900);

		// Can transfer 100 (unfrozen portion)
		await propertyToken.connect(user).transfer(admin.address, 100);

		// Cannot transfer more
		await expect(
			propertyToken.connect(user).transfer(admin.address, 1)
		).to.be.revertedWith("Exceeds transferable balance");

		await propertyToken
			.connect(admin)
			.unfreezePartialTokens(user.address, 900);
	});

	it("Should allow forced transfer (admin recovery)", async function () {
		await propertyToken.connect(admin).transfer(user.address, 500);
		const balBefore = await propertyToken.balanceOf(user.address);

		await propertyToken
			.connect(admin)
			.forcedTransfer(user.address, admin.address, balBefore);
		expect(await propertyToken.balanceOf(user.address)).to.equal(0);
	});

	// MARK: Credential Expiry

	it("Should block transfer when credential is revoked", async function () {
		await propertyToken.connect(admin).transfer(user.address, 500);

		await credentialRegistry
			.connect(admin)
			.revokeCredential(userCcid, KYC_TYPE);

		await expect(
			propertyToken.connect(user).transfer(admin.address, 100)
		).to.be.revertedWith("Compliance: transfer not allowed");

		await credentialRegistry
			.connect(admin)
			.registerCredential(userCcid, KYC_TYPE, MAX_UINT40, "0x");

		await propertyToken.connect(user).transfer(admin.address, 100);
	});

	// MARK: Snapshots

	it("Should support snapshots for dividend distribution", async function () {
		const snapshotId = await propertyToken
			.connect(admin)
			.snapshot.staticCall();
		await propertyToken.connect(admin).snapshot();

		const balAtSnapshot = await propertyToken.balanceOfAt(
			user.address,
			snapshotId
		);
		expect(balAtSnapshot).to.be.gt(0);
	});
});
