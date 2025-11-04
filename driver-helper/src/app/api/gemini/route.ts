import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const MODEL = "gemini-1.5-flash";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "Missing GEMINI_API_KEY" }, { status: 500 });
    }

    const client = new GoogleGenerativeAI(apiKey);

    switch (body.type) {
      case "chat": {
        const context: ChatMessage[] = Array.isArray(body.context) ? body.context : [];
        const serializedContext = context
          .map((item) => `${item.role === "user" ? "Driver" : "Assistant"}: ${item.content}`)
          .join("\n");
        const prompt = `You are Driver Helper AI, assisting professional drivers in India.\n${serializedContext}\nDriver: ${body.text}\nAssistant:`;
        const model = client.getGenerativeModel({ model: MODEL });
        const result = await model.generateContent(prompt);
        const output = result.response?.text();
        return NextResponse.json({ output });
      }
      case "translate": {
        const direction = body.direction === "en-hi" ? "en-hi" : "hi-en";
        const model = client.getGenerativeModel({ model: MODEL });
        const instruction = direction === "hi-en"
          ? "Translate this Hindi text to English suited for ride-sharing context."
          : "Translate this English text to Hindi, keeping driver-friendly tone.";
        const prompt = `${instruction}\nText: ${body.text}`;
        const result = await model.generateContent(prompt);
        const output = result.response?.text();
        return NextResponse.json({ output });
      }
      case "transcribe": {
        if (!body.audio) {
          return NextResponse.json({ error: "Missing audio payload" }, { status: 400 });
        }
        const model = client.getGenerativeModel({ model: MODEL });
        const result = await model.generateContent([
          {
            inlineData: {
              mimeType: "audio/webm",
              data: body.audio,
            },
          },
          {
            text: "Transcribe the driver's voice message. Mention Hindi and translate to English if applicable.",
          },
        ]);
        const output = result.response?.text();
        return NextResponse.json({ output });
      }
      case "search": {
        const prompt = `You are Driver Helper AI. Provide crisp guidance for: ${body.text}. Focus on Indian driving context, permits, traffic, earnings.`;
        const model = client.getGenerativeModel({ model: MODEL });
        const result = await model.generateContent(prompt);
        return NextResponse.json({ output: result.response?.text() });
      }
      default:
        return NextResponse.json({ error: "Unsupported request" }, { status: 400 });
    }
  } catch (error) {
    console.error("Gemini route error", error);
    return NextResponse.json({ error: "Gemini request failed" }, { status: 500 });
  }
}
