import { getRepositoryTree } from "@/services/repository/github";
import { isProcessableFile } from "@/services/repository/file-filter";
import { detectLanguage } from "@/services/parser/language-detector";

import { processRepositoryFile } from "./file-processor";
import { processWithConcurrency } from "./worker-pool";

import type { CodeChunk } from "@/types/code-chunk";
import type { IngestionResult } from "@/types/ingestion";

interface Repository {
  id: string;
  name: string;
  owner: string;
  default_branch: string;
}

interface RepositoryFile {
  path: string;
  sha: string;
  type: string;
}

const INGESTION_CONCURRENCY = 5;

export async function ingestRepository(
  repository: Repository
): Promise<IngestionResult> {
  const tree = await getRepositoryTree(
    repository.owner,
    repository.name,
    repository.default_branch
  );

  const allFiles = tree.tree.filter(
    (item: RepositoryFile) => item.type === "blob"
  );

  const processableFiles = allFiles.filter(
    (file: RepositoryFile) =>
      isProcessableFile(file.path) &&
      detectLanguage(file.path) !== null
  );

  const filesToProcess = processableFiles.slice(0, 10);

  const failures: IngestionResult["failures"] = [];

  const results = await processWithConcurrency<
    RepositoryFile,
    {
      filePath: string;
      chunks: CodeChunk[];
      error: string | null;
    }
  >(
    filesToProcess,
    async (file) => {
      try {
        const chunks = await processRepositoryFile(
          file,
          {
            repositoryId: repository.id,
            owner: repository.owner,
            repo: repository.name,
          }
        );

        return {
          filePath: file.path,
          chunks,
          error: null,
        };
      } catch (error) {
        return {
          filePath: file.path,
          chunks: [] as CodeChunk[],
          error:
            error instanceof Error
              ? error.message
              : "Unknown error",
        };
      }
    },
    INGESTION_CONCURRENCY
  );

  const allChunks: CodeChunk[] = [];

  for (const result of results) {
    if (result.error) {
      failures.push({
        filePath: result.filePath,
        error: result.error,
      });

      continue;
    }

    allChunks.push(...result.chunks);
  }

  return {
    repositoryId: repository.id,

    totalFiles: allFiles.length,
    processableFiles: processableFiles.length,
    processedFiles:
      filesToProcess.length - failures.length,
    failedFiles: failures.length,
    attemptedFiles: filesToProcess.length,
    totalChunks: allChunks.length,
    failures,
  };
}