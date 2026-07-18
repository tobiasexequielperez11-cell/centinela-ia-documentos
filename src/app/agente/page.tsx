import { redirect } from 'next/navigation';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { createClient } from '@/lib/supabase/server';
import { getUserProfile } from '@/lib/auth/getUserProfile';

type Alerta = { fecha: string; dias: number; titulo: string; contexto?: string; href: string };

function diasDesdeHoy(iso: string): number {
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return NaN;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const fecha = new Date(y, m - 1, d);
  fecha.setHours(0, 0, 0, 0);
  return Math.round((fecha.getTime() - hoy.getTime()) / 86_400_000);
}

function textoDias(n: number): string {
  if (n < 0) return `hace ${Math.abs(n)} día${Math.abs(n) === 1 ? '' : 's'}`;
  if (n === 0) return 'vence hoy';
  if (n === 1) return 'vence mañana';
  return `en ${n} días`;
}

function formatFecha(iso: string) {
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

const NIVELES = [
  { test: (n: number) => n < 0, icon: '🔴', chip: 'bg-rose-500/20 text-rose-300', border: 'border-l-rose-500' },
  { test: (n: number) => n >= 0 && n <= 7, icon: '🟠', chip: 'bg-orange-500/20 text-orange-300', border: 'border-l-orange-500' },
  { test: (n: number) => n > 7 && n <= 15, icon: '🟡', chip: 'bg-amber-500/20 text-amber-300', border: 'border-l-amber-400' },
  { test: (n: number) => n > 15 && n <= 30, icon: '🟢', chip: 'bg-emerald-500/20 text-emerald-300', border: 'border-l-emerald-500' },
];

function nivelDe(n: number) {
  return NIVELES.find((x) => x.test(n)) ?? null;
}

export default async function AgentePage() {
  const { user, profile } = await getUserProfile();
  if (!user) redirect('/login');
  if (!profile) redirect('/onboarding');

  const supabase = await createClient();

  const [documentsResult, casesResult, plazosResult] = await Promise.all([
    supabase
      .from('documents')
      .select('id, file_name, expires_at, case_id')
      .eq('organization_id', profile.organization_id)
      .not('expires_at', 'is', null),
    supabase
      .from('cases')
      .select('id, title')
      .eq('organization_id', profile.organization_id)
      .neq('status', 'archived')
      .neq('status', 'Archivado'),
    supabase
      .from('agenda_plazos')
      .select('id, titulo, fecha, detalle, categoria, case_id')
      .eq('organization_id', profile.organization_id),
  ]);

  const documents = documentsResult.data ?? [];
  const cases = casesResult.data ?? [];
  const plazos = plazosResult.data ?? [];

  const caseTitleById = new Map<string, string>();
  for (const c of cases) caseTitleById.set(c.id, c.title || 'Expediente sin título');

  const alertas: Alerta[] = [];

  for (const doc of documents) {
    if (!doc.expires_at) continue;
    const fecha = String(doc.expires_at).slice(0, 10);
    const cid = (doc as { case_id?: string | null }).case_id ?? null;
    alertas.push({
      fecha,
      dias: diasDesdeHoy(fecha),
      titulo: `Vence documento: ${doc.file_name ?? 'Documento'}`,
      contexto: cid ? caseTitleById.get(cid) : 'Documento',
      href: cid ? `/expedientes/${cid}` : `/documentos/${doc.id}`,
    });
  }

  for (const p of plazos) {
    if (!p.fecha) continue;
    const fecha = String(p.fecha).slice(0, 10);
    const cid = (p as { case_id?: string | null }).case_id ?? null;
    alertas.push({
      fecha,
      dias: diasDesdeHoy(fecha),
      titulo: p.titulo ?? 'Plazo',
      contexto: cid ? caseTitleById.get(cid) : 'Agenda',
      href: cid ? `/expedientes/${cid}` : '/agenda',
    });
  }

  const alertasVisibles = alertas
    .filter((a) => !Number.isNaN(a.dias) && a.dias >= -90 && a.dias <= 30)
    .sort((a, b) => a.dias - b.dias);

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl px-4 py-6">
        <div className="relative overflow-hidden rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/40 p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-cyan-500/20 text-3xl">
              🤖
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-white">Agente IA de Centinela</h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-300">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" /> En línea
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-300">
                Estoy vigilando todos tus legajos. La IA propone, vos decidís.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
            🚦 Alertas tempranas
            <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs font-normal text-slate-400">
              {alertasVisibles.length}
            </span>
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Vencimientos y plazos de toda la organización (vencidos recientes y próximos 30 días).
          </p>

          {alertasVisibles.length === 0 ? (
            <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900/40 p-6 text-center text-sm text-slate-400">
              ✅ Todo tranquilo por ahora. No hay vencimientos ni plazos próximos.
            </div>
          ) : (
            <div className="mt-4 space-y-2">
              {alertasVisibles.map((a, i) => {
                const nivel = nivelDe(a.dias);
                return (
                  <Link
                    key={i}
                    href={a.href}
                    className={`block rounded-xl border border-slate-800 border-l-4 ${nivel?.border ?? 'border-l-slate-600'} bg-slate-900/50 p-3 transition hover:border-cyan-500/40 hover:bg-slate-900`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`rounded-md px-2 py-0.5 text-xs font-semibold ${nivel?.chip ?? 'bg-slate-700 text-slate-300'}`}>
                        {nivel?.icon} {textoDias(a.dias)}
                      </span>
                      <span className="text-xs text-slate-500">{formatFecha(a.fecha)}</span>
                      {a.contexto && (
                        <span className="ml-auto truncate text-xs text-slate-400">{a.contexto}</span>
                      )}
                    </div>
                    <p className="mt-1.5 text-sm font-medium text-slate-100">{a.titulo}</p>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
