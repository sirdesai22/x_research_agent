import { NextResponse } from 'next/server';
import { TwitterApi } from 'twitter-api-v2';

const client = new TwitterApi({
  appKey: String(process.env.TWITTER_API_KEY),
  appSecret: String(process.env.TWITTER_API_SECRET),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const callbackUrl = searchParams.get('callbackUrl') || 'http://localhost:3000/api/twitter-auth';
    
    const authLink = await client.generateAuthLink(callbackUrl, {
      linkMode: 'authorize',
    });

    return NextResponse.json({ 
      url: authLink.url,
      oauth_token: authLink.oauth_token,
      oauth_token_secret: authLink.oauth_token_secret,
    });
  } catch (error) {
    console.error('Error generating auth link:', error);
    return NextResponse.json({ error: 'Failed to generate auth link' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { oauth_token, oauth_token_secret, oauth_verifier } = await request.json();
    
    const client = new TwitterApi({
      appKey: String(process.env.TWITTER_API_KEY),
      appSecret: String(process.env.TWITTER_API_SECRET),
      accessToken: oauth_token,
      accessSecret: oauth_token_secret,
    });

    const { accessToken, accessSecret, screenName } = await client.login(oauth_verifier);

    return NextResponse.json({
      accessToken,
      accessSecret,
      screenName,
    });
  } catch (error) {
    console.error('Error completing auth:', error);
    return NextResponse.json({ error: 'Failed to complete authentication' }, { status: 500 });
  }
} 