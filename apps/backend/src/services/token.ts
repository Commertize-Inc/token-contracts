import { ethers } from "ethers";
import {
	getFactoryContract,
	getTokenContract,
	getWallet,
	getProvider,
	getIdentityRegistryContract,
	getUSDCContract,
	getComplianceContract,
} from "@commertize/nexus";
import { Listing, SupportedCurrency } from "@commertize/data";

export class TokenService {
	// Deploy a new Property Token via the Factory
	static async deployPropertyToken(listing: Listing): Promise<string> {
		try {
			console.log(`Deploying token for listing ${listing.id}...`);
			const provider = getProvider();
			const wallet = getWallet(provider);
			const factory = getFactoryContract(wallet);

			// 1. Ensure Admin is Verified
			const isVerified = await TokenService.isVerified(wallet.address);
			if (!isVerified) {
				console.log("Admin not verified. Registering Admin Identity...");
				await TokenService.registerIdentity(
					wallet.address,
					840,
					ethers.keccak256(ethers.toUtf8Bytes("ADMIN"))
				);
			}

			// 2. Deploy Property Token
			const tx = await factory.deployProperty(
				listing.name,
				`CRE-${listing.id.substring(0, 4).toUpperCase()}`, // Symbol
				ethers.parseEther(listing.tokenomics.totalTokenSupply.toString()),
				await getComplianceContract(provider).getAddress()
			);

			console.log(`Deployment TX sent: ${tx.hash}`);
			const receipt = await tx.wait();

			// Parse Token Address
			let tokenAddress = "";
			for (const log of receipt.logs) {
				try {
					const parsed = factory.interface.parseLog(log);
					if (parsed?.name === "PropertyDeployed") {
						tokenAddress = parsed.args[0];
						break;
					}
				} catch (e) { }
			}
			if (!tokenAddress)
				throw new Error("Token deployed but address not found in logs");
			console.log(`Token Deployed at: ${tokenAddress}`);

			// 2. Determine Funding Currency Address
			// Default to HBAR (Address 0)
			let paymentToken = ethers.ZeroAddress;
			let decimals = 18;

			if (listing.fundingCurrency === SupportedCurrency.USDC) {
				// Official USDC on Hedera
				const deploymentConfig =
					process.env.VITE_DEPLOYMENT_JSON || process.env.DEPLOYMENT_JSON;
				let isMainnet = false;
				if (deploymentConfig) {
					try {
						const config = JSON.parse(deploymentConfig);
						if (config.network?.name?.includes("mainnet")) {
							isMainnet = true;
						}
					} catch (e) {
						console.error("Failed to parse DEPLOYMENT_JSON:", e);
					}
				}
				// Fallback to Env var if exists
				if (process.env.HEDERA_NETWORK === "mainnet") isMainnet = true;

				paymentToken = isMainnet
					? "0x000000000000000000000000000000000006f89a" // Mainnet (0.0.456858)
					: "0x0000000000000000000000000000000000068cda"; // Testnet (0.0.429274)
				decimals = 6;
			} else if (listing.fundingCurrency === SupportedCurrency.CREUSD) {
				// Platform Token (Aliased to USDC_ADDRESS env var in Nexus usually)
				// Or check Nexus constant
				// We can import USDC_ADDRESS from Nexus?
				// For now hardcode or use the param if available.
				// Since TokenService uses `getUSDCContract`, let's see what that uses.
				// For now, assume CREUSD = the one in ENV.
				const nexus = await import("@commertize/nexus");
				paymentToken = nexus.USDC_ADDRESS;
				decimals = 6;
			}

			// 3. Deploy Listing Escrow
			console.log(
				`Deploying Escrow for Currency: ${listing.fundingCurrency} (${paymentToken})...`
			);
			const tokensForInvestors = listing.tokenomics.tokensForInvestors;
			const price = listing.tokenomics.tokenPrice;
			const targetRaise = ethers.parseUnits(
				(tokensForInvestors * price).toFixed(decimals),
				decimals
			);
			const deadline = Math.floor(Date.now() / 1000) + 86400 * 60; // 60 Days

			const escrowTx = await factory.deployEscrow(
				tokenAddress,
				paymentToken,
				listing.sponsor.walletAddress || wallet.address, // Sponsor Address
				targetRaise,
				deadline
			);
			const escrowReceipt = await escrowTx.wait();

			// Parse Escrow Address
			let escrowAddress = "";
			for (const log of escrowReceipt.logs) {
				try {
					const parsed = factory.interface.parseLog(log);
					if (parsed?.name === "EscrowDeployed") {
						escrowAddress = parsed.args[0];
						break;
					}
				} catch (e) { }
			}
			console.log(`Escrow Deployed at: ${escrowAddress}`);

			if (escrowAddress) {
				// Update Listing Entity (Saved by Caller usually, but we modify the object here)
				listing.escrowContractAddress = escrowAddress;

				// 3.5 Register Escrow Identity (So it can receive Property Tokens)
				// Use country 840 (US) or 0? 0 usually for System/Contracts if valid.
				// Or same as Deployer.
				// We need to register it.
				console.log(`Registering Escrow Identity: ${escrowAddress}`);
				const identityRegistry = getIdentityRegistryContract(wallet);
				// Hash "ESCROW"
				const escrowHash = ethers.keccak256(ethers.toUtf8Bytes("ESCROW"));
				try {
					const idTx = await identityRegistry.registerIdentity(
						escrowAddress,
						840,
						escrowHash
					);
					await idTx.wait();
					console.log(`Escrow Registered.`);
				} catch (e: any) {
					console.warn(
						`Escrow Registration Warning (maybe already registered): ${e.message}`
					);
				}

				// 4. Transfer Property Tokens to Escrow
				// Backend Wallet currently holds the supply.
				// We transfer ONLY the investor portion? Or all?
				// Proposed: Transfer Investor Portion to Escrow.
				console.log(`Transferring ${tokensForInvestors} Tokens to Escrow...`);
				const tokenContract = getTokenContract(tokenAddress, wallet);
				const transferAmount = ethers.parseEther(tokensForInvestors.toString());

				// Standard ERC20 Transfer (Now compliant)
				const trTx = await tokenContract.transfer(
					escrowAddress,
					transferAmount
				);
				await trTx.wait();
				console.log(`Tokens Transferred.`);
			}

			return tokenAddress;
		} catch (error) {
			console.error("Token Deployment Failed:", error);
			throw error;
		}
	}

