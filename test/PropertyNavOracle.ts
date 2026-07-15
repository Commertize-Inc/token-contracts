import { expect } from "chai";
import hre from "hardhat";

const { ethers } = await hre.network.connect();

const PROPERTY_ID = ethers.zeroPadValue("0x1234", 32);

// abi.encode(propertyId, nav, timestamp) — matches PropertyNavConsumer._processReport
function encodeReport(propertyId: string, nav: bigint, timestamp: number): string {
	return ethers.AbiCoder.defaultAbiCoder().encode(
		["bytes32", "uint256", "uint32"],
		[propertyId, nav, timestamp]
	);
}

// abi.encodePacked(bytes32 workflowId, bytes10 workflowName, address owner) = 62 bytes
function encodeMetadata(
	workflowId: string,
	workflowName: string,
	owner: string
): string {
	return ethers.solidityPacked(
		["bytes32", "bytes10", "address"],
		[workflowId, workflowName, owner]
	);
}

describe("PropertyNavConsumer (CRE oracle sink)", function () {
	let owner: any;
	let attacker: any;
	let forwarder: any; // MockKeystoneForwarder
	let consumer: any;
	let emptyMeta: string;

	beforeEach(async function () {
		[owner, attacker] = await ethers.getSigners();

		const Forwarder = await ethers.getContractFactory("MockKeystoneForwarder");
		forwarder = await Forwarder.deploy();
		await forwarder.waitForDeployment();

		const Consumer = await ethers.getContractFactory("PropertyNavConsumer");
		consumer = await Consumer.deploy(await forwarder.getAddress());
		await consumer.waitForDeployment();

		emptyMeta = encodeMetadata(ethers.ZeroHash, "0x00000000000000000000", owner.address);
	});

	it("stores NAV from a forwarder-relayed report", async function () {
		const nav = ethers.parseUnits("1250.75", 18);
		await forwarder.relay(
			await consumer.getAddress(),
			emptyMeta,
			encodeReport(PROPERTY_ID, nav, 1_000)
		);
		const [storedNav, ts] = await consumer.latestNav(PROPERTY_ID);
		expect(storedNav).to.equal(nav);
		expect(ts).to.equal(1_000);
	});

	it("rejects a direct onReport call from a non-forwarder", async function () {
		await expect(
			consumer
				.connect(attacker)
				.onReport(emptyMeta, encodeReport(PROPERTY_ID, 1n, 1_000))
		).to.be.revertedWithCustomError(consumer, "InvalidSender");
	});

	it("discards a stale (older-or-equal timestamp) report without reverting", async function () {
		const addr = await consumer.getAddress();
		await forwarder.relay(addr, emptyMeta, encodeReport(PROPERTY_ID, 100n, 2_000));

		// Equal timestamp, different value -> discarded, emits StaleReportDiscarded.
		await expect(
			forwarder.relay(addr, emptyMeta, encodeReport(PROPERTY_ID, 999n, 2_000))
		).to.emit(consumer, "StaleReportDiscarded");

		// Older timestamp -> discarded.
		await forwarder.relay(addr, emptyMeta, encodeReport(PROPERTY_ID, 888n, 1_500));

		const [storedNav, ts] = await consumer.latestNav(PROPERTY_ID);
		expect(storedNav).to.equal(100n);
		expect(ts).to.equal(2_000);
	});

	it("accepts a strictly-newer report", async function () {
		const addr = await consumer.getAddress();
		await forwarder.relay(addr, emptyMeta, encodeReport(PROPERTY_ID, 100n, 2_000));
		await forwarder.relay(addr, emptyMeta, encodeReport(PROPERTY_ID, 200n, 2_001));
		const [storedNav, ts] = await consumer.latestNav(PROPERTY_ID);
		expect(storedNav).to.equal(200n);
		expect(ts).to.equal(2_001);
	});

	it("reverts on an empty property id", async function () {
		await expect(
			forwarder.relay(
				await consumer.getAddress(),
				emptyMeta,
				encodeReport(ethers.ZeroHash, 1n, 1_000)
			)
		).to.be.revertedWithCustomError(consumer, "EmptyPropertyId");
	});

	it("enforces workflow-id pinning once configured", async function () {
		const addr = await consumer.getAddress();
		const goodId = ethers.id("commertize-nav-production");
		await consumer.connect(owner).setExpectedWorkflowId(goodId);

		const badMeta = encodeMetadata(ethers.id("someone-else"), "0x00000000000000000000", owner.address);
		await expect(
			forwarder.relay(addr, badMeta, encodeReport(PROPERTY_ID, 1n, 1_000))
		).to.be.revertedWithCustomError(consumer, "InvalidWorkflowId");

		const goodMeta = encodeMetadata(goodId, "0x00000000000000000000", owner.address);
		await forwarder.relay(addr, goodMeta, encodeReport(PROPERTY_ID, 42n, 1_000));
		const [storedNav] = await consumer.latestNav(PROPERTY_ID);
		expect(storedNav).to.equal(42n);
	});

	it("advertises the IReceiver interface via ERC-165", async function () {
		// IReceiver.onReport(bytes,bytes) selector-based interfaceId.
		const iface = new ethers.Interface([
			"function onReport(bytes metadata, bytes report)",
		]);
		const selector = iface.getFunction("onReport")!.selector;
		expect(await consumer.supportsInterface(selector)).to.equal(true);
	});
});
