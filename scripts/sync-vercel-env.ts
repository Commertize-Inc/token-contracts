import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

const APPS_DIR = path.join(process.cwd(), "apps");
const APPS = ["landing", "dashboard", "backend"]; // Apps to sync to

// Args
const args = process.argv.slice(2);
const stageArg = args.find((arg) => arg.startsWith("--stage="))?.split("=")[1];
const dryRun = args.includes("--dry-run");

const VALID_STAGES = ["preview", "production", "development"];
const stage = stageArg || "development";

if (!VALID_STAGES.includes(stage)) {
	console.error(
		`Error: Invalid stage '${stage}'. Must be one of: ${VALID_STAGES.join(
			", "
		)}`
	);
	process.exit(1);
}

const sourceFile = `.env.${stage}`;

if (!fs.existsSync(sourceFile)) {
	console.error(`Error: Source file '${sourceFile}' not found.`);
	process.exit(1);
}

console.log(`Loading env vars from: ${sourceFile} for stage: ${stage}`);
const envConfig = dotenv.parse(fs.readFileSync(sourceFile));

// Keys to ignore (system specific or secrets we don't want to sync blindly)
const IGNORED_KEYS = ["NODE_ENV", "PORT"];

async function sync() {
	for (const app of APPS) {
		const appDir = path.join(APPS_DIR, app);
		if (!fs.existsSync(appDir)) {
			console.warn(`Skipping ${app}: Directory not found.`);
			continue;
		}

		console.log(`\n--- Syncing to apps/${app} (${stage}) ---`);

		for (const [key, value] of Object.entries(envConfig)) {
			if (IGNORED_KEYS.includes(key)) continue;

			if (dryRun) {
				console.log(`[DRY RUN] Would set ${key}=${value.substring(0, 5)}...`);
				continue;
			}

			try {
				console.log(`Setting ${key}...`);

				// First remove the existing variable for this target to ensure we can set the new one
				// We pipe 'yes' or use --yes to avoid prompts if it doesn't exist (though rm usually errs if not found, we ignore that)
				try {
					execSync(`vercel env rm ${key} ${stage} --yes`, {
						cwd: appDir,
						stdio: "ignore", // Suppress output for removal, it's noisy if it fails
					});
				} catch {
					// Ignore error if it didn't exist
				}

				// Add the new value
				// We use printf to pipe the value purely to avoid shell expansion issues with complex chars
				execSync(`printf "%s" "${value}" | vercel env add ${key} ${stage}`, {
					cwd: appDir,
					stdio: "inherit",
				});
			} catch (err) {
				console.error(`Failed to set ${key} for ${app}`, err);
			}
		}
	}
}

sync();
