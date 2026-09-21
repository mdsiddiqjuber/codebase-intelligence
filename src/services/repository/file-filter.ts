const ALLOWED_EXTENSIONS = [
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".py",
  ".java",
  ".c",
  ".h",
  ".cpp",
  ".hpp",
  ".go",
  ".rs",
  ".php",
  ".rb",
  ".swift",
  ".kt",
  ".kts",
  ".sql",
  ".html",
  ".css",
  ".scss",
  ".md",
];

const IGNORED_DIRECTORIES = [
  "node_modules",
  ".git",
  ".next",
  "dist",
  "build",
  "coverage",
];

const IGNORED_FILES = [
  "package-lock.json",
  "yarn.lock",
  "pnpm-lock.yaml",
];

export function isProcessableFile(path: string) {
  const lowerPath = path.toLowerCase();

  if (
    IGNORED_DIRECTORIES.some((directory) =>
      lowerPath.includes(`/${directory}/`)
    )
  ) {
    return false;
  }

  const fileName = lowerPath.split("/").pop() ?? "";

  if (IGNORED_FILES.includes(fileName)) {
    return false;
  }

  return ALLOWED_EXTENSIONS.some((extension) =>
    lowerPath.endsWith(extension)
  );
}