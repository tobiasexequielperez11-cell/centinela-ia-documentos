import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { getUserProfile } from '@/lib/auth/getUserProfile';

interface InfoCardProps {
  title: string;
  description: string;
  items: string[];
  tone?: 'default' | 'success' | 'warning' | 'danger';
}

interface RouteControl {
  route: string;
  module: string;
  adminAccess: string;
  employeeAccess: string;
  status: string;
}

function getToneClasses(tone: InfoCardProps['tone'] = 'default') {
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

function InfoCard({
  title,
  description,
  items,
  tone = 'default',
}: InfoCardProps) {
  return (
    <div className={`rounded-3xl border p-6 shadow-sm ${getToneClasses(tone)}`}>
      <h2 className="text-xl font-black tracking-tight">{title}</h2>

      <p className="mt-3 text-sm leading-6 opacity-80">{description}</p>

      <div className="mt-5 space-y-3">
        {items.map((item) => (
          <div
            key={item}
            className="rounded-2xl border border-white/50 bg-white/60 p-4 text-sm font-medium leading-6"
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusPill({
  children,
  tone = 'default',
}: {
  children: React.ReactNode;
  tone?: 'default' | 'success' | 'warning' | 'danger';
}) {
  const classes = {
    default: 'bg-slate-100 text-slate-700',
    success: 'bg-emerald-50 text-emerald-700',
    warning: 'bg-amber-50 text-amber-700',
    danger: 'bg-rose-50 text-rose-700',
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.16em] ${classes[tone]}`}
    >
      {children}
    </span>
  );
}

export default async function SeguridadPage() {
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

  const roleCards = [
    {
      title: 'Rol admin',
      description:
        'Perfil con acceso operativo completo dentro de la beta cerrada.',
      tone: 'success' as const,
      items: [
        'Puede acceder a dashboard, expedientes, documentos, reportes, configuración y paneles internos.',
        'Puede gestionar usuarios, invitaciones operativas y auditoría.',
        'Puede revisar el estado beta y controles de seguridad.',
        'Debe evitar compartir accesos a Supabase, Vercel, GitHub o credenciales internas.',
      ],
    },
    {
      title: 'Rol employee',
      description:
        'Perfil de prueba externa controlada para validar la beta sin acceso administrativo.',
      tone: 'warning' as const,
      items: [
        'Puede ingresar a dashboard, expedientes, documentos y reportes generales.',
        'Puede validar navegación, visor PDF, métricas visibles y cierre de sesión.',
        'No puede acceder a usuarios, invitaciones, auditoría ni paneles internos de configuración.',
        'No debe cargar documentos reales sensibles durante la beta cerrada.',
      ],
    },
  ];

  const routeControls: RouteControl[] = [
    {
      route: '/dashboard',
      module: 'Dashboard',
      adminAccess: 'Permitido',
      employeeAccess: 'Permitido',
      status: 'Operativo',
    },
    {
      route: '/expedientes',
      module: 'Expedientes',
      adminAccess: 'Permitido',
      employeeAccess: 'Permitido',
      status: 'Operativo',
    },
    {
      route: '/documentos',
      module: 'Documentos',
      adminAccess: 'Permitido',
      employeeAccess: 'Permitido',
      status: 'Operativo',
    },
    {
      route: '/reportes',
      module: 'Reportes generales',
      adminAccess: 'Permitido',
      employeeAccess: 'Permitido',
      status: 'Operativo',
    },
    {
      route: '/usuarios',
      module: 'Usuarios',
      adminAccess: 'Permitido',
      employeeAccess: 'Bloqueado',
      status: 'Protegido',
    },
    {
      route: '/usuarios/invitaciones',
      module: 'Invitaciones',
      adminAccess: 'Permitido',
      employeeAccess: 'Bloqueado',
      status: 'Protegido',
    },
    {
      route: '/reportes?vista=auditoria',
      module: 'Auditoría',
      adminAccess: 'Permitido',
      employeeAccess: 'Bloqueado',
      status: 'Protegido',
    },
    {
      route: '/configuracion/estado-beta',
      module: 'Estado beta',
      adminAccess: 'Permitido',
      employeeAccess: 'Bloqueado',
      status: 'Protegido',
    },
    {
      route: '/configuracion/seguridad',
      module: 'Seguridad y permisos',
      adminAccess: 'Permitido',
      employeeAccess: 'Bloqueado',
      status: 'Protegido',
    },
  ];

  const betaRules = [
    'La beta cerrada se prueba con usuarios controlados y perfiles definidos.',
    'Los testers externos deben usar rol employee y estado active.',
    'Los módulos administrativos quedan reservados para admin.',
    'Las variables reales se administran en Vercel y no deben subirse a GitHub.',
    'No se utiliza OpenAI API paga durante esta etapa.',
    'No se deben cargar documentos reales sensibles durante la prueba.',
  ];

  const securityChecklist = [
    {
      label: 'Login protegido',
      status: 'Validado',
      tone: 'success' as const,
    },
    {
      label: 'Logout online',
      status: 'Validado',
      tone: 'success' as const,
    },
    {
      label: 'Employee bloqueado en usuarios',
      status: 'Validado',
      tone: 'success' as const,
    },
    {
      label: 'Employee bloqueado en auditoría',
      status: 'Validado',
      tone: 'success' as const,
    },
    {
      label: 'Estado beta solo admin',
      status: 'Validado',
      tone: 'success' as const,
    },
    {
      label: 'Supabase conectado',
      status: 'Validado',
      tone: 'success' as const,
    },
    {
      label: 'GitHub sin .env.local',
      status: 'Validado',
      tone: 'success' as const,
    },
    {
      label: 'OpenAI API real',
      status: 'No activa',
      tone: 'warning' as const,
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
                Seguridad y permisos
              </h1>

              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                Panel interno para revisar roles, accesos, rutas protegidas,
                reglas actuales de beta cerrada y controles mínimos de seguridad
                antes de ampliar la prueba externa.
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-950">
              <p className="font-black">Estado del acceso</p>
              <p className="mt-1">Vista disponible solo para admin</p>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          {roleCards.map((card) => (
            <InfoCard
              key={card.title}
              title={card.title}
              description={card.description}
              items={card.items}
              tone={card.tone}
            />
          ))}
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-950">
                Matriz de rutas protegidas
              </h2>

              <p className="mt-1 text-sm text-slate-600">
                Resumen de accesos esperados para admin y employee durante la beta.
              </p>
            </div>

            <Link
              href="/configuracion"
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
            >
              Volver a configuración
            </Link>
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl border border-slate-100">
            <div className="hidden grid-cols-[1.1fr_1fr_1fr_1fr_1fr] bg-slate-50 px-4 py-3 text-xs font-black uppercase tracking-[0.16em] text-slate-500 md:grid">
              <div>Ruta</div>
              <div>Módulo</div>
              <div>Admin</div>
              <div>Employee</div>
              <div>Estado</div>
            </div>

            <div className="divide-y divide-slate-100">
              {routeControls.map((item) => (
                <div
                  key={item.route}
                  className="grid gap-3 p-4 text-sm md:grid-cols-[1.1fr_1fr_1fr_1fr_1fr] md:items-center"
                >
                  <div>
                    <p className="font-black text-slate-800">{item.route}</p>
                    <p className="mt-1 text-xs text-slate-500 md:hidden">
                      Ruta protegida
                    </p>
                  </div>

                  <div className="font-semibold text-slate-700">
                    {item.module}
                  </div>

                  <div>
                    <StatusPill tone="success">{item.adminAccess}</StatusPill>
                  </div>

                  <div>
                    <StatusPill
                      tone={
                        item.employeeAccess === 'Permitido'
                          ? 'success'
                          : 'danger'
                      }
                    >
                      {item.employeeAccess}
                    </StatusPill>
                  </div>

                  <div>
                    <StatusPill
                      tone={item.status === 'Protegido' ? 'warning' : 'success'}
                    >
                      {item.status}
                    </StatusPill>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.9fr_1fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black text-slate-950">
              Reglas actuales de beta cerrada
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Reglas operativas que deben mantenerse mientras la beta siga en
              modalidad cerrada y controlada.
            </p>

            <div className="mt-5 space-y-3">
              {betaRules.map((rule) => (
                <div
                  key={rule}
                  className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm font-medium leading-6 text-slate-700"
                >
                  {rule}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black text-slate-950">
              Checklist de controles
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Estado resumido de controles mínimos de acceso y seguridad.
            </p>

            <div className="mt-5 divide-y divide-slate-100">
              {securityChecklist.map((item) => (
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

        <section className="rounded-3xl border border-slate-200 bg-slate-950 p-6 text-white shadow-sm">
          <h2 className="text-xl font-black">
            Criterio operativo de seguridad
          </h2>

          <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-300">
            La beta se considera segura para prueba cerrada mientras los testers
            externos permanezcan con rol employee, las rutas administrativas
            sigan bloqueadas, no existan bugs críticos abiertos y no se compartan
            accesos internos de Supabase, GitHub o Vercel.
          </p>
        </section>
      </div>
    </AppShell>
  );
}