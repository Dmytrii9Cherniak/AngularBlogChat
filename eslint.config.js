/** @type {import("eslint").Linter.FlatConfig} */
module.exports = [
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: require("@typescript-eslint/parser"),
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: __dirname,
        sourceType: "module"
      }
    },
    plugins: {
      "@typescript-eslint": require("@typescript-eslint/eslint-plugin"),
      "prettier": require("eslint-plugin-prettier")
    },
    rules: {
      "prettier/prettier": [
        "error",
        {
          "singleQuote": true,
          "semi": true,
          "trailingComma": "none"
        }
      ],
      "no-trailing-spaces": "error",
      "eol-last": ["error", "always"]
    }
  }
];
