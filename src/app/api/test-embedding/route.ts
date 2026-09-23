import { NextResponse } from "next/server";

import { generateEmbedding } from "@/services/vector/embedding";

export const runtime = "nodejs";

export async function GET() {
  try {
    const embedding = await generateEmbedding(
      "function authenticateUser verifies a user's credentials"
    );

    return NextResponse.json({
      success: true,
      dimensions: embedding.length,
      preview: embedding.slice(0, 5),
    });
  } catch (error) {
    console.error("Embedding test failed:", error);

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