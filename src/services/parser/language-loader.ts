import path from "path";
import { Language } from "web-tree-sitter";

import type { SupportedLanguage } from "./language-detector";

export async function loadLanguage(
  language: SupportedLanguage
) {
  let languagePath: string;

  switch (language) {
    case "typescript":
      languagePath = path.join(
        process.cwd(),
        "node_modules/tree-sitter-typescript/tree-sitter-typescript.wasm"
      );
      break;

    case "tsx":
      languagePath = path.join(
        process.cwd(),
        "node_modules/tree-sitter-typescript/tree-sitter-tsx.wasm"
      );
      break;

    case "javascript":
      languagePath = path.join(
        process.cwd(),
        "node_modules/tree-sitter-javascript/tree-sitter-javascript.wasm"
      );
      break;
  }

  return Language.load(languagePath);
}