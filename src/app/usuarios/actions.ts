'use server';

import { randomUUID } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getUserProfile } from '@/lib/auth/getUserProfile';
import { createAuditLog } from '@/lib/audit/createAuditLog';
import { sendInvitationEmail } from '@/lib/email/sendInvitationEmail';
import {
  canManageUsers,
  canOrgAdminAssignRole,
  isUserRole,
} from '@/lib/permissions/roles';

const VALID_STATUSES = ['active', 'inactive', 'invited'];

function cleanValue(value: FormDataEntryValue | null) {
  return String(value ?? '').trim();
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function updateUserAccess(formData: FormData) {
  const targetUserId = cleanValue(formData.get('user_id'));
  const newRole = cleanValue(formData.get('role'));
  const newStatus = cleanValue(formData.get('status'));

  if (!targetUserId || !newRole || !newStatus) {
    redirect('/usuarios?error=missing_fields');
  }

  if (!isUserRole(newRole)) {
    redirect('/usuarios?error=invalid_role');
  }

  if (!VALID_STATUSES.includes(newStatus)) {
    redirect('/usuarios?error=invalid_status');
  }

  const { user, profile } = await getUserProfile();

  if (!user) redirect('/login');
  if (!profile) redirect('/onboarding');

  if (!isUserRole(profile.role) || !canManageUsers(profile.role)) {
    redirect('/usuarios?error=admin_required');
  }

  if (newRole === 'admin') {
    redirect('/usuarios?error=admin_role_platform_only');
  }

  const supabase = await createClient();

  const { data: targetProfile, error: targetError } = await supabase
    .from('profiles')
    .select('id, organization_id, full_name, email, role, status')
    .eq('id', targetUserId)
    .eq('organization_id', profile.organization_id)
    .single();

  if (targetError || !targetProfile) {
    console.error('Target profile error:', targetError);
    redirect('/usuarios?error=user_not_found');
  }

  if (targetProfile.id === user.id) {
    redirect('/usuarios?error=self_change_blocked');
  }

  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      role: newRole,
      status: newStatus,
      updated_at: new Date().toISOString(),
    })
    .eq('id', targetProfile.id)
    .eq('organization_id', profile.organization_id);

  if (updateError) {
    console.error('Update user access error:', updateError);
    redirect('/usuarios?error=update_failed');
  }

  await createAuditLog({
    organizationId: profile.organization_id,
    userId: user.id,
    action: 'user_access_updated',
    resourceType: 'user',
    resourceId: targetProfile.id,
    metadata: {
      target_email: targetProfile.email,
      previous_role: targetProfile.role,
      new_role: newRole,
      previous_status: targetProfile.status,
      new_status: newStatus,
    },
  });

  revalidatePath('/usuarios');
  revalidatePath('/reportes');
  revalidatePath('/reportes?vista=auditoria');

  redirect('/usuarios?success=access_updated');
}

