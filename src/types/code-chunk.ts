export type CodeSymbolType =
  | "function"
  | "method"
  | "class"
  | "interface"
  | "variable"
  | "import"
  | "export"
  | "module"
  | "unknown";

export interface CodeChunk {
  id: string;
  repositoryId: string;
  filePath: string;
  language: string;
  symbolName: string;
  symbolType: CodeSymbolType;
  content: string;
  startLine: number;
  endLine: number;
}