import 'server-only';

export type AnalisisUIF = {
  nivel_riesgo: 'bajo' | 'medio' | 'alto';
  factores_riesgo: string[];
  senales_alerta: string[];
  verificaciones_pendientes: string[];
  requiere_ros: boolean;
  fundamento: string;
};

type DocInput = { nombre: string; tipo: string; resumen: string; alertas: string[]; datos: string[] };

export async function analizarRiesgoUIF(input: {
  titulo: string;
  tipoActo: string;
  comparecientes: string;
  sensibilidad: string;
  resumenGeneral: string;
  documentos: DocInput[];
}): Promise<
  | { ok: false; motivo: 'sin_api_key' | 'sin_datos' | 'error' }
  | { ok: true; analisis: AnalisisUIF; model: string }
> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return { ok: false, motivo: 'sin_api_key' };
  if (input.documentos.length === 0 && !input.resumenGeneral.trim() && !input.comparecientes.trim()) {
    return { ok: false, motivo: 'sin_datos' };
  }

  const modelo = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

  const docsTexto = input.documentos.map((d, i) =>
    `Documento ${i + 1}: ${d.nombre} (${d.tipo})\nResumen: ${d.resumen}\nDatos clave: ${d.datos.join('; ') || '-'}\nAlertas: ${d.alertas.join('; ') || '-'}`
  ).join('\n\n');

  const prompt = [
    'Sos un oficial de cumplimiento especializado en Prevención del Lavado de Activos y Financiación del Terrorismo (PLA/FT) para escribanos públicos en Argentina, como sujetos obligados ante la UIF (Ley 25.246 y resoluciones de la UIF aplicables a notarios). Analizá el riesgo del legajo y su operación.',
    'Evaluá factores de riesgo típicos: tipo y complejidad del acto, montos involucrados y su razonabilidad, uso de dinero en efectivo, medios de pago, personas expuestas políticamente (PEP), estructuras societarias o interpósitas personas, beneficiario final poco claro, jurisdicciones de riesgo, urgencia inusual, e inconsistencias documentales.',
    'Respondé SOLO un objeto JSON válido (sin texto adicional) con esta forma exacta:',
    '{',
    '  "nivel_riesgo": "bajo" | "medio" | "alto",',
    '  "factores_riesgo": ["factores concretos detectados en este legajo"],',
    '  "senales_alerta": ["señales de alerta / red flags relevantes, si las hay"],',
    '  "verificaciones_pendientes": ["controles de debida diligencia que faltan, ej: verificar beneficiario final, constancia de origen de fondos"],',
    '  "requiere_ros": true,',
    '  "fundamento": "explicación breve del nivel de riesgo asignado y del criterio"',
    '}',
    'Reglas CRÍTICAS: NO inventes datos ni montos. Si falta información para evaluar un factor, indicalo en "verificaciones_pendientes". Poné "requiere_ros" en true SOLO si hay señales de alerta serias que ameriten evaluar un Reporte de Operación Sospechosa; ante la duda, dejalo en false y sugerí verificaciones. Este es un apoyo al criterio profesional del escribano, NO lo reemplaza ni constituye asesoramiento legal.',
    '',
    `LEGAJO: ${input.titulo}`,
    `Tipo de acto: ${input.tipoActo || '-'}`,
    `Comparecientes: ${input.comparecientes || '-'}`,
    `Sensibilidad declarada: ${input.sensibilidad || '-'}`,
    '',
    'RESUMEN DEL EXPEDIENTE:',
    input.resumenGeneral || '(sin resumen)',
    '',
    'DOCUMENTOS ANALIZADOS:',
    docsTexto || '(sin documentos analizados)',
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
    if (!resp.ok) { console.error('UIF Gemini error:', resp.status, await resp.text()); return { ok: false, motivo: 'error' }; }
    const data = await resp.json();
    const raw: string = data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? '').join('') ?? '';
    if (!raw.trim()) return { ok: false, motivo: 'error' };
    const parsed = JSON.parse(raw);
    const arr = (v: unknown): string[] => (Array.isArray(v) ? v.map((x) => String(x)) : []);
    const nivel = ['bajo', 'medio', 'alto'].includes(String(parsed.nivel_riesgo))
      ? (String(parsed.nivel_riesgo) as AnalisisUIF['nivel_riesgo'])
      : 'medio';
    return {
      ok: true, model: `uif-${modelo}`,
      analisis: {
        nivel_riesgo: nivel,
        factores_riesgo: arr(parsed.factores_riesgo),
        senales_alerta: arr(parsed.senales_alerta),
        verificaciones_pendientes: arr(parsed.verificaciones_pendientes),
        requiere_ros: Boolean(parsed.requiere_ros),
        fundamento: String(parsed.fundamento ?? ''),
      },
    };
  } catch (e) { console.error('UIF parse error:', e); return { ok: false, motivo: 'error' }; }
}