export async function createUserInvitation(formData: FormData) {
  const rawEmail = cleanValue(formData.get('email'));
  const email = normalizeEmail(rawEmail);
  const role = cleanValue(formData.get('role')) || 'employee';

  if (!email || !role) {
    redirect('/usuarios/invitaciones?error=missing_fields');
  }

  if (!isValidEmail(email)) {
    redirect('/usuarios/invitaciones?error=invalid_email');
  }

  if (!isUserRole(role)) {
    redirect('/usuarios/invitaciones?error=invalid_role');
  }

  const { user, profile } = await getUserProfile();

  if (!user) redirect('/login');
  if (!profile) redirect('/onboarding');

  if (!isUserRole(profile.role) || !canManageUsers(profile.role)) {
    redirect('/usuarios/invitaciones?error=admin_required');
  }

  if (!canOrgAdminAssignRole(role)) {
    redirect('/usuarios/invitaciones?error=admin_role_platform_only');
  }

  const supabase = await createClient();

  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id, email')
    .eq('organization_id', profile.organization_id)
    .eq('email', email)
    .maybeSingle();

  if (existingProfile) {
    redirect('/usuarios/invitaciones?error=user_already_exists');
  }

  const { data: existingInvitation } = await supabase
    .from('user_invitations')
    .select('id, email, status')
    .eq('organization_id', profile.organization_id)
    .eq('email', email)
    .eq('status', 'pending')
    .maybeSingle();

  if (existingInvitation) {
    redirect('/usuarios/invitaciones?error=invitation_already_pending');
  }
  const { data: acceptedInvitation } = await supabase
    .from('user_invitations')
    .select('id, email, status')
    .eq('organization_id', profile.organization_id)
    .eq('email', email)
    .eq('status', 'accepted')
    .maybeSingle();

  if (acceptedInvitation) {
    redirect('/usuarios/invitaciones?error=invitation_already_accepted');
  }
  const token = randomUUID();

  const { data: invitation, error: insertError } = await supabase
    .from('user_invitations')
    .insert({
      organization_id: profile.organization_id,
      email,
      role,
      status: 'pending',
      invitation_token: token,
      invited_by: user.id,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select('id, email, role, status')
    .single();

  if (insertError || !invitation) {
    console.error('Create invitation error:', insertError);
    redirect('/usuarios/invitaciones?error=invitation_create_failed');
  }

  const appUrl =
    process.env.APP_URL?.trim() || 'https://centinela-ia-documentos.vercel.app';
  const invitationUrl = new URL('/invitacion/aceptar', appUrl);
  invitationUrl.searchParams.set('email', invitation.email);
  invitationUrl.searchParams.set('token', token);

  await sendInvitationEmail({
    to: invitation.email,
    invitationUrl: invitationUrl.toString(),
  });

  await createAuditLog({
    organizationId: profile.organization_id,
    userId: user.id,
    action: 'user_invitation_created',
    resourceType: 'user_invitation',
    resourceId: invitation.id,
    metadata: {
      target_email: invitation.email,
      role: invitation.role,
      status: invitation.status,
      mode: 'manual_internal_invitation',
    },
  });

  revalidatePath('/usuarios');
  revalidatePath('/usuarios/invitaciones');
  revalidatePath('/reportes');
  revalidatePath('/reportes?vista=auditoria');

  redirect('/usuarios/invitaciones?success=invitation_created');
}

export async function cancelUserInvitation(formData: FormData) {
  const invitationId = cleanValue(formData.get('invitation_id'));

  if (!invitationId) {
    redirect('/usuarios/invitaciones?error=missing_invitation');
  }

  const { user, profile } = await getUserProfile();

  if (!user) redirect('/login');
  if (!profile) redirect('/onboarding');

  if (!isUserRole(profile.role) || !canManageUsers(profile.role)) {
    redirect('/usuarios/invitaciones?error=admin_required');
  }

  const supabase = await createClient();

  const { data: invitation, error: invitationError } = await supabase
    .from('user_invitations')
    .select('id, organization_id, email, role, status')
    .eq('id', invitationId)
    .eq('organization_id', profile.organization_id)
    .single();

  if (invitationError || !invitation) {
    console.error('Invitation lookup error:', invitationError);
    redirect('/usuarios/invitaciones?error=invitation_not_found');
  }

  if (invitation.status !== 'pending') {
    redirect('/usuarios/invitaciones?error=invitation_not_pending');
  }

  const { error: updateError } = await supabase
    .from('user_invitations')
    .update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', invitation.id)
    .eq('organization_id', profile.organization_id);

  if (updateError) {
    console.error('Cancel invitation error:', updateError);
    redirect('/usuarios/invitaciones?error=cancel_failed');
  }

  await createAuditLog({
    organizationId: profile.organization_id,
    userId: user.id,
    action: 'user_invitation_cancelled',
    resourceType: 'user_invitation',
    resourceId: invitation.id,
    metadata: {
      target_email: invitation.email,
      role: invitation.role,
      previous_status: invitation.status,
      new_status: 'cancelled',
    },
  });

  revalidatePath('/usuarios');
  revalidatePath('/usuarios/invitaciones');
  revalidatePath('/reportes');
  revalidatePath('/reportes?vista=auditoria');

  redirect('/usuarios/invitaciones?success=invitation_cancelled');
}
