import { randomUUID } from "crypto";
import type { Node } from "web-tree-sitter";

import type {
  CodeChunk,
  CodeSymbolType,
} from "@/types/code-chunk";

interface ChunkContext {
  repositoryId: string;
  filePath: string;
  language: string;
  sourceCode: string;
}

export function extractCodeChunks(
  rootNode: Node,
  context: ChunkContext
): CodeChunk[] {
  const chunks: CodeChunk[] = [];

  function visit(node: Node) {
    const symbol = getSymbolInfo(node);

    if (symbol) {
      chunks.push({
        id: randomUUID(),
        repositoryId: context.repositoryId,
        filePath: context.filePath,
        language: context.language,
        symbolName: symbol.name,
        symbolType: symbol.type,
        content: node.text,
        startLine: node.startPosition.row + 1,
        endLine: node.endPosition.row + 1,
      });
    }

    for (let i = 0; i < node.childCount; i++) {
      const child = node.child(i);

      if (child) {
        visit(child);
      }
    }
  }

  visit(rootNode);

  return chunks;
}

function getSymbolInfo(
  node: Node
): { name: string; type: CodeSymbolType } | null {
  switch (node.type) {
    case "function_declaration":
      return {
        name: getChildName(node),
        type: "function",
      };

    case "class_declaration":
      return {
        name: getChildName(node),
        type: "class",
      };

    case "interface_declaration":
      return {
        name: getChildName(node),
        type: "interface",
      };

    case "method_definition":
      return {
        name: getChildName(node),
        type: "method",
      };

    default:
      return null;
  }
}

function getChildName(node: Node): string {
  const nameNode =
    node.childForFieldName("name");

  return nameNode?.text ?? "anonymous";
}