import { NextResponse } from "next/server";
import { searchCatalog } from "@/lib/catalog";

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q") ?? "";
  return NextResponse.json({ items: searchCatalog(query), total: searchCatalog(query).length });
}
