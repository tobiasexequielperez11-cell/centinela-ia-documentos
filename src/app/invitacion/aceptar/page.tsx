import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';

interface AcceptInvitationPageProps {
  searchParams: Promise<{
    email?: string;
    token?: string;
    estado?: string;
  }>;
}

type ValidationTone = 'success' | 'warning' | 'danger' | 'default';

interface ValidationResult {
  title: string;
  message: string;
  tone: ValidationTone;
  emailLabel: string;
  tokenLabel: string;
  statusLabel: string;
  roleLabel: string;
  expiresLabel: string;
  organizationLabel: string;
}

type InvitationRecord = Record<string, unknown>;

function getSafeValue(value?: string) {
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

function getToneClasses(tone: ValidationTone) {
  if (tone === 'success') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-900';
  }

  if (tone === 'warning') {
    return 'border-amber-200 bg-amber-50 text-amber-900';
  }

  if (tone === 'danger') {
    return 'border-rose-200 bg-rose-50 text-rose-900';
  }

  return 'border-slate-200 bg-slate-50 text-slate-700';
}

function getStatusPillClasses(tone: ValidationTone) {
  if (tone === 'success') {
    return 'bg-emerald-50 text-emerald-700';
  }

  if (tone === 'warning') {
    return 'bg-amber-50 text-amber-700';
  }

  if (tone === 'danger') {
    return 'bg-rose-50 text-rose-700';
  }

  return 'bg-slate-100 text-slate-700';
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

async function validateInvitation(
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
    };
  }

  const tableHasToken = invitations.some((invitation) => 'token' in invitation);

  if (!tableHasToken) {
    const latestInvitation = invitations[0];

    return {
      title: 'Invitación encontrada, pero falta token en tabla',
      message:
        'Se encontró una invitación para el email, pero la tabla user_invitations no expone una columna token. La validación real de token queda pendiente para el siguiente ajuste de base de datos.',
      tone: 'warning',
      emailLabel: getStringValue(latestInvitation, 'email') ?? email,
      tokenLabel: 'Token recibido por URL, pero no existe columna token',
      statusLabel: getStringValue(latestInvitation, 'status') ?? 'No informado',
      roleLabel: getStringValue(latestInvitation, 'role') ?? 'No informado',
      expiresLabel: getDateLabel(getStringValue(latestInvitation, 'expires_at')),
      organizationLabel: maskOrganizationId(
        getStringValue(latestInvitation, 'organization_id')
      ),
    };
  }

  const matchingInvitation = invitations.find((invitation) => {
    const invitationToken = getStringValue(invitation, 'token');

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
    };
  }

  const status = getStringValue(matchingInvitation, 'status');
  const role = getStringValue(matchingInvitation, 'role');
  const expiresAt = getStringValue(matchingInvitation, 'expires_at');
  const organizationId = getStringValue(matchingInvitation, 'organization_id');

  if (status !== 'pending') {
    return {
      title: 'Invitación no disponible',
      message:
        'La invitación existe, pero ya no está en estado pending. Puede haber sido aceptada, cancelada o vencida.',
      tone: 'warning',
      emailLabel: getStringValue(matchingInvitation, 'email') ?? email,
      tokenLabel: 'Token válido',
      statusLabel: status ?? 'No informado',
      roleLabel: role ?? 'No informado',
      expiresLabel: getDateLabel(expiresAt),
      organizationLabel: maskOrganizationId(organizationId),
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
      roleLabel: role ?? 'No informado',
      expiresLabel: getDateLabel(expiresAt),
      organizationLabel: maskOrganizationId(organizationId),
    };
  }

  return {
    title: 'Invitación válida',
    message:
      'La invitación existe, el token coincide, el estado es pending y no está vencida. En el próximo bloque podremos preparar el alta real de usuario.',
    tone: 'success',
    emailLabel: getStringValue(matchingInvitation, 'email') ?? email,
    tokenLabel: 'Token válido',
    statusLabel: status,
    roleLabel: role ?? 'No informado',
    expiresLabel: getDateLabel(expiresAt),
    organizationLabel: maskOrganizationId(organizationId),
  };
}

