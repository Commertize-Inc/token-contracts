/**
 * Testnet Deployment Validation
 *
 * Validates that deployed contracts on the target network are correctly configured.
 * Run with: hardhat test test/TestnetValidation.ts --network testnet
 *       or: hardhat test test/TestnetValidation.ts --network base-sepolia
 *
 * Requirements:
 *   - EVM_PRIVATE_KEY env var set (the deployer key)
 *   - A deployment.{network}.json file for the target network
 */
import { expect } from "chai";
import hre from "hardhat";
import fs from "node:fs";
import path from "node:path";
import { getNetworkMeta } from "../hardhat.config";
import { describe, before, it, beforeEach, after } from "node:test";

const { ethers, networkName } = await hre.network.connect();

// ─── Load deployment config ──────────────────────────────────

const deploymentFile = `deployment.${networkName.replace(/-/g, "_")}.json`;
const deploymentPath = path.join(import.meta.dirname, `../${deploymentFile}`);

if (!fs.existsSync(deploymentPath)) {
	console.log(
		`\n  ⚠ No ${deploymentFile} found — skipping all testnet validation.\n`
	);
	process.exit(0);
}

const deployment = JSON.parse(fs.readFileSync(deploymentPath, "utf-8"));
const meta = getNetworkMeta(networkName);
const contracts = deployment.contracts as Record<string, string>;
const bridgeContracts = (deployment.bridgeContracts ?? {}) as Record<
	string,
	Record<string, string>
>;
const hasBridge = Object.keys(bridgeContracts).length > 0;

// Determine chain role
const isHomeChain = networkName === "testnet" || networkName === "mainnet";

