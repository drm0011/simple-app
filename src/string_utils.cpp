#include "string_utils.h"

#include <algorithm>
#include <cctype>

namespace core {

std::string to_upper(const std::string& input) {
  std::string result = input;
  std::transform(result.begin(), result.end(), result.begin(),
                 [](unsigned char c) { return static_cast<char>(std::toupper(c)); });
  return result;
}

std::string reverse(const std::string& input) {
  return std::string(input.rbegin(), input.rend());
}

} // namespace core

// harmless comment to trigger selective testing
