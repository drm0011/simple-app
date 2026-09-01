#include <gtest/gtest.h>

#include "string_utils.h"

TEST(StringUtilsTest, ToUpperLowerCase) {
  EXPECT_EQ(core::to_upper("hello"), "HELLO");
}

TEST(StringUtilsTest, ToUpperMixedCase) {
  EXPECT_EQ(core::to_upper("HeLLo WoRLd"), "HELLO WORLD");
}

TEST(StringUtilsTest, ToUpperEmpty) {
  EXPECT_EQ(core::to_upper(""), "");
}

TEST(StringUtilsTest, ReverseSimple) {
  EXPECT_EQ(core::reverse("abc"), "cba");
}

TEST(StringUtilsTest, ReversePalindrome) {
  EXPECT_EQ(core::reverse("racecar"), "racecar");
}

TEST(StringUtilsTest, ReverseEmpty) {
  EXPECT_EQ(core::reverse(""), "");
}
