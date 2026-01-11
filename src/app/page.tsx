"use client";
import { useState, useEffect } from "react";

export default function Home() {
  const [summary, setSummary] = useState("");
  const [tweet, setTweet] = useState("");
  const [topic, setTopic] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [tweetLoading, setTweetLoading] = useState(false);
  const [researchStatus, setResearchStatus] = useState("offline");
  const [actionStatus, setActionStatus] = useState("offline");
  const [postingStatus, setPostingStatus] = useState<
    "idle" | "posting" | "success" | "error"
  >("idle");
  const [tweetUrl, setTweetUrl] = useState("");
  const [postError, setPostError] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [twitterConnected, setTwitterConnected] = useState(false);
  const [twitterUsername, setTwitterUsername] = useState("");

  const connectTwitter = async () => {
    try {
      setIsConnecting(true);
      const response = await fetch('/api/twitter-auth');
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      // Store the tokens in localStorage for the callback
      localStorage.setItem('oauth_token', data.oauth_token);
      localStorage.setItem('oauth_token_secret', data.oauth_token_secret);
      
      // Redirect to Twitter auth page
      window.location.href = data.url;
    } catch (error) {
      console.error('Error connecting to Twitter:', error);
      setPostError(error instanceof Error ? error.message : 'Failed to connect to Twitter');
    } finally {
      setIsConnecting(false);
    }
  };

  // Handle the OAuth callback
  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const oauth_token = params.get('oauth_token');
      const oauth_verifier = params.get('oauth_verifier');

      if (oauth_token && oauth_verifier) {
        try {
          const storedToken = localStorage.getItem('oauth_token');
          const storedTokenSecret = localStorage.getItem('oauth_token_secret');

          if (storedToken !== oauth_token) {
            throw new Error('Invalid OAuth token');
          }

          const response = await fetch('/api/twitter-auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              oauth_token: storedToken,
              oauth_token_secret: storedTokenSecret,
              oauth_verifier,
            }),
          });

          const data = await response.json();
          
          if (data.error) {
            throw new Error(data.error);
          }

          // Store the tokens securely
          localStorage.setItem('twitter_access_token', data.accessToken);
          localStorage.setItem('twitter_access_secret', data.accessSecret);
          setTwitterUsername(data.screenName);
          setTwitterConnected(true);

          // Clean up the URL
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (error) {
          console.error('Error completing Twitter auth:', error);
          setPostError(error instanceof Error ? error.message : 'Failed to complete Twitter authentication');
        }
      }
    };

    handleCallback();
  }, []);

  const postTweet = async (tw: string) => {
    console.log("Posting tweet:", tw);
    try {
      setPostingStatus("posting");
      setPostError("");
      
      const accessToken = localStorage.getItem('twitter_access_token');
      const accessSecret = localStorage.getItem('twitter_access_secret');
      
      if (!accessToken || !accessSecret) {
        throw new Error('Twitter authentication required');
      }

      const response = await fetch("/api/post-tweet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          tw,
          accessToken,
          accessSecret,
        }),
      });

      const tweet = await response.json();
      console.log(tweet);

      if (!response.ok) {
        throw new Error(tweet.error || "Failed to post tweet");
      }
      setTweetUrl(`https://x.com/${twitterUsername}/${tweet.id}`);
      setPostingStatus("success");
    } catch (error) {
      console.error("Error posting tweet:", error);
      setPostError(
        error instanceof Error ? error.message : "Failed to post tweet"
      );
      setPostingStatus("error");
    }
  };

  const runAgents = async () => {
    setSummaryLoading(true);
    setTweetLoading(true);
    setResearchStatus("online");
    setPostingStatus("idle");
    setTweetUrl("");

    const res1 = await fetch("/api/research-agent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: topic }),
    });
    const data1 = await res1.json();
    setSummary(data1.summary);
    setSummaryLoading(false);
    setResearchStatus("offline");

    setActionStatus("online");
    const res2 = await fetch("/api/action-agent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ summary: data1.summary }),
    });
    const data2 = await res2.json();
    console.log("Action Agent Response:", data2);
    setTweet(data2.tweet);
    setTweetLoading(false);
    setActionStatus("offline");
    postTweet(data2.tweet);
  };

  const TwitterPostCard = () => (
    <div className="min-w-lg p-4 border rounded-lg shadow-sm bg-gray-900">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-bold text-white">🐦 X Post Status</h2>
        <div className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${
              postingStatus === "posting"
                ? "bg-yellow-500 animate-pulse"
                : postingStatus === "success"
                ? "bg-green-500"
                : postingStatus === "error"
                ? "bg-red-500"
                : "bg-gray-300"
            }`}
          />
          <span className="text-sm text-gray-600">
            {postingStatus === "posting"
              ? "Posting..."
              : postingStatus === "success"
              ? "Posted"
              : postingStatus === "error"
              ? "Failed"
              : "Ready"}
          </span>
        </div>
      </div>
      <div className="p-3 bg-gray-900 rounded-md min-h-[100px]">
        {postingStatus === "idle" && (
          <p className="text-gray-400 text-center">No tweet posted yet</p>
        )}
        {postingStatus === "posting" && (
          <div className="flex flex-col items-center justify-center gap-2">
            <p className="text-white">Posting to X...</p>
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
          </div>
        )}
        {postingStatus === "success" && (
          <div className="flex flex-col items-center gap-2">
            <p className="text-green-400">Successfully posted to X!</p>
            <a
              href={tweetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 text-sm"
            >
              View on X
            </a>
          </div>
        )}
        {postingStatus === "error" && (
          <div className="flex flex-col items-center gap-2">
            <p className="text-red-400">Failed to post tweet</p>
            <p className="text-red-300 text-sm">{postError}</p>
          </div>
        )}
      </div>
      {tweet && postingStatus === "idle" && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => postTweet(tweet)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
          >
            Post to X
          </button>
        </div>
      )}
    </div>
  );

  const AgentCard = ({
    title,
    content,
    loading,
    status,
    isSecondAgent,
  }: {
    title: string;
    content: string;
    loading: boolean;
    status: string;
    isSecondAgent: boolean;
  }) => (
    <div className="min-w-lg p-4 border rounded-lg shadow-sm bg-gray-900 max-w-lg">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-bold text-white">{title}</h2>
        <div className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${
              status === "online" ? "bg-green-500 animate-pulse" : "bg-gray-300"
            }`}
          />
          <span className="text-sm text-gray-600">
            {status === "online" ? "Generating..." : "Ready"}
          </span>
        </div>
      </div>
      <div className="p-3 bg-gray-900 rounded-md h-[200px] overflow-y-auto">
        {!isSecondAgent ? (
          <p className="whitespace-pre-wrap text-white">
            {loading ? "Thinking..." : content}
          </p>
        ) : (
          <p className="whitespace-pre-wrap text-white">
            {loading || (isSecondAgent && summaryLoading)
              ? "Waiting for Research Agent..."
              : content}
          </p>
        )}
      </div>
    </div>
  );

  return (
    <main className="p-4 flex flex-col items-center justify-center gap-6">
      <h1 className="text-2xl font-bold text-white">2-Agent System</h1>
      
      <div className="w-full max-w-2xl flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Enter a topic"
            className="flex-1 border border-gray-300 p-2 rounded-md text-white bg-gray-900"
          />
          <button
            onClick={connectTwitter}
            disabled={isConnecting || twitterConnected}
            className={`ml-4 px-4 py-2 rounded-md transition-colors ${
              twitterConnected
                ? 'bg-green-500 cursor-not-allowed'
                : isConnecting
                ? 'bg-gray-500 cursor-wait'
                : 'bg-blue-500 hover:bg-blue-600'
            } text-white`}
          >
            {twitterConnected ? (
              <span className="flex items-center">
                <span className="mr-2">✓</span>
                @{twitterUsername}
              </span>
            ) : isConnecting ? (
              'Connecting...'
            ) : (
              'Connect Twitter'
            )}
          </button>
        </div>
        
        <button
          onClick={runAgents}
          disabled={!twitterConnected}
          className={`bg-blue-500 text-white p-2 rounded-md transition-colors ${
            !twitterConnected ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600 cursor-pointer'
          }`}
        >
          Run 2-Agent System
        </button>
      </div>

      <div className="w-full flex flex-col items-center gap-5">
        <div className="flex justify-center items-center gap-5">
          <AgentCard
            title="🔍 Research Agent"
            content={summary}
            loading={summaryLoading}
            status={researchStatus}
            isSecondAgent={false}
          />
          <span className="text-white text-2xl">
            {"- - - - - - - - - - - -"}
          </span>
          <AgentCard
            title="📝 Action Agent"
            content={tweet}
            loading={tweetLoading}
            status={actionStatus}
            isSecondAgent={true}
          />
        </div>
        <TwitterPostCard />
      </div>
    </main>
  );
}
