const { execSync } = require("child_process");
const prompts = require("prompts");
const chalk = require("chalk");
const fs = require("fs");
const path = require("path");

async function main() {
	console.log(chalk.bold.blue("\n📦 Nexus Release Helper\n"));

	// 1. Checks deployment.json existence.
	const deploymentPath = path.join(__dirname, "../deployment.json");
	if (!fs.existsSync(deploymentPath)) {
		console.warn(
			chalk.yellow(
				"⚠️  deployment.json not found. You might want to run a deploy script first."
			)
		);
		const { continueRelease } = await prompts({
			type: "confirm",
			name: "continueRelease",
			message: "Continue anyway?",
			initial: false,
		});
		if (!continueRelease) return;
	} else {
		const deployment = require(deploymentPath);
		console.log(
			chalk.green(
				`✅ deployment.json found (Network: ${deployment.network?.name || "Unknown"})`
			)
		);
	}

	// 2. Checks git status.
	const status = execSync("git status --porcelain", { encoding: "utf-8" });
	if (status.includes("deployment.json")) {
		console.log(chalk.cyan("deployment.json has changed."));
		const { commit } = await prompts({
			type: "confirm",
			name: "commit",
			message: "Commit deployment.json updates?",
			initial: true,
		});

		if (commit) {
			execSync("git add deployment.json");
			execSync('git commit -m "chore(nexus): update deployment artifacts"');
			console.log(chalk.green("✅ Committed deployment.json"));
		}
	}

	// 3. Bumps Version & Tag.
	const packageJsonPath = path.join(__dirname, "../package.json");
	const pkg = require(packageJsonPath);
	console.log(`Current version: ${chalk.bold(pkg.version)}`);

	const { bump } = await prompts({
		type: "select",
		name: "bump",
		message: "Select release type",
		choices: [
			{ title: "Patch (x.x.1)", value: "patch" },
			{ title: "Minor (x.1.0)", value: "minor" },
			{ title: "Major (1.0.0)", value: "major" },
			{ title: "None (Just Push Remote)", value: "none" },
		],
	});

	let version = pkg.version;

	if (bump !== "none") {
		console.log(chalk.blue(`Bumping ${bump} version...`));
		// Bump version in package.json
		execSync(`npm version ${bump} --no-git-tag-version`);

		version = require(packageJsonPath).version;

		// Commits version bump in monorepo.
		execSync(`git add package.json`);
		execSync(`git commit -m "chore(nexus): release v${version}"`);
		console.log(chalk.green(`✅ Bumped to v${version}`));
	}

	// 4. Pushes to Private Remote (Subtree).
	const REMOTE_URL = "github-mambattu:Commertize-Inc/nexus.git";
	const BRANCH_NAME = "main"; // Target branch on remote

	console.log(chalk.bold(`\n🚀 Deploying to ${REMOTE_URL}...`));

	try {
		// Go to root of monorepo to run git subtree
		// Resolves project root.
		const rootDir = path.resolve(__dirname, "../../");

		// 1. Splits subtree into unique branch.
		const splitBranch = `nexus-release-v${version}-${Date.now()}`;
		console.log("  Running git subtree split...");
		// Creates split branch containing 'packages/nexus' history.
		execSync(`git subtree split --prefix=packages/nexus -b ${splitBranch}`, {
			cwd: rootDir,
			stdio: "inherit",
		});

		// 2. Push the split branch to the remote
		console.log(`  Pushing to remote ${BRANCH_NAME}...`);
		execSync(`git push ${REMOTE_URL} ${splitBranch}:${BRANCH_NAME} --force`, {
			cwd: rootDir,
			stdio: "inherit",
		});

		// 3. Tag on remote?
		if (bump !== "none") {
			console.log(`  Pushing tag v${version}...`);
			// Tags and pushes split branch locally.
			execSync(`git tag v${version} ${splitBranch}`, { cwd: rootDir });
			execSync(`git push ${REMOTE_URL} v${version}`, {
				cwd: rootDir,
				stdio: "inherit",
			});

			// Cleans up local tag.
			execSync(`git tag -d v${version}`, { cwd: rootDir });
		}

		// 4. Cleanup split branch
		console.log("  Cleaning up...");
		execSync(`git branch -D ${splitBranch}`, { cwd: rootDir });

		console.log(
			chalk.green(`\n✅ Successfully deployed v${version} to private remote!`)
		);
	} catch (e) {
		console.error(chalk.red("\n❌ Deployment failed:"), e.message);
	}
}

main().catch(console.error);
