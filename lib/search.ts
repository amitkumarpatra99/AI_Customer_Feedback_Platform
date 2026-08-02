import prisma from "./db";
import { Feedback } from "@prisma/client";

/**
 * Generates a vector embedding for a given text query.
 * Can be hooked up to OpenAI, Cohere, or a local model.
 */
export async function generateEmbedding(_text: string): Promise<number[]> {
  if (_text) { /* no-op to satisfy unused-vars */ }
  // TODO: Replace with real embedding generation (e.g., HuggingFace, OpenAI, Cohere, etc.)
  // Returns a mock 1536-dimensional vector for now
  return Array.from({ length: 1536 }, () => Math.random() - 0.5);
}


export async function findSimilarFeedback(
  query: string,
  workspaceId: string,
  limit: number = 5
): Promise<Feedback[]> {
  const _queryEmbedding = await generateEmbedding(query);
  if (_queryEmbedding) { /* no-op to satisfy unused-vars */ }
  
 
  const feedbackItems = await prisma.feedback.findMany({
    where: {
      workspaceId: workspaceId,
      content: {
        contains: query
      }
    },
    take: limit
  });
  
  return feedbackItems;
}
