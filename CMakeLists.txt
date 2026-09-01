# simple-app
# A minimal C++ project used to test a coverage-based test impact analysis pipeline.
#
# Build instructions:
#   mkdir build && cd build
#   cmake ..
#   make
#   ctest
#
# Or, from the project root:
#   cmake -S . -B build
#   cmake --build build
#   ctest --test-dir build

cmake_minimum_required(VERSION 3.16)
project(simple-app LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

# GoogleTest via FetchContent (requires network on first configure).
include(FetchContent)
FetchContent_Declare(
  googletest
  GIT_REPOSITORY https://github.com/google/googletest.git
  GIT_TAG v1.15.2
)
FetchContent_MakeAvailable(googletest)

# Core library under test.
add_library(core STATIC
  src/math_utils.cpp
  src/string_utils.cpp
)
target_include_directories(core PUBLIC ${CMAKE_CURRENT_SOURCE_DIR}/src)

option(ENABLE_COVERAGE "Build with gcov coverage instrumentation (GCC/Clang only)" OFF)
if(ENABLE_COVERAGE)
  target_compile_options(core PRIVATE --coverage)
  target_link_options(core PUBLIC --coverage)
endif()

# Tests: separate executables so a test impact analysis pipeline
# can map each executable to the sources it exercises.
enable_testing()

add_executable(test_math tests/test_math.cpp)
target_link_libraries(test_math PRIVATE core gtest gtest_main)

add_executable(test_string tests/test_string.cpp)
target_link_libraries(test_string PRIVATE core gtest gtest_main)

include(GoogleTest)
gtest_discover_tests(test_math)
gtest_discover_tests(test_string)

add_test(NAME test_math COMMAND test_math)
add_test(NAME test_string COMMAND test_string)
