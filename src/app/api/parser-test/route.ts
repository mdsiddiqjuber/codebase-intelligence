import { NextResponse } from "next/server";

import { parseTypeScript } from "@/services/parser/tree-sitter";
import { extractCodeChunks } from "@/services/parser/code-chunker";

export const runtime = "nodejs";

export async function GET() {
  const sourceCode = `
    interface User {
      id: number;
      name: string;
    }

    class UserService {
      getUser(id: number) {
        return id;
      }
    }

    function hello(name: string) {
      return "Hello " + name;
    }
  `;

  const tree = await parseTypeScript(sourceCode);

  const chunks = extractCodeChunks(tree.rootNode, {
    repositoryId: "test-repository",
    filePath: "test.ts",
    language: "typescript",
    sourceCode,
  });

  return NextResponse.json({
    chunks,
  });
}