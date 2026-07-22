#!/usr/bin/env bash
# One-command local E2E deployment validation: boots an Anvil chain with the
# chain id networks.ts expects for "localhost", runs the deploy script in CI
# mode, then validates the full contract lifecycle (scripts/local-e2e.ts).
set -euo pipefail
cd "$(dirname "$0")/.."

CHAIN_ID=5042002 # must match NETWORKS.localhost in networks.ts
PORT=8545
RPC="http://127.0.0.1:$PORT"

if ! command -v anvil >/dev/null; then
	echo "error: anvil not found — install Foundry (https://getfoundry.sh)" >&2
	exit 1
fi

anvil --chain-id "$CHAIN_ID" --port "$PORT" --silent &
ANVIL_PID=$!
trap 'kill "$ANVIL_PID" 2>/dev/null || true' EXIT

for i in $(seq 1 30); do
	if curl -sf -X POST -H 'Content-Type: application/json' \
		--data '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' \
		"$RPC" >/dev/null 2>&1; then
		break
	fi
	if [ "$i" -eq 30 ]; then
		echo "error: anvil did not become ready on $RPC" >&2
		exit 1
	fi
	sleep 1
done

rm -f deployment.localhost.json
CI=true npx hardhat run --network localhost scripts/deploy.ts
npx hardhat run --network localhost scripts/local-e2e.ts
