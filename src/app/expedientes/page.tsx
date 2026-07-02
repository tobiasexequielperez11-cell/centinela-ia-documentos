import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { createClient } from '@/lib/supabase/server';
import { getUserProfile } from '@/lib/auth/getUserProfile';
import { getCaseStatusLabel } from '@/lib/industries/caseConfig';
import { normalizeIndustryType } from '@/lib/industries/documentTypes';
import { summarizeChecklistStatuses } from '@/lib/checklist/progress';
import { getDocumentExpiryStatus, expiryStatusLabel, getExpiryBadgeStyles } from '@/lib/documents/expiry';
import type { CaseRecord } from '@/types/case';

function displayText(value?: string | null, fallback = 'Sin definir') {
  const cleanValue = value?.trim();

  if (!cleanValue) return fallback;

  return cleanValue;
}

function formatPlazoDate(value?: string | null) {
  if (!value) return '—';
  const parts = value.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return value;
}

export default async function CasesPage() {
  const { user, profile } = await getUserProfile();

  if (!user) redirect('/login');
  if (!profile) redirect('/onboarding');

  const supabase = await createClient();

  const { data: cases } = await supabase
    .from('cases')
    .select('*')
    .eq('organization_id', profile.organization_id)
    .neq('status', 'archived')
    .neq('status', 'Archivado')
    .order('created_at', { ascending: false });

  const { data: organization } = await supabase
    .from('organizations')
    .select('industry_type')
    .eq('id', profile.organization_id)
    .maybeSingle();

  const organizationIndustry = normalizeIndustryType(organization?.industry_type);
  const records = (cases ?? []) as CaseRecord[];

  let statusesByCase: Record<string, string[]> = {};
  if (records.length > 0) {
    const caseIds = records.map((c) => c.id);
    const { data: checklistItems } = await supabase
      .from('checklist_items')
      .select('status, checklists!inner(case_id)')
      .eq('checklists.organization_id', profile.organization_id)
      .in('checklists.case_id', caseIds);

    statusesByCase = (checklistItems ?? []).reduce((acc: Record<string, string[]>, item: any) => {
      const caseId = item.checklists.case_id;
      if (!acc[caseId]) acc[caseId] = [];
      acc[caseId].push(item.status);
      return acc;
    }, {});
  }

  return (
    <AppShell>
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">
            Gestión de expedientes
          </p>

          <h2 className="mt-2 text-3xl font-bold text-slate-950">
            Expedientes
          </h2>

          <p className="mt-2 text-sm text-slate-600">
            Todos tus casos, clientes, estados y documentación asociada en un único panel.
          </p>
        </div>

        <Link
          href="/expedientes/nuevo"
          className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800"
        >
          Crear expediente
        </Link>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-4">Expediente</th>
              <th className="px-5 py-4">Cliente</th>
              <th className="px-5 py-4">Tipo</th>
              <th className="px-5 py-4">Estado</th>
              <th className="px-5 py-4">Próximo plazo</th>
              <th className="px-5 py-4">Documentación</th>
              <th className="px-5 py-4">Accion</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200">
            {records.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50">
                <td className="px-5 py-4 font-bold text-slate-950">
                  {displayText(item.title, 'Expediente sin titulo')}
                </td>

                <td className="px-5 py-4 text-slate-600">
                  {displayText(item.client_name, 'Sin cliente asignado')}
                </td>

                <td className="px-5 py-4 text-slate-600">
                  {item.case_type ?? 'General'}
                </td>

                <td className="px-5 py-4 text-slate-600">
                  {getCaseStatusLabel(item.status, organizationIndustry)}
                </td>

                <td className="px-5 py-4">
                  {(() => {
                    const plazo = ((item.metadata as Record<string, unknown> | null)?.fecha_relevante as string | undefined)?.trim();
                    if (!plazo) {
                      return (
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                          Sin fecha
                        </span>
                      );
                    }
                    const status = getDocumentExpiryStatus(plazo);
                    return (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-700">{formatPlazoDate(plazo)}</span>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${getExpiryBadgeStyles(status)}`}>
                          {expiryStatusLabel(status)}
                        </span>
                      </div>
                    );
                  })()}
                </td>

                <td className="px-5 py-4">
                  {(() => {
                    const statuses = statusesByCase[item.id];
                    if (!statuses || statuses.length === 0) {
                      return (
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                          Sin checklist
                        </span>
                      );
                    }
                    const progress = summarizeChecklistStatuses(statuses);
                    if (progress.total === 0) {
                      return (
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                          Sin checklist
                        </span>
                      );
                    }
                    if (progress.isComplete) {
                      return (
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-[#22C55E] border border-green-200">
                          Completo
                        </span>
                      );
                    }
                    return (
                      <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-[#F59E0B] border border-amber-200">
                        Faltan {progress.missing}
                      </span>
                    );
                  })()}
                </td>

                <td className="px-5 py-4">
                  <Link
                    className="font-bold text-sky-600 hover:text-sky-700"
                    href={`/expedientes/${item.id}`}
                  >
                    Ver detalle
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {records.length === 0 ? (
          <div className="p-10 text-center">
            <p className="font-bold text-slate-950">
              Todavia no hay expedientes.
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Crea el primer expediente para comenzar la gestion documental.
            </p>
          </div>
        ) : null}
      </div>
    </AppShell>
  );
}
