import 'server-only';

export type ResumenExpediente = {
  resumen_general: string;
  estado_actual: string;
  partes: string[];
  puntos_clave: string[];
  riesgos_alertas: string[];
  proximas_acciones: string[];
};

type DocInput = { nombre: string; tipo: string; resumen: string; alertas: string[]; datos: string[] };
type EventoInput = { fecha: string; tipo: string; titulo: string; descripcion: string };

export async function generarResumenConIA(input: {
  titulo: string; cliente: string; tipo: string; estado: string;
  documentos: DocInput[]; eventos: EventoInput[];
}): Promise<
  | { ok: false; motivo: 'sin_api_key' | 'sin_datos' | 'error' }
  | { ok: true; resumen: ResumenExpediente; model: string }
> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return { ok: false, motivo: 'sin_api_key' };
  if (input.documentos.length === 0 && input.eventos.length === 0) return { ok: false, motivo: 'sin_datos' };

  const modelo = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

  const docsTexto = input.documentos.map((d, i) =>
    `Documento ${i + 1}: ${d.nombre} (${d.tipo})\nResumen: ${d.resumen}\nDatos clave: ${d.datos.join('; ') || '-'}\nAlertas: ${d.alertas.join('; ') || '-'}`
  ).join('\n\n');

  const eventosTexto = input.eventos.map((e) =>
    `- ${e.fecha} [${e.tipo}] ${e.titulo}${e.descripcion ? ': ' + e.descripcion : ''}`
  ).join('\n');

  const prompt = [
    'Sos un abogado senior argentino. En base a los documentos ya analizados y las actuaciones de un expediente, redactá un RESUMEN EJECUTIVO del caso completo, claro y profesional, para entender el estado del asunto de un vistazo.',
    'Respondé SOLO un objeto JSON válido (sin texto adicional) con esta forma exacta:',
    '{',
    '  "resumen_general": "2-4 oraciones sobre de qué se trata el expediente y su situación",',
    '  "estado_actual": "una oración sobre en qué etapa procesal está",',
    '  "partes": ["cada parte y su rol"],',
    '  "puntos_clave": ["hechos, montos, fechas y datos determinantes"],',
    '  "riesgos_alertas": ["riesgos, plazos críticos o inconsistencias a vigilar"],',
    '  "proximas_acciones": ["acciones concretas sugeridas para el abogado"]',
    '}',
    'Reglas: NO inventes datos, montos, fechas ni artículos. Si algo no surge de la información, devolvé un array vacío. Basate SOLO en lo aportado.',
    '',
    `EXPEDIENTE: ${input.titulo}`,
    `Cliente: ${input.cliente || '-'} | Tipo: ${input.tipo || '-'} | Estado: ${input.estado || '-'}`,
    '',
    'DOCUMENTOS ANALIZADOS:',
    docsTexto || '(sin documentos analizados)',
    '',
    'ACTUACIONES / LÍNEA DE TIEMPO:',
    eventosTexto || '(sin actuaciones registradas)',
  ].join('\n');

  try {
    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.2, responseMimeType: 'application/json' },
        }),
      }
    );
    if (!resp.ok) { console.error('Copiloto Gemini error:', resp.status, await resp.text()); return { ok: false, motivo: 'error' }; }
    const data = await resp.json();
    const raw: string = data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? '').join('') ?? '';
    if (!raw.trim()) return { ok: false, motivo: 'error' };
    const parsed = JSON.parse(raw);
    const arr = (v: unknown): string[] => (Array.isArray(v) ? v.map((x) => String(x)) : []);
    return {
      ok: true, model: `copiloto-${modelo}`,
      resumen: {
        resumen_general: String(parsed.resumen_general ?? ''),
        estado_actual: String(parsed.estado_actual ?? ''),
        partes: arr(parsed.partes),
        puntos_clave: arr(parsed.puntos_clave),
        riesgos_alertas: arr(parsed.riesgos_alertas),
        proximas_acciones: arr(parsed.proximas_acciones),
      },
    };
  } catch (e) { console.error('Copiloto parse error:', e); return { ok: false, motivo: 'error' }; }
}
