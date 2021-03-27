module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: ["plugin:vue/essential", "@vue/standard", "@vue/typescript"],
  rules: {
    "comma-dangle": "off",
    "no-console": "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off",
    "space-before-function-paren": ["error", "never"],
    "switch-colon-spacing": ["error", { after: true, before: false }],
    "no-case-declarations": "off",
    semi: ["error", "always"],
    quotes: ["error", "single"],
    "max-nested-callbacks": [1, 5],
    "max-len": ["error", { code: 300 }],
    "max-lines": [
      "error",
      { max: 1500, skipBlankLines: true, skipComments: true }
    ],
    "max-params": [1, 10],
    "vue/max-len": ["error", {
      "code": 300,
      "template": 300,
      "tabWidth": 2,
      "comments": 500,
      "ignorePattern": "",
      "ignoreComments": false,
      "ignoreTrailingComments": false,
      "ignoreUrls": false,
      "ignoreStrings": false,
      "ignoreTemplateLiterals": false,
      "ignoreRegExpLiterals": false,
      "ignoreHTMLAttributeValues": false,
      "ignoreHTMLTextContents": false,
    }]
  },
  parserOptions: {
    parser: "@typescript-eslint/parser"
  }
};
