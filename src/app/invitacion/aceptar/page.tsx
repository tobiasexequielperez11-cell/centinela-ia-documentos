import Link from 'next/link';

interface AcceptInvitationPageProps {
  searchParams: Promise<{
    email?: string;
    token?: string;
    estado?: string;
  }>;
}

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

export default async function AcceptInvitationPage({
  searchParams,
}: AcceptInvitationPageProps) {
  const params = await searchParams;

  const email = getSafeValue(params.email);
  const token = getSafeValue(params.token);
  const estado = getSafeValue(params.estado);

  const hasInvitationData = Boolean(email || token);

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-5xl items-center justify-center">
        <section className="grid w-full gap-6 lg:grid-cols-[1fr_0.85fr]">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 shadow-2xl">
            <p className="text-xs font-black uppercase tracking-[0.35em] text-sky-300">
              Centinela IA Documentos
            </p>

            <h1 className="mt-5 max-w-2xl text-4xl font-black tracking-tight md:text-5xl">
              Aceptar invitación
            </h1>

            <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-300">
              Esta pantalla será utilizada para que un usuario invitado pueda
              confirmar su acceso a una organización dentro de Centinela IA
              Documentos. En esta etapa inicial solo estamos preparando la ruta
              pública y la experiencia visual del flujo.
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-5">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-sky-300">
                  Paso 1
                </p>
                <p className="mt-3 text-sm font-bold leading-6">
                  El administrador genera una invitación.
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-5">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-sky-300">
                  Paso 2
                </p>
                <p className="mt-3 text-sm font-bold leading-6">
                  El invitado abre un enlace seguro.
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-5">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-sky-300">
                  Paso 3
                </p>
                <p className="mt-3 text-sm font-bold leading-6">
                  El sistema validará la invitación.
                </p>
              </div>
            </div>

            <div className="mt-8 rounded-3xl border border-amber-400/20 bg-amber-400/10 p-5 text-sm leading-7 text-amber-100">
              <p className="font-black">Estado del bloque actual</p>
              <p className="mt-2">
                Esta página todavía no crea usuarios, no cambia estados y no
                valida tokens contra Supabase. Esa validación se preparará en el
                próximo bloque.
              </p>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white p-8 text-slate-950 shadow-2xl">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <p className="text-xs font-black uppercase tracking-[0.28em] text-sky-600">
                Invitación recibida
              </p>

              <h2 className="mt-4 text-2xl font-black tracking-tight">
                Datos detectados
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-600">
                En esta etapa se leen parámetros básicos de la URL para preparar
                el flujo real de aceptación.
              </p>

              <div className="mt-6 space-y-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                    Email
                  </p>
                  <p className="mt-2 break-all text-sm font-bold text-slate-900">
                    {email ?? 'No informado en la URL'}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                    Token
                  </p>
                  <p className="mt-2 break-all text-sm font-bold text-slate-900">
                    {token ? 'Token recibido por URL' : 'No informado en la URL'}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                    Estado
                  </p>
                  <p className="mt-2 text-sm font-bold text-slate-900">
                    {estado ?? 'Pendiente de validación'}
                  </p>
                </div>
              </div>

              <div
                className={`mt-6 rounded-2xl border p-4 text-sm leading-6 ${
                  hasInvitationData
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                    : 'border-amber-200 bg-amber-50 text-amber-900'
                }`}
              >
                {hasInvitationData
                  ? 'La URL contiene datos iniciales de invitación. En el próximo bloque se validarán contra Supabase.'
                  : 'La URL no contiene datos de invitación. Más adelante esta pantalla se abrirá desde un enlace generado por el sistema.'}
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