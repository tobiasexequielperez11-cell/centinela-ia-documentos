import 'server-only';
import type { IndustryType } from '@/lib/industries/documentTypes';
import { getCaseStatuses } from '@/lib/industries/caseConfig';

export type MensajeChat = { rol: 'user' | 'model'; texto: string };

// Acciones que el agente puede proponer para que el humano apruebe.
export type AccionPropuesta = {
  tipo:
    | 'agendar_plazo'
    | 'crear_actuacion'
    | 'agregar_checklist'
    | 'generar_resumen'
    | 'generar_cotejo'
    | 'redactar_borrador'
    | 'analizar_uif'
    | 'cambiar_estado'
    | 'vincular_documento';
  titulo: string;
  fecha?: string; // YYYY-MM-DD (solo agendar_plazo y crear_actuacion)
  estado?: string; // valor de estado destino (solo cambiar_estado)
  itemChecklist?: string; // título exacto del ítem (solo vincular_documento)
  documento?: string; // nombre exacto del archivo (solo vincular_documento)
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

function reglasAcciones(hoy: string, estadosValidos: string): string {
  return `ACCIONES QUE PODÉS PROPONER (campo "acciones"):
- FECHA DE HOY: ${hoy}. Usala para evaluar vencimientos.
- Proponé una acción SOLO cuando surja con claridad del CONTEXTO DEL LEGAJO. Si no corresponde ninguna, devolvé "acciones" como lista vacía.
- Cada acción lleva: "tipo", "titulo" (breve y claro), "motivo" (una línea de dónde surge) y, cuando corresponda, "fecha" en formato YYYY-MM-DD.
- Podés proponer MÁS DE UNA acción a la vez.
- Tipos disponibles:
  1) "agendar_plazo": agendar un vencimiento o fecha límite en la agenda. REQUIERE "fecha". Ej: "Vence certificado de dominio".
  2) "crear_actuacion": registrar un hito en la CRONOLOGÍA del legajo (audiencia, presentación, notificación, firma). REQUIERE "fecha". Ej: "Audiencia de vista de causa".
  3) "agregar_checklist": sumar un pendiente al checklist cuando detectes algo que FALTA o hay que conseguir/controlar. SIN "fecha". Ej: "Solicitar certificado de inhibición".
  4) "generar_resumen": regenerar el resumen integral del expediente con IA cuando convenga actualizarlo. SIN "fecha". Ej: "Actualizar el resumen del legajo".
  5) "generar_cotejo": cruzar (cotejar) los documentos del legajo con IA para detectar discrepancias, faltantes o vigencias vencidas. SIN "fecha". Proponéla cuando haya varios documentos que convenga confrontar. Ej: "Cotejar los documentos del legajo".
  6) "redactar_borrador": generar con IA un borrador de la escritura o acto notarial a partir de la información del legajo. SIN "fecha". Proponéla solo cuando el legajo tenga datos suficientes. Ej: "Redactar borrador de escritura".
  7) "analizar_uif": correr el análisis de riesgo UIF (prevención de lavado) con IA cuando los montos o el tipo de operación lo ameriten. SIN "fecha". Ej: "Analizar riesgo UIF de la operación".
  8) "cambiar_estado": mover el legajo a otra etapa del flujo de trabajo cuando el avance lo justifique. SIN "fecha", pero REQUIERE el campo "estado" con EXACTAMENTE uno de estos valores válidos: ${estadosValidos}. Usá "titulo" para describir el cambio (ej: "Pasar a En preparación"). Proponéla solo si el contexto muestra que el legajo avanzó de etapa.
  9) "vincular_documento": vincular un documento YA cargado en el legajo con un ítem PENDIENTE del checklist que ese documento satisface. SIN "fecha". REQUIERE dos campos: "itemChecklist" (el título EXACTO del ítem, copiado del CONTEXTO) y "documento" (el nombre EXACTO del archivo, copiado del CONTEXTO). Proponéla SOLO cuando en el contexto haya un ítem marcado "PENDIENTE (sin documento)" y un documento del legajo que claramente lo cumpla. Usá "titulo" para describir el vínculo (ej: "Vincular 'DNI del comprador' con dni_comprador.pdf"). NO inventes títulos ni nombres: deben coincidir textualmente con el contexto.
- NO inventes fechas, nombres, estados ni datos. La ejecución real la confirma el usuario con un botón.`;
}

function limpiarJson(raw: string): string {
  let s = raw.trim();
  if (s.startsWith('\`\`\`')) {
    s = s.replace(/^\`\`\`(?:json)?/i, '').replace(/\`\`\`$/, '').trim();
  }
  return s;
}

function validarAcciones(input: unknown, estadosValidos: string[] = []): AccionPropuesta[] {
  if (!Array.isArray(input)) return [];
  const TIPOS = ['agendar_plazo', 'crear_actuacion', 'agregar_checklist', 'generar_resumen', 'generar_cotejo', 'redactar_borrador', 'analizar_uif', 'cambiar_estado', 'vincular_documento'];
  const CON_FECHA = ['agendar_plazo', 'crear_actuacion'];
  const out: AccionPropuesta[] = [];
  for (const a of input) {
    if (!a || typeof a !== 'object') continue;
    const o = a as Record<string, unknown>;
    const tipo = typeof o.tipo === 'string' ? o.tipo.trim() : '';
    const titulo = typeof o.titulo === 'string' ? o.titulo.trim() : '';
    const fecha = typeof o.fecha === 'string' ? o.fecha.trim() : '';
    const estado = typeof o.estado === 'string' ? o.estado.trim() : '';
    const itemChecklist = typeof o.itemChecklist === 'string' ? o.itemChecklist.trim() : '';
    const documento = typeof o.documento === 'string' ? o.documento.trim() : '';
    const motivo = typeof o.motivo === 'string' ? o.motivo.trim() : '';
    if (!TIPOS.includes(tipo) || !titulo) continue;
    if (tipo === 'cambiar_estado') {
      if (!estado || (estadosValidos.length && !estadosValidos.includes(estado))) continue;
      out.push({ tipo: 'cambiar_estado', titulo, estado, motivo });
    } else if (tipo === 'vincular_documento') {
      if (!itemChecklist || !documento) continue;
      out.push({ tipo: 'vincular_documento', titulo, itemChecklist, documento, motivo });
    } else if (CON_FECHA.includes(tipo)) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) continue;
      out.push({ tipo: tipo as AccionPropuesta['tipo'], titulo, fecha, motivo });
    } else {
      out.push({ tipo: tipo as AccionPropuesta['tipo'], titulo, motivo });
    }
  }
  return out;
}

// Rescata el texto de "respuesta" aunque el JSON venga cortado o mal formado,
// para que el usuario nunca vea llaves ni comillas crudas.
function salvarRespuesta(raw: string): string {
  const m = raw.match(/"respuesta"\s*:\s*"((?:\\.|[^"\\])*)/);
  if (m && m[1]) {
    let s = m[1];
    if (s.endsWith('\\')) s = s.slice(0, -1); // quita backslash colgante del corte
    try {
      return JSON.parse('"' + s + '"').trim();
    } catch {
      return s
        .replace(/\\n/g, '\n')
        .replace(/\\"/g, '"')
        .replace(/\\t/g, ' ')
        .replace(/\\\\/g, '\\')
        .trim();
    }
  }
  // Último recurso: limpiar llaves y campos crudos.
  return raw
    .replace(/\bacciones\b\s*:[\s\S]*$/, '')
    .replace(/[{}"]/g, '')
    .replace(/\brespuesta\b\s*:/, '')
    .replace(/\\n/g, '\n')
    .trim();
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
  const estados = getCaseStatuses(input.industry);
  const estadosTexto = estados.map((e) => `"${e.value}" (${e.label})`).join(', ');
  const estadosValores = estados.map((e) => e.value);

  const systemInstruction = [
    getAgentPersona(input.industry),
    '',
    REGLAS,
    '',
    reglasAcciones(hoy, estadosTexto),
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
      maxOutputTokens: 2048,
      thinkingConfig: { thinkingBudget: 0 },
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
                estado: { type: 'STRING' },
                itemChecklist: { type: 'STRING' },
                documento: { type: 'STRING' },
                motivo: { type: 'STRING' },
              },
              required: ['tipo', 'titulo', 'motivo'],
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
                : salvarRespuesta(raw);
            return {
              ok: true,
              respuesta,
              acciones: validarAcciones(parsed?.acciones, estadosValores),
              model: `agente-${modelo}`,
            };
          } catch {
            // JSON cortado o inválido: rescatamos el texto limpio, sin acciones.
            return { ok: true, respuesta: salvarRespuesta(raw), acciones: [], model: `agente-${modelo}` };
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
