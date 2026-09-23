import { NextResponse } from "next/server";

import { indexCodeChunks } from "@/services/vector/batch-indexer";

import type { CodeChunk } from "@/types/code-chunk";

export const runtime = "nodejs";

export async function GET() {
  try {
    const chunks: CodeChunk[] = [
      {
        id: crypto.randomUUID(),
        repositoryId: "test-repository",
        filePath: "src/auth/authenticate.ts",
        language: "typescript",
        symbolName: "authenticateUser",
        symbolType: "function",
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
      },
      {
        id: crypto.randomUUID(),
        repositoryId: "test-repository",
        filePath: "src/users/user-service.ts",
        language: "typescript",
        symbolName: "getUserById",
        symbolType: "function",
        content: `
          async function getUserById(
            id: string
          ) {
            return User.findById(id);
          }
        `,
        startLine: 5,
        endLine: 9,
      },
      {
        id: crypto.randomUUID(),
        repositoryId: "test-repository",
        filePath: "src/orders/order-service.ts",
        language: "typescript",
        symbolName: "createOrder",
        symbolType: "function",
        content: `
          async function createOrder(
            userId: string,
            productId: string
          ) {
            return Order.create({
              userId,
              productId,
            });
          }
        `,
        startLine: 12,
        endLine: 19,
      },
    ];

    await indexCodeChunks(chunks);

    return NextResponse.json({
      success: true,
      indexedChunks: chunks.length,
    });
  } catch (error) {
    console.error(
      "Batch indexing test failed:",
      error
    );

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