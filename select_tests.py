#!/usr/bin/env python3
import argparse
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SRC_DIR = ROOT / "src"
SOURCE_TO_TEST = ROOT / "source_to_test_mapping.json"

HEADER_SUFFIXES = {".h", ".hpp"}
SOURCE_SUFFIXES = {".c", ".cc", ".cpp", ".cxx"}


def changed_src_files(base):
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

    changed = []
    for line in paths:
        path = (ROOT / line).resolve()
        if SRC_DIR not in path.parents:
            continue
        if path.suffix in SOURCE_SUFFIXES or path.suffix in HEADER_SUFFIXES:
            changed.append(path)
    return changed


def run_all_via_ctest(args):
    build = subprocess.run(["cmake", "--build", str(ROOT / args.build_dir)], cwd=ROOT)
    if build.returncode != 0:
        sys.exit("Build failed")
    ctest = subprocess.run(["ctest", "--test-dir", str(ROOT / args.build_dir)], cwd=ROOT)
    sys.exit(ctest.returncode)


def main():
    parser = argparse.ArgumentParser(
        description="Select tests affected by changes to src/ since a git ref."
    )
    parser.add_argument("--base", default="main", help="git ref to diff against")
    parser.add_argument("--run", action="store_true", help="execute selected tests")
    parser.add_argument("--build-dir", default="build", help="build directory")
    args = parser.parse_args()

    if not SOURCE_TO_TEST.is_file():
        print(f"Warning: {SOURCE_TO_TEST} not found. Selecting all tests.")
        if args.run:
            run_all_via_ctest(args)
        print("Selected tests: all")
        return

    mapping = json.loads(SOURCE_TO_TEST.read_text())
    all_tests = sorted({t for tests in mapping.values() for t in tests})

    changed = changed_src_files(args.base)
    if not changed:
        print("No src/ changes detected. No tests affected.")
        return

    header_changed = any(p.suffix in HEADER_SUFFIXES for p in changed)

    if header_changed:
        selected = all_tests
        print("Header file changed; selecting all tests (conservative).")
    else:
        selected = set()
        unknown = []
        for path in changed:
            rel = str(path.relative_to(ROOT))
            tests = mapping.get(rel)
            if tests is None:
                unknown.append(rel)
            else:
                selected.update(tests)
        if unknown:
            print(
                f"Files not in mapping ({', '.join(unknown)}); selecting all tests (conservative)."
            )
            selected = all_tests

    selected = sorted(selected)
    print("Selected tests:", ", ".join(selected) if selected else "none")

    if not args.run:
        return

    build = subprocess.run(["cmake", "--build", str(ROOT / args.build_dir)], cwd=ROOT)
    if build.returncode != 0:
        sys.exit("Build failed")

    failures = []
    for test in selected:
        proc = subprocess.run([str(ROOT / args.build_dir / test)], cwd=ROOT)
        if proc.returncode != 0:
            failures.append(test)
    if failures:
        sys.exit(f"Failed tests: {', '.join(failures)}")
    print("All selected tests passed.")


if __name__ == "__main__":
    main()
