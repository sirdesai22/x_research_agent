import { NextResponse } from 'next/server';
import { TwitterApi } from 'twitter-api-v2';

export async function POST(request: Request) {
  try {
    const { tw, accessToken, accessSecret } = await request.json();
    
    if (!accessToken || !accessSecret) {
      return NextResponse.json(
        { error: 'Twitter authentication required' },
        { status: 401 }
      );
    }

    const client = new TwitterApi({
      appKey: String(process.env.TWITTER_API_KEY),
      appSecret: String(process.env.TWITTER_API_SECRET),
      accessToken,
      accessSecret,
    });

    const tweet = await client.v2.tweet(tw);
    console.log(tweet);
    return NextResponse.json({ tweet: tweet.data });
  } catch (error) {
    console.error("Error posting tweet:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to post tweet' },
      { status: 500 }
    );
  }
}