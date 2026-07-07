import { redirect } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { getUserProfile } from '@/lib/auth/getUserProfile';
import { canUseAi, isUserRole } from '@/lib/permissions/roles';
import { BuscarClient } from './BuscarClient';
import { BackfillDocs } from './BackfillDocs';

export default async function BuscarPage() {
  const { user, profile } = await getUserProfile();
  if (!user) redirect('/login');
  if (!profile) redirect('/onboarding');

  const puedeUsarIA = isUserRole(profile.role) && canUseAi(profile.role);

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-3xl px-4 py-8">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-sky-600">
            Búsqueda inteligente
          </p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">Preguntá a tus documentos</h1>
          <p className="mt-2 text-sm text-slate-500">
            Hacé una pregunta en lenguaje natural y la IA responde usando el contenido de los
            documentos analizados de tu organización, citando las fuentes.
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Para generar la respuesta, tu pregunta y los fragmentos relevantes se procesan con IA de
            Google.
          </p>
        </div>

        {puedeUsarIA ? (
          <>
            <BuscarClient />
            {profile.role === 'admin' && <BackfillDocs />}
          </>
        ) : (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            Tu rol no tiene habilitada la búsqueda con IA. Consultá con un administrador.
          </div>
        )}
      </div>
    </AppShell>
  );
}
