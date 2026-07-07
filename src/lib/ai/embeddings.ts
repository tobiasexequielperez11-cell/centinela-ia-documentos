const GEMINI_EMBED_MODEL = 'text-embedding-004'; // 768 dimensiones

export type EmbeddingResult = { values: number[] } | { error: string };

export async function generarEmbedding(texto: string): Promise<EmbeddingResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return { error: 'sin-api-key' };

  const url =
    'https://generativelanguage.googleapis.com/v1beta/models/' +
    GEMINI_EMBED_MODEL +
    ':embedContent?key=' +
    apiKey;

  try {
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'models/' + GEMINI_EMBED_MODEL,
        content: { parts: [{ text: texto }] },
      }),
    });

    if (!resp.ok) {
      const detalle = await resp.text();
      return { error: 'http' + resp.status + ':' + detalle.slice(0, 160) };
    }

    const data = await resp.json();
    const values = data?.embedding?.values;
    if (!Array.isArray(values)) return { error: 'sin-values' };
    return { values };
  } catch (e) {
    return { error: 'fetch:' + String(e).slice(0, 160) };
  }
}

export function partirEnFragmentos(texto: string, maxLen = 1200, overlap = 150): string[] {
  const limpio = texto.replace(/\s+/g, ' ').trim();
  if (!limpio) return [];

  const chunks: string[] = [];
  let i = 0;
  while (i < limpio.length) {
    const fin = Math.min(i + maxLen, limpio.length);
    chunks.push(limpio.slice(i, fin));
    if (fin >= limpio.length) break;
    i = fin - overlap;
  }
  return chunks;
}
