import { Parser, Language } from "web-tree-sitter";
import path from "path";

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

export async function parseTypeScript(sourceCode: string) {
  const parser = await getParser();

  const languagePath = path.join(
    process.cwd(),
    "node_modules/tree-sitter-typescript/tree-sitter-typescript.wasm"
  );

  const language = await Language.load(languagePath);

  parser.setLanguage(language);

  return parser.parse(sourceCode);
}