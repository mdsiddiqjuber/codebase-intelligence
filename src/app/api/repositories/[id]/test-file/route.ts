import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { getRepositoryTree } from "@/services/repository/github";
import { isProcessableFile } from "@/services/repository/file-filter";
import { fetchSourceFile } from "@/services/repository/source-fetcher";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 1. Get repository metadata
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

    // 2. Get repository tree
    const tree = await getRepositoryTree(
      repository.owner,
      repository.name,
      repository.default_branch
    );

    // 3. Find the first processable file
    const file = tree.tree.find(
      (item: { type: string; path: string; sha: string }) =>
        item.type === "blob" && isProcessableFile(item.path)
    );

    if (!file) {
      return NextResponse.json(
        { error: "No processable source file found" },
        { status: 404 }
      );
    }

    // 4. Fetch actual source code
    const content = await fetchSourceFile(
      repository.owner,
      repository.name,
      file.sha
    );

    return NextResponse.json({
      path: file.path,
      sha: file.sha,
      content,
    });
  } catch (error) {
    console.error("Test file error:", error);

    return NextResponse.json(
      { error: "Failed to fetch source file" },
      { status: 500 }
    );
  }
}