import qdrant from "./qdrant";
import { CODE_COLLECTION } from "./collection";
import { generateEmbeddings } from "./embedding";

import type { CodeChunk } from "@/types/code-chunk";

const EMBEDDING_BATCH_SIZE = 32;

export async function indexCodeChunks(
  chunks: CodeChunk[]
) {
  for (
    let i = 0;
    i < chunks.length;
    i += EMBEDDING_BATCH_SIZE
  ) {
    const batch = chunks.slice(
      i,
      i + EMBEDDING_BATCH_SIZE
    );

    const embeddings = await generateEmbeddings(
      batch.map((chunk) => chunk.content)
    );

    const points = batch.map((chunk, index) => ({
      id: chunk.id,
      vector: embeddings[index],
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
    }));

    await qdrant.upsert(CODE_COLLECTION, {
      wait: true,
      points,
    });
  }
}