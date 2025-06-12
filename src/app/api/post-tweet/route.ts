import { TwitterApi } from 'twitter-api-v2';
import { NextResponse } from 'next/server';

// Initialize the Twitter client with OAuth 1.0a credentials
const client = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY!,
  appSecret: process.env.TWITTER_API_SECRET!,
  accessToken: process.env.TWITTER_ACCESS_TOKEN!,
  accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET!,
});

export async function POST(request: Request) {
  try {
    const { tw } = await request.json();
    
    if (!tw) {
      return NextResponse.json({ error: 'Tweet content is required' }, { status: 400 });
    }

    // Log the credentials (without values) to verify they exist
    console.log('Checking credentials:', {
      hasAppKey: !!process.env.TWITTER_API_KEY,
      hasAppSecret: !!process.env.TWITTER_API_SECRET,
      hasAccessToken: !!process.env.TWITTER_ACCESS_TOKEN,
      hasAccessSecret: !!process.env.TWITTER_ACCESS_TOKEN_SECRET
    });

    // Verify we have all required credentials
    if (!process.env.TWITTER_API_KEY || !process.env.TWITTER_API_SECRET || 
        !process.env.TWITTER_ACCESS_TOKEN || !process.env.TWITTER_ACCESS_TOKEN_SECRET) {
      throw new Error('Twitter API credentials are not properly configured');
    }

    try {
      // Create a tweet using the client
      const result = await client.v2.tweet(tw);
      
      if (!result.data) {
        throw new Error('Failed to create tweet: No data returned from Twitter API');
      }

      console.log('Tweet posted successfully:', result.data);

      return NextResponse.json({ 
        success: true, 
        tweetId: result.data.id,
        tweetUrl: `https://x.com/user/status/${result.data.id}`
      });
    } catch (twitterError: any) {
      // Log the full Twitter API error
      console.error('Twitter API Error:', {
        code: twitterError.code,
        data: twitterError.data,
        rateLimit: twitterError.rateLimit,
        headers: twitterError.headers,
        message: twitterError.message
      });
      throw twitterError;
    }
  } catch (error: any) {
    console.error('Error posting tweet:', error);
    
    // Log detailed error information
    console.error('Full error object:', {
      name: error.name,
      message: error.message,
      code: error.code,
      data: error.data,
      stack: error.stack,
      rateLimit: error.rateLimit,
      headers: error.headers
    });

    // Return a more detailed error response
    return NextResponse.json({ 
      error: 'Failed to post tweet',
      details: error.message || 'Unknown error',
      code: error.code,
      twitterError: error.data
    }, { status: 500 });
  }
} 