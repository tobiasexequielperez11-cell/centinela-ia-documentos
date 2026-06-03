import Link from 'next/link';
import { updateRecoveredPassword } from './actions';

interface NuevaContrasenaPageProps {
  searchParams: Promise<{
    estado?: string;
  }>;
}

function getStatusMessage(estado: string | null) {
  if (!estado) {
    return null;
  }

  const messages: Record<string, string> = {
    missing_fields: 'Completá la nueva contraseña y la confirmación.',
    password_too_short: 'La contraseña debe tener al menos 8 caracteres.',
    passwords_do_not_match: 'Las contraseñas ingresadas no coinciden.',
    session_required:
      'No hay una sesión válida de recuperación. Volvé a solicitar el enlace.',
    update_failed:
      'No se pudo actualizar la contraseña. Intentá nuevamente o solicitá otro enlace.',
    updated:
      'La contraseña fue actualizada correctamente. Ya podés volver al login.',
  };

  return messages[estado] ?? null;
}

export default async function NuevaContrasenaPage({
  searchParams,
}: NuevaContrasenaPageProps) {
  const params = await searchParams;
  const estado = params.estado?.trim() ?? null;
  const statusMessage = getStatusMessage(estado);

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <section className="mx-auto grid min-h-[calc(100vh-5rem)] w-full max-w-6xl items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 shadow-2xl lg:p-12">
          <p className="text-xs font-black uppercase tracking-[0.45em] text-sky-300">
            Centinela IA
          </p>

          <h1 className="mt-8 max-w-2xl text-4xl font-black tracking-tight text-white md:text-5xl">
            Nueva contraseña
          </h1>

          <p className="mt-6 max-w-2xl text-sm leading-7 text-slate-300">
            Esta pantalla permite definir una nueva contraseña después de abrir
            el enlace de recuperación enviado por email. Para completar el
            cambio, debe existir una sesión válida de recuperación.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-sky-300">
                Paso 1
              </p>
              <p className="mt-4 text-sm font-bold leading-6 text-white">
                Abrir el enlace recibido por email.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-sky-300">
                Paso 2
              </p>
              <p className="mt-4 text-sm font-bold leading-6 text-white">
                Ingresar y confirmar la nueva contraseña.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-sky-300">
                Paso 3
              </p>
              <p className="mt-4 text-sm font-bold leading-6 text-white">
                Volver al login con el nuevo acceso.
              </p>
            </div>
          </div>

          <div className="mt-8 rounded-3xl border border-amber-400/30 bg-amber-400/10 p-6">
            <p className="text-sm font-black text-amber-100">
              Estado del bloque actual
            </p>
            <p className="mt-3 text-sm leading-7 text-amber-50">
              La pantalla ya puede intentar actualizar la contraseña usando
              Supabase Auth. El cambio solo se completa si el usuario llega con
              una sesión válida de recuperación.
            </p>
          </div>
        </div>

        <div className="rounded-[2rem] bg-white p-8 text-slate-950 shadow-2xl lg:p-10">
          <p className="text-xs font-black uppercase tracking-[0.35em] text-sky-600">
            Restablecimiento
          </p>

          <h2 className="mt-5 text-2xl font-black">
            Definir nueva contraseña
          </h2>

          <p className="mt-4 text-sm leading-7 text-slate-600">
            Ingresá una contraseña nueva y confirmala. Debe tener al menos 8
            caracteres.
          </p>

          {statusMessage ? (
            <div className="mt-5 rounded-2xl border border-sky-200 bg-sky-50 p-4 text-sm font-bold leading-6 text-sky-900">
              {statusMessage}
            </div>
          ) : null}

          <form action={updateRecoveredPassword} className="mt-8 space-y-5">
            <label className="block">
              <span className="text-sm font-bold text-slate-700">
                Nueva contraseña
              </span>
              <input
                type="password"
                name="password"
                placeholder="Mínimo 8 caracteres"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-semibold text-slate-950 outline-none transition focus:border-sky-400 focus:bg-white"
              />
            </label>

            <label className="block">
              <span className="text-sm font-bold text-slate-700">
                Confirmar contraseña
              </span>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Repetí la nueva contraseña"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-semibold text-slate-950 outline-none transition focus:border-sky-400 focus:bg-white"
              />
            </label>

            <button
              type="submit"
              className="w-full rounded-2xl bg-slate-900 px-5 py-4 text-sm font-black text-white transition hover:bg-slate-800"
            >
              Actualizar contraseña
            </button>

            <Link
              href="/recuperar-contrasena"
              className="block w-full rounded-2xl border border-slate-200 px-5 py-4 text-center text-sm font-black text-slate-800 transition hover:bg-slate-50"
            >
              Solicitar otro enlace
            </Link>

            <Link
              href="/login"
              className="block w-full rounded-2xl border border-slate-200 px-5 py-4 text-center text-sm font-black text-slate-800 transition hover:bg-slate-50"
            >
              Volver al login
            </Link>
          </form>
        </div>
      </section>
    </main>
  );
}