import { GoogleGenAI } from '@google/genai';

const genAI = new GoogleGenAI({apiKey:process.env.NEXT_PUBLIC_GEMINI_API_KEY || ''});

export async function askGemini(prompt: string) {
    const response = await genAI.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
      });
      if(!response) {
        throw new Error("Failed to generate content");
      }
      return response.text;
}

