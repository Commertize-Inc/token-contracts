/**
 * Testnet Deployment Validation
 *
 * Validates that deployed contracts on Arc testnet are correctly configured
 * and the compliance stack (IdentityRegistry, CredentialRegistry,
 * CredentialCheckPolicy) is wired up properly.
 *
 * Run with: hardhat test test/TestnetValidation.ts --network arc-testnet
 *
 * Requirements:
 *   - EVM_PRIVATE_KEY env var set (the deployer key)
 *   - deployment.arc_testnet.json exists (run deploy.ts first)
 */
import { expect } from "chai";
import hre from "hardhat";
import fs from "node:fs";
import path from "node:path";
import { getNetworkMeta } from "../hardhat.config";
import { describe, before, it, after } from "node:test";

const { ethers, networkName } = await hre.network.connect();

// MARK: Load Deployment Config

const deploymentFile = `deployment.${networkName.replace(/-/g, "_")}.json`;
const deploymentPath = path.join(import.meta.dirname, `../${deploymentFile}`);

if (!fs.existsSync(deploymentPath)) {
	console.log(
		`\n  No ${deploymentFile} found — skipping all testnet validation.\n`
	);
	process.exit(0);
}

const deployment = JSON.parse(fs.readFileSync(deploymentPath, "utf-8"));
const meta = getNetworkMeta(networkName);
const contracts = deployment.contracts as Record<string, string>;

// MARK: Constants

const KYC_TYPE = ethers.keccak256(ethers.toUtf8Bytes("KYC"));
const AML_TYPE = ethers.keccak256(ethers.toUtf8Bytes("AML"));
const adminCcid = ethers.keccak256(
	ethers.solidityPacked(["string", "string"], ["commertize", "ADMIN"])
);

