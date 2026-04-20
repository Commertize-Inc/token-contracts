/**
 * Live Testnet Integration Flows
 *
 * Deploys fresh PropertyToken + ListingEscrow via the factory, then exercises
 * the full lifecycle: purchase, escrow finalize, token distribution, dividend
 * distribution + claim, and supply/snapshot queries.
 *
 * Run with: hardhat test test/IntegrationFlows.ts --network arc-testnet
 *
 * Requirements:
 *   - EVM_PRIVATE_KEY env var set (the deployer key)
 *   - deployment.arc_testnet.json exists (run deploy.ts first)
 *   - Deployer wallet holds >= 200 USDC on Arc testnet
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
		`\n  No ${deploymentFile} found — skipping integration flows.\n`
	);
	process.exit(0);
}

const deployment = JSON.parse(fs.readFileSync(deploymentPath, "utf-8"));
const meta = getNetworkMeta(networkName);
const contracts = deployment.contracts as Record<string, string>;

// MARK: Constants

const USDC_ADDRESS = "0x3600000000000000000000000000000000000000";
const MIN_USDC_BALANCE = 200_000_000n; // 200 USDC (6 decimals)
const TOKEN_SUPPLY = ethers.parseEther("10000000"); // 10M tokens
const ESCROW_TOKEN_AMOUNT = ethers.parseEther("5000000"); // 5M tokens
const TARGET_RAISE = ethers.parseUnits("100", 6); // 100 USDC
const DEPOSIT_AMOUNT = ethers.parseUnits("50", 6); // 50 USDC
const DIVIDEND_AMOUNT = 10_000n; // 0.01 USDC

const ERC20_ABI = [
	"function balanceOf(address) view returns (uint256)",
	"function approve(address,uint256) returns (bool)",
	"function allowance(address,address) view returns (uint256)",
	"function transfer(address,uint256) returns (bool)",
	"function transferFrom(address,address,uint256) returns (bool)",
	"function decimals() view returns (uint8)",
];

// MARK: Test Suite

describe(
	`Integration Flows — ${networkName}`,
	{ timeout: 120_000 },
	function () {
		let deployer: any;
		let usdc: any;
		let factory: any;
		let dividendVault: any;
		let propertyToken: any;
		let escrow: any;
		let propertyTokenAddress: string;
		let escrowAddress: string;

		// MARK: Setup

		before(async function () {
			[deployer] = await ethers.getSigners();
			console.log(`    Deployer: ${deployer.address}`);

			// USDC balance gate
			usdc = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, deployer);
			const usdcBalance: bigint = await usdc.balanceOf(deployer.address);
			console.log(
				`    USDC balance: ${ethers.formatUnits(usdcBalance, 6)} USDC`
			);

			if (usdcBalance < MIN_USDC_BALANCE) {
				console.log(
					`    Insufficient USDC (need >= 200). Skipping entire suite.`
				);
				process.exit(0);
			}

			// Load factory + DividendVault from deployment
			factory = await ethers.getContractAt(
				"PropertyFactory",
				contracts.PropertyFactory
			);
			dividendVault = await ethers.getContractAt(
				"DividendVault",
				contracts.DividendVault
			);

			// Deploy fresh PropertyToken via factory
			console.log(`    Deploying fresh PropertyToken...`);
			const deployTx = await factory.deployProperty(
				"Integration Test Property",
				"CTZ-INTG",
				TOKEN_SUPPLY,
				contracts.CredentialCheckPolicy
			);
			const deployReceipt = await deployTx.wait();
			console.log(`    PropertyToken deploy tx: ${deployTx.hash}`);

			const propEvent = deployReceipt!.logs.find((log: any) => {
				try {
					return (
						factory.interface.parseLog(log)!.name ===
						"PropertyDeployed"
					);
				} catch {
					return false;
				}
			});
			propertyTokenAddress =
				factory.interface.parseLog(propEvent!)!.args.property;
			console.log(`    PropertyToken: ${propertyTokenAddress}`);

			propertyToken = await ethers.getContractAt(
				"PropertyToken",
				propertyTokenAddress
			);

			// Deploy fresh ListingEscrow via factory
			const deadline = Math.floor(Date.now() / 1000) + 3600;
			console.log(`    Deploying fresh ListingEscrow...`);
			const escrowTx = await factory.deployEscrow(
				propertyTokenAddress,
				USDC_ADDRESS,
				deployer.address,
				TARGET_RAISE,
				deadline,
				contracts.IdentityRegistry,
				contracts.CredentialRegistry
			);
			const escrowReceipt = await escrowTx.wait();
			console.log(`    ListingEscrow deploy tx: ${escrowTx.hash}`);

			const escrowEvent = escrowReceipt!.logs.find((log: any) => {
				try {
					return (
						factory.interface.parseLog(log)!.name ===
						"EscrowDeployed"
					);
				} catch {
					return false;
				}
			});
			escrowAddress =
				factory.interface.parseLog(escrowEvent!)!.args.escrow;
			console.log(`    ListingEscrow: ${escrowAddress}`);

			escrow = await ethers.getContractAt(
				"ListingEscrow",
				escrowAddress
			);

			// Set escrow as exempt on the token
			const exemptTx = await propertyToken.setExempt(
				escrowAddress,
				true
			);
			await exemptTx.wait();
			console.log(`    Escrow set as exempt on PropertyToken`);

			// Transfer 5M tokens to escrow for later distribution
			const transferTx = await propertyToken.transfer(
				escrowAddress,
				ESCROW_TOKEN_AMOUNT
			);
			await transferTx.wait();
			console.log(
				`    Transferred ${ethers.formatEther(ESCROW_TOKEN_AMOUNT)} tokens to escrow`
			);

			// Verify deployer is registered
			const identityRegistry = await ethers.getContractAt(
				"IdentityRegistry",
				contracts.IdentityRegistry
			);
			const isRegistered = await identityRegistry.isRegistered(
				deployer.address
			);
			console.log(`    Deployer registered: ${isRegistered}`);
			expect(isRegistered).to.be.true;
		});

		// MARK: Flow 1 — Purchase to Escrow

		describe("Flow 1: Purchase to Escrow", function () {
			it("should check deployer USDC balance", async function () {
				const balance = await usdc.balanceOf(deployer.address);
				console.log(
					`      USDC balance: ${ethers.formatUnits(balance, 6)}`
				);
				expect(balance).to.be.greaterThan(0n);
			});

			it("should approve USDC to escrow", async function () {
				const tx = await usdc.approve(escrowAddress, DEPOSIT_AMOUNT);
				await tx.wait();
				console.log(`      Approve tx: ${tx.hash}`);

				const allowance = await usdc.allowance(
					deployer.address,
					escrowAddress
				);
				expect(allowance).to.be.greaterThanOrEqual(DEPOSIT_AMOUNT);
			});

			it("should deposit 50 USDC into escrow", async function () {
				const tx = await escrow.depositFor(
					deployer.address,
					DEPOSIT_AMOUNT
				);
				await tx.wait();
				console.log(`      DepositFor tx: ${tx.hash}`);

				const deposited = await escrow.deposits(deployer.address);
				expect(deposited).to.equal(DEPOSIT_AMOUNT);

				const totalRaised = await escrow.totalRaised();
				expect(totalRaised).to.equal(DEPOSIT_AMOUNT);
				console.log(
					`      Total raised: ${ethers.formatUnits(totalRaised, 6)} USDC`
				);
			});
		});

		// MARK: Flow 2 — Escrow Release + Token Distribution

		describe("Flow 2: Escrow Release + Token Distribution", function () {
			it("should deposit remaining 50 USDC to meet target", async function () {
				const approveTx = await usdc.approve(
					escrowAddress,
					DEPOSIT_AMOUNT
				);
				await approveTx.wait();

				const tx = await escrow.depositFor(
					deployer.address,
					DEPOSIT_AMOUNT
				);
				await tx.wait();
				console.log(`      Second deposit tx: ${tx.hash}`);

				const totalRaised = await escrow.totalRaised();
				expect(totalRaised).to.equal(TARGET_RAISE);
				console.log(
					`      Total raised: ${ethers.formatUnits(totalRaised, 6)} USDC (target met)`
				);
			});

			it("should finalize escrow", async function () {
				const tx = await escrow.adminFinalize();
				await tx.wait();
				console.log(`      Finalize tx: ${tx.hash}`);

				const finalized = await escrow.finalized();
				expect(finalized).to.be.true;
			});

			it("should distribute tokens to deployer", async function () {
				const balBefore = await propertyToken.balanceOf(
					deployer.address
				);

				const tx = await escrow.adminDistributeTokens(
					[deployer.address],
					[ESCROW_TOKEN_AMOUNT]
				);
				await tx.wait();
				console.log(`      Distribute tx: ${tx.hash}`);

				const balAfter = await propertyToken.balanceOf(
					deployer.address
				);
				expect(balAfter).to.be.greaterThan(balBefore);
				console.log(
					`      Deployer token balance: ${ethers.formatEther(balAfter)}`
				);
			});
		});

		// MARK: Flow 3 — Display Holdings

		describe("Flow 3: Display Holdings", function () {
			it("should show deployer holds property tokens", async function () {
				const balance = await propertyToken.balanceOf(
					deployer.address
				);
				expect(balance).to.be.greaterThan(0n);
				console.log(
					`      Deployer balance: ${ethers.formatEther(balance)} CTZ-INTG`
				);
			});

			it("should confirm total supply", async function () {
				const supply = await propertyToken.totalSupply();
				expect(supply).to.equal(TOKEN_SUPPLY);
				console.log(
					`      Total supply: ${ethers.formatEther(supply)}`
				);
			});

			it("should list all deployed properties", async function () {
				const properties = await factory.getDeployedProperties();
				console.log(
					`      Factory deployed properties: ${properties.length}`
				);
				for (const addr of properties) {
					console.log(`        - ${addr}`);
				}
				expect(properties.length).to.be.greaterThan(0);
			});
		});

		// MARK: Flow 4 — Dividend Distribution + Claim

		describe("Flow 4: Dividend Distribution + Claim", function () {
			it("should grant DividendVault snapshotter role", async function () {
				const tx = await propertyToken.setSnapshotter(
					contracts.DividendVault,
					true
				);
				await tx.wait();
				console.log(`      setSnapshotter tx: ${tx.hash}`);
			});

			it("should approve USDC to DividendVault", async function () {
				const tx = await usdc.approve(
					contracts.DividendVault,
					DIVIDEND_AMOUNT
				);
				await tx.wait();
				console.log(`      Approve tx: ${tx.hash}`);
			});

			it("should deposit dividend", async function () {
				const tx = await dividendVault.depositDividend(
					propertyTokenAddress,
					DIVIDEND_AMOUNT
				);
				await tx.wait();
				console.log(`      depositDividend tx: ${tx.hash}`);

				const count = await dividendVault.distributionCounts(
					propertyTokenAddress
				);
				expect(count).to.be.greaterThanOrEqual(1n);
				console.log(`      Distribution count: ${count}`);
			});

			it("should have claimable amount", async function () {
				const count = await dividendVault.distributionCounts(
					propertyTokenAddress
				);
				const distributionId = count - 1n;

				const claimable = await dividendVault.getClaimableAmount(
					propertyTokenAddress,
					distributionId,
					deployer.address
				);
				expect(claimable).to.be.greaterThan(0n);
				console.log(
					`      Claimable: ${ethers.formatUnits(claimable, 6)} USDC`
				);
			});

			it("should claim dividend", async function () {
				const count = await dividendVault.distributionCounts(
					propertyTokenAddress
				);
				const distributionId = count - 1n;

				const tx = await dividendVault.claim(
					propertyTokenAddress,
					distributionId
				);
				await tx.wait();
				console.log(`      Claim tx: ${tx.hash}`);

				const claimed = await dividendVault.hasClaimed(
					propertyTokenAddress,
					distributionId,
					deployer.address
				);
				expect(claimed).to.be.true;
			});
		});

		// MARK: Flow 5 — Supply / Valuation Query

		describe("Flow 5: Supply / Valuation Query", function () {
			it("should return expected total supply", async function () {
				const supply = await propertyToken.totalSupply();
				expect(supply).to.equal(TOKEN_SUPPLY);
			});

			it("should have a snapshot id > 0", async function () {
				const snapshotId = await propertyToken.getCurrentSnapshotId();
				expect(snapshotId).to.be.greaterThan(0n);
				console.log(`      Current snapshot ID: ${snapshotId}`);
			});

			it("should return correct balanceOfAt for deployer", async function () {
				const snapshotId = await propertyToken.getCurrentSnapshotId();
				const currentBalance = await propertyToken.balanceOf(
					deployer.address
				);
				const snapshotBalance = await propertyToken.balanceOfAt(
					deployer.address,
					snapshotId
				);

				expect(snapshotBalance).to.equal(currentBalance);
				console.log(
					`      balanceOfAt(snapshot ${snapshotId}): ${ethers.formatEther(snapshotBalance)}`
				);
			});

			it("should return correct totalSupplyAt for snapshot", async function () {
				const snapshotId = await propertyToken.getCurrentSnapshotId();
				const supply = await propertyToken.totalSupply();
				const snapshotSupply =
					await propertyToken.totalSupplyAt(snapshotId);

				expect(snapshotSupply).to.equal(supply);
			});
		});

		// MARK: Summary

		after(function () {
			console.log("\n    --- Integration Test Contracts ---");
			console.log(
				`    Network:        ${networkName} (chainId ${deployment.network?.chainId})`
			);
			console.log(`    PropertyToken:  ${propertyTokenAddress}`);
			console.log(`    ListingEscrow:  ${escrowAddress}`);
			console.log(`    DividendVault:  ${contracts.DividendVault}`);
			console.log(`    Factory:        ${contracts.PropertyFactory}`);
			console.log(`    USDC:           ${USDC_ADDRESS}`);
			console.log("");
		});
	}
);
