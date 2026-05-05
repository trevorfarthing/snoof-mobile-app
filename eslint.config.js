// https://docs.expo.dev/guides/using-eslint/
import expoConfig from "eslint-config-expo/flat.js";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import eslintPluginUnicorn from "eslint-plugin-unicorn";
import { defineConfig } from "eslint/config";

export default defineConfig([
  expoConfig,
  eslintPluginPrettierRecommended,
  eslintPluginUnicorn.configs.recommended,
  {
    ignores: ["dist/*", "ios/*", "android/*", "node_modules/*", ".expo/*"],
    plugins: {
      unicorn: eslintPluginUnicorn,
    },
    rules: {
      "unicorn/better-regex": "warn",
      "unicorn/no-negated-condition": "off",
      "unicorn/no-null": "off",
      "unicorn/prevent-abbreviations": "off",
      "unicorn/no-useless-switch-case": "warn",
      curly: ["error", "all"],
    },
  },
]);
