import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { MotionCard } from '@/components/ui/MotionCard';;
import { getUserProfile } from '@/lib/auth/getUserProfile';

interface DocCardProps {
  title: string;
  description: string;
  status: string;
  category: string;
  items: string[];
  href?: string;
  tone?: 'default' | 'success' | 'warning' | 'danger';
}

interface SprintStatus {
  sprint: string;
  title: string;
  status: string;
  detail: string;
}

function getToneClasses(tone: DocCardProps['tone'] = 'default') {
  if (tone === 'success') {
    return 'border-emerald-200 bg-emerald-500/10 text-emerald-200';
  }

  if (tone === 'warning') {
    return 'border-amber-200 bg-amber-500/10 text-amber-200';
  }

  if (tone === 'danger') {
    return 'border-rose-200 bg-rose-500/10 text-rose-200';
  }

  return 'border-white/10 bg-white/[0.04] text-white';
}

function StatusPill({
  children,
  tone = 'success',
}: {
  children: string;
  tone?: 'success' | 'warning' | 'danger' | 'default';
}) {
  const classes = {
    success: 'bg-emerald-500/20 text-emerald-300',
    warning: 'bg-amber-500/20 text-amber-300',
    danger: 'bg-rose-500/20 text-rose-300',
    default: 'bg-slate-100 text-slate-200',
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.16em] ${classes[tone]}`}
    >
      {children}
    </span>
  );
}

function DocCard({
  title,
  description,
  status,
  category,
  items,
  href,
  tone = 'default',
}: DocCardProps) {
  const card = (
    <div className={`h-full rounded-3xl border p-6 shadow-sm ${getToneClasses(tone)}`}>
      <div className="flex items-start justify-between gap-4">
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black uppercase tracking-[0.18em]">
          {category}
        </span>

        <StatusPill tone={tone === 'danger' ? 'danger' : tone === 'warning' ? 'warning' : 'success'}>
          {status}
        </StatusPill>
      </div>

      <h2 className="mt-5 text-xl font-black tracking-tight">{title}</h2>

      <p className="mt-3 text-sm leading-6 opacity-80">{description}</p>

      <div className="mt-5 space-y-3">
        {items.map((item) => (
          <div
            key={item}
            className="rounded-2xl border border-white/20 bg-white/[0.08] p-4 text-sm font-medium leading-6"
          >
            {item}
          </div>
        ))}
      </div>

      <div className="mt-6">
        {href ? (
          <span className="inline-flex rounded-2xl bg-white/10 px-4 py-2 text-sm font-bold text-white">
            Abrir referencia
          </span>
        ) : (
          <span className="inline-flex rounded-2xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-bold">
            Referencia interna
          </span>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block h-full">
        {card}
      </Link>
    );
  }

  return card;
}

export default async function DocumentacionPage() {
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

  const documentationCards: DocCardProps[] = [
    {
      title: 'Cierre Beta operativa comercial mínima',
      description:
        'Documento interno donde se registró el estado formal de la Beta operativa comercial online funcional.',
      status: 'Creado',
      category: 'Documento',
      tone: 'success',
      items: [
        'Resume qué está terminado y probado online.',
        'Registra stack, funcionalidades validadas y estado de seguridad.',
        'Sirve como evidencia interna del cierre del Sprint 9.',
      ],
    },
    {
      title: 'Registro de incidencias',
      description:
        'Planilla de seguimiento para bugs, comentarios, mejoras y validaciones del tester externo.',
      status: 'Activo',
      category: 'Planilla',
      tone: 'success',
      items: [
        'Incluye BETA-001: logout corregido y validado online.',
        'Incluye BETA-002: flujo general validado correctamente.',
        'Actualmente no hay bugs críticos ni altos abiertos.',
      ],
    },
    {
      title: 'Checklist de tester externo',
      description:
        'Listado de acciones mínimas que debe probar una persona externa durante la Beta operativa comercial.',
      status: 'Validado',
      category: 'Tester',
      tone: 'success',
      items: [
        'Login, dashboard, documentos, expedientes y reportes generales.',
        'Bloqueo correcto en usuarios, invitaciones y auditoría.',
        'Logout online funcional y retorno a login.',
      ],
    },
    {
      title: 'Documentación de seguridad',
      description:
        'Reglas internas para proteger variables, accesos administrativos y rutas sensibles.',
      status: 'Controlado',
      category: 'Seguridad',
      tone: 'warning',
      items: [
        'No compartir accesos a Supabase, Vercel ni GitHub.',
        'No subir .env.local ni claves privadas al repositorio.',
        'Mantener testers externos con rol employee.',
      ],
      href: '/configuracion/seguridad',
    },
    {
      title: 'Documentación de entorno',
      description:
        'Referencia interna sobre variables, archivos protegidos y estado del entorno online.',
      status: 'Controlado',
      category: 'Entorno',
      tone: 'warning',
      items: [
        'Variables reales administradas desde Vercel.',
        'Repositorio GitHub documentado sin .env.local, node_modules, .next ni .vercel.',
        'Integración IA externa no activa durante esta etapa.',
      ],
      href: '/configuracion/entorno',
    },
    {
      title: 'Estado operativo beta',
      description:
        'Panel interno con métricas, testers activos, documentos, expedientes, auditoría y checklist beta.',
      status: 'Activo',
      category: 'Beta',
      tone: 'success',
      items: [
        'Muestra usuarios, testers activos, documentos y expedientes.',
'Muestra análisis IA, invitaciones pendientes y actividad operativa.',
'Confirma que la integración IA externa no está activa.',
      ],
      href: '/configuracion/estado-beta',
    },
  ];

const sprintStatuses: SprintStatus[] = [
  {
    sprint: 'Sprint 8',
    title: 'Navegación, roles, permisos y beta local',
    status: 'Aprobado',
    detail:
      'Rutas principales validadas, roles revisados, acceso denegado creado y beta local aprobada.',
  },
  {
    sprint: 'Sprint 9',
    title: 'Deploy online y Beta operativa comercial',
    status: 'Aprobado',
    detail:
      'Repositorio GitHub documentado, Vercel, tester externo, permisos online, logout y cierre beta aprobados.',
  },
  {
    sprint: 'Sprint 10',
    title: 'Configuración interna y control operativo',
    status: 'Aprobado',
    detail:
      'Paneles internos de estado beta, seguridad, entorno, documentación, resumen y roadmap creados y validados.',
  },
  {
    sprint: 'Sprint 11',
    title: 'Invitaciones reales y alta de usuarios',
    status: 'Aprobado',
    detail:
      'Flujo real de invitaciones, aceptación por enlace, validación de token/email y control por organización aprobados.',
  },
  {
    sprint: 'Sprint 12',
    title: 'Recuperación de contraseña y sesión',
    status: 'Aprobado',
    detail:
      'Recuperación de contraseña, nueva contraseña, mensajes claros y control final de sesión aprobados.',
  },
  {
    sprint: 'Sprint 13',
    title: 'Seguridad fuerte, RLS, Storage y permisos',
    status: 'Aprobado',
    detail:
      'RLS, Storage privado, aislamiento por organización, auditoría, permisos por rol y rutas sensibles aprobados.',
  },
  {
    sprint: 'Sprint 14',
    title: 'UX y pulido profesional',
    status: 'Aprobado',
    detail:
      'Layout, dashboard, reportes, usuarios, expedientes, documentos, detalle de expediente y textos internos pulidos.',
  },
  {
    sprint: 'Sprint 15',
    title: 'Comercialización, landing, demo y precontacto',
    status: 'En curso avanzado',
    detail:
      'Landing comercial, demo guiada, PDF comercial, README actualizado, mejoras funcionales y preparación de contacto real con prospectos.',
  },
];

  const internalRules = [
    'Toda mejora importante debe pasar por backup, build local, prueba local, commit, push y deploy en Vercel.',
'No se debe activar una integración IA externa hasta definir propuesta comercial, control de costos y límites de uso.',
    'Los testers externos no deben recibir acceso a Supabase, GitHub, Vercel ni credenciales internas.',
    'Los documentos usados para pruebas no deben contener información real sensible.',
    'Toda incidencia detectada debe registrarse en la planilla de Beta operativa comercial.',
    'Todo cambio funcional importante debe validarse como admin y como employee antes de aprobarse.',
  ];

const nextDocumentationItems = [
  'Mantener actualizada la documentación interna según cambios validados en la beta operativa comercial.',
  'Registrar feedback de demos comerciales, objeciones frecuentes y necesidades detectadas en prospectos.',
  'Actualizar casos de uso, pitch, material comercial y planilla de seguimiento según respuesta real del mercado.',
  'Documentar próximas mejoras solo después de validarlas en contacto comercial real o demos controladas.',
  'Conservar respaldo de builds, commits, deploys y decisiones aprobadas por cada bloque cerrado.',
];

  return (
    <AppShell>
      <div className="space-y-8">
        <MotionCard index={0} className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.35em] text-sky-600">
                Control interno
              </p>

              <h1 className="mt-3 text-3xl font-black tracking-tight text-white">
                Documentación interna
              </h1>

              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
                Centro interno para ordenar documentos de cierre, planilla de
                incidencias, checklist de tester, sprints aprobados, reglas de
                uso de beta y próximos documentos técnicos del proyecto.
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-4 text-sm text-emerald-950">
              <p className="font-black">Estado documental</p>
              <p className="mt-1">Beta operativa comercial documentada</p>
            </div>
          </div>
        </MotionCard>

        <MotionCard index={1} className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {documentationCards.map((card) => (
            <DocCard
              key={card.title}
              title={card.title}
              description={card.description}
              status={card.status}
              category={card.category}
              items={card.items}
              href={card.href}
              tone={card.tone}
            />
          ))}
        </MotionCard>

        <MotionCard index={2} className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-black text-white">
                Estado de sprints documentados
              </h2>

              <p className="mt-1 text-sm text-slate-300">
                Resumen de los últimos sprints aprobados y su valor dentro del MVP.
              </p>
            </div>

            <Link
              href="/configuracion"
              className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-bold text-slate-200 hover:bg-white/[0.02]"
            >
              Volver a configuración
            </Link>
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl border border-slate-100">
            <div className="hidden grid-cols-[160px_1fr_160px] bg-white/[0.02] px-4 py-3 text-xs font-black uppercase tracking-[0.16em] text-slate-400 md:grid">
              <div>Sprint</div>
              <div>Detalle</div>
              <div>Estado</div>
            </div>

            <div className="divide-y divide-slate-100">
              {sprintStatuses.map((item) => (
                <div
                  key={item.sprint}
                  className="grid gap-3 p-4 text-sm md:grid-cols-[160px_1fr_160px] md:items-center"
                >
                  <div>
                    <p className="font-black text-white">{item.sprint}</p>
                    <p className="mt-1 text-xs text-slate-400 md:hidden">
                      Sprint documentado
                    </p>
                  </div>

                  <div>
                    <p className="font-black text-slate-200">{item.title}</p>
                    <p className="mt-1 leading-6 text-slate-300">{item.detail}</p>
                  </div>

                  <div>
                    <StatusPill tone={item.status === 'Aprobado' ? 'success' : 'warning'}>
                      {item.status}
                    </StatusPill>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </MotionCard>

        <MotionCard index={3} className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-sm">
            <h2 className="text-xl font-black text-white">
              Reglas internas de documentación
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-300">
              Criterios que conviene mantener para que el proyecto siga ordenado
              durante los próximos sprints.
            </p>

            <div className="mt-5 space-y-3">
              {internalRules.map((rule) => (
                <div
                  key={rule}
                  className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 text-sm font-medium leading-6 text-slate-200"
                >
                  {rule}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-sm">
            <h2 className="text-xl font-black text-white">
              Próxima documentación
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-300">
              Documentos recomendados para acompañar los próximos avances.
            </p>

            <div className="mt-5 space-y-3">
              {nextDocumentationItems.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm font-medium leading-6 text-amber-900"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </MotionCard>

        <MotionCard index={4} className="rounded-3xl border border-white/10 bg-white/10 p-6 text-white shadow-sm">
          <h2 className="text-xl font-black">
            Criterio operativo documental
          </h2>

          <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-300">
            El proyecto se considera correctamente documentado mientras cada
            avance importante tenga respaldo, estado aprobado, registro de
            incidencias si corresponde y una decisión clara sobre qué queda para
            próximos sprints.
          </p>
        </MotionCard>
      </div>
    </AppShell>
  );
}