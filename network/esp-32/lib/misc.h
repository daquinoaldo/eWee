#ifndef misc_H
#define misc_H

#include <sstream>

// ----- ----- ID GENERATOR ----- ----- //
void gen_id(char *s, const int len) {
    static const char alphanum[] =
        "0123456789"
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
        "abcdefghijklmnopqrstuvwxyz";
    for (int i = 0; i < len; ++i) {
        s[i] = alphanum[random(9999) % (sizeof(alphanum) - 1)];
    }
    s[len] = 0;
}

std::string int2string(long tValue) {
  std::ostringstream convert;
  convert << tValue;
  return convert.str();
}

#endif
