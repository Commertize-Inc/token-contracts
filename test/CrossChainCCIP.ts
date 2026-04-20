/**
 * Cross-Chain CCIP Test — Arc Testnet → Ethereum Sepolia
 *
 * Validates Chainlink CCIP infrastructure on Arc testnet and sends
 * a data-only message to Ethereum Sepolia via the CCIP router.
 *
 * Run with: hardhat test test/CrossChainCCIP.ts --network arc-testnet
 *
 * Requirements:
 *   - EVM_PRIVATE_KEY env var set (the deployer key)
 *   - Deployer holds >= 1 LINK on Arc testnet for fees
 */
import { expect } from "chai";
import hre from "hardhat";
import { describe, before, it, after } from "node:test";

const { ethers, networkName } = await hre.network.connect();

// MARK: CCIP Addresses (Arc Testnet)

const CCIP_ROUTER = "0xdE4E7FED43FAC37EB21aA0643d9852f75332eab8";
const LINK_TOKEN = "0x3F1f176e347235858DD6Db905DDBA09Eaf25478a";
const WUSDC_TOKEN = "0xbf4B839A7939a52acbF8fC52D5Bd5BFE69a064EA";
const RMN_ADDRESS = "0xD610B8f58689de7755947C05342A2DFaC30ebD57";
const TOKEN_ADMIN_REGISTRY = "0xd3e461C55676B10634a5F81b747c324B85686Dd1";
const ONRAMP_ARC_SEPOLIA = "0x2016AA303B331bd739Fd072998e579a3052500A6";

const ARC_CHAIN_SELECTOR = 3034092155422581607n;
const SEPOLIA_CHAIN_SELECTOR = 16015286601757825753n;

// MARK: Inline ABIs

const ROUTER_ABI = [
	"function isChainSupported(uint64 destChainSelector) view returns (bool)",
	"function getFee(uint64 destChainSelector, tuple(bytes receiver, bytes data, tuple(address token, uint256 amount)[] tokenAmounts, address feeToken, bytes extraArgs) message) view returns (uint256)",
	"function ccipSend(uint64 destChainSelector, tuple(bytes receiver, bytes data, tuple(address token, uint256 amount)[] tokenAmounts, address feeToken, bytes extraArgs) message) payable returns (bytes32)",
	"event CCIPSendRequested(bytes32 indexed messageId)",
];

const ERC20_ABI = [
	"function balanceOf(address) view returns (uint256)",
	"function approve(address,uint256) returns (bool)",
	"function allowance(address,address) view returns (uint256)",
	"function decimals() view returns (uint8)",
	"function symbol() view returns (string)",
	"function name() view returns (string)",
];

// MARK: State

let deployer: any;
let router: any;
let link: any;
let wusdc: any;
let skipSuite = false;
let messageId: string | null = null;
let sendTxHash: string | null = null;
let ccipExplorerUrl: string | null = null;
let estimatedFee: bigint = 0n;
let message: any;

