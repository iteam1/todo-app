#!/usr/bin/env bash
# loc-stats.sh — count lines of code by file type across project assets
# Usage: ./scripts/loc-stats.sh [root-dir]
#   root-dir defaults to the directory containing this script's parent

set -euo pipefail

ROOT="${1:-$(cd "$(dirname "$0")/.." && pwd)}"

# Directories to scan (relative to ROOT)
SCAN_DIRS=(src __tests__ assets specs docs)

# Directories / patterns to always skip
SKIP_PATTERNS=(
  node_modules
  .git
  .next
  dist
  build
  coverage
  playwright-report
  test-results
  "*.d.ts"
)

# ── helpers ──────────────────────────────────────────────────────────────────

build_prune_args() {
  local args=()
  for p in "${SKIP_PATTERNS[@]}"; do
    args+=(-not -path "*/${p}/*" -not -name "${p}")
  done
  printf '%s\n' "${args[@]}"
}

ext_to_type() {
  case "$1" in
    ts|tsx)   echo "TypeScript" ;;
    js|jsx)   echo "JavaScript" ;;
    css)      echo "CSS" ;;
    json)     echo "JSON" ;;
    md)       echo "Markdown" ;;
    mjs|cjs)  echo "JavaScript" ;;
    html)     echo "HTML" ;;
    sh)       echo "Shell" ;;
    yaml|yml) echo "YAML" ;;
    *)        echo "Other" ;;
  esac
}

count_lines() {
  local file="$1"
  # wc -l counts newlines; add 1 if file doesn't end with newline (non-empty)
  local n
  n=$(wc -l < "$file")
  # if file is non-empty and last char is not newline, wc -l under-counts by 1
  if [[ -s "$file" ]] && [[ "$(tail -c1 "$file" | wc -l)" -eq 0 ]]; then
    n=$((n + 1))
  fi
  echo "$n"
}

# ── main ─────────────────────────────────────────────────────────────────────

declare -A type_lines   # type → total lines
declare -A type_files   # type → file count
grand_total_lines=0
grand_total_files=0

# build find prune args once
mapfile -t PRUNE < <(build_prune_args)

for dir in "${SCAN_DIRS[@]}"; do
  full_dir="$ROOT/$dir"
  [[ -d "$full_dir" ]] || continue

  while IFS= read -r -d '' file; do
    ext="${file##*.}"
    [[ "$ext" == "$file" ]] && ext=""   # no extension
    type=$(ext_to_type "$ext")

    lines=$(count_lines "$file")

    type_lines[$type]=$(( ${type_lines[$type]:-0} + lines ))
    type_files[$type]=$(( ${type_files[$type]:-0} + 1 ))
    grand_total_lines=$(( grand_total_lines + lines ))
    grand_total_files=$(( grand_total_files + 1 ))
  done < <(find "$full_dir" -type f "${PRUNE[@]}" -print0 2>/dev/null)
done

# also count root-level config files (non-recursive)
while IFS= read -r -d '' file; do
  ext="${file##*.}"
  [[ "$ext" == "$file" ]] && ext=""
  type=$(ext_to_type "$ext")

  lines=$(count_lines "$file")

  type_lines[$type]=$(( ${type_lines[$type]:-0} + lines ))
  type_files[$type]=$(( ${type_files[$type]:-0} + 1 ))
  grand_total_lines=$(( grand_total_lines + lines ))
  grand_total_files=$(( grand_total_files + 1 ))
done < <(find "$ROOT" -maxdepth 1 -type f "${PRUNE[@]}" -print0 2>/dev/null)

# ── output ───────────────────────────────────────────────────────────────────

COL_TYPE=14
COL_FILES=8
COL_LINES=10

divider=$(printf '%-*s' $((COL_TYPE + COL_FILES + COL_LINES + 6)) '' | tr ' ' '-')

printf "\n  Lines of Code — %s\n\n" "$ROOT"
printf "  %-*s  %*s  %*s\n" $COL_TYPE "Type" $COL_FILES "Files" $COL_LINES "Lines"
printf "  %s\n" "$divider"

# sort types alphabetically
sorted_types=( $(printf '%s\n' "${!type_lines[@]}" | sort) )

for type in "${sorted_types[@]}"; do
  printf "  %-*s  %*d  %*d\n" \
    $COL_TYPE "$type" \
    $COL_FILES "${type_files[$type]}" \
    $COL_LINES "${type_lines[$type]}"
done

printf "  %s\n" "$divider"
printf "  %-*s  %*d  %*d\n\n" \
  $COL_TYPE "TOTAL" \
  $COL_FILES "$grand_total_files" \
  $COL_LINES "$grand_total_lines"
