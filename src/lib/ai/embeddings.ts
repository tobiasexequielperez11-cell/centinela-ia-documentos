const GEMINI_EMBED_MODEL = 'text-embedding-004'; // 768 dimensiones (gratis)

/** Genera el vector de embedding de un texto usando Gemini. */
export async function generarEmbedding(texto: string): Promise<number[] | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

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
      console.error('Embedding error:', resp.status, await resp.text());
      return null;
    }

    const data = await resp.json();
    const values = data?.embedding?.values;
    return Array.isArray(values) ? values : null;
  } catch (e) {
    console.error('Embedding fetch error:', e);
    return null;
  }
}

/** Parte un texto largo en fragmentos con solapamiento, para indexar. */
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
