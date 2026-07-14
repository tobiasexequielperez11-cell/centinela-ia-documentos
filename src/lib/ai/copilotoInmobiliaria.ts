import 'server-only';

export type BriefingInmobiliaria = {
  panorama: string;
  prioridades: string[];
  alertas: string[];
  oportunidades: string[];
};

type Snapshot = {
  propiedades: { total: number; porEstado: Record<string, number> };
  operaciones: { total: number; porEstado: Record<string, number> };
  clientes: { total: number; porEstado: Record<string, number> };
  alquileres: { total: number; vencidos: string[]; proximos: string[] };
};

export async function generarBriefingInmobiliaria(snap: Snapshot): Promise<
  | { ok: false; motivo: 'sin_api_key' | 'sin_datos' | 'error' }
  | { ok: true; briefing: BriefingInmobiliaria; model: string }
> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return { ok: false, motivo: 'sin_api_key' };

  const totalGeneral =
    snap.propiedades.total + snap.operaciones.total + snap.clientes.total + snap.alquileres.total;
  if (totalGeneral === 0) return { ok: false, motivo: 'sin_datos' };

  const modelo = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const fmt = (m: Record<string, number>) =>
    Object.entries(m).map(([k, v]) => `${k}: ${v}`).join(', ') || '-';

  const prompt = [
    'Sos el copiloto de una inmobiliaria argentina. En base al estado actual del negocio (números reales que te paso abajo), redactá un BRIEFING EJECUTIVO del día: claro, concreto y accionable, en español rioplatense.',
    'Respondé SOLO un objeto JSON válido (sin texto adicional) con esta forma exacta:',
    '{',
    ' "panorama": "2-4 oraciones con la foto general del negocio hoy",',
    ' "prioridades": ["acciones concretas para hoy/esta semana, ordenadas por importancia"],',
    ' "alertas": ["riesgos o cosas que requieren atención (ajustes vencidos, operaciones trabadas)"],',
    ' "oportunidades": ["oportunidades comerciales concretas (propiedades para mover, clientes para contactar)"]',
    '}',
    'Reglas: NO inventes datos, nombres ni números. Basate SOLO en la información aportada. Si algo no surge, devolvé un array vacío.',
    '',
    'ESTADO ACTUAL DE LA INMOBILIARIA:',
    `Propiedades (total ${snap.propiedades.total}) por estado: ${fmt(snap.propiedades.porEstado)}`,
    `Operaciones (total ${snap.operaciones.total}) por estado: ${fmt(snap.operaciones.porEstado)}`,
    `Clientes/interesados (total ${snap.clientes.total}) por estado: ${fmt(snap.clientes.porEstado)}`,
    `Alquileres (total ${snap.alquileres.total}).`,
    `Ajustes de alquiler VENCIDOS: ${snap.alquileres.vencidos.join(' | ') || 'ninguno'}`,
    `Ajustes de alquiler PRÓXIMOS (30 días): ${snap.alquileres.proximos.join(' | ') || 'ninguno'}`,
  ].join('\n');

  try {
    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3, responseMimeType: 'application/json' },
        }),
      }
    );
    if (!resp.ok) {
      console.error('Briefing Gemini error:', resp.status, await resp.text());
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
      model: `briefing-${modelo}`,
      briefing: {
        panorama: String(parsed.panorama ?? ''),
        prioridades: arr(parsed.prioridades),
        alertas: arr(parsed.alertas),
        oportunidades: arr(parsed.oportunidades),
      },
    };
  } catch (e) {
    console.error('Briefing parse error:', e);
    return { ok: false, motivo: 'error' };
  }
}

export async function responderPreguntaInmobiliaria(input: { pregunta: string; contexto: string }): Promise<
  | { ok: false; motivo: 'sin_api_key' | 'error' }
  | { ok: true; respuesta: string; model: string }
> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return { ok: false, motivo: 'sin_api_key' };

  const modelo = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

  const prompt = [
    'Sos el copiloto de una inmobiliaria argentina. Respondé la pregunta del usuario basándote ÚNICAMENTE en los datos del negocio que te paso como CONTEXTO.',
    'Reglas:',
    '- No inventes datos, nombres, precios ni fechas. Si la respuesta no surge del contexto, decilo claramente ("No tengo ese dato cargado").',
    '- Sé concreto y breve. Cuando enumeres propiedades, clientes u operaciones, usá viñetas.',
    '- Respondé en español rioplatense, en texto plano (sin JSON, sin markdown pesado).',
    '- Sos un asistente orientativo: la decisión final es del humano.',
    '',
    'CONTEXTO (estado actual del negocio):',
    input.contexto,
    '',
    `PREGUNTA: ${input.pregunta}`,
  ].join('\n');

  try {
    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3 },
        }),
      }
    );
    if (!resp.ok) {
      console.error('Copiloto QA Gemini error:', resp.status, await resp.text());
      return { ok: false, motivo: 'error' };
    }
    const data = await resp.json();
    const raw: string =
      data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? '').join('') ?? '';
    if (!raw.trim()) return { ok: false, motivo: 'error' };
    return { ok: true, respuesta: raw.trim(), model: `qa-${modelo}` };
  } catch (e) {
    console.error('Copiloto QA error:', e);
    return { ok: false, motivo: 'error' };
  }
}
