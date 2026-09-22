import { NextResponse } from "next/server";
import { generateMetadata } from "@/lib/ai";
import { getTitle } from "@/lib/catalog";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const title = getTitle(Number(body.id));
  if (!title) return NextResponse.json({ error: "Title not found" }, { status: 404 });
  return NextResponse.json(await generateMetadata(title, typeof body.language === "string" ? body.language : "English"));
}
