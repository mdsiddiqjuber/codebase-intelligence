import { NextResponse } from "next/server";

import {
  ensureCodeCollection,
  CODE_COLLECTION,
} from "@/services/vector/collection";

export const runtime = "nodejs";

export async function GET() {
  try {
    await ensureCodeCollection();

    return NextResponse.json({
      success: true,
      collection: CODE_COLLECTION,
    });
  } catch (error) {
    console.error("Qdrant test failed:", error);

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