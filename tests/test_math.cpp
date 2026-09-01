#include <gtest/gtest.h>

#include "math_utils.h"

TEST(MathUtilsTest, AddPositiveNumbers) {
  EXPECT_EQ(core::add(2, 3), 5);
}

TEST(MathUtilsTest, AddNegativeNumbers) {
  EXPECT_EQ(core::add(-2, -3), -5);
}

TEST(MathUtilsTest, AddMixedSign) {
  EXPECT_EQ(core::add(7, -3), 4);
}

TEST(MathUtilsTest, MultiplyPositiveNumbers) {
  EXPECT_EQ(core::multiply(4, 5), 20);
}

TEST(MathUtilsTest, MultiplyByZero) {
  EXPECT_EQ(core::multiply(123, 0), 0);
}

TEST(MathUtilsTest, MultiplyNegativeNumbers) {
  EXPECT_EQ(core::multiply(-3, -6), 18);
}
