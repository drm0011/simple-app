# simple-app

A minimal C++17 project used to test a coverage-based test impact analysis pipeline.

## Structure

```
simple-app/
├── src/          # core library (math_utils, string_utils)
└── tests/        # separate test executables (test_math, test_string)
```

## Build & Test

```sh
mkdir build && cd build
cmake ..
make
ctest
```

GoogleTest is fetched automatically via CMake FetchContent.
