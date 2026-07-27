import prisma from "./db";

/**
 * Generates a vector embedding for a given text query.
 * Can be hooked up to OpenAI, Cohere, or a local model.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  // TODO: Replace with real embedding generation (e.g., HuggingFace, OpenAI, Cohere, etc.)
  // Returns a mock 1536-dimensional vector for now
  return Array.from({ length: 1536 }, () => Math.random() - 0.5);
}


export async function findSimilarFeedback(
  query: string,
  workspaceId: string,
  limit: number = 5
): Promise<any[]> {
  const queryEmbedding = await generateEmbedding(query);
  
 
  const feedbackItems = await prisma.feedback.findMany({
    where: {
      workspaceId: workspaceId,
      content: {
        contains: query,
        mode: "insensitive"
      }
    },
    take: limit
  });
  
  return feedbackItems;
}
