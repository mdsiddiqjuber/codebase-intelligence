import qdrant from "./qdrant";
import { CODE_COLLECTION } from "./collection";
import { generateEmbedding } from "./embedding";

import type { CodeChunk } from "@/types/code-chunk";

export async function indexCodeChunk(
  chunk: CodeChunk
) {
  const embedding = await generateEmbedding(
    chunk.content
  );

  await qdrant.upsert(CODE_COLLECTION, {
    wait: true,
    points: [
      {
        id: chunk.id,
        vector: embedding,
        payload: {
          repositoryId: chunk.repositoryId,
          filePath: chunk.filePath,
          language: chunk.language,
          symbolName: chunk.symbolName,
          symbolType: chunk.symbolType,
          content: chunk.content,
          startLine: chunk.startLine,
          endLine: chunk.endLine,
        },
      },
    ],
  });
}