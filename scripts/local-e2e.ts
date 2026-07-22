import hre from "hardhat";
import fs from "node:fs";
import path from "node:path";

/**
 * End-to-end deployment validation against a local chain. Assumes the core
 * contracts are already deployed (scripts/deploy.ts) and reads their addresses
 * from deployment.localhost.json. Run via `pnpm test:e2e` (scripts/e2e-local.sh
 * boots the chain and runs both steps) — see README Development.
 *
 * Exercises: investor KYC, factory-deployed PropertyToken + ListingEscrow,
 * compliance/vault wiring, a full native raise through finalize() with token
 * distribution, and deployment + wiring of the CRE consumer and CCIP identity
 * sync pair.
 */

const { ethers } = await hre.network.connect();
const [deployer, investor] = await ethers.getSigners();

const deploymentPath = path.join(
	import.meta.dirname,
	"../deployment.localhost.json"
);
if (!fs.existsSync(deploymentPath)) {
	throw new Error(
		"deployment.localhost.json not found — run `CI=true hardhat run --network localhost scripts/deploy.ts` first (or use scripts/e2e-local.sh)."
	);
}
const c = JSON.parse(fs.readFileSync(deploymentPath, "utf-8")).contracts;

const registry = await ethers.getContractAt(
	"IdentityRegistry",
	c.IdentityRegistry,
	deployer
);
const compliance = await ethers.getContractAt(
	"TokenCompliance",
	c.TokenCompliance,
	deployer
);
const factory = await ethers.getContractAt(
	"PropertyFactory",
	c.PropertyFactory,
	deployer
);
const vault = await ethers.getContractAt(
	"DividendVault",
	c.DividendVault,
	deployer
);

const KYC = ethers.keccak256(ethers.toUtf8Bytes("KYC"));
const SUPPLY = ethers.parseUnits("1000", 18);
const TARGET = ethers.parseEther("1");

function ok(msg: string) {
	console.log(`[ok] ${msg}`);
}
function assertEqual(actual: unknown, expected: unknown, what: string) {
	if (actual !== expected) {
		throw new Error(`${what}: expected ${expected}, got ${actual}`);
	}
}
function parsedEvent(receipt: any, name: string) {
	const evt = receipt.logs
		.map((l: any) => {
			try {
				return factory.interface.parseLog(l);
			} catch {
				return null;
			}
		})
		.find((e: any) => e?.name === name);
	if (!evt) throw new Error(`event ${name} not emitted`);
	return evt;
}

// MARK: KYC

await (await registry.registerIdentity(investor.address, 840, KYC)).wait();
assertEqual(await registry.isVerified(investor.address), true, "investor KYC");
ok("investor KYC registered");

// MARK: Factory lifecycle

let rc = await (
	await factory.deployProperty("E2E Prop", "E2EP", SUPPLY, c.TokenCompliance)
).wait();
const tokenAddr = parsedEvent(rc, "PropertyDeployed").args.property;
const token = await ethers.getContractAt("PropertyToken", tokenAddr, deployer);
ok(`PropertyToken deployed via factory: ${tokenAddr}`);

const now = BigInt((await ethers.provider.getBlock("latest"))!.timestamp);
rc = await (
	await factory.deployEscrow(
		tokenAddr,
		ethers.ZeroAddress, // native raise
		deployer.address,
		TARGET,
		now + 3600n
	)
).wait();
const escrowAddr = parsedEvent(rc, "EscrowDeployed").args.escrow;
const escrow = await ethers.getContractAt("ListingEscrow", escrowAddr, deployer);
ok(`ListingEscrow deployed via factory: ${escrowAddr}`);

// MARK: Wiring

await (await compliance.setExempt(escrowAddr, true)).wait();
await (await token.transfer(escrowAddr, SUPPLY)).wait();
await (await vault.setPropertyValid(tokenAddr, true)).wait();
await (await token.setSnapshotter(c.DividendVault, true)).wait();
ok("escrow exempted, supply escrowed, vault validated + snapshotter");

// MARK: Raise lifecycle

await (await escrow.connect(investor).deposit(0, { value: TARGET })).wait();
await ethers.provider.send("evm_increaseTime", [3700]);
await ethers.provider.send("evm_mine", []);
await (await escrow.finalize()).wait();
assertEqual(
	await token.balanceOf(investor.address),
	SUPPLY,
	"investor token balance after finalize"
);
assertEqual(
	await ethers.provider.getBalance(tokenAddr),
	TARGET,
	"raise proceeds in PropertyToken vault"
);
ok("raise finalized: tokens distributed, proceeds in vault");

// MARK: Oracle + identity sync

const consumer = await (
	await ethers.getContractFactory("PropertyNavConsumer", deployer)
).deploy(deployer.address);
await consumer.waitForDeployment();
ok(`PropertyNavConsumer deployed: ${await consumer.getAddress()}`);

const sender = await (
	await ethers.getContractFactory("IdentitySyncSender", deployer)
).deploy(deployer.address, ethers.ZeroAddress, deployer.address);
await sender.waitForDeployment();
const receiver = await (
	await ethers.getContractFactory("IdentitySyncReceiver", deployer)
).deploy(deployer.address, c.IdentityRegistry, deployer.address);
await receiver.waitForDeployment();
await (
	await registry.grantRole(await registry.SYNC_ROLE(), await receiver.getAddress())
).wait();
await (
	await receiver.setTrustedSender(3478487238524512106n, await sender.getAddress())
).wait();
ok("IdentitySyncSender/Receiver deployed and wired (SYNC_ROLE + trusted sender)");

console.log("\nLOCAL E2E DEPLOYMENT: ALL CHECKS PASSED");
