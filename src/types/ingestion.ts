export interface IngestionResult {
  repositoryId: string;

  totalFiles: number;
  processableFiles: number;
  attemptedFiles: number;
  processedFiles: number;
  failedFiles: number;
  totalChunks: number;

  failures: {
    filePath: string;
    error: string;
  }[];
}