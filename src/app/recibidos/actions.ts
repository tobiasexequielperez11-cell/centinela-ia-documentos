'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getUserProfile } from '@/lib/auth/getUserProfile';

export async function aceptarDerivacion(formData: FormData) {
  const id = String(formData.get('id') || '');
  if (!id) return;
  const { user, profile } = await getUserProfile();
  if (!user || !profile) redirect('/login');
  const supabase = await createClient();
  await supabase
    .from('case_derivations')
    .update({
      status: 'aceptada',
      to_organization_id: profile.organization_id,
      accepted_by: user.id,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);
  revalidatePath('/recibidos');
}

export async function rechazarDerivacion(formData: FormData) {
  const id = String(formData.get('id') || '');
  if (!id) return;
  const { user, profile } = await getUserProfile();
  if (!user || !profile) redirect('/login');
  const supabase = await createClient();
  await supabase
    .from('case_derivations')
    .update({
      status: 'rechazada',
      accepted_by: user.id,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);
  revalidatePath('/recibidos');
}
