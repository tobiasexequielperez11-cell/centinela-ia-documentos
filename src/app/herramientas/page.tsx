import { redirect } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { getUserProfile } from '@/lib/auth/getUserProfile';
import { ImagenAPdf } from './ImagenAPdf';
import { ConversorImagenes } from './ConversorImagenes';

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
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Herramientas</h1>
        <p className="mt-1 text-sm text-slate-500">
          Utilidades rápidas para tus documentos. Todo se procesa en tu
          navegador, sin subir nada a un servidor.
        </p>

        <section className="mt-8">
          <h2 className="text-lg font-semibold text-slate-900">Imagen → PDF</h2>
          <p className="mt-1 text-sm text-slate-500">
            Convertí fotos o capturas en un PDF. Ideal para papeles
            fotografiados con el celular.
          </p>
          <div className="mt-4">
            <ImagenAPdf />
          </div>
        </section>

        <section className="mt-12 border-t border-slate-100 pt-8">
          <h2 className="text-lg font-semibold text-slate-900">
            Conversor y compresor de imágenes
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Cambiá el formato (JPG ↔ PNG) o reducí el peso de tus imágenes.
          </p>
          <div className="mt-4">
            <ConversorImagenes />
          </div>
        </section>
      </div>
    </AppShell>
  );
}
