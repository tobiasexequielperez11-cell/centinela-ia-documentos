import { notFound, redirect } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { createClient } from '@/lib/supabase/server';
import { getUserProfile } from '@/lib/auth/getUserProfile';
import { updateCaseStatus } from '../actions';
import type { CaseRecord } from '@/types/case';

interface CaseDetailPageProps {
  params: Promise<{ id: string }>;
}

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    new: 'Nuevo',
    in_review: 'En revisión',
    incomplete: 'Incompleto',
    waiting_client: 'Esperando cliente',
    complete: 'Completo',
    archived: 'Archivado',
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

  return (
    <AppShell>
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">
            Detalle de expediente
          </p>
          <h2 className="mt-2 text-3xl font-bold text-slate-950">
            {caseRecord.title}
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Cliente: {caseRecord.client_name ?? 'Sin cliente asignado'} · Estado actual:{' '}
            {statusLabel(caseRecord.status)}
          </p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.7fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-950">
            Información general
          </h3>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Tipo
              </p>
              <p className="mt-2 font-bold text-slate-950">
                {caseRecord.case_type ?? 'general'}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Estado
              </p>
              <p className="mt-2 font-bold text-slate-950">
                {statusLabel(caseRecord.status)}
              </p>
            </div>
          </div>

          <form action={updateCaseStatus} className="mt-6 flex flex-col gap-3 sm:flex-row">
            <input type="hidden" name="case_id" value={caseRecord.id} />

            <select
              name="status"
              defaultValue={caseRecord.status}
              className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-sky-400"
            >
              <option value="new">Nuevo</option>
              <option value="in_review">En revisión</option>
              <option value="incomplete">Incompleto</option>
              <option value="waiting_client">Esperando cliente</option>
              <option value="complete">Completo</option>
              <option value="archived">Archivado</option>
            </select>

            <button className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800">
              Actualizar estado
            </button>
          </form>
        </section>

        <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-950">
            Próximos módulos
          </h3>
          <div className="mt-5 space-y-3 text-sm text-slate-600">
            <p>• Documentos asociados.</p>
            <p>• Checklist automático.</p>
            <p>• Resumen IA del expediente.</p>
            <p>• Reporte PDF.</p>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}