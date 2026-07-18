'use server';

import { createClient } from '@/lib/supabase/server';
import { getUserProfile } from '@/lib/auth/getUserProfile';
import { normalizeIndustryType } from '@/lib/industries/documentTypes';
import { canUseAi, canUpdateCase, isUserRole } from '@/lib/permissions/roles';
import { revalidatePath } from 'next/cache';
import { guardarPlazoDetectado } from '@/app/agenda/actions';
import { generarResumenExpediente } from '@/app/expedientes/actions';
import { responderAgenteLegajo, type MensajeChat, type AccionPropuesta } from '@/lib/ai/agente';

export async function preguntarAgente(input: {
  caseId: string;
  historial: MensajeChat[];
  pregunta: string;
}): Promise<
  { ok: false; motivo: string } | { ok: true; respuesta: string; acciones: AccionPropuesta[] }
> {
  const pregunta = (input.pregunta ?? '').trim();
  if (!pregunta) return { ok: false, motivo: 'Escribí una pregunta.' };

  const { user, profile } = await getUserProfile();
  if (!user || !profile) return { ok: false, motivo: 'Sesión no válida.' };
  if (!canUseAi(profile.role)) return { ok: false, motivo: 'No tenés permiso para usar la IA.' };

  const supabase = await createClient();

  const { data: caseData } = await supabase
    .from('cases')
    .select('*')
    .eq('id', input.caseId)
    .eq('organization_id', profile.organization_id)
    .single();
  if (!caseData) return { ok: false, motivo: 'Legajo no encontrado.' };

  const { data: organization } = await supabase
    .from('organizations')
    .select('industry_type')
    .eq('id', profile.organization_id)
    .maybeSingle();
  const industry = normalizeIndustryType(organization?.industry_type);

  const { data: docsData } = await supabase
    .from('documents')
    .select('id, file_name, document_type, expires_at')
    .eq('case_id', input.caseId)
    .eq('organization_id', profile.organization_id)
    .order('created_at', { ascending: false });
  const documentos = docsData ?? [];
  const nombrePorDoc = new Map<string, string>();
  const vencimientoPorDoc = new Map<string, string | null>();
  for (const d of documentos) {
    nombrePorDoc.set(d.id, d.file_name);
    vencimientoPorDoc.set(d.id, (d as any).expires_at ?? null);
  }

  const { data: analisisData } = await supabase
    .from('ai_outputs')
    .select('document_id, result_json, created_at')
    .eq('case_id', input.caseId)
    .eq('organization_id', profile.organization_id)
    .eq('output_type', 'document_analysis')
    .order('created_at', { ascending: false });

  const { data: resumenData } = await supabase
    .from('ai_outputs')
    .select('result_json')
    .eq('case_id', input.caseId)
    .eq('organization_id', profile.organization_id)
    .eq('output_type', 'case_summary')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: cotejoData } = await supabase
    .from('ai_outputs')
    .select('result_json')
    .eq('case_id', input.caseId)
    .eq('organization_id', profile.organization_id)
    .eq('output_type', 'case_cotejo')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  // Cronología: actuaciones y plazos cargados a mano o detectados por la IA
  // (misma fuente que alimenta el Radar de plazos).
  const { data: eventosData } = await supabase
    .from('case_events')
    .select('event_date, event_type, title, description')
    .eq('case_id', input.caseId)
    .eq('organization_id', profile.organization_id)
    .order('event_date', { ascending: true });

  const partes: string[] = [];
  partes.push(`LEGAJO: ${caseData.title ?? 'Sin título'}`);
  partes.push(
    `Cliente: ${caseData.client_name ?? '-'} | Tipo: ${caseData.case_type ?? '-'} | Estado: ${caseData.status ?? '-'}`
  );

  const resumenJson = (resumenData?.result_json ?? null) as any;
  if (resumenJson) {
    partes.push('\nRESUMEN DEL EXPEDIENTE:');
    if (resumenJson.resumen_general) partes.push(String(resumenJson.resumen_general));
    if (resumenJson.estado_actual) partes.push(`Estado procesal: ${resumenJson.estado_actual}`);
    if (Array.isArray(resumenJson.puntos_clave) && resumenJson.puntos_clave.length)
      partes.push(`Puntos clave: ${resumenJson.puntos_clave.join('; ')}`);
    if (Array.isArray(resumenJson.riesgos_alertas) && resumenJson.riesgos_alertas.length)
      partes.push(`Riesgos/alertas: ${resumenJson.riesgos_alertas.join('; ')}`);
    if (Array.isArray(resumenJson.proximas_acciones) && resumenJson.proximas_acciones.length)
      partes.push(`Próximas acciones sugeridas: ${resumenJson.proximas_acciones.join('; ')}`);
  }

  const cotejoJson = (cotejoData?.result_json ?? null) as any;
  if (cotejoJson) {
    partes.push('\nCOTEJO DE DOCUMENTOS:');
    if (cotejoJson.veredicto) partes.push(String(cotejoJson.veredicto));
    if (Array.isArray(cotejoJson.discrepancias) && cotejoJson.discrepancias.length)
      partes.push(`Discrepancias: ${cotejoJson.discrepancias.join('; ')}`);
    if (Array.isArray(cotejoJson.faltantes) && cotejoJson.faltantes.length)
      partes.push(`Faltantes: ${cotejoJson.faltantes.join('; ')}`);
    if (Array.isArray(cotejoJson.alertas_vigencia) && cotejoJson.alertas_vigencia.length)
      partes.push(`Alertas de vigencia: ${cotejoJson.alertas_vigencia.join('; ')}`);
  }

  // Vencimientos cargados directamente en los documentos (certificados, etc.)
  const vencimientos: string[] = [];
  for (const d of documentos) {
    const v = (d as any).expires_at as string | null;
    if (v) vencimientos.push(`- ${d.file_name}: vence ${String(v).slice(0, 10)}`);
  }
  if (vencimientos.length) {
    partes.push('\nVENCIMIENTOS DE DOCUMENTOS (fecha de expiración cargada):');
    partes.push(vencimientos.join('\n'));
  }

  // Cronología del legajo: actuaciones y plazos (a mano o detectados por la IA).
  // Marcamos los FUTUROS para que el agente pueda proponer agendarlos.
  const eventos = eventosData ?? [];
  if (eventos.length) {
    const hoyIso = new Date().toISOString().slice(0, 10);
    partes.push('\nCRONOLOGÍA DEL LEGAJO (actuaciones y plazos; los marcados como PLAZO FUTURO son agendables):');
    partes.push(
      eventos
        .map((e) => {
          const f = String((e as any).event_date ?? '').slice(0, 10);
          const estado = f && f >= hoyIso ? 'PLAZO FUTURO' : 'ya pasó';
          const tipo = (e as any).event_type ?? 'otro';
          const titulo = (e as any).title ?? '';
          const desc = (e as any).description ? ` — ${(e as any).description}` : '';
          return `- ${f} [${estado}] (${tipo}) ${titulo}${desc}`;
        })
        .join('\n')
    );
  }

  const analisisPorDoc = new Map<string, any>();
  for (const o of analisisData ?? []) {
    if (o.document_id && !analisisPorDoc.has(o.document_id))
      analisisPorDoc.set(o.document_id, o.result_json);
  }
  if (analisisPorDoc.size > 0) {
    partes.push('\nDOCUMENTOS ANALIZADOS:');
    let i = 1;
    for (const [docId, rj] of analisisPorDoc.entries()) {
      const nombre = nombrePorDoc.get(docId) || 'documento';
      const r = (rj ?? {}) as any;
      const bloque = [`Documento ${i}: ${nombre} (${r.tipo_documental_detectado ?? 'tipo no detectado'})`];
      const venceDoc = vencimientoPorDoc.get(docId);
      if (venceDoc) bloque.push(`Vencimiento del documento: ${String(venceDoc).slice(0, 10)}`);
      if (r.resumen) bloque.push(`Resumen: ${r.resumen}`);
      if (Array.isArray(r.partes) && r.partes.length) bloque.push(`Partes: ${r.partes.join('; ')}`);
      if (Array.isArray(r.datos_clave) && r.datos_clave.length) bloque.push(`Datos clave: ${r.datos_clave.join('; ')}`);
      if (Array.isArray(r.clausulas_riesgos) && r.clausulas_riesgos.length) bloque.push(`Cláusulas/riesgos: ${r.clausulas_riesgos.join('; ')}`);
      if (Array.isArray(r.alertas) && r.alertas.length) bloque.push(`Alertas: ${r.alertas.join('; ')}`);
      if (Array.isArray(r.fechas_plazos) && r.fechas_plazos.length)
        bloque.push(`Fechas/plazos: ${r.fechas_plazos.map((f: any) => `${f.descripcion ?? ''} (${f.fecha ?? ''})`).join('; ')}`);
      partes.push(bloque.join('\n'));
      i++;
    }
  } else if (documentos.length > 0) {
    partes.push('\nDOCUMENTOS DEL LEGAJO (sin analizar aún):');
    partes.push(documentos.map((d) => `- ${d.file_name}`).join('\n'));
  }

  const contextoLegajo = partes.join('\n');

  const historial = Array.isArray(input.historial)
    ? input.historial
        .filter((m) => m && (m.rol === 'user' || m.rol === 'model') && typeof m.texto === 'string')
        .slice(-12)
    : [];

  const res = await responderAgenteLegajo({ industry, contextoLegajo, historial, pregunta });
  if (!res.ok) {
    const motivo =
      res.motivo === 'sin_api_key'
        ? 'La IA no está configurada (falta la API key).'
        : 'No pude generar una respuesta. Probá de nuevo.';
    return { ok: false, motivo };
  }
  return { ok: true, respuesta: res.respuesta, acciones: res.acciones };
}

