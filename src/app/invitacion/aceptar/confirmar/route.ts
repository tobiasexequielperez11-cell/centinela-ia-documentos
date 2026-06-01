import { NextResponse } from 'next/server';
import {
  validateInvitation,
  getSafeValue,
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

  if (email) {
    redirectUrl.searchParams.set('email', email);
  }

  if (token) {
    redirectUrl.searchParams.set('token', token);
  }

  redirectUrl.searchParams.set('estado', estado);

  return redirectUrl;
}

function normalizeEmail(email?: string | null) {
  if (!email) {
    return null;
  }

  return email.trim().toLowerCase();
}

function getFullNameFromEmail(email: string) {
  const localPart = email.split('@')[0] ?? 'Usuario invitado';

  return localPart
    .replace(/[._-]+/g, ' ')
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export async function POST(request: Request) {
  const formData = await request.formData();

  const email = getSafeValue(formData.get('email')?.toString());
  const token = getSafeValue(formData.get('token')?.toString());

  const validation = await validateInvitation(email, token);

  if (!validation.canAccept || !validation.invitation) {
    return NextResponse.redirect(
      buildRedirectUrl(request, email, token, 'invitacion_invalida')
    );
  }

  const supabaseAuth = await createClient();
  const {
    data: { user },
  } = await supabaseAuth.auth.getUser();

  if (!user) {
    return NextResponse.redirect(
      buildRedirectUrl(request, email, token, 'login_requerido')
    );
  }

  const invitedEmail = normalizeEmail(validation.invitation.email);
  const userEmail = normalizeEmail(user.email);

  if (!invitedEmail || !userEmail || invitedEmail !== userEmail) {
    return NextResponse.redirect(
      buildRedirectUrl(request, email, token, 'email_no_coincide')
    );
  }

  const supabaseAdmin = createAdminClient();

  if (!supabaseAdmin) {
    return NextResponse.redirect(
      buildRedirectUrl(request, email, token, 'configuracion_pendiente')
    );
  }

  const { data: existingProfile, error: existingProfileError } =
    await supabaseAdmin
      .from('profiles')
      .select('id, organization_id, email, role, status')
      .eq('id', user.id)
      .maybeSingle();

  if (existingProfileError) {
    return NextResponse.redirect(
      buildRedirectUrl(request, email, token, 'error_perfil')
    );
  }

  if (
    existingProfile?.organization_id &&
    existingProfile.organization_id !== validation.invitation.organization_id
  ) {
    return NextResponse.redirect(
      buildRedirectUrl(request, email, token, 'perfil_otra_organizacion')
    );
  }

  if (existingProfile) {
    const { error: updateProfileError } = await supabaseAdmin
      .from('profiles')
      .update({
        organization_id: validation.invitation.organization_id,
        email: validation.invitation.email,
        role: validation.invitation.role,
        status: 'active',
      })
      .eq('id', user.id);

    if (updateProfileError) {
      return NextResponse.redirect(
        buildRedirectUrl(request, email, token, 'error_actualizando_perfil')
      );
    }
  } else {
    const { error: insertProfileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: user.id,
        organization_id: validation.invitation.organization_id,
        full_name: getFullNameFromEmail(validation.invitation.email),
        email: validation.invitation.email,
        role: validation.invitation.role,
        status: 'active',
      });

    if (insertProfileError) {
      return NextResponse.redirect(
        buildRedirectUrl(request, email, token, 'error_creando_perfil')
      );
    }
  }

  const { error: updateInvitationError } = await supabaseAdmin
    .from('user_invitations')
    .update({
      status: 'accepted',
      accepted_at: new Date().toISOString(),
    })
    .eq('id', validation.invitation.id);

  if (updateInvitationError) {
    return NextResponse.redirect(
      buildRedirectUrl(
        request,
        email,
        token,
        'perfil_creado_invitacion_no_actualizada'
      )
    );
  }

  const dashboardUrl = new URL('/dashboard', request.url);
  dashboardUrl.searchParams.set('invitacion', 'aceptada');

  return NextResponse.redirect(dashboardUrl);
}