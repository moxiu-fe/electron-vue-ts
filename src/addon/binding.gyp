{
  "targets": [
    {
      "target_name": "hello",
      "sources": [ "helloBridge.cpp" ]
    },
    {
      "target_name": "action_after_build",
      "type": "none",
      "dependencies": [ "hello" ],
      "copies": [
          {
            "files": [ "<(PRODUCT_DIR)/hello.node" ],
            "destination": "../src/addons"
          }
      ]
    }
  ]
}
