import 'server-only';
import type { IndustryType } from '@/lib/industries/documentTypes';

export type MensajeChat = { rol: 'user' | 'model'; texto: string };

// Acción que el agente puede proponer para que el humano apruebe.
export type AccionPropuesta = {
  tipo: 'agendar_plazo';
  titulo: string;
  fecha: string; // YYYY-MM-DD
  motivo: string;
};

const PERSONA_LEGAL = `Sos "Centinela", el agente jurídico de un estudio de abogados argentino, con el rol de un Secretario Letrado / Abogado Senior de Litigios. Trabajás sobre UN expediente concreto (contexto abajo). Sos un "halcón": buscás debilidades, plazos y riesgos procesales. Priorizás detectar inconsistencias temporales (prescripción, caducidad de instancia) y falta de personería. Prestá atención a: actor, demandado, objeto del juicio, monto reclamado, pruebas ofrecidas y plazos de caducidad. No te limites a resumir: cuando detectes un plazo o un riesgo, PROPONÉ el próximo paso concreto.`;

const PERSONA_ESCRIBANIA = `Sos "Centinela", el agente notarial de una escribanía argentina, con el rol de un Adscripto obsesionado con el control formal. Trabajás sobre UN legajo concreto (contexto abajo). Tu tono es neutral, técnico y preventivo: el escribano no pelea, PREVIENE. Priorizás la trazabilidad legal y las alertas. Prestá atención obligatoria a: nomenclatura catastral, matrícula / folio real, titulares dominiales actuales, gravámenes activos (embargos/hipotecas/inhibiciones) y vigencia exacta de los certificados. Tu función central es el COTEJO: cruzás los documentos del legajo y señalás discrepancias. Si los montos superan los umbrales de la UIF en Argentina, avisá que corresponde activar el checklist de prevención de lavado.`;

const PERSONA_INMOBILIARIA = `Sos "Centinela", el agente inmobiliario de una inmobiliaria argentina, con el rol de un Broker / Martillero Público enfocado en cierres eficientes y gestión de relaciones. Trabajás sobre UN legajo/operación concreta (contexto abajo). Hablás el idioma del negocio: leads, interesados, captaciones, tipos de garantía y plazos locativos. Distinguís entre los requisitos de búsqueda del cliente y las características de las propiedades disponibles, para ayudar al MATCHING. Sos proactivo con oportunidades y resguardo documental: cuando corresponda, proponé el próximo paso.`;

function getAgentPersona(industry: IndustryType): string {
  if (industry === 'escribania') return PERSONA_ESCRIBANIA;
  if (industry === 'inmobiliaria') return PERSONA_INMOBILIARIA;
  return PERSONA_LEGAL;
}

const REGLAS = `REGLAS INQUEBRANTABLES:
- Basáte ÚNICAMENTE en el CONTEXTO DEL LEGAJO y en la conversación. NO inventes datos, montos, fechas, nombres ni artículos.
- Si algo no surge del contexto, decilo con claridad ("No tengo ese dato cargado en el legajo").
- Sos orientativo: la IA propone, el humano dispone. Nunca presentes algo como certeza legal definitiva.
- Respondé en español rioplatense, con tono profesional, claro y CONCISO. Apuntá a 6-12 líneas salvo que te pidan más detalle.
- FORMATO del campo "respuesta": párrafos breves. Para enumerar, usá viñetas simples con "- " (una sola línea cada una, SIN anidar sublistas). Resaltá términos clave con **negrita** con moderación. No uses tablas ni encabezados markdown.
- Sé PROACTIVO: cuando detectes un plazo, una discrepancia o una oportunidad, proponé el próximo paso.`;

function reglasAcciones(hoy: string): string {
  return `ACCIONES QUE PODÉS PROPONER (campo "acciones"):
- FECHA DE HOY: ${hoy}. Usala para evaluar vencimientos.
- Podés proponer AGENDAR PLAZOS concretos en la agenda del estudio.
- Incluí una acción SOLO cuando en el CONTEXTO DEL LEGAJO haya una fecha concreta y relevante (vencimiento, audiencia, turno, firma, vigencia de un certificado, plazo procesal con fecha).
- Cada acción: tipo "agendar_plazo", titulo breve y claro (ej: "Vence certificado de dominio"), fecha en formato YYYY-MM-DD, motivo (una línea explicando de dónde surge).
- NO inventes fechas. Si no hay fechas concretas en el contexto, devolvé "acciones" como lista vacía.
- En el texto podés mencionar y recomendar; la carga real la confirma el usuario con un botón.`;
}

