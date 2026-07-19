#!/usr/bin/env bash
# End-to-end AnyFinancial backtesting workflow:
#   setup dependencies -> fetch bars -> run the configured split(s).
set -euo pipefail

SKILL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CONFIG=""
SPLITS="in,out"
REPORT_DIR="reports"
SKIP_SETUP=0

usage() {
  cat <<'EOF'
Usage: scripts/run_workflow.sh --config RUN.config.json [options]

Options:
  --config PATH       Backtest config JSON. Required.
  --splits LIST       Comma-separated splits: in,out,full. Default: in,out.
  --report-dir DIR    Directory for JSON reports. Default: reports.
  --skip-setup        Do not run scripts/setup.sh; assumes .venv-backtest exists.

Example:
  cp config.example.json my.config.json
  bash scripts/run_workflow.sh --config my.config.json --splits in,out,full
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --config) CONFIG="$2"; shift 2 ;;
    --splits) SPLITS="$2"; shift 2 ;;
    --report-dir) REPORT_DIR="$2"; shift 2 ;;
    --skip-setup) SKIP_SETUP=1; shift ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Unknown argument: $1" >&2; usage >&2; exit 2 ;;
  esac
done

if [[ -z "$CONFIG" ]]; then
  echo "Error: --config is required." >&2
  usage >&2
  exit 2
fi

if [[ "$CONFIG" != /* ]]; then
  CONFIG="$(cd "$(dirname "$CONFIG")" && pwd)/$(basename "$CONFIG")"
fi
if [[ "$REPORT_DIR" != /* ]]; then
  REPORT_DIR="$(pwd)/$REPORT_DIR"
fi

cd "$SKILL_DIR"

if [[ "$SKIP_SETUP" -eq 0 ]]; then
  bash scripts/setup.sh
fi

# shellcheck disable=SC1091
source "${BACKTEST_VENV:-$SKILL_DIR/.venv-backtest}/bin/activate"

python scripts/fetch_data.py --config "$CONFIG"

mkdir -p "$REPORT_DIR"
IFS=',' read -r -a split_arr <<< "$SPLITS"
for split in "${split_arr[@]}"; do
  split="$(echo "$split" | tr -d '[:space:]')"
  [[ -z "$split" ]] && continue
  python scripts/run_backtest.py \
    --config "$CONFIG" \
    --split "$split" \
    --report "$REPORT_DIR/$(basename "$CONFIG" .json).${split}.json"
done
