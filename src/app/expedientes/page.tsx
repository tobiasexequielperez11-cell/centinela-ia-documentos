import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { createClient } from '@/lib/supabase/server';
import { getUserProfile } from '@/lib/auth/getUserProfile';
import { getCaseStatusLabel } from '@/lib/industries/caseConfig';
import { normalizeIndustryType } from '@/lib/industries/documentTypes';
import { summarizeChecklistStatuses } from '@/lib/checklist/progress';
import { getDocumentExpiryStatus, expiryStatusLabel, getExpiryBadgeStyles } from '@/lib/documents/expiry';
import { formatPlazoDate } from '@/lib/format/date';
import { Badge } from '@/components/ui/Badge';
import { Reveal } from '@/components/ui/Reveal';
import type { CaseRecord } from '@/types/case';

function displayText(value?: string | null, fallback = 'Sin definir') {
  const cleanValue = value?.trim();

  if (!cleanValue) return fallback;

  return cleanValue;
}


export default async function CasesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
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
  let records = (cases ?? []) as CaseRecord[];

  const query = (q ?? '').trim().toLowerCase();
  if (query) {
    records = records.filter((item) =>
      [item.title, item.client_name, item.case_type]
        .some((field) => (field ?? '').toLowerCase().includes(query))
    );
  }

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
      <Reveal>
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
            className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition-all hover:bg-slate-800"
          >
            Crear expediente
          </Link>
        </div>

        <form method="get" className="mb-4 flex gap-2">
          <input
            type="search"
            name="q"
            defaultValue={q ?? ''}
            placeholder="Buscar por expediente, cliente o tipo…"
            className="w-full max-w-md rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Buscar
          </button>
        </form>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.03]">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/[0.04] text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-3">Expediente</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Próximo plazo</th>
                <th className="px-4 py-3">Documentación</th>
                <th className="px-4 py-3">Acción</th>
              </tr>
            </thead>

          <tbody className="divide-y divide-slate-200">
            {records.map((item) => (
              <tr key={item.id} className="border-t border-white/5 transition-colors hover:bg-white/[0.03]">
                <td className="px-4 py-3 font-bold text-white">
                  {displayText(item.title, 'Expediente sin titulo')}
                </td>

                <td className="px-4 py-3 text-slate-300">
                  {displayText(item.client_name, 'Sin cliente asignado')}
                </td>

                <td className="px-4 py-3 text-slate-300">
                  {item.case_type ?? 'General'}
                </td>

                <td className="px-4 py-3">
                  <Badge tone="accent">{getCaseStatusLabel(item.status, organizationIndustry)}</Badge>
                </td>

                <td className="px-4 py-3">
                  {(() => {
                    const plazo = ((item.metadata as Record<string, unknown> | null)?.fecha_relevante as string | undefined)?.trim();
                    if (!plazo) {
                      return (
                        <Badge tone="neutral">Sin fecha</Badge>
                      );
                    }
                    const status = getDocumentExpiryStatus(plazo);
                    return (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-300">{formatPlazoDate(plazo)}</span>
                        <Badge tone={status === 'vencido' ? 'danger' : status === 'por_vencer' ? 'warning' : 'neutral'}>
                          {expiryStatusLabel(status)}
                        </Badge>
                      </div>
                    );
                  })()}
                </td>

                <td className="px-4 py-3">
                  {(() => {
                    const statuses = statusesByCase[item.id];
                    if (!statuses || statuses.length === 0) {
                      return (
                        <Badge tone="neutral">Sin checklist</Badge>
                      );
                    }
                    const progress = summarizeChecklistStatuses(statuses);
                    if (progress.total === 0) {
                      return (
                        <Badge tone="neutral">Sin checklist</Badge>
                      );
                    }
                    if (progress.isComplete) {
                      return (
                        <Badge tone="success">Completo</Badge>
                      );
                    }
                    return (
                      <Badge tone="warning">
                        Sugeridos {progress.total - progress.missing}/{progress.total}
                      </Badge>
                    );
                  })()}
                </td>

                <td className="px-4 py-3">
                  <Link
                    className="text-xs font-medium text-accent-soft hover:text-white"
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
            {query ? (
              <p className="font-bold text-white">
                No se encontraron expedientes para «{q}».
              </p>
            ) : (
              <p className="font-bold text-white">
                Todavía no hay expedientes.
              </p>
            )}

            <p className="mt-2 text-sm text-slate-400">
              Crea el primer expediente para comenzar la gestion documental.
            </p>
          </div>
        ) : null}
        </div>
      </Reveal>
    </AppShell>
  );
}
