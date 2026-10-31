// Stream an Asha answer with the OpenAI Node SDK.
//   npm install openai
//   ASHA_API_KEY=dnai_a2a_... node openai_stream.mjs
// Keep the key on your server: the API refuses cross-origin browser calls.
import OpenAI from "openai";

const client = new OpenAI({ baseURL: "https://api.askasha.org/v1", apiKey: process.env.ASHA_API_KEY });

const stream = await client.chat.completions.create({
  model: "asha",
  stream: true,
  messages: [{ role: "user", content: "Red flags for a fever in a 2-year-old?" }],
  metadata: { audience: "caregiver", verbosity: "brief" },
});

for await (const chunk of stream) {
  process.stdout.write(chunk.choices[0]?.delta?.content ?? "");
}
process.stdout.write("\n");
