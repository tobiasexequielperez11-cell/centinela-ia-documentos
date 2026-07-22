import 'server-only';

export type AvisoComercial = {
  titulo: string;
  aviso: string;
  destacados: string[];
  hashtags: string[];
  datos_faltantes: string[];
};

type DocInput = { nombre: string; tipo: string; resumen: string; alertas: string[]; datos: string[] };

export async function redactarAvisoConIA(input: {
  titulo: string;
  tipoOperacion: string;
  direccion: string;
  valorOperacion: string;
  propiedad: { nombre: string; direccion: string; tipo: string; estado: string } | null;
  resumenGeneral: string;
  documentos: DocInput[];
}): Promise<
  | { ok: false; motivo: 'sin_api_key' | 'sin_datos' | 'error' }
  | { ok: true; aviso: AvisoComercial; model: string }
> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return { ok: false, motivo: 'sin_api_key' };
  const hayDatos =
    input.documentos.length > 0 ||
    !!input.resumenGeneral.trim() ||
    !!input.propiedad ||
    !!input.direccion.trim();
  if (!hayDatos) return { ok: false, motivo: 'sin_datos' };

  const modelo = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

  const docsTexto = input.documentos.map((d, i) =>
    `Documento ${i + 1}: ${d.nombre} (${d.tipo})\nResumen: ${d.resumen}\nDatos clave: ${d.datos.join('; ') || '-'}\nAlertas: ${d.alertas.join('; ') || '-'}`
  ).join('\n\n');

  const propTexto = input.propiedad
    ? `Nombre: ${input.propiedad.nombre || '-'} | Dirección: ${input.propiedad.direccion || '-'} | Tipo: ${input.propiedad.tipo || '-'} | Estado: ${input.propiedad.estado || '-'}`
    : '(sin propiedad vinculada)';

  const prompt = [
    'Sos un martillero y corredor inmobiliario argentino, experto en marketing de propiedades. En base a los datos de la operación, la propiedad y los documentos ya analizados, redactá un AVISO / FICHA COMERCIAL atractivo y profesional para publicar en portales inmobiliarios y redes sociales, en español rioplatense.',
    'El aviso debe ser vendedor pero honesto: destacá ubicación, tipo de propiedad, ambientes, superficie, estado y comodidades SOLO si surgen de los datos. Tono cálido y claro. No uses mayúsculas sostenidas ni signos de exclamación excesivos.',
    'Respondé SOLO un objeto JSON válido (sin texto adicional) con esta forma exacta:',
    '{',
    '  "titulo": "título corto y atractivo del aviso, ej: Departamento 3 ambientes a estrenar en Palermo",',
    '  "aviso": "el texto completo del aviso listo para publicar, con saltos de línea",',
    '  "destacados": ["viñetas cortas con las características destacadas (ambientes, m2, amenities, etc.)"],',
    '  "hashtags": ["hashtags para redes, sin el símbolo numeral"],',
    '  "datos_faltantes": ["datos que convendría sumar para mejorar el aviso (fotos, expensas, m2, etc.)"]',
    '}',
    'Reglas CRÍTICAS: NO inventes superficies, precios, ambientes, orientación ni amenities. Si un dato no surge de la información aportada, NO lo pongas en el aviso y sumalo a "datos_faltantes". Basate SOLO en la información aportada.',
    '',
    `OPERACIÓN: ${input.titulo}`,
    `Tipo de operación: ${input.tipoOperacion || '-'}`,
    `Dirección del inmueble (dato del legajo): ${input.direccion || '-'}`,
    `Valor de la operación (dato del legajo): ${input.valorOperacion || '-'}`,
    '',
    'PROPIEDAD VINCULADA:',
    propTexto,
    '',
    'RESUMEN DE LA OPERACIÓN:',
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
          generationConfig: { temperature: 0.4, responseMimeType: 'application/json' },
        }),
      }
    );
    if (!resp.ok) { console.error('Aviso Gemini error:', resp.status, await resp.text()); return { ok: false, motivo: 'error' }; }
    const data = await resp.json();
    const raw: string = data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? '').join('') ?? '';
    if (!raw.trim()) return { ok: false, motivo: 'error' };
    const parsed = JSON.parse(raw);
    const arr = (v: unknown): string[] => (Array.isArray(v) ? v.map((x) => String(x)) : []);
    return {
      ok: true, model: `aviso-${modelo}`,
      aviso: {
        titulo: String(parsed.titulo ?? 'Aviso comercial'),
        aviso: String(parsed.aviso ?? ''),
        destacados: arr(parsed.destacados),
        hashtags: arr(parsed.hashtags),
        datos_faltantes: arr(parsed.datos_faltantes),
      },
    };
  } catch (e) { console.error('Aviso parse error:', e); return { ok: false, motivo: 'error' }; }
}
