import { AppShell } from '@/components/layout/AppShell';
import { createCase } from '../actions';

export default function NewCasePage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">
            Nuevo expediente
          </p>

          <h2 className="mt-2 text-3xl font-bold text-slate-950">
            Crear carpeta de trabajo
          </h2>

          <p className="mt-2 text-sm text-slate-600">
            Este expediente agrupará documentos, checklist, reportes y actividad.
          </p>
        </div>

        <form
          action={createCase}
          className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="grid gap-5">
            <div>
              <label className="text-sm font-semibold text-slate-700">
                Título del expediente
              </label>
              <input
                name="title"
                required
                placeholder="Compraventa — Cliente Pérez"
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">
                Cliente
              </label>
              <input
                name="client_name"
                placeholder="Nombre del cliente o empresa"
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">
                Tipo de expediente
              </label>
              <select
                name="case_type"
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-sky-400"
              >
                <option value="real_estate_purchase">
                  Compraventa de inmueble
                </option>
                <option value="rental">Alquiler</option>
                <option value="accounting_monthly">
                  Carpeta contable mensual
                </option>
                <option value="legal_case">Caso jurídico</option>
                <option value="general">General</option>
              </select>
            </div>
          </div>

          <button className="mt-6 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800">
            Crear expediente
          </button>
        </form>
      </div>
    </AppShell>
  );
}