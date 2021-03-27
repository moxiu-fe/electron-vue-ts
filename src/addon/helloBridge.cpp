#include <node.h>
#include "hello.cpp"

namespace hello
{

using v8::Exception;
using v8::FunctionCallbackInfo;
using v8::Isolate;
using v8::Local;
using v8::NewStringType;
using v8::Number;
using v8::Object;
using v8::String;
using v8::Value;

// This is the implementation of the "hello" method
// Input arguments are passed using the
// const FunctionCallbackInfo<Value>& args struct
void hello(const FunctionCallbackInfo<Value> &args)
{
  Isolate *isolate = args.GetIsolate();

  // Check the number of arguments passed.
  if (args.Length() != 1)
  {
    // Throw an Error that is passed back to JavaScript
    isolate->ThrowException(Exception::TypeError(String::NewFromUtf8(isolate, "Wrong number of arguments", NewStringType::kNormal).ToLocalChecked()));
    return;
  }

  // Check the argument types
  if (!args[0]->IsString())
  {
    isolate->ThrowException(Exception::TypeError(String::NewFromUtf8(isolate, "Wrong arguments", NewStringType::kNormal).ToLocalChecked()));
    return;
  }

  // get the param
  v8::String::Utf8Value param1(args[0]->ToString());

  // javascript string 转换为c++ string
  std::string str = std::string(*param1);

  // 调用c++ 函数
  std::string value = Hello::hello(str); 

  // c++ string 转换为javascript string
  Local<String> retval = String::NewFromUtf8(isolate, value.c_str());

  args.GetReturnValue().Set(retval);
}

void Init(Local<Object> exports)
{
  NODE_SET_METHOD(exports, "hello", hello); // 暴露函数给js
}

NODE_MODULE(NODE_GYP_MODULE_NAME, Init)

} // namespace hello
