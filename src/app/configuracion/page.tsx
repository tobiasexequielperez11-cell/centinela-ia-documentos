import { AppShell } from '@/components/layout/AppShell';

export default function PlaceholderPage() {
  return (
    <AppShell>
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">Módulo MVP</p>
        <h2 className="mt-2 text-3xl font-bold text-slate-950">Configuracion</h2>
        <p className="mt-3 text-slate-600">Esta pantalla se conectará en los próximos sprints.</p>
      </div>
    </AppShell>
  );
}
