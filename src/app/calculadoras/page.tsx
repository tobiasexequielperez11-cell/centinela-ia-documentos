import { redirect } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { getUserProfile } from '@/lib/auth/getUserProfile';
import { CalculadorasClient } from './CalculadorasClient';

export default async function CalculadorasPage() {
  const { user, profile } = await getUserProfile();
  if (!user) redirect('/login');
  if (!profile) redirect('/onboarding');

  return (
    <AppShell>
      <CalculadorasClient />
    </AppShell>
  );
}
