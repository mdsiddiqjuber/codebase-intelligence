export type SupportedLanguage =
  | "typescript"
  | "tsx"
  | "javascript";

export function detectLanguage(
  filePath: string
): SupportedLanguage | null {
  const extension = filePath
    .toLowerCase()
    .split(".")
    .pop();

  switch (extension) {
    case "ts":
      return "typescript";

    case "tsx":
      return "tsx";

    case "js":
      return "javascript";

    case "jsx":
      return "javascript";

    default:
      return null;
  }
}