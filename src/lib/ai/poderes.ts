import 'server-only';

export type AnalisisPoder = {
  tipo_instrumento: string;
  otorgante: string;
  apoderado_representante: string[];
  facultades: string[];
  limites_exclusiones: string[];
  vigencia: string;
  representacion: string;
  alertas: string[];
  apto_para: string[];
};

export async function analizarPoderConIA(
  base64Data: string,
  mimeType: string
): Promise<
  | { ok: false; motivo: 'sin_api_key' | 'error' }
  | { ok: true; analisis: AnalisisPoder; model: string }
> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return { ok: false, motivo: 'sin_api_key' };
  const modelo = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

  const prompt = [
    'Sos un escribano argentino experto en derecho notarial y societario. Analizá el PODER o ESTATUTO/CONTRATO SOCIAL adjunto y determiná, con criterio notarial, quién puede hacer qué y hasta cuándo, para evaluar si el instrumento habilita el acto a otorgar.',
    'Prestá atención a: tipo de instrumento (poder general / poder especial / estatuto o contrato social), otorgante(s), apoderado(s) o representante(s) designado(s), facultades otorgadas, límites o actos excluidos, vigencia (plazo, condición, revocación) y régimen de representación (quién obliga a la persona o sociedad y en qué actos).',
    'Respondé SOLO un objeto JSON válido (sin texto adicional) con esta forma exacta:',
    '{',
    '  "tipo_instrumento": "poder general | poder especial | estatuto/contrato social | otro",',
    '  "otorgante": "quién otorga el poder o denominación de la sociedad",',
    '  "apoderado_representante": ["apoderados o representantes designados, con su rol"],',
    '  "facultades": ["facultades o atribuciones concretas otorgadas"],',
    '  "limites_exclusiones": ["límites, condiciones o actos expresamente excluidos"],',
    '  "vigencia": "plazo o condición de vigencia; indicar si es por tiempo indeterminado y régimen de revocación",',
    '  "representacion": "quién puede obligar/representar y en qué actos (clave en estatutos)",',
    '  "alertas": ["facultades faltantes para actos de disposición, vencimientos, riesgos de representación o insuficiencia del instrumento"],',
    '  "apto_para": ["actos para los que el instrumento resultaría suficiente"]',
    '}',
    'Reglas: NO inventes datos. Si algo no surge del documento, devolvé un string vacío o un array vacío según corresponda. Respondé en español rioplatense.',
  ].join('\n');

  try {
    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                { inline_data: { mime_type: mimeType, data: base64Data } },
              ],
            },
          ],
          generationConfig: { temperature: 0.2, responseMimeType: 'application/json' },
        }),
      }
    );
    if (!resp.ok) {
      console.error('Análisis poder Gemini error:', resp.status, await resp.text());
      return { ok: false, motivo: 'error' };
    }
    const data = await resp.json();
    const raw: string =
      data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? '').join('') ?? '';
    if (!raw.trim()) return { ok: false, motivo: 'error' };
    const parsed = JSON.parse(raw);
    const arr = (v: unknown): string[] => (Array.isArray(v) ? v.map((x) => String(x)) : []);
    return {
      ok: true,
      model: `analisis-poder-${modelo}`,
      analisis: {
        tipo_instrumento: String(parsed.tipo_instrumento ?? ''),
        otorgante: String(parsed.otorgante ?? ''),
        apoderado_representante: arr(parsed.apoderado_representante),
        facultades: arr(parsed.facultades),
        limites_exclusiones: arr(parsed.limites_exclusiones),
        vigencia: String(parsed.vigencia ?? ''),
        representacion: String(parsed.representacion ?? ''),
        alertas: arr(parsed.alertas),
        apto_para: arr(parsed.apto_para),
      },
    };
  } catch (e) {
    console.error('Análisis poder parse error:', e);
    return { ok: false, motivo: 'error' };
  }
}
