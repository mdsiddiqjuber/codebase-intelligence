import { NextResponse } from "next/server";
import { parseSourceFile } from "@/services/parser/tree-sitter";
import { extractCodeChunks } from "@/services/parser/code-chunker";

export const runtime = "nodejs";

export async function GET() {
  const sourceCode = `
    const element = <div>Hello {name}</div>;

    function UserCard({ name }: { name: string }) {
      return <div>{name}</div>;
    }
  `;

  const tree = await parseSourceFile(sourceCode, "test.tsx");

  if (!tree) {
    throw new Error("Failed to parse source code");
  }

  const chunks = extractCodeChunks(tree.rootNode, {
    repositoryId: "test-repository",
    filePath: "test.tsx",
    language: "tsx",
    sourceCode,
  });

  return NextResponse.json({
    chunks,
  });
}