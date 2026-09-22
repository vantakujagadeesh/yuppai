import { NextResponse } from "next/server";
import { catalog } from "@/lib/catalog";
import { providerStatus } from "@/lib/config";

export function GET() {
  const providers = providerStatus();
  return NextResponse.json({
    ok: true,
    catalog: catalog.length,
    providers,
    aiProvider: providers.ai,
    mode: providers.ai ? "provider-with-fallback" : "catalog-fallback",
    publishable: providers.catalog && providers.ai && providers.database && providers.auth && providers.playback,
    timestamp: new Date().toISOString(),
  });
}
