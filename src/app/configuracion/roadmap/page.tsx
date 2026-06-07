import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { getUserProfile } from '@/lib/auth/getUserProfile';

interface RoadmapSprint {
  sprint: string;
  title: string;
  status: string;
  priority: string;
  objective: string;
  blocks: string[];
  result: string;
  tone: 'success' | 'warning' | 'default';
}

interface PriorityCardProps {
  title: string;
  description: string;
  status: string;
  tone?: 'success' | 'warning' | 'danger' | 'default';
}

function getToneClasses(tone: RoadmapSprint['tone'] | PriorityCardProps['tone'] = 'default') {
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
  tone = 'default',
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

function PriorityCard({
  title,
  description,
  status,
  tone = 'default',
}: PriorityCardProps) {
  return (
    <div className={`rounded-3xl border p-6 shadow-sm ${getToneClasses(tone)}`}>
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-lg font-black tracking-tight">{title}</h2>
        <StatusPill tone={tone}>{status}</StatusPill>
      </div>

      <p className="mt-3 text-sm leading-6 opacity-80">{description}</p>
    </div>
  );
}

export default async function RoadmapPage() {
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

  const roadmap: RoadmapSprint[] = [
    {
      sprint: 'Sprint 10',
      title: 'Configuración interna y control operativo',
      status: 'En curso',
      priority: 'Alta',
      tone: 'warning',
      objective:
        'Cerrar el módulo de configuración como centro interno de control del MVP.',
      blocks: [
        'Estado beta.',
        'Seguridad y permisos.',
        'Variables y entorno.',
        'Documentación interna.',
'Análisis IA en modo controlado.',
        'Roadmap interno.',
        'Resumen general del sistema.',
        'Cierre formal de configuración interna.',
      ],
      result:
        'El admin podrá entender desde la app qué está activo, qué falta, qué está protegido y cuál es el estado del producto.',
    },
    {
      sprint: 'Sprint 11',
      title: 'Invitaciones reales y alta de usuarios',
      status: 'Pendiente',
      priority: 'Alta',
      tone: 'default',
      objective:
        'Convertir las invitaciones operativas actuales en un flujo más real para clientes y testers.',
      blocks: [
        'Diagnóstico del sistema actual de invitaciones.',
        'Página pública para aceptar invitación.',
        'Validar token, email, rol y vencimiento.',
        'Crear perfil automáticamente al aceptar invitación.',
        'Asignar organización automáticamente.',
        'Evitar duplicados y usuarios repetidos.',
        'Actualizar estados pending / accepted / expired.',
        'Auditoría completa del flujo.',
        'Prueba online con nuevo tester.',
      ],
      result:
        'Un admin podrá invitar usuarios y el sistema podrá vincularlos correctamente a la organización.',
    },
    {
      sprint: 'Sprint 12',
      title: 'Recuperación de contraseña y sesión',
      status: 'Pendiente',
      priority: 'Alta',
      tone: 'default',
      objective:
        'Permitir que usuarios reales recuperen acceso sin intervención manual del administrador.',
      blocks: [
        'Revisar configuración de Supabase Auth Redirect URLs.',
        'Crear pantalla “Olvidé mi contraseña”.',
        'Enviar link de recuperación.',
        'Crear pantalla de nueva contraseña.',
        'Confirmación de contraseña actualizada.',
        'Mensajes de error claros.',
        'Prueba online completa.',
      ],
      result:
        'El sistema será más usable para clientes reales porque podrán recuperar su contraseña.',
    },
    {
      sprint: 'Sprint 13',
      title: 'Seguridad fuerte, RLS, Storage y permisos',
      status: 'Pendiente',
      priority: 'Crítica',
      tone: 'default',
      objective:
        'Endurecer la seguridad para evitar accesos cruzados, permisos débiles o exposición accidental de datos.',
      blocks: [
        'Auditoría de RLS por tabla.',
        'Políticas de Storage.',
        'Acceso por organization_id.',
        'Validación server-side por rol.',
        'Protección avanzada de reportes sensibles.',
        'Protección de auditoría.',
        'Pruebas con admin, employee, auditor y client.',
        'Cierre de hardening de seguridad.',
      ],
      result:
        'El sistema no solo bloqueará visualmente, sino también desde base de datos, storage y servidor.',
    },
    {
      sprint: 'Sprint 14',
      title: 'UX, experiencia y pulido profesional',
      status: 'Pendiente',
      priority: 'Media',
      tone: 'default',
      objective:
        'Hacer que la app se sienta más clara, guiada, profesional y cercana a un producto comercial.',
      blocks: [
        'Pantallas vacías más elegantes.',
        'Mensajes de error claros.',
        'Estados de carga.',
        'Botones más guiados.',
        'Flujo de carga documental más intuitivo.',
        'Mejoras visuales en tablas.',
        'Textos más comerciales.',
        'Responsive y pulido final.',
      ],
      result:
        'La app dejará de sentirse como beta técnica y empezará a sentirse como producto presentable.',
    },
    {
      sprint: 'Sprint 15',
      title: 'Presentación comercial y preparación de venta',
      status: 'Pendiente',
      priority: 'Alta',
      tone: 'default',
      objective:
        'Preparar el material necesario para mostrar, explicar y vender el MVP de forma profesional.',
      blocks: [
        'Landing comercial.',
        'Demo guiada.',
        'Guion para video corto de uso.',
        'Documento comercial.',
        'Casos de uso por rubro.',
        'Plan de precios.',
        'Pitch para estudios jurídicos.',
        'Pitch para inmobiliarias y PyMEs.',
        'Paquete comercial final.',
      ],
      result:
        'El proyecto tendrá una app funcional y también una forma clara de presentarse comercialmente.',
    },
  ];

  const currentPriorities = [
    {
      title: 'Terminar Sprint 10',
      description:
        'Cerrar configuración interna antes de avanzar a flujos más sensibles como invitaciones reales.',
      status: 'Ahora',
      tone: 'warning' as const,
    },
{
  title: 'Mantener IA en modo controlado',
  description:
    'Mantener el análisis IA en modo controlado hasta validar propuesta comercial, costos y límites por usuario.',
  status: 'Correcto',
  tone: 'success' as const,
},
    {
      title: 'Preparar seguridad fuerte',
      description:
        'Sprint 13 será clave antes de ampliar la prueba a más personas o clientes reales.',
      status: 'Pendiente',
      tone: 'default' as const,
    },
    {
      title: 'Pensar comercialmente',
      description:
        'Sprint 15 convertirá la beta técnica en una propuesta vendible con landing, demo y pitch.',
      status: 'Futuro',
      tone: 'default' as const,
    },
  ];

  const commercialReadiness = [
    'Producto online funcional.',
    'Tester externo validado.',
    'Permisos básicos funcionando.',
    'Configuración interna en construcción.',
    'Falta invitación real automatizada.',
    'Falta recuperación de contraseña.',
    'Falta hardening completo de seguridad.',
    'Falta presentación comercial.',
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
                Roadmap interno
              </h1>

              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                Vista interna para ordenar el camino desde la beta cerrada online
                hasta una versión más cercana a un MVP comercial serio. Este
                panel resume los próximos sprints, prioridades y pendientes
                antes de mostrar el producto a más clientes reales.
              </p>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-950">
              <p className="font-black">Etapa actual</p>
              <p className="mt-1">Beta cerrada online avanzada</p>
            </div>
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {currentPriorities.map((priority) => (
            <PriorityCard
              key={priority.title}
              title={priority.title}
              description={priority.description}
              status={priority.status}
              tone={priority.tone}
            />
          ))}
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-950">
                Sprints planificados
              </h2>

              <p className="mt-1 text-sm text-slate-600">
                Recorrido definido desde configuración interna hasta presentación comercial.
              </p>
            </div>

            <Link
              href="/configuracion"
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
            >
              Volver a configuración
            </Link>
          </div>

          <div className="mt-6 space-y-5">
            {roadmap.map((item) => (
              <div
                key={item.sprint}
                className={`rounded-3xl border p-6 shadow-sm ${getToneClasses(item.tone)}`}
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.24em] opacity-70">
                      {item.sprint}
                    </p>

                    <h3 className="mt-2 text-2xl font-black tracking-tight">
                      {item.title}
                    </h3>

                    <p className="mt-3 max-w-4xl text-sm leading-6 opacity-80">
                      {item.objective}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <StatusPill
                      tone={item.status === 'En curso' ? 'warning' : 'default'}
                    >
                      {item.status}
                    </StatusPill>

                    <StatusPill
                      tone={item.priority === 'Crítica' ? 'danger' : 'warning'}
                    >
                      {item.priority}
                    </StatusPill>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {item.blocks.map((block) => (
                    <div
                      key={block}
                      className="rounded-2xl border border-white/60 bg-white/60 p-4 text-sm font-medium leading-6"
                    >
                      {block}
                    </div>
                  ))}
                </div>

                <div className="mt-5 rounded-2xl border border-white/60 bg-white/70 p-4 text-sm font-bold leading-6">
                  Resultado esperado: {item.result}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black text-slate-950">
              Estado comercial actual
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Resumen rápido de preparación actual del MVP frente a una posible
              presentación comercial.
            </p>

            <div className="mt-5 space-y-3">
              {commercialReadiness.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm font-medium leading-6 text-slate-700"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-950 p-6 text-white shadow-sm">
            <h2 className="text-xl font-black">
              Criterio para avanzar a venta
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-300">
              El proyecto estará más cerca de una versión comercial seria cuando
              cuente con invitaciones reales, recuperación de contraseña,
              seguridad fuerte, UX más pulida y material comercial claro. Hasta
              entonces, el mejor uso es como beta privada controlada para validar
              flujo, propuesta y casos de uso.
            </p>

            <div className="mt-5 rounded-2xl border border-white/10 bg-white/10 p-4 text-sm font-bold leading-6 text-white">
              Estado recomendado: seguir por sprints controlados hasta Sprint 15.
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}