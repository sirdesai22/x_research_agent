import { NextResponse } from 'next/server';
import {TwitterApi} from 'twitter-api-v2';

const client = new TwitterApi({
  appKey: String(process.env.TWITTER_API_KEY),
  appSecret: String(process.env.TWITTER_API_SECRET),
  accessToken: String(process.env.TWITTER_ACCESS_TOKEN),
  accessSecret: String(process.env.TWITTER_ACCESS_TOKEN_SECRET),
});

export async function POST(request: Request) {
  try {
    const { tw } = await request.json();
    const tweet = await client.v2.tweet(tw);
    console.log(tweet);
    return NextResponse.json({ tweet: tweet.data });
  } catch (error) {
    console.error("Error posting tweet:", error);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}