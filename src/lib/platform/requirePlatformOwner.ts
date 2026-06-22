import 'server-only';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function requirePlatformOwner() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const admin = createAdminClient();

  if (!admin) {
    console.error('Platform owner access unavailable: service role is not configured.');
    redirect('/acceso-denegado?motivo=configuracion');
  }

  const { data: owner, error } = await admin
    .from('platform_admins')
    .select('user_id, email, active')
    .eq('user_id', user.id)
    .eq('active', true)
    .maybeSingle();

  if (error) {
    console.error('Platform owner verification failed:', error);
    redirect('/acceso-denegado?motivo=rol');
  }

  if (!owner) redirect('/acceso-denegado?motivo=rol');

  return { user, owner, admin };
}
