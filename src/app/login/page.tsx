import Link from 'next/link';
import { signIn } from './actions';

interface LoginPageProps {
  searchParams: Promise<{ error?: string }>;
}

function getErrorMessage(error?: string) {
  if (error === 'missing_fields') return 'Completá email y contraseña.';
  if (error === 'invalid_credentials') return 'Email o contraseña incorrectos.';
  return null;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const errorMessage = getErrorMessage(params.error);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-12 text-white">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-300">
          Centinela IA
        </p>

        <h1 className="mt-3 text-3xl font-bold">Ingresar al panel</h1>

        <p className="mt-2 text-sm leading-6 text-slate-300">
          Acceso privado para organizaciones y usuarios autorizados.
        </p>

        {errorMessage ? (
          <div className="mt-6 rounded-2xl border border-rose-400/30 bg-rose-400/10 p-4 text-sm text-rose-200">
            {errorMessage}
          </div>
        ) : null}

        <form action={signIn} className="mt-8 space-y-4">
          <div>
            <label className="text-sm font-semibold text-slate-200">Email</label>
            <input
              name="email"
              type="email"
              required
              className="mt-2 w-full rounded-2xl border border-white/10 bg-white px-4 py-3 text-slate-950 outline-none focus:ring-2 focus:ring-sky-400"
              placeholder="usuario@empresa.com"
            />
          </div>

          <div>
            <div className="flex items-center justify-between gap-4">
              <label className="text-sm font-semibold text-slate-200">
                Contraseña
              </label>

              <Link
                href="/recuperar-contrasena"
                className="text-xs font-semibold text-sky-300 hover:text-sky-200"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <input
              name="password"
              type="password"
              required
              className="mt-2 w-full rounded-2xl border border-white/10 bg-white px-4 py-3 text-slate-950 outline-none focus:ring-2 focus:ring-sky-400"
              placeholder="••••••••"
            />
          </div>

          <button className="w-full rounded-2xl bg-sky-400 px-5 py-3 text-sm font-bold text-slate-950 hover:bg-sky-300">
            Ingresar
          </button>
        </form>

        <p className="mt-6 text-center text-xs leading-5 text-slate-400">
          El acceso está limitado a usuarios autorizados por la organización.
        </p>
      </div>
    </main>
  );
}