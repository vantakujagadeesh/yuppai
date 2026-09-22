import { NextResponse } from "next/server";
import { answerChat } from "@/lib/ai";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!Array.isArray(body.messages) || body.messages.length > 20) return NextResponse.json({ error: "messages must be an array of up to 20 items" }, { status: 400 });
    const messages = body.messages.filter((message: unknown): message is { role: "user" | "assistant"; content: string } => typeof message === "object" && message !== null && ["user", "assistant"].includes((message as { role?: string }).role ?? "") && typeof (message as { content?: unknown }).content === "string").slice(-20);
    if (!messages.length) return NextResponse.json({ error: "At least one message is required" }, { status: 400 });
    return NextResponse.json(await answerChat(messages));
  } catch (error) {
    console.error("chat request failed", error);
    return NextResponse.json({ error: "The assistant is temporarily unavailable" }, { status: 502 });
  }
}
