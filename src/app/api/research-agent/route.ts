import { getTrendingAITools } from "@/lib/search";
import { askGemini } from "@/lib/gemini";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { query } = await request.json();
  const searchResults = await getTrendingAITools(query);

  const summaryPrompt = `Summarize these topics and rank the top 3:\n${searchResults}`;
  const summary = await askGemini(summaryPrompt);

  return NextResponse.json({ summary });
}
