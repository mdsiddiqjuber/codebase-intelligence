import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { getRepositoryTree } from "@/services/repository/github";
import { isProcessableFile } from "@/services/repository/file-filter";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 1. Get repository from Supabase
    const { data: repository, error: repositoryError } = await supabase
      .from("repositories")
      .select("*")
      .eq("id", id)
      .single();

    if (repositoryError || !repository) {
      return NextResponse.json(
        { error: "Repository not found" },
        { status: 404 }
      );
    }

    // 2. Get GitHub repository tree
    const tree = await getRepositoryTree(
      repository.owner,
      repository.name,
      repository.default_branch
    );

    // 3. Filter files
    const files = tree.tree.filter(
      (item: { type: string; path: string }) =>
        item.type === "blob" && isProcessableFile(item.path)
    );

    // 4. Update repository status
    await supabase
      .from("repositories")
      .update({ status: "processing" })
      .eq("id", id);

    return NextResponse.json({
      message: "Repository ingestion started",
      repositoryId: id,
      totalFiles: files.length,
      files: files.map((file: { path: string }) => file.path),
    });
  } catch (error) {
    console.error("Ingestion error:", error);

    return NextResponse.json(
      { error: "Failed to ingest repository" },
      { status: 500 }
    );
  }
}