# simple-app

A minimal C++17 project used to test a coverage-based test impact analysis pipeline.
## Structure

```
simple-app/
├── src/          # core library (math_utils, string_utils)
└── tests/        # separate test executables (test_math, test_string)
```

## Prerequisites

- CMake >= 3.16
- A C++17 compiler (g++, clang++, MSVC)
- Network access on first configure (GoogleTest is fetched via CMake FetchContent, pinned to v1.15.2)

## Build & Test

Run from the project root:

```sh
cmake -S . -B build
cmake --build build
ctest --test-dir build
```

Expected output: `100% tests passed, 0 tests failed out of 14`.

## Fresh rebuild

```sh
cmake -E remove_directory build
cmake -S . -B build
cmake --build build
ctest --test-dir build
```

The `build/` directory is git-ignored and safe to delete (`cmake -E remove_directory` works on Linux, macOS, and Windows); it is regenerated from the sources.

## Coverage mapping (PoC)

Generates `test_to_source_mapping.json`, mapping each test executable to the `src/` files it executes (used for test impact analysis). GCC/Clang + gcovr only.

```sh
pip install gcovr
./run_coverage.sh
python3 generate_mapping.py
```

`run_coverage.sh` builds with `-DENABLE_COVERAGE=ON`, runs each test executable separately, and stores its isolated coverage data under `coverage_data/<test>/`. `generate_mapping.py` runs gcovr on each folder and writes the mapping.
