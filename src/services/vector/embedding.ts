import {
  pipeline,
  type FeatureExtractionPipeline,
} from "@huggingface/transformers";

const MODEL = "Xenova/all-MiniLM-L6-v2";

let extractorPromise: Promise<FeatureExtractionPipeline> | null = null;

async function getExtractor(): Promise<FeatureExtractionPipeline> {
  if (!extractorPromise) {
    extractorPromise = pipeline(
      "feature-extraction",
      MODEL
    ) as Promise<FeatureExtractionPipeline>;
  }

  return extractorPromise;
}

export async function generateEmbedding(
  text: string
): Promise<number[]> {
  const extractor = await getExtractor();

  const output = await extractor(text, {
    pooling: "mean",
    normalize: true,
  });

  return Array.from(output.data);
}

export async function generateEmbeddings(
  texts: string[]
): Promise<number[][]> {
  const extractor = await getExtractor();

  const output = await extractor(texts, {
    pooling: "mean",
    normalize: true,
  });

  return output.tolist() as number[][];
}