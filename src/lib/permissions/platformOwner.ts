import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';

export async function isPlatformOwner(userId: string): Promise<boolean> {
  const admin = createAdminClient();
  
  if (!admin) {
    return false;
  }
  
  const { data: owner } = await admin
    .from('platform_admins')
    .select('user_id, active')
    .eq('user_id', userId)
    .eq('active', true)
    .maybeSingle();
    
  return Boolean(owner);
}
