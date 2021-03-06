module.exports = {
  env: {
    mocha: true,
  },
  extends: ["airbnb", "plugin:prettier/recommended"],
  plugins: ["babel"],
  rules: {
    "prettier/prettier": ["warn"],
    "import/extensions": [
      "error",
      "ignorePackages",
      {
        js: "never",
        ts: "never",
      },
    ],
    "dot-notation": [
      "error",
      {
        allowPattern: "^_.*$",
      },
    ],
    "import/prefer-default-export": "off",
    "prefer-destructuring": "off",
    "prefer-template": "off",
    "no-console": "off",
    "func-names": "off",
    "no-restricted-syntax": "off",
  },
};
