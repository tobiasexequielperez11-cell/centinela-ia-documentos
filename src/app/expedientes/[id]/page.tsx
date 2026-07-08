import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { createClient } from '@/lib/supabase/server';
import { getUserProfile } from '@/lib/auth/getUserProfile';
import {
  getCaseFields,
  getCaseStatuses,
  getCaseStatusLabel,
} from '@/lib/industries/caseConfig';
import {
  getDocumentTypeLabel,
  normalizeIndustryType,
} from '@/lib/industries/documentTypes';
import { summarizeChecklistStatuses } from '@/lib/checklist/progress';
import { getDocumentExpiryStatus, expiryStatusLabel, getExpiryBadgeStyles, getDaysUntilExpiry } from '@/lib/documents/expiry';
import { sensitivityLabel } from '@/lib/documents/sensitivity';
import { formatPlazoDate } from '@/lib/format/date';
import {
  linkChecklistItemDocument,
  toggleChecklistItem,
  updateCaseStatus,
  toggleChecklistItemNotRequired,
  addChecklistItem,
  removeChecklistItem,
  createCaseEvent,
  deleteCaseEvent,
  generarResumenExpediente,
} from '../actions';
import { canUseAi } from '@/lib/permissions/roles';
import { CopilotoExpediente } from './CopilotoExpediente';
import { CronologiaExpediente } from './CronologiaExpediente';
import type { CaseRecord } from '@/types/case';

interface CaseDetailPageProps {
  params: Promise<{ id: string }>;
}

type ChecklistItemRecord = {
  id: string;
  checklist_id: string;
  title: string;
  status: string;
  document_id: string | null;
  notes: string | null;
  created_at: string;
  documents: {
    id: string;
    file_name: string;
  } | null;
  checklists: {
    case_id: string;
    organization_id: string;
  };
};

type CaseDocumentRecord = {
  id: string;
  file_name: string;
  document_type: string | null;
  sensitivity_level: string | null;
  created_at: string;
};

type ChecklistDocumentOptionRecord = {
  id: string;
  file_name: string;
  case_id: string | null;
  created_at: string;
};

type CaseEventRecord = {
  id: string;
  event_date: string;
  event_type: string;
  title: string;
  description: string | null;
  created_by: string | null;
};

const CASE_EVENT_TYPE_LABELS: Record<string,string> = {
  escrito: 'Escrito / Presentación',
  audiencia: 'Audiencia',
  notificacion: 'Notificación / Cédula',
  resolucion: 'Resolución / Sentencia',
  prueba: 'Prueba / Pericia',
  otro: 'Otro movimiento',
};

function getEventTypeBadgeColor(type: string) {
  const colors: Record<string, string> = {
    escrito: 'bg-slate-100 text-slate-700',
    audiencia: 'bg-amber-100 text-amber-700',
    notificacion: 'bg-sky-100 text-sky-700',
    resolucion: 'bg-emerald-100 text-emerald-700',
    prueba: 'bg-purple-100 text-purple-700',
    otro: 'bg-slate-100 text-slate-700',
  };
  return colors[type] || colors.otro;
}

const darkOptionStyle = { backgroundColor: '#0C2340', color: '#FFFFFF' };

function displayText(value?: string | null, fallback = 'Sin definir') {
  const cleanValue = value?.trim();

  if (!cleanValue) return fallback;

  return cleanValue;
}

function getMetadataValue(metadata: CaseRecord['metadata'], key: string) {
  const value = metadata?.[key];
  return typeof value === 'string' ? value : '';
}

function checklistStatusLabel(status: string) {
  const labels: Record<string, string> = {
    pending: 'Pendiente',
    received: 'Recibido',
    reviewed: 'Revisado',
    rejected: 'Rechazado',
    not_required: 'No requerido',
  };

  return labels[status] ?? status;
}



