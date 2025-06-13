import { Client } from "twitter-api-sdk";
import { NextResponse } from "next/server";

const client = new Client(process.env.TWITTER_BEARER_TOKEN!);

export async function POST(request: Request) {
  const { message } = await request.json();
  const tweets = await client.tweets.usersIdTweets("1249650177687736320", {
    max_results: 10,
  });
  console.log(tweets);
  return NextResponse.json(tweets.data);
}