'use server';

import { createClient } from '@/lib/supabase/server';
import { getUserProfile } from '@/lib/auth/getUserProfile';
import { normalizeIndustryType } from '@/lib/industries/documentTypes';
import { canUseAi } from '@/lib/permissions/roles';
import { responderAgenteLegajo, type MensajeChat } from '@/lib/ai/agente';

export async function preguntarAgente(input: {
  caseId: string;
  historial: MensajeChat[];
  pregunta: string;
}): Promise<{ ok: false; motivo: string } | { ok: true; respuesta: string }> {
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
    .select('id, file_name, document_type')
    .eq('case_id', input.caseId)
    .eq('organization_id', profile.organization_id)
    .order('created_at', { ascending: false });
  const documentos = docsData ?? [];
  const nombrePorDoc = new Map<string, string>();
  for (const d of documentos) nombrePorDoc.set(d.id, d.file_name);

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
    if (Array.isArray(resumenJson.riesgos_alertas) && resumenJson.riesgos_alertas.length)
      partes.push(`Riesgos/alertas: ${resumenJson.riesgos_alertas.join('; ')}`);
  }

  const cotejoJson = (cotejoData?.result_json ?? null) as any;
  if (cotejoJson) {
    partes.push('\nCOTEJO DE DOCUMENTOS:');
    if (cotejoJson.veredicto) partes.push(String(cotejoJson.veredicto));
    if (Array.isArray(cotejoJson.discrepancias) && cotejoJson.discrepancias.length)
      partes.push(`Discrepancias: ${cotejoJson.discrepancias.join('; ')}`);
    if (Array.isArray(cotejoJson.faltantes) && cotejoJson.faltantes.length)
      partes.push(`Faltantes: ${cotejoJson.faltantes.join('; ')}`);
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
      if (r.resumen) bloque.push(`Resumen: ${r.resumen}`);
      if (Array.isArray(r.partes) && r.partes.length) bloque.push(`Partes: ${r.partes.join('; ')}`);
      if (Array.isArray(r.datos_clave) && r.datos_clave.length) bloque.push(`Datos clave: ${r.datos_clave.join('; ')}`);
      if (Array.isArray(r.clausulas_riesgos) && r.clausulas_riesgos.length) bloque.push(`Cláusulas/riesgos: ${r.clausulas_riesgos.join('; ')}`);
      if (Array.isArray(r.alertas) && r.alertas.length) bloque.push(`Alertas: ${r.alertas.join('; ')}`);
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
  return { ok: true, respuesta: res.respuesta };
}
