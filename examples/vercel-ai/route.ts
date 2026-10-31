// Next.js App Router route that streams Asha to your UI with the Vercel AI SDK.
//   npm install ai @ai-sdk/openai
//   ASHA_API_KEY=dnai_a2a_... in your server environment (never in the browser)
// Save as app/api/ask/route.ts
import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";

const asha = createOpenAI({
  baseURL: "https://api.askasha.org/v1",
  apiKey: process.env.ASHA_API_KEY,
});

export async function POST(req: Request) {
  const { messages } = await req.json();
  const result = streamText({ model: asha.chat("asha"), messages });
  return result.toTextStreamResponse();
}
