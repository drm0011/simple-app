#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

BUILD_DIR="${1:-build}"
OUT_DIR="coverage_data"
TESTS=(test_math test_string)

cmake -S . -B "$BUILD_DIR" -DENABLE_COVERAGE=ON
cmake --build "$BUILD_DIR"

rm -rf "$OUT_DIR"

for test in "${TESTS[@]}"; do
  test_dir="$OUT_DIR/$test"
  mkdir -p "$test_dir"

  find "$BUILD_DIR" -name '*.gcda' -delete

  "$BUILD_DIR/$test"

  find "$BUILD_DIR" -name '*.gcda' -exec cp --parents -t "$test_dir" {} +
  find "$BUILD_DIR" -name '*.gcno' -exec cp --parents -t "$test_dir" {} +
done

echo "Coverage data written to $OUT_DIR/<test>/"
