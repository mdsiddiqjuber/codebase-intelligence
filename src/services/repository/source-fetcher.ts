import { getBlob } from "./github";

export async function fetchSourceFile(
  owner: string,
  repo: string,
  sha: string
) {
  const blob = await getBlob(owner, repo, sha);

  if (blob.encoding !== "base64") {
    throw new Error("Unexpected GitHub blob encoding");
  }

  return Buffer.from(blob.content, "base64").toString("utf-8");
}