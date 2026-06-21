import 'server-only';

import { createAdminClient } from '@/lib/supabase/admin';

export type ValidationTone = 'success' | 'warning' | 'danger' | 'default';

export interface InvitationForAccept {
  id: string;
  email: string;
  role: string;
  organization_id: string;
  status: string;
  expires_at: string | null;
}

export interface ValidationResult {
  title: string;
  message: string;
  tone: ValidationTone;
  emailLabel: string;
  tokenLabel: string;
  statusLabel: string;
  roleLabel: string;
  expiresLabel: string;
  organizationLabel: string;
  canAccept: boolean;
  invitation: InvitationForAccept | null;
}

type InvitationRecord = Record<string, unknown>;

const allowedRoles = ['admin', 'employee', 'auditor', 'client'];

export function getSafeValue(value?: string | null) {
  if (!value) {
    return null;
  }

  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return null;
  }

  return trimmedValue;
}

function getStringValue(record: InvitationRecord, key: string) {
  const value = record[key];

  if (typeof value !== 'string') {
    return null;
  }

  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return null;
  }

  return trimmedValue;
}

function getDateLabel(value: string | null) {
  if (!value) {
    return 'Sin vencimiento informado';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Fecha inválida';
  }

  return date.toLocaleString('es-AR', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

function isExpired(value: string | null) {
  if (!value) {
    return false;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return true;
  }

  return date.getTime() < Date.now();
}

function maskOrganizationId(value: string | null) {
  if (!value) {
    return 'No informado';
  }

  if (value.length <= 8) {
    return value;
  }

  return `${value.slice(0, 8)}...`;
}

function buildInvitationForAccept(
  record: InvitationRecord
): InvitationForAccept | null {
  const id = getStringValue(record, 'id');
  const email = getStringValue(record, 'email');
  const role = getStringValue(record, 'role');
  const organizationId = getStringValue(record, 'organization_id');
  const status = getStringValue(record, 'status');
  const expiresAt = getStringValue(record, 'expires_at');

  if (!id || !email || !role || !organizationId || !status) {
    return null;
  }

  return {
    id,
    email,
    role,
    organization_id: organizationId,
    status,
    expires_at: expiresAt,
  };
}

export async function validateInvitation(
  email: string | null,
  token: string | null
): Promise<ValidationResult> {
  if (!email || !token) {
    return {
      title: 'Datos incompletos',
      message:
        'La URL debe incluir email y token para poder validar una invitación real.',
      tone: 'warning',
      emailLabel: email ?? 'No informado en la URL',
      tokenLabel: token ? 'Token recibido por URL' : 'No informado en la URL',
      statusLabel: 'Pendiente de validación',
      roleLabel: 'No informado',
      expiresLabel: 'No informado',
      organizationLabel: 'No informado',
      canAccept: false,
      invitation: null,
    };
  }

  const supabase = createAdminClient();

  if (!supabase) {
    return {
      title: 'Configuración pendiente',
      message:
        'No se encontró SUPABASE_SERVICE_ROLE_KEY en el entorno del servidor. La página está creada, pero todavía no puede consultar invitaciones reales.',
      tone: 'warning',
      emailLabel: email,
      tokenLabel: 'Token recibido por URL',
      statusLabel: 'No consultado',
      roleLabel: 'No consultado',
      expiresLabel: 'No consultado',
      organizationLabel: 'No consultado',
      canAccept: false,
      invitation: null,
    };
  }

  const { data, error } = await supabase
    .from('user_invitations')
    .select('*')
    .ilike('email', email)
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    return {
      title: 'No se pudo consultar la invitación',
      message:
        'Supabase respondió con error al intentar validar la invitación. Revisar variables de entorno, RLS o estructura de user_invitations.',
      tone: 'danger',
      emailLabel: email,
      tokenLabel: 'Token recibido por URL',
      statusLabel: 'Error de consulta',
      roleLabel: 'No disponible',
      expiresLabel: 'No disponible',
      organizationLabel: 'No disponible',
      canAccept: false,
      invitation: null,
    };
  }

  const invitations = (data ?? []) as InvitationRecord[];

  if (invitations.length === 0) {
    return {
      title: 'Invitación no encontrada',
      message:
        'No existe una invitación registrada para este email. Verificá que el enlace sea correcto o que la invitación haya sido generada.',
      tone: 'danger',
      emailLabel: email,
      tokenLabel: 'Token recibido por URL',
      statusLabel: 'No encontrada',
      roleLabel: 'No disponible',
      expiresLabel: 'No disponible',
      organizationLabel: 'No disponible',
      canAccept: false,
      invitation: null,
    };
  }

  const tableHasToken = invitations.some(
    (invitation) => 'invitation_token' in invitation || 'token' in invitation
  );

  if (!tableHasToken) {
    const latestInvitation = invitations[0];

    return {
      title: 'Invitación encontrada, pero falta token en tabla',
      message:
        'Se encontró una invitación para el email, pero la tabla user_invitations no expone una columna de token. Para crear perfiles automáticamente hace falta validar un token real.',
      tone: 'warning',
      emailLabel: getStringValue(latestInvitation, 'email') ?? email,
      tokenLabel: 'Token recibido por URL, pero no existe columna de token',
      statusLabel: getStringValue(latestInvitation, 'status') ?? 'No informado',
      roleLabel: getStringValue(latestInvitation, 'role') ?? 'No informado',
      expiresLabel: getDateLabel(getStringValue(latestInvitation, 'expires_at')),
      organizationLabel: maskOrganizationId(
        getStringValue(latestInvitation, 'organization_id')
      ),
      canAccept: false,
      invitation: null,
    };
  }

  const matchingInvitation = invitations.find((invitation) => {
    const invitationToken =
      getStringValue(invitation, 'invitation_token') ??
      getStringValue(invitation, 'token');

    return invitationToken === token;
  });

  if (!matchingInvitation) {
    return {
      title: 'Token inválido',
      message:
        'Existe una invitación para este email, pero el token de la URL no coincide con la invitación registrada.',
      tone: 'danger',
      emailLabel: email,
      tokenLabel: 'Token recibido, pero no coincide',
      statusLabel: 'Token inválido',
      roleLabel: 'No disponible',
      expiresLabel: 'No disponible',
      organizationLabel: 'No disponible',
      canAccept: false,
      invitation: null,
    };
  }

  const status = getStringValue(matchingInvitation, 'status');
  const role = getStringValue(matchingInvitation, 'role');
  const expiresAt = getStringValue(matchingInvitation, 'expires_at');
  const organizationId = getStringValue(matchingInvitation, 'organization_id');

  if (!role || !allowedRoles.includes(role)) {
    return {
      title: 'Rol inválido',
      message:
        'La invitación existe, pero el rol registrado no es válido para crear un perfil.',
      tone: 'danger',
      emailLabel: getStringValue(matchingInvitation, 'email') ?? email,
      tokenLabel: 'Token válido',
      statusLabel: status ?? 'No informado',
      roleLabel: role ?? 'No informado',
      expiresLabel: getDateLabel(expiresAt),
      organizationLabel: maskOrganizationId(organizationId),
      canAccept: false,
      invitation: null,
    };
  }

  if (!organizationId) {
    return {
      title: 'Organización no informada',
      message:
        'La invitación existe, pero no tiene organization_id. No se puede crear el perfil sin organización.',
      tone: 'danger',
      emailLabel: getStringValue(matchingInvitation, 'email') ?? email,
      tokenLabel: 'Token válido',
      statusLabel: status ?? 'No informado',
      roleLabel: role,
      expiresLabel: getDateLabel(expiresAt),
      organizationLabel: 'No informado',
      canAccept: false,
      invitation: null,
    };
  }

  const { data: organization, error: organizationError } = await supabase
    .from('organizations')
    .select('id')
    .eq('id', organizationId)
    .maybeSingle();

  if (organizationError || !organization) {
    return {
      title: 'Organización no encontrada',
      message:
        'La invitación tiene organization_id, pero no se encontró una organización válida asociada. No se puede aceptar la invitación.',
      tone: 'danger',
      emailLabel: getStringValue(matchingInvitation, 'email') ?? email,
      tokenLabel: 'Token válido',
      statusLabel: status ?? 'No informado',
      roleLabel: role,
      expiresLabel: getDateLabel(expiresAt),
      organizationLabel: maskOrganizationId(organizationId),
      canAccept: false,
      invitation: null,
    };
  }

  if (status !== 'pending') {
    return {
      title: 'Invitación no disponible',
      message:
        'La invitación existe, pero ya no está en estado pending. Puede haber sido aceptada, cancelada o vencida.',
      tone: 'warning',
      emailLabel: getStringValue(matchingInvitation, 'email') ?? email,
      tokenLabel: 'Token válido',
      statusLabel: status ?? 'No informado',
      roleLabel: role,
      expiresLabel: getDateLabel(expiresAt),
      organizationLabel: maskOrganizationId(organizationId),
      canAccept: false,
      invitation: null,
    };
  }

  if (isExpired(expiresAt)) {
    return {
      title: 'Invitación vencida',
      message:
        'La invitación existe y el token coincide, pero la fecha de vencimiento ya expiró.',
      tone: 'danger',
      emailLabel: getStringValue(matchingInvitation, 'email') ?? email,
      tokenLabel: 'Token válido',
      statusLabel: status,
      roleLabel: role,
      expiresLabel: getDateLabel(expiresAt),
      organizationLabel: maskOrganizationId(organizationId),
      canAccept: false,
      invitation: null,
    };
  }

  const invitationForAccept = buildInvitationForAccept(matchingInvitation);

  if (!invitationForAccept) {
    return {
      title: 'Invitación incompleta',
      message:
        'La invitación existe, pero faltan datos obligatorios para crear el perfil.',
      tone: 'danger',
      emailLabel: getStringValue(matchingInvitation, 'email') ?? email,
      tokenLabel: 'Token válido',
      statusLabel: status,
      roleLabel: role,
      expiresLabel: getDateLabel(expiresAt),
      organizationLabel: maskOrganizationId(organizationId),
      canAccept: false,
      invitation: null,
    };
  }

  return {
    title: 'Invitación válida',
    message:
      'La invitación existe, el token coincide, el estado es pending y no está vencida. Ya puede continuar al alta controlada de perfil.',
    tone: 'success',
    emailLabel: invitationForAccept.email,
    tokenLabel: 'Token válido',
    statusLabel: invitationForAccept.status,
    roleLabel: invitationForAccept.role,
    expiresLabel: getDateLabel(invitationForAccept.expires_at),
    organizationLabel: maskOrganizationId(invitationForAccept.organization_id),
    canAccept: true,
    invitation: invitationForAccept,
  };
}
