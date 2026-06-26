import { notFound, redirect } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { createClient } from '@/lib/supabase/server';
import { getUserProfile } from '@/lib/auth/getUserProfile';
import {
  getCaseFields,
  getCaseStatuses,
  getCaseStatusLabel,
} from '@/lib/industries/caseConfig';
import { normalizeIndustryType } from '@/lib/industries/documentTypes';
import { toggleChecklistItem, updateCaseStatus } from '../actions';
import type { CaseRecord } from '@/types/case';

interface CaseDetailPageProps {
  params: Promise<{ id: string }>;
}

type ChecklistItemRecord = {
  id: string;
  checklist_id: string;
  title: string;
  status: string;
  notes: string | null;
  created_at: string;
  checklists: {
    case_id: string;
    organization_id: string;
  };
};

function caseTypeLabel(type?: string | null) {
  const labels: Record<string, string> = {
    general: 'General',
    rental: 'Contrato de alquiler',
    real_estate_purchase: 'Compraventa inmobiliaria',
    labor: 'Laboral',
    administrative: 'Administrativo',
    judicial: 'Judicial',
    corporate: 'Societario',
    legal_case: 'Caso juridico',
    accounting_monthly: 'Carpeta contable mensual',
  };

  return labels[type ?? ''] ?? type ?? 'General';
}

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
        { value: caseRecord.status, label: getCaseStatusLabel(caseRecord.status) },
        ...caseStatuses,
      ];
  const visibleMetadataFields = caseFields.filter((field) =>
    getMetadataValue(caseRecord.metadata, field.key)
  );

  const { data: checklistItemsData } = await supabase
    .from('checklist_items')
    .select('id, checklist_id, title, status, notes, created_at, checklists!inner(case_id, organization_id)')
    .eq('checklists.case_id', caseRecord.id)
    .eq('checklists.organization_id', profile.organization_id)
    .order('created_at', { ascending: true });

  const checklistItems = (checklistItemsData ?? []) as unknown as ChecklistItemRecord[];
  const completedChecklistItems = checklistItems.filter(
    (item) => item.status !== 'pending'
  ).length;

  return (
    <AppShell>
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">
            Detalle de expediente
          </p>

          <h2 className="mt-2 text-3xl font-bold text-slate-950">
            {displayText(caseRecord.title, 'Expediente sin titulo')}
          </h2>

          <p className="mt-2 text-sm text-slate-600">
            Cliente: {displayText(caseRecord.client_name, 'Sin cliente asignado')} - Estado actual:{' '}
            {getCaseStatusLabel(caseRecord.status)}
          </p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.7fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-950">
            Informacion general
          </h3>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Tipo
              </p>

              <p className="mt-2 font-bold text-slate-950">
                {caseTypeLabel(caseRecord.case_type)}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Estado
              </p>

              <p className="mt-2 font-bold text-slate-950">
                {getCaseStatusLabel(caseRecord.status)}
              </p>
            </div>

            {visibleMetadataFields.map((field) => (
              <div key={field.key} className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {field.label}
                </p>

                <p className="mt-2 font-bold text-slate-950">
                  {getMetadataValue(caseRecord.metadata, field.key)}
                </p>
              </div>
            ))}
          </div>

          <form action={updateCaseStatus} className="mt-6 grid gap-4">
            <input type="hidden" name="case_id" value={caseRecord.id} />

            <div>
              <label className="text-sm font-semibold text-slate-700">
                Estado
              </label>
              <select
                name="status"
                defaultValue={caseRecord.status}
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-sky-400"
              >
                {statusOptions.map((status) => (
                  <option key={status.value} value={status.value}>
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
                        className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-sky-400"
                      >
                        <option value="">Sin definir</option>
                        {(field.options ?? []).map((option) => (
                          <option key={option} value={option}>
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
        </section>

        <div className="space-y-6">
          <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-950">
              Checklist documental
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              {checklistItems.length > 0
                ? `${completedChecklistItems} de ${checklistItems.length} completados`
                : 'Sin checklist para este expediente.'}
            </p>

            {checklistItems.length > 0 ? (
              <div className="mt-5 space-y-3">
                {checklistItems.map((item) => {
                  const isDone = item.status !== 'pending';

                  return (
                    <form
                      key={item.id}
                      action={toggleChecklistItem}
                      className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3"
                    >
                      <input type="hidden" name="case_id" value={caseRecord.id} />
                      <input type="hidden" name="item_id" value={item.id} />
                      <input type="hidden" name="current_status" value={item.status} />

                      <button
                        type="submit"
                        aria-label={isDone ? 'Marcar como pendiente' : 'Marcar como recibido'}
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-xs font-bold ${
                          isDone
                            ? 'border-sky-500 bg-sky-500 text-white'
                            : 'border-slate-300 bg-white text-transparent'
                        }`}
                      >
                        ✓
                      </button>

                      <div className="min-w-0 flex-1">
                        <p
                          className={`text-sm font-semibold ${
                            isDone
                              ? 'text-slate-500 line-through'
                              : 'text-slate-900'
                          }`}
                        >
                          {item.title}
                        </p>
                        <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          {checklistStatusLabel(item.status)}
                        </p>
                      </div>
                    </form>
                  );
                })}
              </div>
            ) : null}
          </aside>

          <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-950">
              Estado del expediente
            </h3>

            <div className="mt-5 space-y-3 text-sm text-slate-600">
              <p>- Documentacion asociada desde la boveda documental.</p>
              <p>- Seguimiento operativo del estado del caso.</p>
              <p>- Control de revision documental e IA.</p>
              <p>- Preparado para reportes y trazabilidad.</p>
            </div>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