export default async function AcceptInvitationPage({
  searchParams,
}: AcceptInvitationPageProps) {
  const params = await searchParams;

  const email = getSafeValue(params.email);
  const token = getSafeValue(params.token);

  const validation = await validateInvitation(email, token);

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-6xl items-center justify-center">
        <section className="grid w-full gap-6 lg:grid-cols-[1fr_0.9fr]">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 shadow-2xl">
            <p className="text-xs font-black uppercase tracking-[0.35em] text-sky-300">
              Centinela IA Documentos
            </p>

            <h1 className="mt-5 max-w-2xl text-4xl font-black tracking-tight md:text-5xl">
              Validar invitación
            </h1>

            <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-300">
              Esta pantalla consulta una invitación registrada en Supabase y
              valida si el enlace recibido contiene datos suficientes para
              continuar. Todavía no crea usuarios ni modifica estados.
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-5">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-sky-300">
                  Paso 1
                </p>
                <p className="mt-3 text-sm font-bold leading-6">
                  Recibir email y token desde la URL.
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-5">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-sky-300">
                  Paso 2
                </p>
                <p className="mt-3 text-sm font-bold leading-6">
                  Consultar user_invitations en Supabase.
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-5">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-sky-300">
                  Paso 3
                </p>
                <p className="mt-3 text-sm font-bold leading-6">
                  Validar estado, rol, token y vencimiento.
                </p>
              </div>
            </div>

            <div className="mt-8 rounded-3xl border border-amber-400/20 bg-amber-400/10 p-5 text-sm leading-7 text-amber-100">
              <p className="font-black">Estado del bloque actual</p>
              <p className="mt-2">
                Esta página valida una invitación, pero todavía no crea usuarios,
                no cambia estados y no modifica datos de Supabase.
              </p>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white p-8 text-slate-950 shadow-2xl">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.28em] text-sky-600">
                    Validación de invitación
                  </p>

                  <h2 className="mt-4 text-2xl font-black tracking-tight">
                    {validation.title}
                  </h2>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.16em] ${getStatusPillClasses(
                    validation.tone
                  )}`}
                >
                  {validation.tone === 'success'
                    ? 'Válida'
                    : validation.tone === 'danger'
                      ? 'Bloqueada'
                      : 'Revisar'}
                </span>
              </div>

              <p className="mt-4 text-sm leading-6 text-slate-600">
                {validation.message}
              </p>

              <div className="mt-6 space-y-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                    Email
                  </p>
                  <p className="mt-2 break-all text-sm font-bold text-slate-900">
                    {validation.emailLabel}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                    Token
                  </p>
                  <p className="mt-2 break-all text-sm font-bold text-slate-900">
                    {validation.tokenLabel}
                  </p>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                      Estado
                    </p>
                    <p className="mt-2 text-sm font-bold text-slate-900">
                      {validation.statusLabel}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                      Rol
                    </p>
                    <p className="mt-2 text-sm font-bold text-slate-900">
                      {validation.roleLabel}
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                      Vencimiento
                    </p>
                    <p className="mt-2 text-sm font-bold text-slate-900">
                      {validation.expiresLabel}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                      Organización
                    </p>
                    <p className="mt-2 break-all text-sm font-bold text-slate-900">
                      {validation.organizationLabel}
                    </p>
                  </div>
                </div>
              </div>

              <div
                className={`mt-6 rounded-2xl border p-4 text-sm leading-6 ${getToneClasses(
                  validation.tone
                )}`}
              >
                {validation.tone === 'success'
                  ? 'La invitación está lista para el próximo paso del flujo.'
                  : 'La invitación todavía no puede continuar al alta de usuario.'}
              </div>

              <div className="mt-6 flex flex-col gap-3">
                <Link
                  href="/login"
                  className="rounded-2xl bg-slate-950 px-5 py-3 text-center text-sm font-black text-white hover:bg-slate-800"
                >
                  Ir al login
                </Link>

                <Link
                  href="/"
                  className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-center text-sm font-black text-slate-700 hover:bg-slate-50"
                >
                  Volver al inicio
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}