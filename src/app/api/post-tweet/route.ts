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
    return NextResponse.json({ tweet: tweet });
  } catch (error) {
    console.error("Error posting tweet:", error);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}




// const credentials = {
//   consumerKey: String(process.env.TWITTER_API_KEY!),
//   consumerSecret: String(process.env.TWITTER_API_SECRET!),
//   accessToken: String(process.env.TWITTER_ACCESS_TOKEN!),
//   accessTokenSecret: String(process.env.TWITTER_ACCESS_TOKEN_SECRET!),
//   bearerToken: String(process.env.TWITTER_BEARER_TOKEN!),
// }

// const client = new Client();
// await client.login(credentials);

// export async function POST(request: Request) {
//   try{
//   const { message } = await request.json();

//   const tweet = await client.tweets.create({text: message});
//   console.log(tweet);
//   return NextResponse.json({tweet: tweet});
//   }catch(error){
//     console.log(error)
//     return NextResponse.json({message: "Error"}, {status: 500})
//   }
// }