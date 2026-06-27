import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { getUserProfile } from '@/lib/auth/getUserProfile';

interface VariableCardProps {
  name: string;
  description: string;
  environment: string;
  status: string;
  tone?: 'success' | 'warning' | 'danger' | 'default';
}

interface ChecklistItem {
  label: string;
  status: string;
  tone: 'success' | 'warning' | 'danger';
}

function getToneClasses(tone: VariableCardProps['tone'] = 'default') {
  if (tone === 'success') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-950';
  }

  if (tone === 'warning') {
    return 'border-amber-200 bg-amber-50 text-amber-950';
  }

  if (tone === 'danger') {
    return 'border-rose-200 bg-rose-50 text-rose-950';
  }

  return 'border-slate-200 bg-white text-slate-950';
}

function StatusPill({
  children,
  tone = 'success',
}: {
  children: string;
  tone?: 'success' | 'warning' | 'danger' | 'default';
}) {
  const classes = {
    success: 'bg-emerald-50 text-emerald-700',
    warning: 'bg-amber-50 text-amber-700',
    danger: 'bg-rose-50 text-rose-700',
    default: 'bg-slate-100 text-slate-700',
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.16em] ${classes[tone]}`}
    >
      {children}
    </span>
  );
}

function VariableCard({
  name,
  description,
  environment,
  status,
  tone = 'default',
}: VariableCardProps) {
  return (
    <div className={`rounded-3xl border p-6 shadow-sm ${getToneClasses(tone)}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] opacity-70">
            Variable
          </p>

          <h2 className="mt-3 break-all text-lg font-black tracking-tight">
            {name}
          </h2>
        </div>

        <StatusPill tone={tone === 'danger' ? 'danger' : tone === 'warning' ? 'warning' : 'success'}>
          {status}
        </StatusPill>
      </div>

      <p className="mt-4 text-sm leading-6 opacity-80">{description}</p>

      <div className="mt-5 rounded-2xl border border-white/60 bg-white/60 p-4 text-sm">
        <p className="font-black">Dónde se administra</p>
        <p className="mt-1 opacity-80">{environment}</p>
      </div>
    </div>
  );
}

