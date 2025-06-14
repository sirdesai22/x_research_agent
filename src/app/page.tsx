"use client";
import { useState } from "react";

export default function Home() {
  const [summary, setSummary] = useState("");
  const [tweet, setTweet] = useState("");
  const [topic, setTopic] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [tweetLoading, setTweetLoading] = useState(false);
  const [researchStatus, setResearchStatus] = useState("offline");
  const [actionStatus, setActionStatus] = useState("offline");
  const [postingStatus, setPostingStatus] = useState<"idle" | "posting" | "success" | "error">("idle");
  const [tweetUrl, setTweetUrl] = useState("");
  const [postError, setPostError] = useState("");

  const postTweet = async (tw: string) => {
    try {
      setPostingStatus("posting");
      setPostError("");
      const response = await fetch("/api/post-tweet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tw }),
      });
      
      const data = await response.json();
      console.log(data)

      if (!response.ok) {
        throw new Error(data || "Failed to post tweet");
      }

      setTweetUrl(String(data));
      setPostingStatus("success");
    } catch (error) {
      console.error("Error posting tweet:", error);
      setPostError(error instanceof Error ? error.message : "Failed to post tweet");
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
    setTweet(data2.tweet);
    setTweetLoading(false);
    setActionStatus("offline");
    postTweet(tweet);
  };

  const TwitterPostCard = () => (
    <div className="min-w-lg p-4 border rounded-lg shadow-sm bg-gray-900">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-bold text-white">🐦 X Post Status</h2>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${
            postingStatus === "posting" ? "bg-yellow-500 animate-pulse" :
            postingStatus === "success" ? "bg-green-500" :
            postingStatus === "error" ? "bg-red-500" :
            "bg-gray-300"
          }`} />
          <span className="text-sm text-gray-600">
            {postingStatus === "posting" ? "Posting..." :
             postingStatus === "success" ? "Posted" :
             postingStatus === "error" ? "Failed" :
             "Ready"}
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

  const AgentCard = ({ title, content, loading, status, isSecondAgent }: { title: string; content: string; loading: boolean; status: string; isSecondAgent: boolean }) => (
    <div className="min-w-lg p-4 border rounded-lg shadow-sm bg-gray-900">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-bold text-white">{title}</h2>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${status === "online" ? "bg-green-500 animate-pulse" : "bg-gray-300"}`} />
          <span className="text-sm text-gray-600">{status === "online" ? "Generating..." : "Ready"}</span>
        </div>
      </div>
      <div className="p-3 bg-gray-900 rounded-md h-[200px] overflow-y-auto">
        <p className="whitespace-pre-wrap text-white">
          {loading ? "Thinking..." : 
           isSecondAgent && summaryLoading ? "Waiting for Research Agent..." :
           content}
        </p>
      </div>
    </div>
  );

  return (
    <main className="p-4 flex flex-col items-center justify-center gap-6">
      <h1 className="text-2xl font-bold text-white">2-Agent System</h1>
      <input 
        type="text" 
        value={topic} 
        onChange={(e) => setTopic(e.target.value)} 
        placeholder="Enter a topic" 
        className="w-full max-w-2xl border border-gray-300 p-2 rounded-md text-white bg-gray-900"
      />
      <button 
        onClick={runAgents} 
        className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition-colors cursor-pointer"
      >
        Run 2-Agent System
      </button>

      {/* <button 
        onClick={() => postTweet("test tweet from 2-agent system")} 
        className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition-colors cursor-pointer"
      >
        Post Tweet
      </button> */}
      
      <div className="w-full flex flex-col items-center gap-5">
        <div className="flex justify-center items-center gap-5">
          <AgentCard 
            title="🔍 Research Agent" 
            content={summary} 
            loading={summaryLoading} 
            status={researchStatus}
            isSecondAgent={false}
          />
          <span className="text-white text-2xl">{"- - - - - - - - - - - -"}</span>
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
