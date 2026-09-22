import { catalog, searchCatalog, type CatalogTitle } from "./catalog";

type ChatMessage = { role: "user" | "assistant"; content: string };

async function providerRequest(messages: ChatMessage[]) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  const response = await fetch(process.env.AI_BASE_URL ?? "https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({ model: process.env.AI_MODEL ?? "gpt-4o-mini", temperature: 0.2, messages: [
      { role: "system", content: `You are Yupp TV assistant. Only recommend IDs from this catalog: ${JSON.stringify(catalog)}. Return valid JSON with answer (string), titleIds (number[]), and action ("play"|"search"|"none"). Never invent IDs or claim unavailable features.` },
      ...messages,
    ] }),
    signal: AbortSignal.timeout(Number(process.env.AI_TIMEOUT_MS ?? 12000)),
  });
  if (!response.ok) throw new Error(`AI provider returned ${response.status}`);
  const body = await response.json();
  const content = body.choices?.[0]?.message?.content;
  if (typeof content !== "string") throw new Error("AI provider returned no message");
  const json = content.match(/\{[\s\S]*\}/)?.[0];
  if (!json) throw new Error("AI provider returned invalid JSON");
  return JSON.parse(json) as { answer?: string; titleIds?: number[]; action?: string };
}

export async function answerChat(messages: ChatMessage[]) {
  const latest = messages.at(-1)?.content ?? "";
  try {
    const provider = await providerRequest(messages);
    if (provider) return sanitizeAnswer(provider);
  } catch (error) {
    console.error("AI provider unavailable; using catalog fallback", error);
  }
  const results = searchCatalog(latest);
  if (/play|listen|song|music/i.test(latest) && results[0]) {
    return { answer: `I found ${results[0].name}. Open it below to start playback.`, titleIds: [results[0].id], action: "play" as const };
  }
  if (results.length) return { answer: `I found ${results.slice(0, 3).map((title) => title.name).join(", ")} for you.`, titleIds: results.slice(0, 3).map((title) => title.id), action: "search" as const };
  return { answer: "Tell me a genre, language, mood, duration, or title. For example: “find a warm Hindi family movie under two hours.”", titleIds: [], action: "none" as const };
}

function sanitizeAnswer(value: { answer?: string; titleIds?: number[]; action?: string }) {
  const ids = (value.titleIds ?? []).filter((id) => catalog.some((title) => title.id === id)).slice(0, 6);
  return { answer: value.answer || "Here are some titles you may like.", titleIds: ids, action: value.action === "play" ? "play" as const : ids.length ? "search" as const : "none" as const };
}

export async function generateMetadata(title: CatalogTitle, language = "English") {
  try {
    const provider = await providerRequest([{ role: "user", content: `Create a concise viewer summary in ${language} for title ${title.id}. Return JSON with answer (string), titleIds (number[]), and action ("none").` }]);
    if (provider?.answer) return { summary: provider.answer, language, subtitles: ["English"], translations: ["English", title.language] };
  } catch (error) {
    console.error("AI enrichment unavailable; using catalog metadata", error);
  }
  return { summary: title.description, language, subtitles: ["English"], translations: ["English", title.language] };
}
