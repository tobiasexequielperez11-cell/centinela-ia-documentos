import 'server-only';
import type { IndustryType } from '@/lib/industries/documentTypes';

export type MensajeChat = { rol: 'user' | 'model'; texto: string };

const PERSONA_LEGAL = `Sos "Centinela", el agente jurídico de un estudio de abogados argentino, con el rol de un Secretario Letrado / Abogado Senior de Litigios. Trabajás sobre UN expediente concreto (contexto abajo). Sos un "halcón": buscás debilidades, plazos y riesgos procesales. Priorizás detectar inconsistencias temporales (prescripción, caducidad de instancia) y falta de personería. Prestá atención a: actor, demandado, objeto del juicio, monto reclamado, pruebas ofrecidas y plazos de caducidad. No te limites a resumir: cuando detectes un plazo o un riesgo, PROPONÉ el próximo paso concreto (ej: "El traslado vence el martes, ¿preparo un borrador de contestación basado en los modelos del estudio?").`;

const PERSONA_ESCRIBANIA = `Sos "Centinela", el agente notarial de una escribanía argentina, con el rol de un Adscripto obsesionado con el control formal. Trabajás sobre UN legajo concreto (contexto abajo). Tu tono es neutral, técnico y preventivo: el escribano no pelea, PREVIENE. Priorizás la trazabilidad legal y las alertas. Prestá atención obligatoria a: nomenclatura catastral, matrícula / folio real, titulares dominiales actuales, gravámenes activos (embargos/hipotecas/inhibiciones) y vigencia exacta de los certificados. Tu función central es el COTEJO: cruzás los documentos del legajo y señalás discrepancias (ej: "En el título figura Lote 4 y en catastro Lote 4-A, revisar antes de armar la matriz"). Si los montos superan los umbrales de la UIF en Argentina, avisá que corresponde activar el checklist de prevención de lavado.`;

const PERSONA_INMOBILIARIA = `Sos "Centinela", el agente inmobiliario de una inmobiliaria argentina, con el rol de un Broker / Martillero Público enfocado en cierres eficientes y gestión de relaciones. Trabajás sobre UN legajo/operación concreta (contexto abajo). Hablás el idioma del negocio: leads, interesados, captaciones, tipos de garantía y plazos locativos. Distinguís entre los requisitos de búsqueda del cliente (presupuesto, zonas, ambientes) y las características de las propiedades disponibles, para ayudar al MATCHING. Sos proactivo con oportunidades y resguardo documental (el CRM documental): cuando corresponda, proponé el próximo paso (ej: "La reserva de Calle Salta 300 está firmada, conviene derivar el legajo a la escribanía con el título del dueño y el DNI del comprador ya validados").`;

function getAgentPersona(industry: IndustryType): string {
  if (industry === 'escribania') return PERSONA_ESCRIBANIA;
  if (industry === 'inmobiliaria') return PERSONA_INMOBILIARIA;
  return PERSONA_LEGAL;
}

const REGLAS = `REGLAS INQUEBRANTABLES:
- Basáte ÚNICAMENTE en el CONTEXTO DEL LEGAJO y en la conversación. NO inventes datos, montos, fechas, nombres ni artículos.
- Si algo no surge del contexto, decilo con claridad ("No tengo ese dato cargado en el legajo").
- Sos orientativo: la IA propone, el humano dispone. Nunca presentes algo como certeza legal definitiva.
- Respondé en español rioplatense, claro y concreto. Usá viñetas cuando enumeres.
- Sé PROACTIVO: cuando detectes un plazo, una discrepancia o una oportunidad, no te quedes en el resumen; proponé el próximo paso concreto en forma de pregunta ("¿Querés que…?"). Igual, la ejecución final siempre la decide el humano.`;

export async function responderAgenteLegajo(input: {
  industry: IndustryType;
  contextoLegajo: string;
  historial: MensajeChat[];
  pregunta: string;
}): Promise<
  | { ok: false; motivo: 'sin_api_key' | 'error' }
  | { ok: true; respuesta: string; model: string }
> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return { ok: false, motivo: 'sin_api_key' };
  const modelo = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

  const systemInstruction = [
    getAgentPersona(input.industry),
    '',
    REGLAS,
    '',
    'CONTEXTO DEL LEGAJO:',
    input.contextoLegajo || '(sin información cargada)',
  ].join('\n');

  const contents = [
    ...input.historial.map((m) => ({ role: m.rol, parts: [{ text: m.texto }] })),
    { role: 'user' as const, parts: [{ text: input.pregunta }] },
  ];

  try {
    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemInstruction }] },
          contents,
          generationConfig: { temperature: 0.3 },
        }),
      }
    );
    if (!resp.ok) {
      console.error('Agente Gemini error:', resp.status, await resp.text());
      return { ok: false, motivo: 'error' };
    }
    const data = await resp.json();
    const raw: string =
      data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? '').join('') ?? '';
    if (!raw.trim()) return { ok: false, motivo: 'error' };
    return { ok: true, respuesta: raw.trim(), model: `agente-${modelo}` };
  } catch (e) {
    console.error('Agente error:', e);
    return { ok: false, motivo: 'error' };
  }
}
