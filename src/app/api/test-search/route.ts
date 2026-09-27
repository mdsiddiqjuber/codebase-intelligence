  import { NextResponse } from "next/server";

import { searchCodebase } from "@/services/vector/search";

export const runtime = "nodejs";

export async function GET() {
  try {
    const results = await searchCodebase({
      repositoryId:
        "8b453b52-d1e4-4eb9-a4dd-63e42a75af3e",
      query: "Where is the editor component implemented?",
      limit: 5,
    });

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error) {
    console.error("Search test failed:", error);

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