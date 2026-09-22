const optional = (name: string) => process.env[name]?.trim() || undefined;

export const config = {
  tmdbApiKey: optional("TMDB_API_KEY"),
  tmdbReadToken: optional("TMDB_READ_TOKEN"),
  openAiApiKey: optional("OPENAI_API_KEY"),
  databaseUrl: optional("DATABASE_URL"),
  authSecret: optional("AUTH_SECRET"),
  playbackApiUrl: optional("STREAMING_API_URL"),
  playbackApiKey: optional("STREAMING_API_KEY"),
};

export function providerStatus() {
  return {
    catalog: Boolean(config.tmdbApiKey || config.tmdbReadToken),
    ai: Boolean(config.openAiApiKey),
    database: Boolean(config.databaseUrl),
    auth: Boolean(config.authSecret),
    playback: Boolean(config.playbackApiUrl && config.playbackApiKey),
  };
}
