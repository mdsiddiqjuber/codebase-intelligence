import { NextResponse } from "next/server";

import { supabase } from "@/lib/supabase/client";
import { ingestRepository } from "@/services/ingestion/repository-ingestion";

export const runtime = "nodejs";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data: repository, error } = await supabase
      .from("repositories")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !repository) {
      return NextResponse.json(
        { error: "Repository not found" },
        { status: 404 }
      );
    }

    await supabase
      .from("repositories")
      .update({
        status: "processing",
      })
      .eq("id", id);

    const result = await ingestRepository({
      id: repository.id,
      name: repository.name,
      owner: repository.owner,
      default_branch: repository.default_branch,
    });

    await supabase
      .from("repositories")
      .update({
        status: "completed",
      })
      .eq("id", id);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Repository ingestion failed:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
      { status: 500 }
    );
  }
}