	// Transfer Tokens to Investor (Since all are minted to Backend initially)
	static async distributeToken(
		tokenAddress: string,
		investorAddress: string,
		amountTokens: number
	): Promise<string> {
		try {
			const provider = getProvider();
			const wallet = getWallet(provider);
			const token = getTokenContract(tokenAddress, wallet);

			// Standardize amount (decimals default 18?)
			const amountWei = ethers.parseEther(amountTokens.toString());

			console.log(
				`Transferring ${amountTokens} tokens to ${investorAddress}...`
			);

			// Backend is the owner and holds supply. Transfer to investor.
			const tx = await token.transfer(investorAddress, amountWei);
			const receipt = await tx.wait();

			return receipt.hash;
		} catch (error) {
			console.error("Distribution Failed:", error);
			throw error;
		}
	}

	// Register Identity in Registry
	static async registerIdentity(
		userAddress: string,
		country: number,
		identityString: string
	): Promise<string> {
		try {
			console.log(
				`Registering identity for ${userAddress} (Country: ${country})...`
			);

			const provider = getProvider();
			const wallet = getWallet(provider);
			const identityRegistry = getIdentityRegistryContract(wallet);

			// Hash the identity string (Plaid IDV or User ID)
			// Keccak256 requires bytes, so we convert string to Utf8Bytes first.
			const identityHash = ethers.keccak256(ethers.toUtf8Bytes(identityString));

			console.log(`Identity Hash: ${identityHash}`);

			const tx = await identityRegistry.registerIdentity(
				userAddress,
				country,
				identityHash
			);
			const receipt = await tx.wait();

			console.log(`Identity Registered: ${receipt.hash}`);
			return receipt.hash;
		} catch (error) {
			console.error("Identity Registration Failed:", error);
			throw error;
		}
	}

	// Check if User is Verified
	static async isVerified(userAddress: string): Promise<boolean> {
		try {
			const provider = getProvider();
			const identityRegistry = getIdentityRegistryContract(provider);

			return await identityRegistry.isVerified(userAddress);
		} catch (error) {
			console.error("Verification Check Failed:", error);
			return false; // Fail safe
		}
	}

	// Execute Gasless Investment (Permit + TransferFrom)
	static async executeGaslessInvestment(
		userAddress: string,
		amountUsdc: number,
		permit: {
			deadline: number;
			v: number;
			r: string;
			s: string;
		}
	): Promise<string> {
		try {
			const provider = getProvider();
			const wallet = getWallet(provider);
			const usdc = getUSDCContract(wallet);

			console.log(
				`Executing gasless investment for ${userAddress}, Amount: ${amountUsdc} USDC`
			);

			// Amount using 6 decimals (Standard USDC)
			const amountWei = ethers.parseUnits(amountUsdc.toString(), 6);

			// 1. Submit Permit
			console.log("Submitting USDC Permit...");
			// DO NOT SWALLOW ERROR. If permit fails, we can't transfer.
			const permitTx = await usdc.permit(
				userAddress,
				wallet.address, // Spender (Backend Wallet)
				amountWei,
				permit.deadline,
				permit.v,
				permit.r,
				permit.s
			);
			await permitTx.wait();
			console.log(`Permit Confirmed: ${permitTx.hash}`);

			// 2. TransferFrom User to Backend Wallet (Treasury)
			console.log("Executing TransferFrom...");
			const transferTx = await usdc.transferFrom(
				userAddress,
				wallet.address,
				amountWei
			);
			const receipt = await transferTx.wait();
			console.log(`Transfer Confirmed: ${receipt.hash}`);

			return receipt.hash;
		} catch (error: any) {
			console.error("Gasless Investment Failed:", error);
			throw error;
		}
	}
}
