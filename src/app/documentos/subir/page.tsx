import { redirect } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { createClient } from '@/lib/supabase/server';
import { getUserProfile } from '@/lib/auth/getUserProfile';
import { uploadDocument } from '../actions';

interface UploadDocumentPageProps {
  searchParams: Promise<{ error?: string }>;
}

function getErrorMessage(error?: string) {
  const messages: Record<string, string> = {
    missing_file: 'Seleccioná un archivo.',
    invalid_type: 'Tipo de archivo no permitido.',
    file_too_large: 'El archivo supera el tamaño máximo permitido.',
    invalid_case: 'El expediente seleccionado no es válido.',
    upload_failed: 'No se pudo subir el archivo.',
    metadata_failed: 'El archivo subió, pero no se pudieron guardar los metadatos.',
  };

  return error ? messages[error] : null;
}

export default async function UploadDocumentPage({
  searchParams,
}: UploadDocumentPageProps) {
  const params = await searchParams;
  const errorMessage = getErrorMessage(params.error);

  const { user, profile } = await getUserProfile();

  if (!user) redirect('/login');
  if (!profile) redirect('/onboarding');

  const supabase = await createClient();

  const { data: cases } = await supabase
    .from('cases')
    .select('id, title')
    .eq('organization_id', profile.organization_id)
    .order('created_at', { ascending: false });

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">
            Documentos
          </p>

          <h2 className="mt-2 text-3xl font-bold text-slate-950">
            Subir documento
          </h2>

          <p className="mt-2 text-sm text-slate-600">
            El archivo se guardará en storage privado y quedará asociado a tu organización.
          </p>
        </div>

        {errorMessage ? (
          <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            {errorMessage}
          </div>
        ) : null}

        <form
          action={uploadDocument}
          className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="grid gap-5">
            <div>
              <label className="text-sm font-semibold text-slate-700">
                Expediente
              </label>

              <select
                name="case_id"
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-sky-400"
              >
                <option value="">Sin expediente / general</option>

                {(cases ?? []).map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">
                Tipo documental
              </label>

              <select
                name="document_type"
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-sky-400"
              >
                <option value="">Sin Clasificar</option>
                <option value="dni">DNI</option>
                <option value="contrato">Contrato</option>
                <option value="factura">Factura</option>
                <option value="recibo">Recibo</option>
                <option value="escritura">Escritura</option>
                <option value="constancia_fiscal">Constancia fiscal</option>
                <option value="otro">Otro</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">
                Nivel de sensibilidad
              </label>

              <select
                name="sensitivity_level"
                defaultValue="medium"
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-sky-400"
              >
                <option value="low">Bajo</option>
                <option value="medium">Medio</option>
                <option value="high">Alto</option>
                <option value="critical">Crítico</option>
              </select>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              Para pruebas usá documentos ficticios o archivos sin información sensible real.
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">
                Archivo
              </label>

              <input
                name="file"
                type="file"
                required
                accept=".pdf,.jpg,.jpeg,.png,.docx,.xlsx"
                className="mt-2 w-full rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm outline-none focus:ring-2 focus:ring-sky-400"
              />

              <p className="mt-2 text-xs text-slate-500">
                Formatos permitidos: PDF, JPG, PNG, DOCX y XLSX. Máximo 20 MB.
              </p>
            </div>
          </div>

          <button className="mt-6 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800">
            Subir documento
          </button>
        </form>
      </div>
    </AppShell>
  );
}