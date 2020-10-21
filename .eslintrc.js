module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true,
    jest: true,
  },
  extends: ["airbnb-base", "plugin:react/recommended"],
  // extends: ["plugin:react/recommended"],
  globals: {
    Atomics: "readonly",
    SharedArrayBuffer: "readonly",
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: "module",
  },
  rules: {
    "comma-dangle": [0, "always"],
    "no-param-reassign": ["error", { props: false }],
    "linebreak-style": ["error", "windows"],
    "no-console": ["off", "always"],
    "implicit-arrow-linebreak": [0, "always"],
    "prefer-template": 0,
    "no-nested-ternary": 0,
    "object-curly-newline": [0, "always"],
    "max-len": ["error", { code: 200 }],
    "prefer-destructuring": [0, "always"],
    "no-return-assign": [0, "always"],
    quotes: [0, "always"],
    "no-shadow": 0,
  },
};
