import { Parser } from "web-tree-sitter";
import path from "path";
import { detectLanguage } from "./language-detector";
import { loadLanguage } from "./language-loader";

let parserPromise: Promise<Parser> | null = null;

async function getParser() {
  if (!parserPromise) {
    parserPromise = (async () => {
      await Parser.init({
        locateFile: () =>
          path.join(
            process.cwd(),
            "node_modules/web-tree-sitter/web-tree-sitter.wasm"
          ),
      });

      return new Parser();
    })();
  }

  return parserPromise;
}

export async function parseSourceFile(
  sourceCode: string,
  filePath: string
) {
  const language = detectLanguage(filePath);

  if (!language) {
    throw new Error(
      `Unsupported file type: ${filePath}`
    );
  }

  const parser = await getParser();

  const treeSitterLanguage = await loadLanguage(language);

  parser.setLanguage(treeSitterLanguage);

  return parser.parse(sourceCode);
}