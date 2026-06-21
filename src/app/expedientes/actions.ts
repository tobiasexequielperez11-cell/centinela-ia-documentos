'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getUserProfile } from '@/lib/auth/getUserProfile';
import { createAuditLog } from '@/lib/audit/createAuditLog';
import {
  canCreateCase,
  canUpdateCase,
  isUserRole,
} from '@/lib/permissions/roles';

function denyCaseAction() {
  redirect('/acceso-denegado?motivo=rol&accion=expedientes');
}

export async function createCase(formData: FormData) {
  const { user, profile } = await getUserProfile();

  if (!user) redirect('/login');
  if (!profile) redirect('/onboarding');

  if (!isUserRole(profile.role) || !canCreateCase(profile.role)) {
    denyCaseAction();
  }

  const title = String(formData.get('title') || '').trim();
  const clientName = String(formData.get('client_name') || '').trim();
  const caseType = String(formData.get('case_type') || 'general');

  if (!title) {
    redirect('/expedientes/nuevo?error=missing_title');
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from('cases')
    .insert({
      organization_id: profile.organization_id,
      title,
      client_name: clientName || null,
      case_type: caseType,
      status: 'new',
      assigned_to: user.id,
      created_by: user.id,
    })
    .select('id')
    .single();

  if (error || !data) {
    console.error('Create case error:', error);
    redirect('/expedientes/nuevo?error=create_failed');
  }

  await createAuditLog({
    organizationId: profile.organization_id,
    userId: user.id,
    action: 'case_created',
    resourceType: 'case',
    resourceId: data.id,
    metadata: {
      title,
      case_type: caseType,
    },
  });

  revalidatePath('/dashboard');
  revalidatePath('/expedientes');

  redirect(`/expedientes/${data.id}`);
}

export async function updateCaseStatus(formData: FormData) {
  const { user, profile } = await getUserProfile();

  if (!user) redirect('/login');
  if (!profile) redirect('/onboarding');

  if (!isUserRole(profile.role) || !canUpdateCase(profile.role)) {
    denyCaseAction();
  }

  const caseId = String(formData.get('case_id') || '');
  const status = String(formData.get('status') || 'new');

  if (!caseId) {
    redirect('/expedientes');
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from('cases')
    .update({ status })
    .eq('id', caseId)
    .eq('organization_id', profile.organization_id);

  if (!error) {
    await createAuditLog({
      organizationId: profile.organization_id,
      userId: user.id,
      action: 'case_status_updated',
      resourceType: 'case',
      resourceId: caseId,
      metadata: { status },
    });
  }

  revalidatePath('/dashboard');
  revalidatePath('/expedientes');
  revalidatePath(`/expedientes/${caseId}`);
}
