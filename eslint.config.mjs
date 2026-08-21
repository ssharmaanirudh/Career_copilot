import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Regeneratable third-party AI-tooling assets (see CLAUDE.md) — gitignored,
    // not this project's source, and not written to this project's lint rules.
    ".claude/skills/**",
  ]),
]);

export default eslintConfig;
