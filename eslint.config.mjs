import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals"),
  {
    rules: {
      // Paling penting untuk kode yang bersih
      "@typescript-eslint/no-unused-vars": ["error", { 
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_"
      }],
      "@typescript-eslint/no-explicit-any": "warn",
      
      // React/Next.js Rules - hanya yang esensial
      "react/jsx-key": "error",
      "react/jsx-no-undef": "error",
      
      // Best Practices - minimum yang diperlukan
      "no-console": ["warn", { "allow": ["warn", "error"] }],
      "no-debugger": "error",
      "no-alert": "error",
      "no-var": "error",
      "prefer-const": "error",
      
      // Code Style - minimum
      "semi": ["error", "always"],
      "quotes": ["error", "single", { "avoidEscape": true }]
    },
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "public/**",
      "*.config.js",
      "*.config.mjs",
      "*.config.ts"
    ]
  }
];

export default eslintConfig;
