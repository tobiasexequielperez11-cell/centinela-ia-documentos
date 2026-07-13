import { redirect } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { getUserProfile } from '@/lib/auth/getUserProfile';
import { SeguridadCuentaClient } from './SeguridadCuentaClient';

export default async function SeguridadCuentaPage() {
  const { user, profile } = await getUserProfile();

  if (!user) redirect('/login');
  if (!profile) redirect('/onboarding');

  return (
    <AppShell>
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-soft">
          CONFIGURACIÓN
        </p>
        <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-white">
          Seguridad de la <span className="text-gradient">cuenta</span>
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Gestioná la verificación en dos pasos (2FA).
        </p>
      </div>

      <SeguridadCuentaClient />
    </AppShell>
  );
}
