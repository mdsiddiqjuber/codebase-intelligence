import { NextResponse } from "next/server";

import { supabase } from "@/lib/supabase/client";
import { getRepositoryTree } from "@/services/repository/github";
import { isProcessableFile } from "@/services/repository/file-filter";
import { detectLanguage } from "@/services/parser/language-detector";

export const runtime = "nodejs";

export async function GET(
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

    const tree = await getRepositoryTree(
      repository.owner,
      repository.name,
      repository.default_branch
    );

    const files = tree.tree
      .filter(
        (item: {
          path: string;
          type: string;
        }) =>
          item.type === "blob" &&
          isProcessableFile(item.path) &&
          detectLanguage(item.path) !== null
      )
      .slice(0, 30)
      .map((item: { path: string }) => item.path);

    return NextResponse.json({
      count: files.length,
      files,
    });
  } catch (error) {
    console.error("Failed to get repository files:", error);

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