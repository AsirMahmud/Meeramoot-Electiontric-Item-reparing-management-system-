import { env } from "../config/env.js";

type ChatTurn = {
  role: "user" | "assistant";
  text: string;
};

type AiChatInput = {
  message: string;
  history?: ChatTurn[];
};

const SYSTEM_PROMPT = `
You are Meramot AI, a repair assistant for a Bangladesh-based electronics repair platform.

Your job:
- Help users describe device issues clearly
- Suggest likely causes in simple language
- Suggest safe next steps
- Recommend when the user should stop using the device
- Encourage booking a repair request when appropriate

Rules:
- Do not claim certainty when diagnosis is uncertain
- Do not give dangerous repair instructions
- If there is smoke, sparks, swelling battery, burning smell, or electric shock risk, tell the user to stop using the device immediately
- Keep replies concise, practical, and user-friendly
- Focus on phones, laptops, tablets, accessories, home electronics, and repair logistics
- If useful, structure the reply as:
  1. Likely issue
  2. What you can try now
  3. When to seek repair
`;

export async function generateAiRepairReply(input: AiChatInput) {
  if (!env.enableAiChat) {
    return {
      ok: false,
      skipped: true,
      reply: "AI chat is currently disabled.",
    };
  }

  if (!env.geminiApiKey) {
    throw new Error("GEMINI_API_KEY is missing");
  }

  const historyParts =
    input.history?.flatMap((turn) => [
      {
        text: `${turn.role === "assistant" ? "Assistant" : "User"}: ${turn.text}`,
      },
    ]) ?? [];

  const contents = [
    {
      role: "user",
      parts: [
        { text: SYSTEM_PROMPT },
        ...historyParts,
        { text: `User: ${input.message}` },
      ],
    },
  ];

  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": env.geminiApiKey,
      },
      body: JSON.stringify({
        contents,
      }),
    }
  );

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data?.error?.message ||
        data?.message ||
        `Gemini request failed with status ${response.status}`
    );
  }

  const reply =
    data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
    "Sorry, I could not generate a response right now.";

  return {
    ok: true,
    skipped: false,
    reply,
    raw: data,
  };
}