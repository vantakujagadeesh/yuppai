import { NextResponse } from "next/server";
import { catalog } from "@/lib/catalog";

const languages = ["English", "Hindi", "Tamil", "Telugu", "Malayalam", "Kannada", "Bengali", "Marathi", "Punjabi"];

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const text = typeof body.text === "string" ? body.text.trim().slice(0, 300) : "";
  if (!text) return NextResponse.json({ error: "A command is required" }, { status: 400 });
  const lower = text.toLowerCase();
  const language = languages.find((item) => lower.includes(item.toLowerCase()));
  const title = catalog.find((item) => lower.includes(item.name.toLowerCase()));
  if (/subtitle|captions|translation/.test(lower)) return NextResponse.json({ type: "settings", setting: "subtitles", value: language ?? "English", answer: `Subtitles are set to ${language ?? "English"} when the selected stream provides them.` });
  if (/resume|continue/.test(lower)) return NextResponse.json({ type: "playback", action: "resume", answer: "Your continue-watching list is ready." });
  if (/next episode|next/.test(lower)) return NextResponse.json({ type: "playback", action: "next", answer: "The next episode will play when episode metadata is connected." });
  if (/play|watch|open/.test(lower) && title) return NextResponse.json({ type: "playback", action: "play", titleId: title.id, answer: `Opening ${title.name}.` });
  return NextResponse.json({ type: "none", answer: "Try “play The Last Horizon”, “turn on Hindi subtitles”, or “resume watching”." });
}
