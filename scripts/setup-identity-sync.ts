import hre from "hardhat";
import chalk from "chalk";
import { getNetwork } from "../networks";

/**
 * Wires cross-chain identity sync on the CONNECTED network. Because the pieces
 * live on different chains, run this once per chain with the relevant env set:
 *
 * On a DESTINATION chain (has IdentityRegistry + IdentitySyncReceiver):
 *   SYNC_REGISTRY=0x...        # IdentityRegistry
 *   SYNC_RECEIVER=0x...        # IdentitySyncReceiver deployed here
 *   SYNC_SOURCE_SELECTOR=...   # home chain's CCIP selector
 *   SYNC_HOME_SENDER=0x...     # IdentitySyncSender address on the home chain
 *   -> grants SYNC_ROLE to the receiver, sets its trusted sender.
 *
 * On the HOME chain (has IdentitySyncSender):
 *   SYNC_SENDER=0x...          # IdentitySyncSender deployed here
 *   SYNC_DEST_SELECTORS=111,222
 *   SYNC_DEST_RECEIVERS=0xAaa...,0xBbb...   # IdentitySyncReceiver per dest
 *   -> registers each destination on the sender.
 *
 * Idempotent: safe to re-run. Skips whichever half isn't configured.
 *
 * Usage: hardhat run --network arc-testnet scripts/setup-identity-sync.ts
 */

const REGISTRY_ABI = [
	"function SYNC_ROLE() view returns (bytes32)",
	"function hasRole(bytes32 role, address account) view returns (bool)",
	"function grantRole(bytes32 role, address account)",
];
const RECEIVER_ABI = [
	"function setTrustedSender(uint64 sourceChainSelector, address sender)",
	"function trustedSender(uint64) view returns (address)",
];
const SENDER_ABI = [
	"function setDestination(uint64 chainSelector, address receiver)",
	"function destReceiver(uint64) view returns (address)",
];

const { ethers, networkName } = await hre.network.connect();
const [signer] = await ethers.getSigners();

try {
	getNetwork(networkName);
} catch {
	console.error(
		`Error: no config for network '${networkName}'. Run with --network <name>.`
	);
	process.exit(1);
}

console.log(chalk.bold.blue(`\nIdentity sync setup on ${networkName}`));
console.log(`Signer: ${chalk.yellow(signer.address)}`);

let didSomething = false;

// Destination-side wiring.
if (process.env.SYNC_REGISTRY && process.env.SYNC_RECEIVER) {
	const registryAddr = ethers.getAddress(process.env.SYNC_REGISTRY);
	const receiverAddr = ethers.getAddress(process.env.SYNC_RECEIVER);
	const registry = new ethers.Contract(registryAddr, REGISTRY_ABI, signer);
	const syncRole = await registry.SYNC_ROLE();

	if (await registry.hasRole(syncRole, receiverAddr)) {
		console.log("SYNC_ROLE: receiver already granted.");
	} else {
		console.log("Granting SYNC_ROLE to the receiver...");
		await (await registry.grantRole(syncRole, receiverAddr)).wait();
	}

	if (process.env.SYNC_SOURCE_SELECTOR && process.env.SYNC_HOME_SENDER) {
		const selector = BigInt(process.env.SYNC_SOURCE_SELECTOR);
		const homeSender = ethers.getAddress(process.env.SYNC_HOME_SENDER);
		const receiver = new ethers.Contract(receiverAddr, RECEIVER_ABI, signer);
		const current = ethers.getAddress(await receiver.trustedSender(selector));
		if (current === homeSender) {
			console.log("Trusted sender already set.");
		} else {
			console.log(`Setting trusted sender for selector ${selector}...`);
			await (await receiver.setTrustedSender(selector, homeSender)).wait();
		}
	} else {
		console.warn(
			chalk.yellow(
				"SYNC_SOURCE_SELECTOR / SYNC_HOME_SENDER not set — skipped trusted-sender wiring."
			)
		);
	}
	didSomething = true;
}

// Home-side wiring.
if (process.env.SYNC_SENDER) {
	const senderAddr = ethers.getAddress(process.env.SYNC_SENDER);
	const sender = new ethers.Contract(senderAddr, SENDER_ABI, signer);
	const selectors = (process.env.SYNC_DEST_SELECTORS ?? "")
		.split(",")
		.map((s) => s.trim())
		.filter(Boolean);
	const receivers = (process.env.SYNC_DEST_RECEIVERS ?? "")
		.split(",")
		.map((s) => s.trim())
		.filter(Boolean);
	if (selectors.length === 0 || selectors.length !== receivers.length) {
		console.error(
			"Error: SYNC_DEST_SELECTORS and SYNC_DEST_RECEIVERS must be non-empty and equal length."
		);
		process.exit(1);
	}
	for (let i = 0; i < selectors.length; i++) {
		const sel = BigInt(selectors[i]);
		const recv = ethers.getAddress(receivers[i]);
		const current = ethers.getAddress(await sender.destReceiver(sel));
		if (current === recv) {
			console.log(`Destination ${sel} already set.`);
		} else {
			console.log(`Setting destination ${sel} -> ${recv}...`);
			await (await sender.setDestination(sel, recv)).wait();
		}
	}
	didSomething = true;
}

if (!didSomething) {
	console.error(
		"Error: nothing to do. Set the destination-side (SYNC_REGISTRY + SYNC_RECEIVER) or home-side (SYNC_SENDER) env vars."
	);
	process.exit(1);
}

console.log(chalk.bold.green("\nIdentity sync setup complete."));
