import { fetchSourceFile } from "@/services/repository/source-fetcher";
import { parseSourceFile } from "@/services/parser/tree-sitter";
import { extractCodeChunks } from "@/services/parser/code-chunker";
import { detectLanguage } from "@/services/parser/language-detector";
import type { CodeChunk } from "@/types/code-chunk";

interface RepositoryFile {
  path: string;
  sha: string;
}

interface ProcessFileOptions {
  repositoryId: string;
  owner: string;
  repo: string;
}

export async function processRepositoryFile(
  file: RepositoryFile,
  options: ProcessFileOptions
): Promise<CodeChunk[]> {
  const sourceCode = await fetchSourceFile(
    options.owner,
    options.repo,
    file.sha
  );

  const tree = await parseSourceFile(
    sourceCode,
    file.path
  );

  if (!tree) {
    throw new Error(
      `Failed to parse file: ${file.path}`
    );
  }

  const language = detectLanguage(file.path);

  if (!language) {
    throw new Error(
      `Unsupported file type: ${file.path}`
    );
  }
  
  return extractCodeChunks(tree.rootNode, {
    repositoryId: options.repositoryId,
    filePath: file.path,
    language,
    sourceCode,
  });
}