export default async function EntornoPage() {
  const { user, profile } = await getUserProfile();

  if (!user) {
    redirect('/login');
  }

  if (!profile) {
    redirect('/acceso-denegado?motivo=perfil');
  }

  if (profile.status !== 'active') {
    redirect('/acceso-denegado?motivo=estado');
  }

  if (profile.role !== 'admin') {
    redirect('/acceso-denegado?motivo=rol');
  }

  const variables: VariableCardProps[] = [
    {
      name: 'NEXT_PUBLIC_SUPABASE_URL',
      description:
        'URL pública del proyecto Supabase utilizada por la aplicación para conectarse al backend.',
      environment: 'Vercel Environment Variables y archivo local .env.local.',
      status: 'Activa',
      tone: 'success',
    },
    {
      name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      description:
        'Clave pública anon de Supabase usada por el cliente para operar bajo las reglas de seguridad configuradas.',
      environment: 'Vercel Environment Variables y archivo local .env.local.',
      status: 'Activa',
      tone: 'success',
    },
    {
      name: 'SUPABASE_SERVICE_ROLE_KEY',
      description:
        'Clave sensible de Supabase. No debe exponerse en frontend ni subirse a GitHub. Solo debe usarse en procesos server-side controlados si realmente hace falta.',
      environment: 'Solo entorno privado. No debe mostrarse ni compartirse.',
      status: 'Restringida',
      tone: 'warning',
    },
{
name: 'CLAVE_PROVEEDOR_IA',
  description:
    'Clave reservada para una futura integración IA externa. En esta beta no está activa porque el sistema mantiene análisis IA en modo controlado.',
  environment: 'No activa en esta etapa. No cargar si no se decide integrar un proveedor externo.',
  status: 'No activa',
  tone: 'warning',
},
    {
      name: 'APP_URL',
      description:
        'URL base de la aplicación. Puede utilizarse más adelante para enlaces de invitación, recuperación o flujos externos según configuración del entorno',
      environment: 'Vercel Environment Variables si se implementan flujos con enlaces externos.',
      status: 'Opcional según entorno',
      tone: 'default',
    },
{
  name: 'NOMBRE_MODELO_AI',
  description:
    'Nombre de modelo IA preparado para una futura integración externa. La beta actual no depende de este valor.',
  environment: 'Archivo de ejemplo o entorno privado si se activa una integración IA externa en el futuro.',
  status: 'Controlado',
  tone: 'success',
},
  ];

  const protectedFiles = [
    {
      file: '.env.local',
      rule: 'Nunca subir a GitHub. Contiene valores reales del entorno local.',
    },
    {
      file: '.env*.local',
      rule: 'Debe permanecer ignorado por .gitignore.',
    },
    {
      file: 'node_modules',
      rule: 'No se sube. Se reconstruye con npm install.',
    },
    {
      file: '.next',
      rule: 'No se sube. Es salida de compilación local.',
    },
    {
      file: '.vercel',
      rule: 'No se sube. Puede contener configuración local del proyecto Vercel.',
    },
  ];

  const checklist: ChecklistItem[] = [
    {
      label: '.env.local ignorado por GitHub',
      status: 'Validado',
      tone: 'success',
    },
    {
      label: 'Variables reales cargadas en Vercel',
      status: 'Validado',
      tone: 'success',
    },
    {
      label: 'Supabase conectado online',
      status: 'Validado',
      tone: 'success',
    },
    {
      label: 'proveedores IA externos',
      status: 'No activa',
      tone: 'warning',
    },
    {
      label: 'Repositorio privado',
      status: 'Validado',
      tone: 'success',
    },
    {
      label: 'Service Role expuesta en frontend',
      status: 'No permitido',
      tone: 'danger',
    },
  ];

  return (
    <AppShell>
      <div className="space-y-8">
        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.35em] text-sky-600">
                Control interno
              </p>

              <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
                Variables y entorno
              </h1>

              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                Panel interno para revisar nombres de variables, estado del
                entorno online, archivos protegidos y reglas para evitar exponer
                claves privadas durante la Beta operativa comercial.
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-950">
              <p className="font-black">Estado del entorno</p>
              <p className="mt-1">Beta online con variables protegidas</p>
            </div>
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {variables.map((variable) => (
            <VariableCard
              key={variable.name}
              name={variable.name}
              description={variable.description}
              environment={variable.environment}
              status={variable.status}
              tone={variable.tone}
            />
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-950">
                  Archivos protegidos
                </h2>

                <p className="mt-1 text-sm text-slate-600">
                  Archivos y carpetas que no deben subirse al repositorio.
                </p>
              </div>

              <Link
                href="/configuracion"
                className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                Volver a configuración
              </Link>
            </div>

            <div className="mt-5 space-y-3">
              {protectedFiles.map((item) => (
                <div
                  key={item.file}
                  className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
                >
                  <p className="font-mono text-sm font-black text-slate-900">
                    {item.file}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {item.rule}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black text-slate-950">
              Checklist de entorno
            </h2>

            <p className="mt-1 text-sm text-slate-600">
              Estado actual del entorno local, GitHub y Vercel.
            </p>

            <div className="mt-5 divide-y divide-slate-100">
              {checklist.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between gap-4 py-4"
                >
                  <p className="text-sm font-semibold text-slate-800">
                    {item.label}
                  </p>

                  <StatusPill tone={item.tone}>{item.status}</StatusPill>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black text-slate-950">
              Entorno local
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              El entorno local utiliza el archivo privado{' '}
              <span className="font-mono font-black">.env.local</span>. Este
              archivo debe permanecer fuera de GitHub. Sirve para desarrollo,
              pruebas locales y validación antes de desplegar.
            </p>

            <div className="mt-5 rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
              No compartir capturas donde se vean valores reales de variables,
              claves API o tokens internos.
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black text-slate-950">
              Entorno online
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              El entorno online utiliza variables cargadas en Vercel. Los valores
              reales no se guardan en el repositorio. Cada push a GitHub genera
              un nuevo despliegue que utiliza esas variables configuradas.
            </p>

            <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900">
              Estado actual: Vercel conectado, Supabase conectado y beta online
              funcional.
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-slate-950 p-6 text-white shadow-sm">
          <h2 className="text-xl font-black">
            Criterio operativo de entorno seguro
          </h2>

          <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-300">
La beta mantiene un entorno seguro mientras las claves privadas sigan fuera del repositorio, las variables se administren desde Vercel, el archivo .env.local permanezca ignorado y no se active una integración IA externa sin una decisión técnica y económica previa.
          </p>
        </section>
      </div>
    </AppShell>
  );
}