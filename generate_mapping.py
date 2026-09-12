#!/usr/bin/env python3
import json
import shutil
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent
DATA_DIR = ROOT / "coverage_data"
SRC_DIR = ROOT / "src"
TEST_TO_SOURCE = ROOT / "test_to_source_mapping.json"
SOURCE_TO_TEST = ROOT / "source_to_test_mapping.json"

if shutil.which("gcovr") is None:
    sys.exit("gcovr not found. Install it with: pip install gcovr")

if not DATA_DIR.is_dir():
    sys.exit(f"Coverage data not found at {DATA_DIR}. Run run_coverage.sh first.")

mapping = {}

for test_dir in sorted(DATA_DIR.iterdir()):
    if not test_dir.is_dir():
        continue

    proc = subprocess.run(
        ["gcovr", "--root", str(ROOT), str(test_dir), "--json"],
        capture_output=True,
        text=True,
    )
    if proc.returncode != 0:
        sys.exit(f"gcovr failed for {test_dir.name}:\n{proc.stderr}")

    report = json.loads(proc.stdout)

    covered = []
    for file_entry in report["files"]:
        file_path = Path(file_entry["file"])
        if not file_path.is_absolute():
            file_path = ROOT / file_path
        file_path = file_path.resolve()
        if SRC_DIR not in file_path.parents:
            continue
        if any(line["count"] > 0 for line in file_entry["lines"]):
            covered.append(str(file_path.relative_to(ROOT)))

    mapping[test_dir.name] = covered

TEST_TO_SOURCE.write_text(json.dumps(mapping, indent=2) + "\n")
print(f"Wrote {TEST_TO_SOURCE}")

inverted = {}
for test, sources in mapping.items():
    for source in sources:
        inverted.setdefault(source, []).append(test)
for tests in inverted.values():
    tests.sort()

SOURCE_TO_TEST.write_text(
    json.dumps(
        {
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "mapping": inverted,
        },
        indent=2,
    )
    + "\n"
)
print(f"Wrote {SOURCE_TO_TEST}")
