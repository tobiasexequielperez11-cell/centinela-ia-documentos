import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import {
  getSafeValue,
  validateInvitation,
  type ValidationTone,
} from '@/lib/invitations/validateInvitation';

interface AcceptInvitationPageProps {
  searchParams: Promise<{
    email?: string;
    token?: string;
    estado?: string;
  }>;
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

function getActionMessage(estado: string | null) {
  if (!estado) {
    return null;
  }

  const messages: Record<string, string> = {
    login_requerido:
      'Para aceptar la invitación, primero tenés que iniciar sesión con el mismo email invitado y luego volver a abrir este enlace.',
    email_no_coincide:
      'El email de la sesión actual no coincide con el email invitado. Cerrá sesión e ingresá con el correo correcto.',
    invitacion_invalida:
      'La invitación no se puede aceptar porque no pasó la validación.',
    configuracion_pendiente:
      'Falta configuración server-side para completar la aceptación.',
    error_perfil:
      'No se pudo revisar el perfil actual del usuario.',
    error_creando_perfil:
      'La invitación era válida, pero no se pudo crear el perfil.',
    error_actualizando_perfil:
      'La invitación era válida, pero no se pudo actualizar el perfil.',
    perfil_otra_organizacion:
      'El usuario ya tiene un perfil asociado a otra organización.',
    perfil_creado_invitacion_no_actualizada:
      'El perfil fue creado, pero no se pudo marcar la invitación como aceptada. Revisar manualmente.',
    organizacion_no_encontrada:
      'La invitación tiene organización asignada, pero esa organización no existe o no está disponible.',
    error_validando_duplicados:
      'No se pudo validar si ya existe otro perfil con este email.',
    perfil_email_existente:
      'Ya existe otro perfil registrado con este email. No se puede crear un usuario duplicado.',
  };

  return messages[estado] ?? 'No se pudo completar la acción solicitada.';
}

export default async function AcceptInvitationPage({
  searchParams,
}: AcceptInvitationPageProps) {
  const params = await searchParams;

  const email = getSafeValue(params.email);
  const token = getSafeValue(params.token);
  const estado = getSafeValue(params.estado);

  const validation = await validateInvitation(email, token);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const actionMessage = getActionMessage(estado);
  const userEmail = user?.email ?? null;
  const normalizedUserEmail = userEmail?.trim().toLowerCase() ?? null;
  const normalizedInvitationEmail =
    validation.invitation?.email.trim().toLowerCase() ?? null;

  const isLoggedWithMatchingEmail =
    Boolean(normalizedUserEmail) &&
    Boolean(normalizedInvitationEmail) &&
    normalizedUserEmail === normalizedInvitationEmail;

  const canShowAcceptButton = validation.canAccept && isLoggedWithMatchingEmail;

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
              Esta pantalla valida una invitación registrada en Supabase y, si
              corresponde, permite crear el perfil del usuario invitado de forma
              controlada. Todavía no crea cuentas Auth automáticamente.
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-5">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-sky-300">
                  Paso 1
                </p>
                <p className="mt-3 text-sm font-bold leading-6">
                  Validar email y token desde la URL.
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-5">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-sky-300">
                  Paso 2
                </p>
                <p className="mt-3 text-sm font-bold leading-6">
                  Confirmar sesión del usuario invitado.
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-5">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-sky-300">
                  Paso 3
                </p>
                <p className="mt-3 text-sm font-bold leading-6">
                  Crear profile y marcar invitación accepted.
                </p>
              </div>
            </div>

            <div className="mt-8 rounded-3xl border border-amber-400/20 bg-amber-400/10 p-5 text-sm leading-7 text-amber-100">
              <p className="font-black">Estado del bloque actual</p>
              <p className="mt-2">
                Esta página puede crear o vincular un perfil solamente cuando la
                invitación sea válida, el usuario esté logueado y el email de la
                sesión coincida con el email invitado.
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

              {actionMessage ? (
                <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold leading-6 text-amber-900">
                  {actionMessage}
                </div>
              ) : null}

              <div className="mt-6 space-y-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                    Email invitado
                  </p>
                  <p className="mt-2 break-all text-sm font-bold text-slate-900">
                    {validation.emailLabel}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                    Sesión actual
                  </p>
                  <p className="mt-2 break-all text-sm font-bold text-slate-900">
                    {userEmail ?? 'Sin sesión iniciada'}
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
                {validation.canAccept
                  ? 'La invitación es válida. Para crear el perfil, la sesión actual debe coincidir con el email invitado.'
                  : 'La invitación todavía no puede continuar al alta de usuario.'}
              </div>

              {validation.canAccept && !user ? (
                <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold leading-6 text-amber-900">
                  Para aceptar esta invitación, primero iniciá sesión con el
                  mismo correo invitado y después volvé a abrir este enlace.
                </div>
              ) : null}

              {validation.canAccept && user && !isLoggedWithMatchingEmail ? (
                <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-bold leading-6 text-rose-900">
                  La sesión actual no coincide con el email invitado. Cerrá
                  sesión e ingresá con el correo correcto.
                </div>
              ) : null}

              {canShowAcceptButton ? (
                <form
                  action="/invitacion/aceptar/confirmar"
                  method="post"
                  className="mt-6"
                >
                  <input type="hidden" name="email" value={email ?? ''} />
                  <input type="hidden" name="token" value={token ?? ''} />

                  <button
                    type="submit"
                    className="w-full rounded-2xl bg-emerald-600 px-5 py-3 text-center text-sm font-black text-white hover:bg-emerald-700"
                  >
                    Aceptar invitación y crear perfil
                  </button>
                </form>
              ) : null}

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