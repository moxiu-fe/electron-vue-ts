
#include "hello.hpp"

#include <string.h>
#include <iostream>
#include <time.h>
#include <stdlib.h>

#include <sstream>

#include <cstdio>
#include <cstring>
#include <algorithm>
#include <cstdlib>
#include <iostream>
#include <cmath>

using namespace std;

string Hello::hello(string str)
{
  if (str.empty())
  {
    return NULL;
  }

  string hi = "hello " + str;
  return hi;
}
