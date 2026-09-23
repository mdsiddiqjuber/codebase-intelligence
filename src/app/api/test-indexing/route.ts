import { NextResponse } from "next/server";

import { indexCodeChunk } from "@/services/vector/vector-indexer";

export const runtime = "nodejs";

export async function GET() {
  try {
    const chunk = {
      id: crypto.randomUUID(),
      repositoryId: "test-repository",
      filePath: "src/auth/authenticate.ts",
      language: "typescript",
      symbolName: "authenticateUser",
      symbolType: "function" as const,
      content: `
        async function authenticateUser(
          username: string,
          password: string
        ) {
          const user = await findUser(username);

          if (!user) {
            return false;
          }

          return verifyPassword(
            password,
            user.passwordHash
          );
        }
      `,
      startLine: 10,
      endLine: 24,
    };

    await indexCodeChunk(chunk);

    return NextResponse.json({
      success: true,
      chunkId: chunk.id,
    });
  } catch (error) {
    console.error("Indexing test failed:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
      { status: 500 }
    );
  }
}