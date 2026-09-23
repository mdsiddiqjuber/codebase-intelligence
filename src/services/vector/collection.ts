import qdrant from "./qdrant";

export const CODE_COLLECTION = "code_chunks";

const VECTOR_SIZE = 384;

export async function ensureCodeCollection() {
  const collections = await qdrant.getCollections();

  const exists = collections.collections.some(
    (collection) =>
      collection.name === CODE_COLLECTION
  );

  if (exists) {
    return;
  }

  await qdrant.createCollection(CODE_COLLECTION, {
    vectors: {
      size: VECTOR_SIZE,
      distance: "Cosine",
    },
  });
}