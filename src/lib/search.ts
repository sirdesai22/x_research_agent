import { tavily } from '@tavily/core';

export async function getTrendingAITools(query: string) {
    const client = tavily({ apiKey: process.env.NEXT_PUBLIC_TAVILY_API_KEY || '' });
    const response = await client.search(query, {
        search_depth: "basic",
        include_answers: true,
    });
    return response.results.map((result: any) => result.title).join("\n");
}
