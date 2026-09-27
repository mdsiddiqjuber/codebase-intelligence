import qdrant from "./qdrant";
import { CODE_COLLECTION } from "./collection";
import { generateEmbedding } from "./embedding";

export interface CodeSearchResult {
  score: number;
  repositoryId: string;
  filePath: string;
  language: string;
  symbolName: string;
  symbolType: string;
  content: string;
  startLine: number;
  endLine: number;
}

interface SearchOptions {
  repositoryId: string;
  query: string;
  limit?: number;
}

interface CodeChunkPayload {
  repositoryId: string;
  filePath: string;
  language: string;
  symbolName: string;
  symbolType: string;
  content: string;
  startLine: number;
  endLine: number;
}

function parseCodeChunkPayload(
  payload: Record<string, unknown> | null | undefined
): CodeChunkPayload | null {
  if (!payload) {
    return null;
  }

  if (
    typeof payload.repositoryId !== "string" ||
    typeof payload.filePath !== "string" ||
    typeof payload.language !== "string" ||
    typeof payload.symbolName !== "string" ||
    typeof payload.symbolType !== "string" ||
    typeof payload.content !== "string" ||
    typeof payload.startLine !== "number" ||
    typeof payload.endLine !== "number"
  ) {
    return null;
  }

  return {
    repositoryId: payload.repositoryId,
    filePath: payload.filePath,
    language: payload.language,
    symbolName: payload.symbolName,
    symbolType: payload.symbolType,
    content: payload.content,
    startLine: payload.startLine,
    endLine: payload.endLine,
  };
}

export async function searchCodebase({
  repositoryId,
  query,
  limit = 5,
}: SearchOptions): Promise<CodeSearchResult[]> {
  const queryVector = await generateEmbedding(query);

  const results = await qdrant.query(
    CODE_COLLECTION,
    {
      query: queryVector,
      limit,
      with_payload: true,
      filter: {
        must: [
          {
            key: "repositoryId",
            match: {
              value: repositoryId,
            },
          },
        ],
      },
    }
  );

  return results.points
  .map((result) => {
    const payload = parseCodeChunkPayload(
      result.payload
    );

    if (!payload) {
      return null;
    }

    return {
      score: result.score,
      repositoryId: payload.repositoryId,
      filePath: payload.filePath,
      language: payload.language,
      symbolName: payload.symbolName,
      symbolType: payload.symbolType,
      content: payload.content,
      startLine: payload.startLine,
      endLine: payload.endLine,
    };
  })
  .filter(
    (result): result is CodeSearchResult =>
      result !== null
  );
}