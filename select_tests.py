#!/usr/bin/env python3
import argparse
import json
import subprocess
import sys
import time
from datetime import datetime, timezone
from fnmatch import fnmatch
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SRC_DIR = ROOT / "src"
SOURCE_TO_TEST = ROOT / "source_to_test_mapping.json"
REPORT_FILE = ROOT / "test_selection_report.json"

HEADER_SUFFIXES = {".h", ".hpp"}
SOURCE_SUFFIXES = {".c", ".cc", ".cpp", ".cxx"}

CONFIG_PATTERNS = [
    "CMakeLists.txt",
    "*.cmake",
    "Makefile",
    "*.mk",
    ".github/**",
    ".gitlab-ci.yml",
    "run_coverage.sh",
    "generate_mapping.py",
    "select_tests.py",
]


def changed_files(base):
    proc = subprocess.run(
        ["git", "diff", "--name-only", base],
        capture_output=True,
        text=True,
        cwd=ROOT,
    )
    if proc.returncode != 0:
        sys.exit(f"git diff failed:\n{proc.stderr}")
    paths = proc.stdout.splitlines()

    proc = subprocess.run(
        ["git", "ls-files", "--others", "--exclude-standard"],
        capture_output=True,
        text=True,
        cwd=ROOT,
    )
    if proc.returncode != 0:
        sys.exit(f"git ls-files failed:\n{proc.stderr}")
    paths += proc.stdout.splitlines()

    return [p for p in paths if p]


def classify(paths):
    src_files = []
    config_files = []
    other_files = []
    for rel in paths:
        path = ROOT / rel
        if SRC_DIR in path.parents and (
            path.suffix in SOURCE_SUFFIXES or path.suffix in HEADER_SUFFIXES
        ):
            src_files.append(rel)
        elif any(fnmatch(rel, pattern) for pattern in CONFIG_PATTERNS):
            config_files.append(rel)
        else:
            other_files.append(rel)
    return src_files, config_files, other_files


def load_mapping():
    if not SOURCE_TO_TEST.is_file():
        return None, None, None
    data = json.loads(SOURCE_TO_TEST.read_text())
    mapping = data.get("mapping", data)
    generated_at = data.get("generated_at")
    if generated_at:
        try:
            generated_at = datetime.fromisoformat(generated_at)
        except ValueError:
            generated_at = None
    if generated_at is None:
        generated_at = datetime.fromtimestamp(
            SOURCE_TO_TEST.stat().st_mtime, tz=timezone.utc
        )
    return mapping, generated_at, SOURCE_TO_TEST.stat().st_mtime


def run_all_via_ctest(args):
    build = subprocess.run(["cmake", "--build", str(ROOT / args.build_dir)], cwd=ROOT)
    if build.returncode != 0:
        sys.exit("Build failed")
    ctest = subprocess.run(["ctest", "--test-dir", str(ROOT / args.build_dir)], cwd=ROOT)
    sys.exit(ctest.returncode)


def write_report(report):
    REPORT_FILE.write_text(json.dumps(report, indent=2) + "\n")


def main():
    parser = argparse.ArgumentParser(
        description="Select tests affected by changes since a git ref."
    )
    parser.add_argument("--base", default="main", help="git ref to diff against")
    parser.add_argument("--run", action="store_true", help="execute selected tests")
    parser.add_argument("--build-dir", default="build", help="build directory")
    parser.add_argument(
        "--max-age-hours",
        type=float,
        default=168,
        help="fall back to all tests when the mapping is older than this (0 disables)",
    )
    args = parser.parse_args()

    mapping, generated_at, map_mtime = load_mapping()
    map_age_hours = None
    if generated_at is not None:
        map_age_hours = (time.time() - generated_at.timestamp()) / 3600

    changed = changed_files(args.base)
    src_files, config_files, other_files = classify(changed)

    report = {
        "base": args.base,
        "changed_files": changed,
        "src_changed": src_files,
        "config_changed": config_files,
        "other_changed": other_files,
        "map_age_hours": None if map_age_hours is None else round(map_age_hours, 2),
        "rule": None,
        "reason": None,
        "mode": None,
        "selected_tests": [],
    }

    if config_files:
        report["rule"] = "config-change"
        report["reason"] = (
            f"Build-system/config files changed ({', '.join(config_files)}) — full suite."
        )
    elif mapping is None:
        report["rule"] = "map-missing"
        report["reason"] = f"{SOURCE_TO_TEST} not found — full suite."
    elif args.max_age_hours > 0 and map_age_hours is not None and map_age_hours > args.max_age_hours:
        report["rule"] = "map-stale"
        report["reason"] = (
            f"Mapping is {map_age_hours:.1f}h old (limit {args.max_age_hours}h) — full suite."
        )
    elif not src_files:
        report["rule"] = "no-src-changes"
        report["reason"] = "No src/ changes detected. No tests affected."
    elif any(fnmatch(f, "*.h") or fnmatch(f, "*.hpp") for f in src_files):
        report["rule"] = "header-change"
        report["reason"] = "Header file changed — all tests (conservative)."
    else:
        report["rule"] = "mapped-union"
        selected = set()
        unknown = []
        for rel in src_files:
            tests = mapping.get(rel)
            if tests is None:
                unknown.append(rel)
            else:
                selected.update(tests)
        if unknown:
            report["rule"] = "unknown-file"
            report["reason"] = (
                f"Files not in mapping ({', '.join(unknown)}) — full suite (conservative)."
            )
        else:
            report["reason"] = "Union of mapped tests for the changed source files."
            report["selected_tests"] = sorted(selected)
            report["mode"] = "none" if not selected else "selected"

    fallback_rules = {"config-change", "map-missing", "map-stale", "header-change", "unknown-file"}
    if report["rule"] in fallback_rules:
        report["mode"] = "all"

    write_report(report)

    if report["rule"] == "config-change":
        print(report["reason"])
    elif report["rule"] == "map-missing":
        print(f"Warning: {report['reason']}")
    elif report["rule"] == "map-stale":
        print(f"Warning: {report['reason']}")
    elif report["rule"] == "no-src-changes":
        print(report["reason"])
    elif report["rule"] == "header-change":
        print(report["reason"])
    elif report["rule"] == "unknown-file":
        print(report["reason"])
    else:
        print("Selected tests:", ", ".join(report["selected_tests"]) if report["selected_tests"] else "none")

    if not args.run:
        return

    if report["rule"] == "map-missing":
        run_all_via_ctest(args)

    build = subprocess.run(["cmake", "--build", str(ROOT / args.build_dir)], cwd=ROOT)
    if build.returncode != 0:
        sys.exit("Build failed")

    if report["mode"] == "all":
        all_tests = sorted({t for tests in mapping.values() for t in tests})
        failures = []
        for test in all_tests:
            proc = subprocess.run([str(ROOT / args.build_dir / test)], cwd=ROOT)
            if proc.returncode != 0:
                failures.append(test)
        if failures:
            sys.exit(f"Failed tests: {', '.join(failures)}")
        print("All selected tests passed.")
        return

    failures = []
    for test in report["selected_tests"]:
        proc = subprocess.run([str(ROOT / args.build_dir / test)], cwd=ROOT)
        if proc.returncode != 0:
            failures.append(test)
    if failures:
        sys.exit(f"Failed tests: {', '.join(failures)}")
    print("All selected tests passed.")


if __name__ == "__main__":
    main()