describe(
	`Cross-Chain CCIP — ${networkName} → Ethereum Sepolia`,
	{ timeout: 120_000 },
	function () {
		// MARK: Setup

		before(async function () {
			[deployer] = await ethers.getSigners();
			console.log(`    Deployer: ${deployer.address}`);

			router = new ethers.Contract(CCIP_ROUTER, ROUTER_ABI, deployer);
			link = new ethers.Contract(LINK_TOKEN, ERC20_ABI, deployer);
			wusdc = new ethers.Contract(WUSDC_TOKEN, ERC20_ABI, deployer);

			const nativeBalance = await deployer.provider.getBalance(
				deployer.address
			);
			const linkBalance = await link.balanceOf(deployer.address);
			const wusdcBalance = await wusdc.balanceOf(deployer.address);

			console.log(
				`    Native USDC balance: ${ethers.formatEther(nativeBalance)} USDC`
			);
			console.log(
				`    LINK balance:        ${ethers.formatEther(linkBalance)} LINK`
			);
			console.log(
				`    WUSDC balance:       ${ethers.formatEther(wusdcBalance)} WUSDC`
			);

			if (linkBalance < ethers.parseEther("1")) {
				console.log(
					"\n    SKIP: Deployer has < 1 LINK — insufficient for CCIP fees.\n"
				);
				skipSuite = true;
			}

			// Pre-build the EVM2AnyMessage struct used across tests
			const abiCoder = ethers.AbiCoder.defaultAbiCoder();
			const receiverEncoded = abiCoder.encode(
				["address"],
				[deployer.address]
			);
			const dataEncoded = abiCoder.encode(
				["string"],
				["Commertize CCIP Test"]
			);

			// extraArgs v2: tag 0x181dcf10 + encode(gasLimit, allowOutOfOrderExecution)
			const extraArgsPayload = abiCoder.encode(
				["uint256", "bool"],
				[200_000, false]
			);
			const extraArgs = "0x181dcf10" + extraArgsPayload.slice(2);

			message = {
				receiver: receiverEncoded,
				data: dataEncoded,
				tokenAmounts: [],
				feeToken: LINK_TOKEN,
				extraArgs: extraArgs,
			};
		});

		// MARK: CCIP Infrastructure Verification

		describe("CCIP Infrastructure Verification", function () {
			it("Router has deployed code", async function () {
				if (skipSuite) return;
				const code = await deployer.provider.getCode(CCIP_ROUTER);
				expect(code).to.not.equal("0x", "Router has no code");
				console.log(`      Router: ${CCIP_ROUTER}`);
			});

			it("LINK token has deployed code and deployer balance > 0", async function () {
				if (skipSuite) return;
				const code = await deployer.provider.getCode(LINK_TOKEN);
				expect(code).to.not.equal("0x", "LINK token has no code");
				const balance = await link.balanceOf(deployer.address);
				expect(balance).to.be.greaterThan(0n);
				console.log(
					`      LINK: ${LINK_TOKEN} (${ethers.formatEther(balance)} LINK)`
				);
			});

			it("WUSDC has deployed code", async function () {
				if (skipSuite) return;
				const code = await deployer.provider.getCode(WUSDC_TOKEN);
				expect(code).to.not.equal("0x", "WUSDC has no code");
				console.log(`      WUSDC: ${WUSDC_TOKEN}`);
			});

			it("RMN has deployed code", async function () {
				if (skipSuite) return;
				const code = await deployer.provider.getCode(RMN_ADDRESS);
				expect(code).to.not.equal("0x", "RMN has no code");
				console.log(`      RMN: ${RMN_ADDRESS}`);
			});

			it("Token Admin Registry has deployed code", async function () {
				if (skipSuite) return;
				const code = await deployer.provider.getCode(
					TOKEN_ADMIN_REGISTRY
				);
				expect(code).to.not.equal(
					"0x",
					"Token Admin Registry has no code"
				);
				console.log(`      Token Admin Registry: ${TOKEN_ADMIN_REGISTRY}`);
			});

			it("OnRamp (Arc→Sepolia) has deployed code", async function () {
				if (skipSuite) return;
				const code = await deployer.provider.getCode(
					ONRAMP_ARC_SEPOLIA
				);
				expect(code).to.not.equal("0x", "OnRamp has no code");
				console.log(`      OnRamp: ${ONRAMP_ARC_SEPOLIA}`);
			});

			it("Router supports Sepolia as destination chain", async function () {
				if (skipSuite) return;
				const supported = await router.isChainSupported(
					SEPOLIA_CHAIN_SELECTOR
				);
				expect(supported).to.be.true;
				console.log(
					`      Sepolia chain selector: ${SEPOLIA_CHAIN_SELECTOR} (supported: true)`
				);
			});
		});

		// MARK: CCIP Fee Estimation

		describe("CCIP Fee Estimation", function () {
			it("getFee() returns a positive LINK fee for data message", async function () {
				if (skipSuite) return;

				estimatedFee = await router.getFee(
					SEPOLIA_CHAIN_SELECTOR,
					message
				);

				console.log(
					`      Estimated fee: ${ethers.formatEther(estimatedFee)} LINK`
				);
				expect(estimatedFee).to.be.greaterThan(0n);
			});

			it("Deployer has enough LINK to cover the fee", async function () {
				if (skipSuite) return;
				const linkBalance = await link.balanceOf(deployer.address);
				expect(linkBalance).to.be.greaterThanOrEqual(estimatedFee);
				console.log(
					`      LINK balance: ${ethers.formatEther(linkBalance)} >= fee ${ethers.formatEther(estimatedFee)}`
				);
			});
		});

		// MARK: CCIP Send Message

		describe("CCIP Send Message", function () {
			it("Approve LINK to router and send cross-chain message", async function () {
				if (skipSuite) return;

				// Approve LINK spend
				const approveTx = await link.approve(
					CCIP_ROUTER,
					estimatedFee
				);
				await approveTx.wait();
				console.log(`      LINK approved: ${ethers.formatEther(estimatedFee)}`);

				const allowance = await link.allowance(
					deployer.address,
					CCIP_ROUTER
				);
				expect(allowance).to.be.greaterThanOrEqual(estimatedFee);

				// Send CCIP message
				const sendTx = await router.ccipSend(
					SEPOLIA_CHAIN_SELECTOR,
					message
				);
				const receipt = await sendTx.wait();
				sendTxHash = receipt!.hash;

				console.log(`      Tx hash: ${sendTxHash}`);

				// Parse CCIPSendRequested event
				const routerInterface = new ethers.Interface(ROUTER_ABI);
				for (const log of receipt!.logs) {
					try {
						const parsed = routerInterface.parseLog(log);
						if (parsed && parsed.name === "CCIPSendRequested") {
							messageId = parsed.args.messageId;
							break;
						}
					} catch {
						// Not a router event
					}
				}

				// Fallback: look for any indexed bytes32 topic
				if (!messageId && receipt!.logs.length > 0) {
					for (const log of receipt!.logs) {
						if (log.topics && log.topics.length >= 2) {
							const candidate = log.topics[1];
							if (
								candidate &&
								candidate.length === 66 &&
								candidate !== ethers.ZeroHash
							) {
								messageId = candidate;
								console.log(
									`      (messageId from fallback topic parsing)`
								);
								break;
							}
						}
					}
				}

				if (messageId) {
					ccipExplorerUrl = `https://ccip.chain.link/msg/${messageId}`;
					console.log(`      Message ID: ${messageId}`);
					console.log(`      CCIP Explorer: ${ccipExplorerUrl}`);
				} else {
					console.log(
						`      Warning: CCIPSendRequested event not found in ${receipt!.logs.length} logs`
					);
					console.log(
						`      Tx succeeded — check explorer manually`
					);
				}

				expect(receipt!.status).to.equal(1);
			});
		});

		// MARK: Message Status

		describe("Message Status (best-effort)", function () {
			it("Log CCIP Explorer URL for manual verification", async function () {
				if (skipSuite) return;
				if (ccipExplorerUrl) {
					console.log(`      CCIP Explorer: ${ccipExplorerUrl}`);
					console.log(
						`      Note: testnet messages take 5-20 minutes for finality`
					);
				} else {
					console.log(
						`      No messageId captured — verify via tx hash on block explorer`
					);
				}
			});
		});

		// MARK: Summary

		after(function () {
			console.log("\n    --- CCIP Cross-Chain Summary ---");
			console.log(`    Network:         ${networkName}`);
			console.log(`    Router:          ${CCIP_ROUTER}`);
			console.log(`    Destination:     Ethereum Sepolia (${SEPOLIA_CHAIN_SELECTOR})`);
			console.log(`    Suite skipped:   ${skipSuite}`);

			if (!skipSuite) {
				console.log(
					`    Estimated fee:   ${ethers.formatEther(estimatedFee)} LINK`
				);
				console.log(`    Message ID:      ${messageId ?? "N/A"}`);
				console.log(`    Tx hash:         ${sendTxHash ?? "N/A"}`);
				console.log(`    CCIP Explorer:   ${ccipExplorerUrl ?? "N/A"}`);
				console.log(
					`\n    Verify delivery on Ethereum Sepolia via CCIP Explorer:`
				);
				console.log(`    ${ccipExplorerUrl ?? "(no URL)"}`);
			}

			console.log("");
		});
	}
);
