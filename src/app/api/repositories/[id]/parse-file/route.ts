import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { getRepositoryTree } from "@/services/repository/github";
import { fetchSourceFile } from "@/services/repository/source-fetcher";
import { isProcessableFile } from "@/services/repository/file-filter";
import { detectLanguage } from "@/services/parser/language-detector";
import { parseSourceFile } from "@/services/parser/tree-sitter";
import { extractCodeChunks } from "@/services/parser/code-chunker";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(_request.url);
    const requestedPath = searchParams.get("path");

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

    if (!repository.owner || !repository.default_branch) {
      return NextResponse.json(
        { error: "Repository metadata is incomplete" },
        { status: 400 }
      );
    }

    const tree = await getRepositoryTree(
      repository.owner,
      repository.name,
      repository.default_branch
    );

    const file = tree.tree.find(
      (item: {
        path: string;
        type: string;
        sha: string;
      }) =>
        item.type === "blob" &&
        isProcessableFile(item.path) &&
        detectLanguage(item.path) !== null &&
        (!requestedPath || item.path === requestedPath)
    );

    if (!file) {
      return NextResponse.json(
        { error: "No processable files found" },
        { status: 404 }
      );
    }

    const sourceCode = await fetchSourceFile(
      repository.owner,
      repository.name,
      file.sha
    );

    const parsedTree = await parseSourceFile(
      sourceCode,
      file.path
    );

    if (!parsedTree) {
      return NextResponse.json(
        { error: "Failed to parse source file" },
        { status: 422 }
      );
    }

    const language = detectLanguage(file.path);

    if (!language) {
      return NextResponse.json(
        { error: "Unsupported file type" },
        { status: 422 }
      );
    }

    const chunks = extractCodeChunks(
      parsedTree.rootNode,
      {
        repositoryId: repository.id,
        filePath: file.path,
        language,
        sourceCode,
      }
    );

    return NextResponse.json({
      repository: {
        id: repository.id,
        name: repository.name,
      },
      file: {
        path: file.path,
        sha: file.sha,
      },
      chunkCount: chunks.length,
      chunks,
    });
  } catch (error) {
  console.error("Failed to process repository file:", error);

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