// Ejecuta una acción aprobada por el usuario sobre un legajo concreto.
// Valida permisos y organización antes de tocar la base.
export async function ejecutarAccionAgente(input: {
  caseId: string;
  accion: AccionPropuesta;
}): Promise<{ ok: boolean; mensaje: string }> {
  const { user, profile } = await getUserProfile();
  if (!user || !profile) return { ok: false, mensaje: 'Sesión no válida.' };
  if (!isUserRole(profile.role)) return { ok: false, mensaje: 'No tenés permiso.' };

  const { caseId, accion } = input;
  if (!caseId) return { ok: false, mensaje: 'Falta el legajo.' };

  const supabase = await createClient();
  const { data: caseRecord } = await supabase
    .from('cases')
    .select('id')
    .eq('id', caseId)
    .eq('organization_id', profile.organization_id)
    .maybeSingle();
  if (!caseRecord) return { ok: false, mensaje: 'Legajo no encontrado.' };

  const fechaValida =
    typeof accion.fecha === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(accion.fecha);

  switch (accion.tipo) {
    case 'agendar_plazo': {
      if (!canUpdateCase(profile.role)) return { ok: false, mensaje: 'Sin permiso para agendar.' };
      if (!fechaValida) return { ok: false, mensaje: 'La acción no tiene una fecha válida.' };
      const r = await guardarPlazoDetectado({
        titulo: accion.titulo,
        fecha: accion.fecha as string,
        detalle: accion.motivo || 'Propuesto por el Agente IA del legajo',
        caseId,
      });
      return r.ok
        ? { ok: true, mensaje: 'Plazo agendado en tu calendario.' }
        : { ok: false, mensaje: 'No se pudo agendar el plazo.' };
    }

    case 'crear_actuacion': {
      if (!canUpdateCase(profile.role)) return { ok: false, mensaje: 'Sin permiso para cargar actuaciones.' };
      if (!fechaValida) return { ok: false, mensaje: 'La actuación no tiene una fecha válida.' };
      const { error } = await supabase.from('case_events').insert({
        organization_id: profile.organization_id,
        case_id: caseId,
        event_date: accion.fecha as string,
        event_type: 'otro',
        title: accion.titulo,
        description: accion.motivo || null,
        created_by: user.id,
      });
      if (error) {
        console.error('Agente crear_actuacion error:', error);
        return { ok: false, mensaje: 'No se pudo cargar la actuación.' };
      }
      revalidatePath(`/expedientes/${caseId}`);
      return { ok: true, mensaje: 'Actuación registrada en la cronología.' };
    }

    case 'agregar_checklist': {
      if (!canUpdateCase(profile.role)) return { ok: false, mensaje: 'Sin permiso para editar el checklist.' };
      let checklistId: string | undefined;
      const { data: existing } = await supabase
        .from('checklists')
        .select('id')
        .eq('case_id', caseId)
        .eq('organization_id', profile.organization_id)
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle();
      if (existing) {
        checklistId = existing.id;
      } else {
        const { data: nuevo, error: errNuevo } = await supabase
          .from('checklists')
          .insert({
            organization_id: profile.organization_id,
            case_id: caseId,
            name: 'Checklist documental',
            template_type: 'custom',
          })
          .select('id')
          .single();
        if (errNuevo || !nuevo) {
          console.error('Agente checklist create error:', errNuevo);
          return { ok: false, mensaje: 'No se pudo crear el checklist.' };
        }
        checklistId = nuevo.id;
      }
      const { error } = await supabase
        .from('checklist_items')
        .insert({ checklist_id: checklistId, title: accion.titulo, status: 'pending' });
      if (error) {
        console.error('Agente checklist item error:', error);
        return { ok: false, mensaje: 'No se pudo agregar el ítem.' };
      }
      revalidatePath(`/expedientes/${caseId}`);
      return { ok: true, mensaje: 'Ítem agregado al checklist.' };
    }

    case 'generar_resumen': {
      if (!canUseAi(profile.role)) return { ok: false, mensaje: 'Sin permiso para usar la IA.' };
      await generarResumenExpediente(caseId);
      revalidatePath(`/expedientes/${caseId}`);
      return { ok: true, mensaje: 'Resumen generado. Actualizá la página para verlo.' };
    }

    default:
      return { ok: false, mensaje: 'Acción no reconocida.' };
  }
}
