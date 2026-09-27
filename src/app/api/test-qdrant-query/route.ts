import { NextResponse } from "next/server";

import qdrant from "@/services/vector/qdrant";
import { CODE_COLLECTION } from "@/services/vector/collection";
import { generateEmbedding } from "@/services/vector/embedding";

export const runtime = "nodejs";

export async function GET() {
  try {
    const query = "Where is authentication handled?";

    const queryVector =
      await generateEmbedding(query);

    console.log(
      "Embedding dimensions:",
      queryVector.length
    );

    const result = await qdrant.query(
      CODE_COLLECTION,
      {
        query: queryVector,
        limit: 5,
        with_payload: true,
        filter: {
          must: [
            {
              key: "repositoryId",
              match: {
                value: "test-repository",
              },
            },
          ],
        },
      }
    );

    return NextResponse.json({
      success: true,
      dimensions: queryVector.length,
      points: result.points,
    });
  } catch (error) {
    console.error(
      "Qdrant query test failed:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
      { status: 500 }
    );
  }
}