export default async function CaseDetailPage({ params }: CaseDetailPageProps) {
  const { id } = await params;
  const { user, profile } = await getUserProfile();

  if (!user) redirect('/login');
  if (!profile) redirect('/onboarding');

  const supabase = await createClient();

  const { data } = await supabase
    .from('cases')
    .select('*')
    .eq('id', id)
    .eq('organization_id', profile.organization_id)
    .single();

  if (!data) notFound();

  const caseRecord = data as CaseRecord;

  const { data: organization } = await supabase
    .from('organizations')
    .select('industry_type')
    .eq('id', profile.organization_id)
    .maybeSingle();

  const industry = normalizeIndustryType(organization?.industry_type);
  const caseFields = getCaseFields(industry);
  const caseStatuses = getCaseStatuses(industry);
  const statusValues = caseStatuses.map((status) => status.value);
  const statusOptions = statusValues.includes(caseRecord.status)
    ? caseStatuses
    : [
        { value: caseRecord.status, label: getCaseStatusLabel(caseRecord.status, industry) },
        ...caseStatuses,
      ];
  const visibleMetadataFields = caseFields.filter((field) =>
    getMetadataValue(caseRecord.metadata, field.key)
  );

  const { data: checklistItemsData } = await supabase
    .from('checklist_items')
    .select(
      'id, checklist_id, title, status, document_id, notes, created_at, documents(id, file_name), checklists!inner(case_id, organization_id)'
    )
    .eq('checklists.case_id', caseRecord.id)
    .eq('checklists.organization_id', profile.organization_id)
    .order('created_at', { ascending: true });

  const { data: caseDocumentsData } = await supabase
    .from('documents')
    .select('id, file_name, document_type, sensitivity_level, created_at')
    .eq('case_id', caseRecord.id)
    .eq('organization_id', profile.organization_id)
    .order('created_at', { ascending: false });

  const { data: availableDocumentsData } = await supabase
    .from('documents')
    .select('id, file_name, case_id, created_at')
    .eq('organization_id', profile.organization_id)
    .order('created_at', { ascending: false });

  const { data: caseEventsData } = await supabase
    .from('case_events')
    .select('id, event_date, event_type, title, description, created_by')
    .eq('case_id', caseRecord.id)
    .order('event_date', { ascending: false })
    .order('created_at', { ascending: false });

  const checklistItems = (checklistItemsData ?? []) as unknown as ChecklistItemRecord[];
  const caseDocuments = (caseDocumentsData ?? []) as CaseDocumentRecord[];
  const availableDocuments = (availableDocumentsData ??
    []) as ChecklistDocumentOptionRecord[];
  const eventos = (caseEventsData ?? []) as CaseEventRecord[];
    
  const checklistStatuses = checklistItems.map((item) => item.status);
  const checklistProgress = summarizeChecklistStatuses(checklistStatuses);
  const missingItems = checklistItems.filter(
    (item) => item.status === 'pending' || item.status === 'rejected'
  );

  const { data: resumenData } = await supabase
    .from('ai_outputs')
    .select('result_json, created_at')
    .eq('case_id', caseRecord.id)
    .eq('organization_id', profile.organization_id)
    .eq('output_type', 'case_summary')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: analisisData } = await supabase
    .from('ai_outputs')
    .select('document_id, result_json, created_at')
    .eq('case_id', caseRecord.id)
    .eq('organization_id', profile.organization_id)
    .eq('output_type', 'document_analysis')
    .order('created_at', { ascending: false });

  const documentosAnalizados = new Set((analisisData ?? []).map((o) => o.document_id).filter(Boolean)).size;
  const puedeUsarIA = canUseAi(profile.role);

  const nombrePorDoc = new Map<string, string>();
  for (const d of caseDocuments) nombrePorDoc.set(d.id, d.file_name);

  const hoyISO = new Date().toISOString().slice(0, 10);
  const esFuturo = (f: string) => f > hoyISO;

  const cronologia: {
    fecha: string; titulo: string; detalle?: string | null;
    origen: 'actuacion' | 'detectada' | 'documento'; etiquetaOrigen: string; esFuturo: boolean;
  }[] = [];

  // 1) Actuaciones (línea de tiempo manual)
  for (const ev of eventos) {
    const f = String(ev.event_date).slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(f)) continue;
    cronologia.push({
      fecha: f,
      titulo: ev.title,
      detalle: ev.description,
      origen: 'actuacion',
      etiquetaOrigen: CASE_EVENT_TYPE_LABELS[ev.event_type] || 'Actuación',
      esFuturo: esFuturo(f),
    });
  }

  // 2) Fechas detectadas por la IA (último análisis por documento)
  const analisisPorDoc = new Map<string, any>();
  for (const o of analisisData ?? []) {
    if (o.document_id && !analisisPorDoc.has(o.document_id)) analisisPorDoc.set(o.document_id, o.result_json);
  }
  for (const [docId, rj] of analisisPorDoc.entries()) {
    const fechas = Array.isArray((rj as any)?.fechas_plazos) ? (rj as any).fechas_plazos : [];
    for (const fp of fechas) {
      const f = String(fp?.fecha || '').slice(0, 10);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(f)) continue;
      cronologia.push({
        fecha: f,
        titulo: String(fp?.descripcion || 'Fecha detectada'),
        detalle: null,
        origen: 'detectada',
        etiquetaOrigen: `Detectada · ${nombrePorDoc.get(docId) || 'documento'}`,
        esFuturo: esFuturo(f),
      });
    }
  }

  // 3) Cargas de documentos
  for (const d of caseDocuments) {
    const f = String(d.created_at).slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(f)) continue;
    cronologia.push({
      fecha: f,
      titulo: `Documento cargado: ${d.file_name}`,
      detalle: null,
      origen: 'documento',
      etiquetaOrigen: 'Documento',
      esFuturo: false,
    });
  }

  // orden cronológico ascendente (más antiguo → más nuevo)
  cronologia.sort((a, b) => (a.fecha < b.fecha ? -1 : a.fecha > b.fecha ? 1 : 0));

  return (
    <AppShell>
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">
            Detalle de expediente
          </p>

          <h2 className="mt-2 text-3xl font-bold text-slate-950">
            {displayText(caseRecord.title, 'Expediente sin título')}
          </h2>

          <p className="mt-2 text-sm text-slate-600">
            Cliente: {displayText(caseRecord.client_name, 'Sin cliente asignado')} - Estado actual:{' '}
            {getCaseStatusLabel(caseRecord.status, industry)}
          </p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.7fr]">
        <div className="space-y-6">
          <CopilotoExpediente
            caseId={caseRecord.id}
            resumen={(resumenData?.result_json as any) ?? null}
            generadoEl={resumenData?.created_at ?? null}
            documentosAnalizados={documentosAnalizados}
            puedeUsarIA={puedeUsarIA}
          />
          <CronologiaExpediente items={cronologia} />

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-950">
            Datos del expediente
          </h3>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Tipo
              </p>

              <p className="mt-2 font-bold text-slate-950">
                {caseRecord.case_type ?? 'General'}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Estado
              </p>

              <p className="mt-2 font-bold text-slate-950">
                {getCaseStatusLabel(caseRecord.status, industry)}
              </p>
            </div>

            {visibleMetadataFields.map((field) => {
              const value = getMetadataValue(caseRecord.metadata, field.key);
              if (field.key === 'fecha_relevante' && value) {
                const status = getDocumentExpiryStatus(value);
                const days = getDaysUntilExpiry(value) ?? 0;
                return (
                  <div key={field.key} className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {field.label}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <p className="font-bold text-slate-950">
                        {formatPlazoDate(value)}
                      </p>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getExpiryBadgeStyles(status)}`}>
                        {expiryStatusLabel(status)}
                      </span>
                      <span className="text-xs font-medium text-slate-500">
                        {days >= 0 ? `(faltan ${days} días)` : `(vencido hace ${Math.abs(days)} días)`}
                      </span>
                    </div>
                  </div>
                );
              }
              return (
                <div key={field.key} className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {field.label}
                  </p>
                  <p className="mt-2 font-bold text-slate-950">
                    {value}
                  </p>
                </div>
              );
            })}
          </div>

          <details open={visibleMetadataFields.length === 0} className="mt-6 group">
            <summary className="list-none cursor-pointer text-sm font-bold text-sky-600 hover:text-sky-700 flex items-center gap-2 select-none outline-none">
              <span>✏️ Editar datos del expediente</span>
              <span className="transition-transform group-open:rotate-90">▸</span>
            </summary>
            <form action={updateCaseStatus} className="mt-4 grid gap-4">
              <input type="hidden" name="case_id" value={caseRecord.id} />

              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Estado
                </label>
                <select
                  name="status"
                  defaultValue={caseRecord.status}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-[#0C2340] px-4 py-3 text-white outline-none focus:ring-2 focus:ring-sky-400"
                >
                  {statusOptions.map((status) => (
                    <option
                      key={status.value}
                      value={status.value}
                      className="bg-[#0C2340] text-white"
                      style={darkOptionStyle}
                    >
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              {caseFields.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {caseFields.map((field) => (
                    <div key={field.key}>
                      <label className="text-sm font-semibold text-slate-700">
                        {field.label}
                      </label>

                      {field.type === 'select' ? (
                        <select
                          name={`case_metadata.${field.key}`}
                          defaultValue={getMetadataValue(caseRecord.metadata, field.key)}
                          className="mt-2 w-full rounded-2xl border border-slate-200 bg-[#0C2340] px-4 py-3 text-white outline-none focus:ring-2 focus:ring-sky-400"
                        >
                          <option
                            value=""
                            className="bg-[#0C2340] text-white"
                            style={darkOptionStyle}
                          >
                            Sin definir
                          </option>
                          {(field.options ?? []).map((option) => (
                            <option
                              key={option}
                              value={option}
                              className="bg-[#0C2340] text-white"
                              style={darkOptionStyle}
                            >
                              {option}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          name={`case_metadata.${field.key}`}
                          type={field.type}
                          defaultValue={getMetadataValue(caseRecord.metadata, field.key)}
                          className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-sky-400"
                        />
                      )}
                    </div>
                  ))}
                </div>
              ) : null}

              <button className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800">
                Actualizar expediente
              </button>
            </form>
          </details>
        </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h3 className="text-lg font-bold text-slate-950">
                  Documentos del expediente
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Documentos cargados en la bóveda y asociados a este expediente.
                </p>
              </div>

              <Link
                href={`/documentos/subir?case=${caseRecord.id}`}
                className="rounded-2xl bg-sky-500 px-5 py-3 text-sm font-bold text-white hover:bg-sky-600"
              >
                Subir documento
              </Link>
            </div>

            {caseDocuments.length > 0 ? (
              <div className="mt-5 space-y-3">
                {caseDocuments.map((document) => (
                  <div
                    key={document.id}
                    className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-950">
                        {document.file_name}
                      </p>
                      <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        {getDocumentTypeLabel(document.document_type)}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-3">
                      <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-sky-700">
                        {sensitivityLabel(document.sensitivity_level)}
                      </span>
                      <Link
                        href={`/documentos/${document.id}`}
                        className="text-sm font-bold text-sky-600 hover:text-sky-700"
                      >
                        Ver documento
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
                Aún no hay documentos en este expediente.
              </div>
            )}
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-950">Línea de tiempo del expediente</h3>
            <p className="mt-1 text-sm text-slate-500">Registro cronológico de actuaciones, audiencias y movimientos.</p>
            
            <form action={async (formData: FormData) => {
              'use server';
              await createCaseEvent({
                caseId: caseRecord.id,
                eventDate: String(formData.get('eventDate')),
                eventType: String(formData.get('eventType')),
                title: String(formData.get('title')),
                description: String(formData.get('description') || '')
              });
            }} className="mt-5 grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Fecha</label>
                  <input type="date" name="eventDate" required className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-400" />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Tipo</label>
                  <select name="eventType" defaultValue="otro" className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-sky-400">
                    {Object.entries(CASE_EVENT_TYPE_LABELS).map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Título</label>
                <input type="text" name="title" required placeholder="Ej: Se presentó la demanda" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-400" />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Descripción (opcional)</label>
                <textarea name="description" rows={2} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-400" />
              </div>
              <button type="submit" className="justify-self-start rounded-xl bg-[#1E9BF0] px-4 py-2 text-sm font-bold text-white hover:bg-[#1485D6]">
                Agregar actuación
              </button>
            </form>

            <div className="mt-6 space-y-4 border-l-2 border-slate-200 pl-4">
              {eventos.length === 0 ? (
                <div className="text-sm text-slate-500">Todavía no hay actuaciones registradas en este expediente.</div>
              ) : (
                eventos.map((item) => (
                  <div key={item.id} className="relative mb-6 last:mb-0">
                    <span className="absolute -left-[23px] top-1 flex h-3 w-3 items-center justify-center rounded-full bg-slate-300 ring-4 ring-white" />
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-slate-500">{formatPlazoDate(item.event_date)}</span>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${getEventTypeBadgeColor(item.event_type)}`}>
                        {CASE_EVENT_TYPE_LABELS[item.event_type] || CASE_EVENT_TYPE_LABELS.otro}
                      </span>
                    </div>
                    <div className="mt-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-bold text-slate-950">{item.title}</p>
                          {item.description && <p className="mt-1 text-sm text-slate-600">{item.description}</p>}
                        </div>
                        <form action={async () => {
                          'use server';
                          await deleteCaseEvent({ eventId: item.id, caseId: caseRecord.id });
                        }}>
                          <button type="submit" className="text-xs font-bold text-rose-500 hover:text-rose-600">Eliminar</button>
                        </form>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-950">
              Checklist documental
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Lista sugerida. Marcá lo que no aplica o agregá lo que necesites.
            </p>

            {checklistItems.length === 0 && (
              <p className="mt-5 text-sm text-slate-500">
                Aún no hay ítems en este checklist.
              </p>
            )}

            {checklistItems.length > 0 ? (
              <>
                <div className="mt-5 rounded-2xl bg-[#0C2340] p-5 text-white shadow-sm">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold">
                      {checklistProgress.isComplete ? (
                        <span className="flex items-center gap-2 text-[#22C55E]">
                          ✓ Documentación completa
                        </span>
                      ) : (
                        <span>
                          <span className="text-slate-600">{checklistProgress.total - checklistProgress.missing}</span> de {checklistProgress.total} documentos sugeridos
                        </span>
                      )}
                    </p>
                    <span className="text-sm font-bold text-[#C2CCD9]">{checklistProgress.percent}%</span>
                  </div>
                  
                  <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-700/50">
                    <div
                      className="h-full bg-[#22C55E] transition-all duration-500"
                      style={{ width: `${checklistProgress.percent}%` }}
                    />
                  </div>

                  {!checklistProgress.isComplete && missingItems.length > 0 && (
                    <div className="mt-4 border-t border-slate-700/50 pt-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#C2CCD9]">
                        Sugeridos sin cargar:
                      </p>
                      <ul className="mt-3 space-y-2">
                        {missingItems.map((item) => (
                          <li key={`missing-${item.id}`} className="text-sm flex items-start gap-2">
                            <span className="text-[#F59E0B] mt-0.5 font-bold">!</span>
                            <span className="text-white">{item.title}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="mt-5 space-y-3">
                  {checklistItems.map((item) => {
                    const isDone = item.status === 'received' || item.status === 'reviewed';
                    const isMissing = item.status === 'pending' || item.status === 'rejected';
                    const isNotRequired = item.status === 'not_required';

                    return (
                      <div key={item.id} className={`space-y-3 ${isNotRequired ? 'opacity-60' : ''}`}>
                      <div className={`flex items-center gap-3 rounded-2xl border p-3 transition-colors ${
                          isMissing
                            ? 'border-[#F59E0B] bg-white'
                            : isNotRequired
                            ? 'border-slate-200 bg-slate-100'
                            : 'border-slate-200 bg-slate-50'
                        }`}>
                        
                        {!isNotRequired ? (
                          <form action={toggleChecklistItem} className="shrink-0">
                            <input type="hidden" name="case_id" value={caseRecord.id} />
                            <input type="hidden" name="item_id" value={item.id} />
                            <input type="hidden" name="current_status" value={item.status} />
                            <button
                              type="submit"
                              aria-label={isDone ? 'Marcar como pendiente' : 'Marcar como recibido'}
                              className={`flex h-5 w-5 items-center justify-center rounded-md border text-xs font-bold ${
                                isDone
                                  ? 'border-sky-500 bg-sky-500 text-white'
                                  : 'border-slate-300 bg-white text-transparent'
                              }`}
                            >
                              ✓
                            </button>
                          </form>
                        ) : (
                          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-slate-300 bg-slate-200 text-xs text-transparent">✓</div>
                        )}

                        <div className="min-w-0 flex-1">
                          <p
                            className={`text-sm font-semibold ${
                              isDone || isNotRequired
                                ? 'text-slate-500 line-through'
                                : 'text-slate-900'
                            }`}
                          >
                            {item.title}
                          </p>
                          <div className="mt-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                            <span>{checklistStatusLabel(item.status)}</span>
                            <span>•</span>
                            <form action={toggleChecklistItemNotRequired} className="inline-block">
                              <input type="hidden" name="case_id" value={caseRecord.id} />
                              <input type="hidden" name="item_id" value={item.id} />
                              <input type="hidden" name="current_status" value={item.status} />
                              <button type="submit" className="text-slate-500 hover:text-slate-700 underline decoration-slate-300 underline-offset-2">
                                {isNotRequired ? 'Restaurar' : 'No aplica'}
                              </button>
                            </form>
                            <span>•</span>
                            <form action={removeChecklistItem} className="inline-block">
                              <input type="hidden" name="case_id" value={caseRecord.id} />
                              <input type="hidden" name="item_id" value={item.id} />
                              <button type="submit" className="text-rose-400 hover:text-rose-600 underline decoration-rose-200 underline-offset-2">
                                Quitar
                              </button>
                            </form>
                          </div>
                        </div>
                      </div>

                    {item.documents && !isNotRequired ? (
                      <p className="rounded-xl bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-700">
                        Vinculado: {item.documents.file_name}
                      </p>
                    ) : null}

                    {!isNotRequired && (
                      <details className="group">
                        <summary className="list-none cursor-pointer text-xs font-semibold uppercase tracking-wide text-slate-400 hover:text-slate-600 select-none outline-none">
                          Vincular documento
                        </summary>
                        <form
                          action={linkChecklistItemDocument}
                          className="mt-2 rounded-2xl border border-slate-200 bg-white p-3"
                        >
                          <input type="hidden" name="case_id" value={caseRecord.id} />
                          <input type="hidden" name="item_id" value={item.id} />

                          <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                            <select
                              name="document_id"
                              defaultValue={item.document_id ?? ''}
                              className="w-full rounded-xl border border-slate-200 bg-[#0C2340] px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-sky-400"
                            >
                              <option
                                value=""
                                className="bg-[#0C2340] text-white"
                                style={darkOptionStyle}
                              >
                                -- sin vincular --
                              </option>
                              {availableDocuments.map((document) => (
                                <option
                                  key={document.id}
                                  value={document.id}
                                  className="bg-[#0C2340] text-white"
                                  style={darkOptionStyle}
                                >
                                  {document.file_name}
                                </option>
                              ))}
                            </select>

                            <button className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-bold text-slate-700 hover:border-sky-400 hover:text-sky-600">
                              Guardar
                            </button>
                          </div>
                        </form>
                      </details>
                    )}
                    </div>
                  );
                })}
              </div>
            </>
            ) : null}
            <form action={addChecklistItem} className="mt-5 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
              <input type="hidden" name="case_id" value={caseRecord.id} />
              <input 
                type="text" 
                name="title" 
                placeholder="Agregar documento al checklist…" 
                required
                className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400"
              />
              <button className="shrink-0 rounded-xl bg-slate-950 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800">
                Agregar
              </button>
            </form>
          </aside>

        </div>
      </div>
    </AppShell>
  );
}
