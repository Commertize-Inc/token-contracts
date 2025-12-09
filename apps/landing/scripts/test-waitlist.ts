import { createWaitlistEntry } from "../lib/db/waitlist";
import { WaitlistType } from "@commertize/data";
import { getORM } from "../lib/db";
import { config } from "dotenv";
import { expand } from "dotenv-expand";
import path from "path";

// Load env
const env = config({ path: path.resolve(__dirname, "../../.env") });
expand(env);

async function test() {
	try {
		console.log("Testing waitlist creation...");
		const entry = await createWaitlistEntry({
			email: `test-${Date.now()}@example.com`,
			type: WaitlistType.INVESTOR,
			firstName: "Test",
			lastName: "User",
			country: "US",
		});
		console.log("Created entry:", entry);

		const orm = await getORM();
		await orm.close();
		process.exit(0);
	} catch (e) {
		console.error("Test failed:", e);
		process.exit(1);
	}
}

test();
