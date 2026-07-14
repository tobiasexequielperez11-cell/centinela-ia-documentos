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

export async function agregarObservacion(formData: FormData) {
  const { user, profile } = await getUserProfile();
  if (!user) redirect('/login');
  if (!profile) redirect('/onboarding');

  const derivationId = String(formData.get('derivation_id') || '');
  const caseId = String(formData.get('case_id') || '');
  const body = String(formData.get('body') || '').trim();

  if (!derivationId || !caseId || !body) {
    redirect(`/recibidos/${derivationId}`);
  }

  const supabase = await createClient();

  const { data: org } = await supabase
    .from('organizations')
    .select('name')
    .eq('id', profile.organization_id)
    .maybeSingle();

  const { error } = await supabase.from('derivation_notes').insert({
    derivation_id: derivationId,
    case_id: caseId,
    author_organization_id: profile.organization_id,
    author_user_id: user.id,
    author_name: user.email || null,
    author_org_name: org?.name || null,
    body,
  });

  if (error) {
    console.error('Error al agregar observacion:', error);
  }

  revalidatePath(`/recibidos/${derivationId}`);
  redirect(`/recibidos/${derivationId}`);
}
