import { NextResponse } from 'next/server';
import {
  validateInvitation,
  getSafeValue,
  type InvitationForAccept,
} from '@/lib/invitations/validateInvitation';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

function buildRedirectUrl(
  request: Request,
  email: string | null,
  token: string | null,
  estado: string
) {
  const redirectUrl = new URL('/invitacion/aceptar', request.url);

  if (email) redirectUrl.searchParams.set('email', email);
  if (token) redirectUrl.searchParams.set('token', token);
  redirectUrl.searchParams.set('estado', estado);

  return redirectUrl;
}

function normalizeEmail(email?: string | null) {
  return email?.trim().toLowerCase() ?? null;
}

async function rollbackNewUser(
  admin: NonNullable<ReturnType<typeof createAdminClient>>,
  userId: string,
  removeProfile = false
) {
  if (removeProfile) {
    const { error } = await admin.from('profiles').delete().eq('id', userId);
    if (error) console.error('Invitation rollback profile error:', error);
  }

  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) console.error('Invitation rollback auth error:', error);
}

async function acceptInvitationForUser(
  admin: NonNullable<ReturnType<typeof createAdminClient>>,
  invitation: InvitationForAccept,
  userId: string,
  fullName: string,
  isNewUser: boolean
) {
  const { data: duplicateProfiles, error: duplicateError } = await admin
    .from('profiles')
    .select('id')
    .ilike('email', invitation.email)
    .neq('id', userId)
    .limit(1);

  if (duplicateError) return 'error_validando_duplicados';
  if ((duplicateProfiles?.length ?? 0) > 0) return 'perfil_email_existente';

  const { data: existingProfile, error: profileLookupError } = await admin
    .from('profiles')
    .select('id, organization_id')
    .eq('id', userId)
    .maybeSingle();

  if (profileLookupError) return 'error_perfil';

  if (
    existingProfile?.organization_id &&
    existingProfile.organization_id !== invitation.organization_id
  ) {
    return 'perfil_otra_organizacion';
  }

  if (existingProfile) {
    const { error } = await admin
      .from('profiles')
      .update({
        email: invitation.email,
        role: invitation.role,
        status: 'active',
      })
      .eq('id', userId)
      .eq('organization_id', invitation.organization_id);

    if (error) return 'error_actualizando_perfil';
  } else {
    const { error } = await admin.from('profiles').insert({
      id: userId,
      organization_id: invitation.organization_id,
      full_name: fullName,
      email: invitation.email,
      role: invitation.role,
      status: 'active',
    });

    if (error) return 'error_creando_perfil';
  }

  const { data: acceptedInvitation, error: invitationError } = await admin
    .from('user_invitations')
    .update({
      status: 'accepted',
      accepted_by: userId,
      accepted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', invitation.id)
    .eq('organization_id', invitation.organization_id)
    .eq('status', 'pending')
    .select('id')
    .maybeSingle();

  if (invitationError || !acceptedInvitation) {
    if (!existingProfile) {
      await admin.from('profiles').delete().eq('id', userId);
    }
    return 'perfil_creado_invitacion_no_actualizada';
  }

  if (isNewUser) {
    await admin.from('audit_logs').insert({
      organization_id: invitation.organization_id,
      user_id: userId,
      action: 'invitation_accepted_account_created',
      resource_type: 'user_invitation',
      resource_id: invitation.id,
      metadata: { role: invitation.role },
    });
  }

  return null;
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = getSafeValue(formData.get('email')?.toString());
  const token = getSafeValue(formData.get('token')?.toString());
  const fullName = getSafeValue(formData.get('full_name')?.toString());
  const password = formData.get('password')?.toString() ?? '';
  const confirmPassword = formData.get('confirm_password')?.toString() ?? '';

  const validation = await validateInvitation(email, token);

  if (!validation.canAccept || !validation.invitation) {
    return NextResponse.redirect(
      buildRedirectUrl(request, email, token, 'invitacion_invalida')
    );
  }

  const invitation = validation.invitation;
  const invitedEmail = normalizeEmail(invitation.email);
  const supabaseAuth = await createClient();
  const {
    data: { user },
  } = await supabaseAuth.auth.getUser();
  const admin = createAdminClient();

  if (!admin) {
    return NextResponse.redirect(
      buildRedirectUrl(request, email, token, 'configuracion_pendiente')
    );
  }

  const { data: organization, error: organizationError } = await admin
    .from('organizations')
    .select('id')
    .eq('id', invitation.organization_id)
    .maybeSingle();

  if (organizationError || !organization) {
    return NextResponse.redirect(
      buildRedirectUrl(request, email, token, 'organizacion_no_encontrada')
    );
  }

  if (user) {
    if (!invitedEmail || normalizeEmail(user.email) !== invitedEmail) {
      return NextResponse.redirect(
        buildRedirectUrl(request, email, token, 'email_no_coincide')
      );
    }

    const acceptanceError = await acceptInvitationForUser(
      admin,
      invitation,
      user.id,
      user.user_metadata?.full_name || invitedEmail,
      false
    );

    if (acceptanceError) {
      return NextResponse.redirect(
        buildRedirectUrl(request, email, token, acceptanceError)
      );
    }

    return NextResponse.redirect(new URL('/dashboard?invitacion=aceptada', request.url));
  }

  if (!fullName || fullName.length < 2 || fullName.length > 120) {
    return NextResponse.redirect(
      buildRedirectUrl(request, email, token, 'nombre_invalido')
    );
  }

  if (password.length < 8) {
    return NextResponse.redirect(
      buildRedirectUrl(request, email, token, 'password_corta')
    );
  }

  if (password !== confirmPassword) {
    return NextResponse.redirect(
      buildRedirectUrl(request, email, token, 'passwords_no_coinciden')
    );
  }

  const { data: authUsers, error: authLookupError } =
    await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });

  if (authLookupError) {
    return NextResponse.redirect(
      buildRedirectUrl(request, email, token, 'error_validando_cuenta')
    );
  }

  const authUserExists = authUsers.users.some(
    (authUser) => normalizeEmail(authUser.email) === invitedEmail
  );

  if (authUserExists) {
    return NextResponse.redirect(
      buildRedirectUrl(request, email, token, 'cuenta_existente')
    );
  }

  const { data: createdAuth, error: createAuthError } =
    await admin.auth.admin.createUser({
      email: invitation.email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });

  if (createAuthError || !createdAuth.user) {
    console.error('Invitation Auth account creation failed:', createAuthError);
    return NextResponse.redirect(
      buildRedirectUrl(request, email, token, 'error_creando_cuenta')
    );
  }

  const acceptanceError = await acceptInvitationForUser(
    admin,
    invitation,
    createdAuth.user.id,
    fullName,
    true
  );

  if (acceptanceError) {
    await rollbackNewUser(admin, createdAuth.user.id, false);
    return NextResponse.redirect(
      buildRedirectUrl(request, email, token, acceptanceError)
    );
  }

  const { error: signInError } = await supabaseAuth.auth.signInWithPassword({
    email: invitation.email,
    password,
  });

  if (signInError) {
    console.error('Invitation account sign-in failed:', signInError);
    return NextResponse.redirect(
      buildRedirectUrl(request, email, token, 'cuenta_creada_login_pendiente')
    );
  }

  return NextResponse.redirect(new URL('/dashboard?invitacion=aceptada', request.url));
}