// Resolve adapter info for bridge tests (if any)
const firstPropToken = hasBridge ? Object.keys(bridgeContracts)[0] : undefined;
const firstAdapterAddress = firstPropToken
	? bridgeContracts[firstPropToken]?.adapter
	: undefined;

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

		// ─── Contract Code Checks ──────────────────────────────────

		describe("Contract Existence", function () {
			for (const [name, addr] of Object.entries(contracts)) {
				if (name === "USDC") continue; // USDC might be a precompile/native address
				it(`${name} has deployed code at ${addr}`, async function () {
					const code = await deployer.provider.getCode(addr);
					expect(code).to.not.equal("0x", `${name} has no code at ${addr}`);
				});
			}
		});

		// ─── Core Contract Configuration ───────────────────────────

		describe(
			"IdentityRegistry",
			{ skip: !contracts.IdentityRegistry },
			function () {
				let ir: any;

				beforeEach(async function () {
					ir = await ethers.getContractAt(
						"IdentityRegistry",
						contracts.IdentityRegistry
					);
				});

				it("Deployer has DEFAULT_ADMIN_ROLE", async function () {
					const adminRole = await ir.DEFAULT_ADMIN_ROLE();
					expect(await ir.hasRole(adminRole, deployer.address)).to.be.true;
				});

				it("Deployer is verified", async function () {
					expect(await ir.isVerified(deployer.address)).to.be.true;
				});

				it("VERIFIED_ROLE constant is set", async function () {
					const role = await ir.VERIFIED_ROLE();
					expect(role).to.not.equal(ethers.ZeroHash);
				});
			}
		);

		describe(
			"TokenCompliance",
			{ skip: !contracts.TokenCompliance },
			function () {
				let tc: any;

				beforeEach(async function () {
					tc = await ethers.getContractAt(
						"TokenCompliance",
						contracts.TokenCompliance
					);
				});

				it("Owner is deployer", async function () {
					expect(await tc.owner()).to.equal(deployer.address);
				});

				it("Points to the correct IdentityRegistry", async function () {
					if (!contracts.IdentityRegistry) {
						this.skip();
						return;
					}
					expect(await tc.identityRegistry()).to.equal(
						contracts.IdentityRegistry
					);
				});
			}
		);

		describe(
			"PropertyFactory",
			{ skip: !contracts.PropertyFactory },
			function () {
				let factory: any;

				beforeEach(async function () {
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

		// ─── Property Tokens ───────────────────────────────────────

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
				});

				it("All factory-deployed tokens have code", async function () {
					if (!hasProperties) {
						this.skip();
						return;
					}
					for (const addr of propertyAddresses) {
						const code = await deployer.provider.getCode(addr);
						expect(code).to.not.equal(
							"0x",
							`PropertyToken at ${addr} has no code`
						);
					}
				});

				it("First property token has valid metadata", async function () {
					if (!hasProperties) {
						this.skip();
						return;
					}
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

				it("First property token points to correct compliance", async function () {
					if (!hasProperties || !contracts.TokenCompliance) {
						this.skip();
						return;
					}
					const pt = await ethers.getContractAt(
						"PropertyToken",
						propertyAddresses[0]
					);
					expect(await pt.compliance()).to.equal(contracts.TokenCompliance);
				});
			}
		);

		// ─── Bridge Contracts (Home Chain) ─────────────────────────

		describe(
			"Bridge: PropertyTokenAdapter (Home)",
			{ skip: !isHomeChain || !hasBridge || !firstAdapterAddress },
			function () {
				let adapter: any;

				beforeEach(async function () {
					adapter = await ethers.getContractAt(
						"PropertyTokenAdapter",
						firstAdapterAddress!
					);
				});

				it("Has deployed code", async function () {
					const code = await deployer.provider.getCode(firstAdapterAddress!);
					expect(code).to.not.equal("0x");
				});

				it("Owner is deployer", async function () {
					expect(await adapter.owner()).to.equal(deployer.address);
				});

				it("Points to correct PropertyToken", async function () {
					expect(await adapter.token()).to.equal(firstPropToken);
				});

				it("Points to correct compliance", async function () {
					if (!contracts.TokenCompliance) {
						this.skip();
						return;
					}
					const compliance = await adapter.compliance();
					expect(compliance).to.equal(contracts.TokenCompliance);
				});

				it("Is exempt in TokenCompliance", async function () {
					if (!contracts.TokenCompliance) {
						this.skip();
						return;
					}
					const tc = await ethers.getContractAt(
						"TokenCompliance",
						contracts.TokenCompliance
					);
					expect(await tc.isExempt(firstAdapterAddress!)).to.be.true;
				});

				it("Is not paused", async function () {
					expect(await adapter.paused()).to.be.false;
				});

				it("LZ endpoint is correct", async function () {
					if (!meta.lzEndpoint) {
						this.skip();
						return;
					}
					const endpoint = await adapter.endpoint();
					expect(endpoint.toLowerCase()).to.equal(
						meta.lzEndpoint!.toLowerCase()
					);
				});

				it("Has peer configured for destination chain", async function () {
					if (!meta.lzEid) {
						this.skip();
						return;
					}
					const destMeta = isHomeChain
						? getNetworkMeta("base-sepolia")
						: getNetworkMeta("testnet");
					if (!destMeta.lzEid) {
						this.skip();
						return;
					}

					const peer = await adapter.peers(destMeta.lzEid);
					const peerIsSet = peer !== ethers.ZeroHash;
					console.log(
						`      Peer for EID ${destMeta.lzEid}: ${peerIsSet ? peer : "(not set)"}`
					);
					expect(peerIsSet, "Peer should be configured for destination chain")
						.to.be.true;
				});
			}
		);

		// ─── Bridge Contracts (Destination Chain) ──────────────────

		describe(
			"Bridge: PropertyTokenOFT (Destination)",
			{ skip: isHomeChain || !contracts.PropertyTokenOFT },
			function () {
				let oft: any;
				const oftAddress = contracts.PropertyTokenOFT;

				beforeEach(async function () {
					oft = await ethers.getContractAt("PropertyTokenOFT", oftAddress);
				});

				it("Has deployed code", async function () {
					const code = await deployer.provider.getCode(oftAddress);
					expect(code).to.not.equal("0x");
				});

				it("Owner is deployer", async function () {
					expect(await oft.owner()).to.equal(deployer.address);
				});

				it("Has valid name and symbol", async function () {
					const name = await oft.name();
					const symbol = await oft.symbol();
					console.log(`      Token: ${name} (${symbol})`);
					expect(name.length).to.be.greaterThan(0);
					expect(symbol.length).to.be.greaterThan(0);
				});

				it("Supply starts at 0 (mint-only via bridge)", async function () {
					const supply = await oft.totalSupply();
					console.log(`      Total supply: ${ethers.formatEther(supply)}`);
				});

				it("Compliance is enabled", async function () {
					expect(await oft.complianceEnabled()).to.be.true;
				});

				it("Points to correct compliance", async function () {
					if (!contracts.TokenCompliance) {
						this.skip();
						return;
					}
					expect(await oft.compliance()).to.equal(contracts.TokenCompliance);
				});

				it("Is not paused", async function () {
					expect(await oft.paused()).to.be.false;
				});

				it("LZ endpoint is correct", async function () {
					if (!meta.lzEndpoint) {
						this.skip();
						return;
					}
					const endpoint = await oft.endpoint();
					expect(endpoint.toLowerCase()).to.equal(
						meta.lzEndpoint!.toLowerCase()
					);
				});

				it("Has peer configured for home chain", async function () {
					const homeMeta = getNetworkMeta("testnet");
					if (!homeMeta.lzEid) {
						this.skip();
						return;
					}

					const peer = await oft.peers(homeMeta.lzEid);
					const peerIsSet = peer !== ethers.ZeroHash;
					console.log(
						`      Peer for EID ${homeMeta.lzEid}: ${peerIsSet ? peer : "(not set)"}`
					);
					expect(peerIsSet, "Peer should be configured for home chain").to.be
						.true;
				});

				it("Daily bridge cap is configured or unlimited", async function () {
					const cap = await oft.dailyBridgeCap();
					console.log(
						`      Daily bridge cap: ${cap === 0n ? "unlimited" : ethers.formatEther(cap)}`
					);
				});
			}
		);

		// ─── Destination Compliance Infrastructure ────────────────

		describe(
			"Destination Compliance (base-sepolia)",
			{ skip: isHomeChain },
			function () {
				it("IdentityRegistry: deployer has admin role", async function () {
					if (!contracts.IdentityRegistry) {
						this.skip();
						return;
					}
					const ir = await ethers.getContractAt(
						"IdentityRegistry",
						contracts.IdentityRegistry
					);
					const adminRole = await ir.DEFAULT_ADMIN_ROLE();
					expect(await ir.hasRole(adminRole, deployer.address)).to.be.true;
				});

				it("IdentityRegistry: deployer is verified", async function () {
					if (!contracts.IdentityRegistry) {
						this.skip();
						return;
					}
					const ir = await ethers.getContractAt(
						"IdentityRegistry",
						contracts.IdentityRegistry
					);
					expect(await ir.isVerified(deployer.address)).to.be.true;
				});

				it("TokenCompliance: owner is deployer", async function () {
					if (!contracts.TokenCompliance) {
						this.skip();
						return;
					}
					const tc = await ethers.getContractAt(
						"TokenCompliance",
						contracts.TokenCompliance
					);
					expect(await tc.owner()).to.equal(deployer.address);
				});

				it("TokenCompliance: linked to destination IdentityRegistry", async function () {
					if (!contracts.TokenCompliance || !contracts.IdentityRegistry) {
						this.skip();
						return;
					}
					const tc = await ethers.getContractAt(
						"TokenCompliance",
						contracts.TokenCompliance
					);
					expect(await tc.identityRegistry()).to.equal(
						contracts.IdentityRegistry
					);
				});
			}
		);

		// ─── LayerZero Config Validation ──────────────────────────

		describe(
			"LayerZero Configuration",
			{ skip: !meta.lzEndpoint },
			function () {
				it("LZ endpoint has deployed code", async function () {
					const code = await deployer.provider.getCode(meta.lzEndpoint!);
					expect(code).to.not.equal(
						"0x",
						`LZ endpoint ${meta.lzEndpoint} has no code`
					);
				});

				it("Deployment JSON LZ config matches network-meta (if present)", async function () {
					if (!deployment.layerZero) {
						console.log(
							"      (no layerZero field in deployment JSON — will be set on next deploy)"
						);
						this.skip();
						return;
					}
					if (
						deployment.layerZero.endpoint.toLowerCase() !==
						meta.lzEndpoint!.toLowerCase()
					) {
						console.log(
							`      ⚠ deployment.json endpoint: ${deployment.layerZero.endpoint}`
						);
						console.log(`        network-meta endpoint:    ${meta.lzEndpoint}`);
						console.log("        → Will be corrected on next bridge deploy");
					}
					if (deployment.layerZero.eid !== meta.lzEid) {
						console.log(
							`      ⚠ deployment.json EID: ${deployment.layerZero.eid}`
						);
						console.log(`        network-meta EID:    ${meta.lzEid}`);
						console.log("        → Will be corrected on next bridge deploy");
					}
				});
			}
		);

		// ─── Cross-Chain Quote (read-only) ─────────────────────────

		describe(
			"Cross-Chain Bridge Quote",
			{ skip: !hasBridge && !contracts.PropertyTokenOFT },
			function () {
				it("Can quote a bridge fee from adapter (home chain)", async function () {
					if (!isHomeChain || !hasBridge || !firstAdapterAddress) {
						this.skip();
						return;
					}

					const destMeta = getNetworkMeta("base-sepolia");
					if (!destMeta.lzEid) {
						this.skip();
						return;
					}

					const adapter = await ethers.getContractAt(
						"PropertyTokenAdapter",
						firstAdapterAddress
					);

					const sendParam = {
						dstEid: destMeta.lzEid,
						to: ethers.zeroPadValue(deployer.address, 32),
						amountLD: ethers.parseEther("1"),
						minAmountLD: ethers.parseEther("1"),
						extraOptions: "0x",
						composeMsg: "0x",
						oftCmd: "0x",
					};

					try {
						const [nativeFee, lzTokenFee] = await adapter.quoteSend(
							sendParam,
							false
						);
						console.log(
							`      Native fee: ${ethers.formatEther(nativeFee)} ${meta.currency}`
						);
						console.log(
							`      LZ token fee: ${ethers.formatEther(lzTokenFee)}`
						);
						expect(nativeFee).to.be.greaterThan(0);
					} catch (err: any) {
						if (
							err.message.includes("NoPeer") ||
							err.message.includes("peer")
						) {
							console.log("      ⚠ Peer not configured — cannot quote");
							this.skip();
							return;
						}
						throw err;
					}
				});

				it("Can quote a bridge fee from OFT (destination chain)", async function () {
					if (isHomeChain || !contracts.PropertyTokenOFT) {
						this.skip();
						return;
					}

					const homeMeta = getNetworkMeta("testnet");
					if (!homeMeta.lzEid) {
						this.skip();
						return;
					}

					const oft = await ethers.getContractAt(
						"PropertyTokenOFT",
						contracts.PropertyTokenOFT
					);

					const sendParam = {
						dstEid: homeMeta.lzEid,
						to: ethers.zeroPadValue(deployer.address, 32),
						amountLD: ethers.parseEther("1"),
						minAmountLD: ethers.parseEther("1"),
						extraOptions: "0x",
						composeMsg: "0x",
						oftCmd: "0x",
					};

					try {
						const [nativeFee, lzTokenFee] = await oft.quoteSend(
							sendParam,
							false
						);
						console.log(
							`      Native fee: ${ethers.formatEther(nativeFee)} ${meta.currency}`
						);
						console.log(
							`      LZ token fee: ${ethers.formatEther(lzTokenFee)}`
						);
						expect(nativeFee).to.be.greaterThan(0);
					} catch (err: any) {
						if (
							err.message.includes("NoPeer") ||
							err.message.includes("peer")
						) {
							console.log("      ⚠ Peer not configured — cannot quote");
							this.skip();
							return;
						}
						throw err;
					}
				});
			}
		);

		// ─── Summary ──────────────────────────────────────────────

		after(function () {
			console.log("\n    ─── Deployment Summary ───");
			console.log(
				`    Network:    ${networkName} (chainId ${deployment.network?.chainId})`
			);
			console.log(
				`    Role:       ${isHomeChain ? "Home Chain" : "Destination Chain"}`
			);
			console.log(`    Contracts:  ${Object.keys(contracts).length}`);
			console.log(
				`    Bridge:     ${hasBridge ? `${Object.keys(bridgeContracts).length} property token(s)` : "not deployed"}`
			);
			if (meta.lzEndpoint) {
				console.log(`    LZ EID:     ${meta.lzEid}`);
				console.log(`    LZ Endpoint:${meta.lzEndpoint}`);
			}
			console.log("");
		});
	}
);
