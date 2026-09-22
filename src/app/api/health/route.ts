import { NextResponse } from "next/server";
import { catalog } from "@/lib/catalog";

export function GET() {
  return NextResponse.json({
    ok: true,
    catalog: catalog.length,
    aiProvider: Boolean(process.env.OPENAI_API_KEY),
    mode: process.env.OPENAI_API_KEY ? "provider-with-fallback" : "catalog-fallback",
    timestamp: new Date().toISOString(),
  });
}
