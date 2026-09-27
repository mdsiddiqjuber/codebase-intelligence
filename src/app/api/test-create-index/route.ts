import { NextResponse } from "next/server";

import qdrant from "@/services/vector/qdrant";
import { CODE_COLLECTION } from "@/services/vector/collection";

export const runtime = "nodejs";

export async function GET() {
  try {
    await qdrant.createPayloadIndex(
      CODE_COLLECTION,
      {
        field_name: "repositoryId",
        field_schema: "keyword",
      }
    );

    return NextResponse.json({
      success: true,
      message: "repositoryId index created",
    });
  } catch (error) {
    console.error("Index creation failed:", error);

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