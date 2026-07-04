'use server';

import { getUserProfile } from '@/lib/auth/getUserProfile';

export type RedactarResult =
  | { ok: true; texto: string }
  | { ok: false; motivo: 'sin_key' | 'sin_permiso' | 'error' };

export async function redactarEscritoIA(input: {
  titulo: string;
  cuerpo: string;
  valores: Record<string, string>;
  instruccion: string;
}): Promise<RedactarResult> {
  const { user, profile } = await getUserProfile();
  if (!user || !profile) return { ok: false, motivo: 'sin_permiso' };

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return { ok: false, motivo: 'sin_key' };

  const modelo = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

  const datos = Object.entries(input.valores)
    .filter(([, v]) => v && v.trim())
    .map(([k, v]) => `- ${k}: ${v}`)
    .join('\n');

  const prompt = [
    'Sos un asistente jurídico argentino experto. Redactá un escrito formal, claro y bien estructurado, en español rioplatense con estilo forense.',
    'Tomá como base la siguiente plantilla: respetá su estructura y reemplazá las variables entre llaves dobles con los datos provistos.',
    '',
    `TÍTULO DEL MODELO: ${input.titulo}`,
    '',
    'PLANTILLA:',
    input.cuerpo,
    '',
    'DATOS DISPONIBLES DEL EXPEDIENTE:',
    datos || '(sin datos precargados)',
    '',
    'INSTRUCCIÓN DEL ABOGADO:',
    input.instruccion || '(sin instrucción adicional)',
    '',
    'REGLAS ESTRICTAS:',
    '- Completá los campos con los datos disponibles.',
    '- Donde falte información, dejá un marcador entre corchetes, ej: [COMPLETAR: domicilio].',
    '- NO inventes datos personales, montos, fechas ni artículos legales que no te hayan dado.',
    '- Devolvé SOLO el texto del escrito, sin explicaciones ni comentarios previos.',
  ].join('\n');

  try {
    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.4, maxOutputTokens: 2048 },
        }),
      }
    );

    if (!resp.ok) {
      console.error('Gemini error:', resp.status, await resp.text());
      return { ok: false, motivo: 'error' };
    }

    const data = await resp.json();
    const texto: string =
      data?.candidates?.[0]?.content?.parts
        ?.map((p: { text?: string }) => p.text ?? '')
        .join('') ?? '';

    if (!texto.trim()) return { ok: false, motivo: 'error' };
    return { ok: true, texto: texto.trim() };
  } catch (e) {
    console.error('Gemini fetch error:', e);
    return { ok: false, motivo: 'error' };
  }
}
