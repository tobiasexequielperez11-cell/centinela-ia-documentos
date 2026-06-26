import { redirect } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { getCaseFields, getCaseStatuses, getCaseTypes } from '@/lib/industries/caseConfig';
import { normalizeIndustryType } from '@/lib/industries/documentTypes';
import { getUserProfile } from '@/lib/auth/getUserProfile';
import { createClient } from '@/lib/supabase/server';
import { createCase } from '../actions';

export default async function NewCasePage() {
  const { user, profile } = await getUserProfile();

  if (!user) redirect('/login');
  if (!profile) redirect('/onboarding');

  const supabase = await createClient();
  const { data: organization } = await supabase
    .from('organizations')
    .select('industry_type')
    .eq('id', profile.organization_id)
    .maybeSingle();

  const industry = normalizeIndustryType(organization?.industry_type);
  const caseFields = getCaseFields(industry);
  const caseStatuses = getCaseStatuses(industry);
  const caseTypes = getCaseTypes(industry);

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
                {caseTypes.map((caseType) => (
                  <option key={caseType} value={caseType}>
                    {caseType}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">
                Estado inicial
              </label>
              <select
                name="status"
                defaultValue={caseStatuses[0]?.value ?? 'active'}
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-sky-400"
              >
                {caseStatuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            {caseFields.length > 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-600">
                  Datos del rubro
                </p>

                <div className="mt-4 grid gap-4">
                  {caseFields.map((field) => (
                    <div key={field.key}>
                      <label className="text-sm font-semibold text-slate-700">
                        {field.label}
                      </label>

                      {field.type === 'select' ? (
                        <select
                          name={`case_metadata.${field.key}`}
                          className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-sky-400"
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
                          className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-sky-400"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <button className="mt-6 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800">
            Crear expediente
          </button>
        </form>
      </div>
    </AppShell>
  );
}