describe(
	`Testnet Validation — ${networkName} (chainId ${deployment.network?.chainId})`,
	{ timeout: 120_000 },
	function () {
		let deployer: any;

		before(async function () {
			[deployer] = await ethers.getSigners();
			const balance = await deployer.provider.getBalance(deployer.address);
			console.log(`    Deployer: ${deployer.address}`);
			console.log(
				`    Balance:  ${ethers.formatEther(balance)} ${meta.currency}`
			);
		});

		// MARK: Contract Existence

		describe("Contract Existence", function () {
			for (const [name, addr] of Object.entries(contracts)) {
				if (name === "USDC") continue;
				it(`${name} has deployed code at ${addr}`, async function () {
					const code = await deployer.provider.getCode(addr);
					expect(code).to.not.equal("0x", `${name} has no code at ${addr}`);
				});
			}
		});

		// MARK: IdentityRegistry

		describe(
			"IdentityRegistry",
			{ skip: !contracts.IdentityRegistry },
			function () {
				let ir: any;

				before(async function () {
					ir = await ethers.getContractAt(
						"IdentityRegistry",
						contracts.IdentityRegistry
					);
				});

				it("Deployer has DEFAULT_ADMIN_ROLE", async function () {
					const adminRole = await ir.DEFAULT_ADMIN_ROLE();
					expect(await ir.hasRole(adminRole, deployer.address)).to.be.true;
				});

				it("Deployer has REGISTRAR_ROLE", async function () {
					const role = await ir.REGISTRAR_ROLE();
					expect(await ir.hasRole(role, deployer.address)).to.be.true;
				});

				it("Deployer wallet isRegistered()", async function () {
					expect(await ir.isRegistered(deployer.address)).to.be.true;
				});

				it("getIdentity(deployer) returns ADMIN CCID", async function () {
					expect(await ir.getIdentity(deployer.address)).to.equal(adminCcid);
				});

				it("getWallets(adminCcid) includes deployer", async function () {
					const wallets: string[] = await ir.getWallets(adminCcid);
					const lower = wallets.map((w: string) => w.toLowerCase());
					expect(lower).to.include(deployer.address.toLowerCase());
				});
			}
		);

		// MARK: CredentialRegistry

		describe(
			"CredentialRegistry",
			{ skip: !contracts.CredentialRegistry },
			function () {
				let cr: any;

				before(async function () {
					cr = await ethers.getContractAt(
						"CredentialRegistry",
						contracts.CredentialRegistry
					);
				});

				it("Points to correct IdentityRegistry", async function () {
					if (!contracts.IdentityRegistry) return;
					expect(await cr.identityRegistry()).to.equal(
						contracts.IdentityRegistry
					);
				});

				it("Deployer has ISSUER_ROLE", async function () {
					const role = await cr.ISSUER_ROLE();
					expect(await cr.hasRole(role, deployer.address)).to.be.true;
				});

				it("Deployer has valid KYC credential", async function () {
					expect(
						await cr.hasValidCredential(adminCcid, KYC_TYPE)
					).to.be.true;
				});

				it("Deployer has valid AML credential", async function () {
					expect(
						await cr.hasValidCredential(adminCcid, AML_TYPE)
					).to.be.true;
				});

				it("KYC credential is not expired", async function () {
					expect(
						await cr.isCredentialExpired(adminCcid, KYC_TYPE)
					).to.be.false;
				});

				it("getCredentialTypes(adminCcid) includes KYC and AML", async function () {
					const types: string[] = await cr.getCredentialTypes(adminCcid);
					expect(types).to.include(KYC_TYPE);
					expect(types).to.include(AML_TYPE);
				});
			}
		);

		// MARK: CredentialCheckPolicy

		describe(
			"CredentialCheckPolicy",
			{ skip: !contracts.CredentialCheckPolicy },
			function () {
				let ccp: any;

				before(async function () {
					ccp = await ethers.getContractAt(
						"CredentialCheckPolicy",
						contracts.CredentialCheckPolicy
					);
				});

				it("identityRegistry() matches deployed address", async function () {
					if (!contracts.IdentityRegistry) return;
					expect(await ccp.identityRegistry()).to.equal(
						contracts.IdentityRegistry
					);
				});

				it("credentialRegistry() matches deployed address", async function () {
					if (!contracts.CredentialRegistry) return;
					expect(await ccp.credentialRegistry()).to.equal(
						contracts.CredentialRegistry
					);
				});

				it("getRequiredCredentials() returns KYC and AML", async function () {
					const required: string[] = await ccp.getRequiredCredentials();
					expect(required).to.deep.equal([KYC_TYPE, AML_TYPE]);
				});

				it("check() returns (true, false) for deployer-to-deployer", async function () {
					const [pass, bypass] = await ccp.check(
						deployer.address,
						"0x00000000",
						deployer.address,
						deployer.address,
						0
					);
					expect(pass).to.be.true;
					expect(bypass).to.be.false;
				});

				it("check() returns (false, false) for unregistered address", async function () {
					const randomAddr = ethers.Wallet.createRandom().address;
					const [pass, bypass] = await ccp.check(
						deployer.address,
						"0x00000000",
						deployer.address,
						randomAddr,
						0
					);
					expect(pass).to.be.false;
					expect(bypass).to.be.false;
				});
			}
		);

		// MARK: PropertyFactory

		describe(
			"PropertyFactory",
			{ skip: !contracts.PropertyFactory },
			function () {
				let factory: any;

				before(async function () {
					factory = await ethers.getContractAt(
						"PropertyFactory",
						contracts.PropertyFactory
					);
				});

				it("Owner is deployer", async function () {
					expect(await factory.owner()).to.equal(deployer.address);
				});

				it("Can query deployed properties", async function () {
					const properties = await factory.getDeployedProperties();
					console.log(`      Deployed properties: ${properties.length}`);
					expect(properties).to.be.an("array");
				});

				it("Can query deployed escrows", async function () {
					const escrows = await factory.getDeployedEscrows();
					console.log(`      Deployed escrows: ${escrows.length}`);
					expect(escrows).to.be.an("array");
				});
			}
		);

		// MARK: Property Tokens (from Factory)

		describe(
			"Property Tokens (from Factory)",
			{ skip: !contracts.PropertyFactory },
			function () {
				let factory: any;
				let propertyAddresses: string[];
				let hasProperties = false;

				before(async function () {
					factory = await ethers.getContractAt(
						"PropertyFactory",
						contracts.PropertyFactory
					);
					propertyAddresses = await factory.getDeployedProperties();
					hasProperties = propertyAddresses.length > 0;
					if (!hasProperties) {
						console.log("      No properties deployed — skipping token tests");
					}
				});

				it("All factory-deployed tokens have code", async function () {
					if (!hasProperties) return;
					for (const addr of propertyAddresses) {
						const code = await deployer.provider.getCode(addr);
						expect(code).to.not.equal(
							"0x",
							`PropertyToken at ${addr} has no code`
						);
					}
				});

				it("First token has valid metadata", async function () {
					if (!hasProperties) return;
					const pt = await ethers.getContractAt(
						"PropertyToken",
						propertyAddresses[0]
					);
					const name = await pt.name();
					const symbol = await pt.symbol();
					const supply = await pt.totalSupply();
					const owner = await pt.owner();

					console.log(`      Token: ${name} (${symbol})`);
					console.log(`      Supply: ${ethers.formatEther(supply)}`);
					console.log(`      Owner: ${owner}`);

					expect(name.length).to.be.greaterThan(0);
					expect(symbol.length).to.be.greaterThan(0);
					expect(supply).to.be.greaterThan(0);
				});

				it("First token compliancePolicy() matches CredentialCheckPolicy", async function () {
					if (!hasProperties || !contracts.CredentialCheckPolicy) return;
					const pt = await ethers.getContractAt(
						"PropertyToken",
						propertyAddresses[0]
					);
					expect(await pt.compliancePolicy()).to.equal(
						contracts.CredentialCheckPolicy
					);
				});

				it("First token owner is deployer", async function () {
					if (!hasProperties) return;
					const pt = await ethers.getContractAt(
						"PropertyToken",
						propertyAddresses[0]
					);
					expect(await pt.owner()).to.equal(deployer.address);
				});
			}
		);

		// MARK: Compliance Enforcement

		describe(
			"Compliance Enforcement (View Calls)",
			{
				skip:
					!contracts.PropertyFactory || !contracts.CredentialCheckPolicy,
			},
			function () {
				let ccp: any;
				let factory: any;
				let hasProperties = false;
				let firstProperty: string;

				before(async function () {
					ccp = await ethers.getContractAt(
						"CredentialCheckPolicy",
						contracts.CredentialCheckPolicy
					);
					factory = await ethers.getContractAt(
						"PropertyFactory",
						contracts.PropertyFactory
					);
					const properties = await factory.getDeployedProperties();
					hasProperties = properties.length > 0;
					if (hasProperties) firstProperty = properties[0];
				});

				it("Verified deployer passes compliance check", async function () {
					if (!hasProperties) return;
					const [pass] = await ccp.check(
						firstProperty,
						"0xa9059cbb",
						deployer.address,
						deployer.address,
						0
					);
					expect(pass).to.be.true;
				});

				it("Unregistered address fails compliance check", async function () {
					if (!hasProperties) return;
					const randomAddr = ethers.Wallet.createRandom().address;
					const [pass] = await ccp.check(
						firstProperty,
						"0xa9059cbb",
						deployer.address,
						randomAddr,
						0
					);
					expect(pass).to.be.false;
				});

				it("Escrow is exempt on first token (if escrow exists)", async function () {
					if (!hasProperties) return;
					const escrows = await factory.getDeployedEscrows();
					if (escrows.length === 0) return;

					const pt = await ethers.getContractAt(
						"PropertyToken",
						firstProperty
					);
					expect(await pt.isExempt(escrows[0])).to.be.true;
				});
			}
		);

		// MARK: Freeze / Pause State

		describe(
			"Freeze / Pause State",
			{ skip: !contracts.PropertyFactory },
			function () {
				let factory: any;
				let hasProperties = false;
				let pt: any;

				before(async function () {
					factory = await ethers.getContractAt(
						"PropertyFactory",
						contracts.PropertyFactory
					);
					const properties = await factory.getDeployedProperties();
					hasProperties = properties.length > 0;
					if (hasProperties) {
						pt = await ethers.getContractAt(
							"PropertyToken",
							properties[0]
						);
					}
				});

				it("Deployer is not frozen", async function () {
					if (!hasProperties) return;
					expect(await pt.isFrozen(deployer.address)).to.be.false;
				});

				it("Token is not paused", async function () {
					if (!hasProperties) return;
					expect(await pt.paused()).to.be.false;
				});

				it("Deployer has no frozen tokens", async function () {
					if (!hasProperties) return;
					expect(await pt.getFrozenTokens(deployer.address)).to.equal(0);
				});
			}
		);

		// MARK: ListingEscrow

		describe(
			"Listing Escrows (from Factory)",
			{ skip: !contracts.PropertyFactory },
			function () {
				let factory: any;
				let escrowAddresses: string[];
				let hasEscrows = false;

				before(async function () {
					factory = await ethers.getContractAt(
						"PropertyFactory",
						contracts.PropertyFactory
					);
					escrowAddresses = await factory.getDeployedEscrows();
					hasEscrows = escrowAddresses.length > 0;
					if (!hasEscrows) {
						console.log("      No escrows deployed — skipping escrow tests");
					}
				});

				it("All factory-deployed escrows have code", async function () {
					if (!hasEscrows) return;
					for (const addr of escrowAddresses) {
						const code = await deployer.provider.getCode(addr);
						expect(code).to.not.equal(
							"0x",
							`ListingEscrow at ${addr} has no code`
						);
					}
				});

				it("First escrow references correct IdentityRegistry", async function () {
					if (!hasEscrows || !contracts.IdentityRegistry) return;
					const escrow = await ethers.getContractAt(
						"ListingEscrow",
						escrowAddresses[0]
					);
					expect(await escrow.identityRegistry()).to.equal(
						contracts.IdentityRegistry
					);
				});

				it("First escrow references correct CredentialRegistry", async function () {
					if (!hasEscrows || !contracts.CredentialRegistry) return;
					const escrow = await ethers.getContractAt(
						"ListingEscrow",
						escrowAddresses[0]
					);
					expect(await escrow.credentialRegistry()).to.equal(
						contracts.CredentialRegistry
					);
				});

				it("First escrow has a deadline set", async function () {
					if (!hasEscrows) return;
					const escrow = await ethers.getContractAt(
						"ListingEscrow",
						escrowAddresses[0]
					);
					const deadline = await escrow.deadline();
					expect(deadline).to.be.greaterThan(0);
				});
			}
		);

		// MARK: DividendVault

		describe(
			"DividendVault",
			{ skip: !contracts.DividendVault },
			function () {
				let vault: any;

				before(async function () {
					vault = await ethers.getContractAt(
						"DividendVault",
						contracts.DividendVault
					);
				});

				it("paymentToken() is USDC precompile", async function () {
					const usdcAddr = meta.usdcAddress;
					expect(
						ethers.getAddress(await vault.paymentToken())
					).to.equal(ethers.getAddress(usdcAddr));
				});

				it("protocolFeeBps() is 100 (1%)", async function () {
					expect(await vault.protocolFeeBps()).to.equal(100);
				});

				it("Owner is deployer", async function () {
					expect(await vault.owner()).to.equal(deployer.address);
				});
			}
		);

		// MARK: CommertizeToken

		describe(
			"CommertizeToken",
			{ skip: !contracts.CommertizeToken },
			function () {
				let ctz: any;

				before(async function () {
					ctz = await ethers.getContractAt(
						"CommertizeToken",
						contracts.CommertizeToken
					);
				});

				it("Has valid name and symbol", async function () {
					const name = await ctz.name();
					const symbol = await ctz.symbol();
					console.log(`      Token: ${name} (${symbol})`);
					expect(name.length).to.be.greaterThan(0);
					expect(symbol.length).to.be.greaterThan(0);
				});

				it("Has positive total supply", async function () {
					const supply = await ctz.totalSupply();
					console.log(`      Supply: ${ethers.formatEther(supply)}`);
					expect(supply).to.be.greaterThan(0);
				});
			}
		);

		// MARK: Summary

		after(function () {
			console.log("\n    --- Deployment Summary ---");
			console.log(
				`    Network:    ${networkName} (chainId ${deployment.network?.chainId})`
			);
			console.log(`    Contracts:  ${Object.keys(contracts).length}`);
			for (const [name, addr] of Object.entries(contracts)) {
				console.log(`    ${name}: ${addr}`);
			}
			console.log("");
		});
	}
);