function limpiarJson(raw: string): string {
  let s = raw.trim();
  if (s.startsWith('\`\`\`')) {
    s = s.replace(/^\`\`\`(?:json)?/i, '').replace(/\`\`\`$/, '').trim();
  }
  return s;
}

function validarAcciones(input: unknown): AccionPropuesta[] {
  if (!Array.isArray(input)) return [];
  const out: AccionPropuesta[] = [];
  for (const a of input) {
    if (!a || typeof a !== 'object') continue;
    const o = a as Record<string, unknown>;
    const titulo = typeof o.titulo === 'string' ? o.titulo.trim() : '';
    const fecha = typeof o.fecha === 'string' ? o.fecha.trim() : '';
    const motivo = typeof o.motivo === 'string' ? o.motivo.trim() : '';
    if (o.tipo === 'agendar_plazo' && titulo && /^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
      out.push({ tipo: 'agendar_plazo', titulo, fecha, motivo });
    }
  }
  return out;
}

export async function responderAgenteLegajo(input: {
  industry: IndustryType;
  contextoLegajo: string;
  historial: MensajeChat[];
  pregunta: string;
}): Promise<
  | { ok: false; motivo: 'sin_api_key' | 'error' }
  | { ok: true; respuesta: string; acciones: AccionPropuesta[]; model: string }
> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return { ok: false, motivo: 'sin_api_key' };
  const modelo = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const hoy = new Date().toISOString().slice(0, 10);

  const systemInstruction = [
    getAgentPersona(input.industry),
    '',
    REGLAS,
    '',
    reglasAcciones(hoy),
    '',
    'CONTEXTO DEL LEGAJO:',
    input.contextoLegajo || '(sin información cargada)',
  ].join('\n');

  const contents = [
    ...input.historial.map((m) => ({ role: m.rol, parts: [{ text: m.texto }] })),
    { role: 'user' as const, parts: [{ text: input.pregunta }] },
  ];

  const body = JSON.stringify({
    systemInstruction: { parts: [{ text: systemInstruction }] },
    contents,
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 1400,
      responseMimeType: 'application/json',
      responseSchema: {
        type: 'OBJECT',
        properties: {
          respuesta: { type: 'STRING' },
          acciones: {
            type: 'ARRAY',
            items: {
              type: 'OBJECT',
              properties: {
                tipo: { type: 'STRING' },
                titulo: { type: 'STRING' },
                fecha: { type: 'STRING' },
                motivo: { type: 'STRING' },
              },
              required: ['tipo', 'titulo', 'fecha', 'motivo'],
            },
          },
        },
        required: ['respuesta'],
      },
    },
  });

  // Reintenta ante errores transitorios de Gemini (sobrecarga 429 / 5xx).
  for (let intento = 0; intento < 3; intento++) {
    try {
      const resp = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body,
        }
      );

      if (resp.ok) {
        const data = await resp.json();
        const raw: string =
          data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? '').join('') ?? '';
        if (raw.trim()) {
          try {
            const parsed = JSON.parse(limpiarJson(raw));
            const respuesta =
              typeof parsed?.respuesta === 'string' && parsed.respuesta.trim()
                ? parsed.respuesta.trim()
                : raw.trim();
            return {
              ok: true,
              respuesta,
              acciones: validarAcciones(parsed?.acciones),
              model: `agente-${modelo}`,
            };
          } catch {
            // Si no vino JSON válido, devolvemos el texto crudo sin acciones.
            return { ok: true, respuesta: raw.trim(), acciones: [], model: `agente-${modelo}` };
          }
        }
      } else if (resp.status === 429 || resp.status >= 500) {
        console.error('Agente Gemini transitorio:', resp.status);
      } else {
        console.error('Agente Gemini error:', resp.status, await resp.text());
        return { ok: false, motivo: 'error' };
      }
    } catch (e) {
      console.error('Agente error de red:', e);
    }
    await new Promise((r) => setTimeout(r, 800 * (intento + 1)));
  }

  return { ok: false, motivo: 'error' };
}
