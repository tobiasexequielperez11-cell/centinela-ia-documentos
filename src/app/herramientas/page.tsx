import { redirect } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { getUserProfile } from '@/lib/auth/getUserProfile';
import { ImagenAPdf } from './ImagenAPdf';

export default async function HerramientasPage() {
  const { user, profile } = await getUserProfile();
  if (!user) redirect('/login');
  if (!profile) redirect('/onboarding');

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-4xl px-4 py-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-sky-600">
          Herramientas jurídicas
        </p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Herramientas PDF</h1>
        <p className="mt-1 text-sm text-slate-500">
          Convertí imágenes en un PDF. Ideal para fotos del celular o capturas de
          pantalla que querés archivar como documento.
        </p>
        <div className="mt-6">
          <ImagenAPdf />
        </div>
      </div>
    </AppShell>
  );
}
