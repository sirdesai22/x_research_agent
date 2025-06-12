import { askGemini } from "@/lib/gemini";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { summary } = await request.json();

  const postPrompt = `Write a single tweet about this topic in an engaging, concise format under 200 characters:\n${summary}`;
  const tweet = await askGemini(postPrompt);

  return NextResponse.json({ tweet });
}
