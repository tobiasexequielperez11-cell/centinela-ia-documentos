'use server';

import { randomUUID } from 'node:crypto';
import { redirect } from 'next/navigation';
import { requirePlatformOwner } from '@/lib/platform/requirePlatformOwner';
import { sendInvitationEmail } from '@/lib/email/sendInvitationEmail';

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function createClientOrganization(formData: FormData) {
  const organizationName = String(formData.get('organization_name') || '').trim();
  const adminEmail = normalizeEmail(String(formData.get('admin_email') || ''));

  if (!organizationName || !adminEmail) {
    redirect('/plataforma?error=missing_fields');
  }

  if (organizationName.length > 160 || !isValidEmail(adminEmail)) {
    redirect('/plataforma?error=invalid_fields');
  }

  const { user, admin } = await requirePlatformOwner();

  const [{ data: existingProfiles }, { data: existingInvitations }] =
    await Promise.all([
      admin.from('profiles').select('id').ilike('email', adminEmail).limit(1),
      admin
        .from('user_invitations')
        .select('id')
        .ilike('email', adminEmail)
        .in('status', ['pending', 'accepted'])
        .limit(1),
    ]);

  if ((existingProfiles?.length ?? 0) > 0) {
    redirect('/plataforma?error=email_already_registered');
  }

  if ((existingInvitations?.length ?? 0) > 0) {
    redirect('/plataforma?error=invitation_already_exists');
  }

  const invitationToken = randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await admin
    .rpc('platform_create_organization_with_admin_invitation', {
      organization_name: organizationName,
      administrator_email: adminEmail,
      platform_owner_id: user.id,
      invitation_token_value: invitationToken,
      invitation_expires_at: expiresAt,
    })
    .single();

  if (error || !data) {
    console.error('Platform organization creation failed:', error);
    redirect('/plataforma?error=create_failed');
  }

  const result = data as { invitation_id: string };
  const appUrl =
    process.env.APP_URL?.trim() || 'https://centinela-ia-documentos.vercel.app';
  const invitationUrl = new URL('/invitacion/aceptar', appUrl);
  invitationUrl.searchParams.set('email', adminEmail);
  invitationUrl.searchParams.set('token', invitationToken);

  await sendInvitationEmail({
    to: adminEmail,
    invitationUrl: invitationUrl.toString(),
  });

  redirect(
    `/plataforma?success=organization_created&invitation=${encodeURIComponent(result.invitation_id)}`
  );
}
