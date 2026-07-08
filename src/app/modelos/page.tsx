import { redirect } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { createClient } from '@/lib/supabase/server';
import { getUserProfile } from '@/lib/auth/getUserProfile';
import { ModelosClient, type ExpedienteLite } from './ModelosClient';
import { canUseAi } from '@/lib/permissions/roles';
import { RevisarEscrito } from './RevisarEscrito';

export default async function ModelosPage({
  searchParams,
}: {
  searchParams: Promise<{ modelo?: string }>;
}) {
  const { user, profile } = await getUserProfile();
  if (!user) redirect('/login');
  if (!profile) redirect('/onboarding');

  const supabase = await createClient();
  const { data: cases } = await supabase
    .from('cases')
    .select('id, title, client_name, case_type, metadata')
    .eq('organization_id', profile.organization_id)
    .neq('status', 'archived')
    .neq('status', 'Archivado')
    .order('created_at', { ascending: false });

  const expedientes = (cases ?? []) as ExpedienteLite[];

  const sp = await searchParams;
  const modeloInicialId = typeof sp.modelo === 'string' ? sp.modelo : null;

  const puedeIA = canUseAi(profile.role);

  return (
    <AppShell>
      <div className="space-y-6">
        <ModelosClient expedientes={expedientes} modeloInicialId={modeloInicialId} />
        {puedeIA && <RevisarEscrito />}
      </div>
    </AppShell>
  );
}
