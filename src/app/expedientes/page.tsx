import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { createClient } from '@/lib/supabase/server';
import { getUserProfile } from '@/lib/auth/getUserProfile';
import { getCaseStatusLabel } from '@/lib/industries/caseConfig';
import { normalizeIndustryType } from '@/lib/industries/documentTypes';
import type { CaseRecord } from '@/types/case';

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

  return (
    <AppShell>
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">
            Expedientes
          </p>

          <h2 className="mt-2 text-3xl font-bold text-slate-950">
            Carpetas de trabajo
          </h2>

          <p className="mt-2 text-sm text-slate-600">
            Gestiona casos, clientes, estados y documentacion asociada desde un unico panel.
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
                  {caseTypeLabel(item.case_type)}
                </td>

                <td className="px-5 py-4 text-slate-600">
                  {getCaseStatusLabel(item.status, organizationIndustry)}
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
