import { loadEnv } from "@commertize/utils/server";
loadEnv("../");

import { MikroORM } from "@mikro-orm/core";
import { PostgreSqlDriver } from "@mikro-orm/postgresql";
import config from "@commertize/data/config";
import { Listing } from "@commertize/data";
import { getWallet, getProvider, getEscrowContract } from "@commertize/nexus";
import { ethers } from "ethers";

async function main() {
	console.log("Initializing Database Connection...");
	const orm = await MikroORM.init<PostgreSqlDriver>(await config);
	const em = orm.em.fork();

	const listingId = "testnet-hbar-1";
	console.log(`Finding listing ${listingId}...`);

	// Find Listing
	const listing = await em.findOne(Listing, { id: listingId });
	if (!listing) {
		throw new Error(`Listing ${listingId} not found. Run seed-testnet first.`);
	}

	if (!listing.escrowContractAddress) {
		throw new Error(
			"Listing has no Escrow Contract Address. Re-run seed-testnet."
		);
	}

	console.log(`Escrow Address: ${listing.escrowContractAddress}`);

	// Connect Wallet (Admin/Investor)
	const provider = getProvider();
	const wallet = getWallet(provider);
	console.log(`Investor Wallet: ${wallet.address}`);

	const balance = await provider.getBalance(wallet.address);
	console.log(`Wallet Balance: ${ethers.formatEther(balance)} HBAR`);

	// Investment Amount: 10 Tokens * $10 = $100.
	// Wait, price is 10 HBAR? Or $10?
	// Tokenomics: tokenPrice: 10. Funding Currency: HBAR.
	// So 10 HBAR per token.
	// Let's buy 5 Tokens = 50 HBAR.
	const tokensToBuy = 5;
	const pricePerToken = listing.tokenomics.tokenPrice; // 10
	const totalCostHbar = tokensToBuy * pricePerToken; // 50
	const amountWei = ethers.parseEther(totalCostHbar.toString());

	console.log(`Buying ${tokensToBuy} tokens for ${totalCostHbar} HBAR...`);

	// Get Escrow Contract
	const escrow = getEscrowContract(listing.escrowContractAddress, wallet);

	// Call Deposit
	// Function: deposit(uint256 amount) payable
	// Reverts if msg.value != amount (for Native)
	console.log("Sending Transaction...");
	const tx = await escrow.deposit(amountWei, { value: amountWei });
	console.log(`Transaction Sent: ${tx.hash}`);

	const receipt = await tx.wait();
	console.log("Transaction Confirmed!");

	// Check Events?
	// Escrow emits Deposited(user, amount)
	console.log("Investment Successful!");

	await orm.close();
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
