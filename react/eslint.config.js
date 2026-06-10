import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist", "coverage"] },
  {
    files: ["src/**/*.{ts,tsx}"],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    languageOptions: {
      ecmaVersion: 2025,
      sourceType: "module",
    },
    rules: {
      // Full react-hooks v7 ruleset (rules-of-hooks, exhaustive-deps, plus the
      // React Compiler checks: purity, immutability, manual-memo, etc.). Spread
      // the rules directly because the plugin's bundled flat config declares
      // `plugins` as a legacy string array that ESLint 10 rejects.
      ...reactHooks.configs["recommended-latest"].rules,
      // Keep modules fast-refresh-friendly (component files export only components).
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
    },
  },
);
