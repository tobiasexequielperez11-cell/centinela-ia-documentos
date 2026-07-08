import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { getUserProfile } from '@/lib/auth/getUserProfile';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

interface SummaryCardProps {
  title: string;
  value: string | number;
  description: string;
  tone?: 'default' | 'success' | 'warning' | 'danger';
}

interface StatusItem {
  label: string;
  status: string;
  description: string;
  tone: 'success' | 'warning' | 'danger' | 'default';
  href?: string;
}

function getToneClasses(tone: SummaryCardProps['tone'] = 'default') {
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

function SummaryCard({
  title,
  value,
  description,
  tone = 'default',
}: SummaryCardProps) {
  return (
    <div className={`rounded-3xl border p-6 shadow-sm ${getToneClasses(tone)}`}>
      <p className="text-xs font-black uppercase tracking-[0.22em] opacity-70">
        {title}
      </p>

      <p className="mt-3 text-3xl font-black">{value}</p>

      <p className="mt-2 text-sm leading-6 opacity-80">{description}</p>
    </div>
  );
}

function StatusRow({ item }: { item: StatusItem }) {
  const content = (
    <div className="grid gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm md:grid-cols-[1fr_160px] md:items-center">
      <div>
        <p className="font-black text-slate-900">{item.label}</p>
        <p className="mt-1 leading-6 text-slate-600">{item.description}</p>
      </div>

      <div className="md:text-right">
        <StatusPill tone={item.tone}>{item.status}</StatusPill>
      </div>
    </div>
  );

  if (item.href) {
    return (
      <Link href={item.href} className="block">
        {content}
      </Link>
    );
  }

  return content;
}

async function getTableCount(
  supabase: Awaited<ReturnType<typeof createClient>>,
  tableName: string,
  filters: Record<string, string | number | boolean | null> = {}
) {
  let query = supabase
    .from(tableName)
    .select('id', { count: 'exact', head: true });

  for (const [key, value] of Object.entries(filters)) {
    if (value === null) {
      query = query.is(key, null);
    } else {
      query = query.eq(key, value);
    }
  }

  const { count, error } = await query;

  if (error) {
    return 0;
  }

  return count ?? 0;
}

export default async function ResumenSistemaPage() {
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

  const admin = createAdminClient();
  let isPlatformOwner = false;
  
  if (admin) {
    const { data: owner } = await admin
      .from('platform_admins')
      .select('user_id, active')
      .eq('user_id', user.id)
      .eq('active', true)
      .maybeSingle();
      
    isPlatformOwner = Boolean(owner);
  }

  if (!isPlatformOwner) {
    redirect('/configuracion');
  }

  const supabase = await createClient();
  const organizationId = profile.organization_id;

  const [
    totalProfiles,
    activeEmployees,
    totalCases,
    totalDocuments,
    totalAiOutputs,
    pendingInvitations,
    totalAuditLogs,
  ] = await Promise.all([
    getTableCount(supabase, 'profiles', { organization_id: organizationId }),
    getTableCount(supabase, 'profiles', {
      organization_id: organizationId,
      role: 'employee',
      status: 'active',
    }),
    getTableCount(supabase, 'cases', { organization_id: organizationId }),
    getTableCount(supabase, 'documents', { organization_id: organizationId }),
    getTableCount(supabase, 'ai_outputs', { organization_id: organizationId }),
    getTableCount(supabase, 'user_invitations', {
      organization_id: organizationId,
      status: 'pending',
    }),
    getTableCount(supabase, 'audit_logs', { organization_id: organizationId }),
  ]);

  const activeModules: StatusItem[] = [
    {
      label: 'Dashboard',
      status: 'Activo',
      description: 'Panel principal con métricas, documentos, IA e invitaciones operativas.',
      tone: 'success',
      href: '/dashboard',
    },
    {
      label: 'Expedientes',
      status: 'Activo',
      description: 'Gestión operativa de expedientes vinculados a la organización.',
      tone: 'success',
      href: '/expedientes',
    },
    {
      label: 'Documentos',
      status: 'Activo',
description: 'Bóveda documental, carga de archivos, visor PDF y análisis IA en modo controlado.',
      tone: 'success',
      href: '/documentos',
    },
    {
      label: 'Reportes',
      status: 'Activo',
      description: 'Reportes operativos, auditoría y métricas de invitaciones.',
      tone: 'success',
      href: '/reportes',
    },
    {
      label: 'Usuarios e invitaciones',
      status: 'Controlado',
      description: 'Gestión administrativa de usuarios e invitaciones operativas.',
      tone: 'warning',
      href: '/usuarios',
    },
    {
      label: 'Configuración interna',
      status: 'En curso',
      description: 'Centro interno de estado beta, seguridad, entorno, documentación, IA y roadmap.',
      tone: 'warning',
      href: '/configuracion',
    },
  ];

  const protectedModules: StatusItem[] = [
    {
      label: 'Usuarios',
      status: 'Solo admin',
      description: 'Los perfiles employee no pueden acceder al módulo de usuarios.',
      tone: 'success',
    },
    {
      label: 'Invitaciones',
      status: 'Solo admin',
      description: 'La creación y gestión de invitaciones queda reservada a admin.',
      tone: 'success',
    },
    {
      label: 'Auditoría',
      status: 'Protegida',
      description: 'Los reportes de auditoría no están disponibles para employee.',
      tone: 'success',
    },
    {
      label: 'Paneles internos de configuración',
      status: 'Solo admin',
      description: 'Estado beta, seguridad, entorno, documentación, IA, roadmap y resumen quedan restringidos.',
      tone: 'success',
    },
  ];

const pendingModules: StatusItem[] = [
  {
    label: 'Contacto comercial real',
    status: 'Sprint 15 — Bloque 6',
    description:
      'Contactar primeros prospectos, registrar respuestas y agendar demos comerciales controladas.',
    tone: 'warning',
    href: '/configuracion/roadmap',
  },
  {
    label: 'Primeras demos con clientes',
    status: 'En preparación',
    description:
      'Usar la landing, el PDF comercial, el pitch de WhatsApp y la planilla de seguimiento para validar interés real.',
    tone: 'warning',
    href: '/configuracion/roadmap',
  },
  {
    label: 'Feedback comercial',
    status: 'Pendiente de clientes',
    description:
      'Registrar objeciones, rubros interesados, precio validado y necesidades de desarrollo a medida.',
    tone: 'default',
    href: '/configuracion/roadmap',
  },
  {
    label: 'Roadmap posterior',
    status: 'Luego de demos',
    description:
      'Definir próximas mejoras según respuesta real del mercado: filtros avanzados, clientes, reportes o integraciones futuras.',
    tone: 'default',
    href: '/configuracion/roadmap',
  },
];

  const systemHealth: StatusItem[] = [
    {
      label: 'Beta operativa comercial online',
      status: 'Funcional',
      description: 'La app está desplegada en Vercel y conectada a Supabase.',
      tone: 'success',
    },
    {
      label: 'Repositorio GitHub',
status: 'Documentado',
      description: 'El código está versionado sin .env.local, node_modules, .next ni .vercel.',
      tone: 'success',
    },
    {
      label: 'Supabase',
      status: 'Conectado',
      description: 'Auth, base de datos y storage se encuentran operativos para la beta.',
      tone: 'success',
    },
{
  label: 'Integración IA externa',
  status: 'No activa',
  description: 'La app mantiene análisis IA en modo controlado sin costos externos.',
  tone: 'warning',
},
    {
      label: 'Tester externo',
      status: 'Activo',
      description: 'Existe al menos un tester employee conectado a la organización.',
      tone: 'success',
    },
    {
      label: 'Incidencias críticas',
      status: '0 abiertas',
      description: 'No hay bugs críticos ni altos abiertos en la beta operativa comercial.',
      tone: 'success',
    },
  ];

const nextActions = [
  'Contactar primeros prospectos reales y registrar cada respuesta comercial.',
  'Agendar demos breves con estudios jurídicos, inmobiliarias, escribanías o áreas administrativas.',
  'Usar landing, PDF comercial, pitch de WhatsApp y planilla de seguimiento como kit mínimo de venta.',
  'Validar interés real, objeciones frecuentes, precio beta y necesidades de desarrollo a medida.',
  'Mantener backups, commits, builds y deploys por cada ajuste aprobado antes de mostrar a clientes.',
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
                Resumen general del sistema
              </h1>

              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                Vista ejecutiva interna para revisar en una sola pantalla el
estado actual del MVP, módulos activos, módulos protegidos,
próximos pasos comerciales, beta operativa comercial, IA, seguridad y despliegue.
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-950">
              <p className="font-black">Estado general</p>
              <p className="mt-1">Beta operativa comercial online</p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            title="Usuarios"
            value={totalProfiles}
            description="Perfiles conectados a la organización."
            tone="success"
          />

          <SummaryCard
            title="Testers activos"
            value={activeEmployees}
            description="Usuarios employee activos para validación externa."
            tone="success"
          />

          <SummaryCard
            title="Expedientes"
            value={totalCases}
            description="Expedientes disponibles dentro de la organización."
          />

          <SummaryCard
            title="Documentos"
            value={totalDocuments}
            description="Archivos registrados en la bóveda documental."
          />

          <SummaryCard
            title="Análisis IA"
            value={totalAiOutputs}
            description="Resultados generados por análisis IA documental en entorno beta"
            tone="success"
          />

          <SummaryCard
            title="Invitaciones pendientes"
            value={pendingInvitations}
            description="Invitaciones operativas pendientes de gestión."
            tone={pendingInvitations > 0 ? 'warning' : 'success'}
          />

          <SummaryCard
            title="Auditoría"
            value={totalAuditLogs}
            description="Eventos registrados para trazabilidad."
          />

<SummaryCard
  title="Integración IA externa"
  value="No activa"
  description="La beta no consume servicios externos de IA."
  tone="success"
/>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black text-slate-950">
              Módulos activos
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Partes funcionales del sistema actual.
            </p>

            <div className="mt-5 space-y-3">
              {activeModules.map((item) => (
                <StatusRow key={item.label} item={item} />
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black text-slate-950">
              Módulos protegidos
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Áreas restringidas para evitar acciones administrativas desde un tester employee.
            </p>

            <div className="mt-5 space-y-3">
              {protectedModules.map((item) => (
                <StatusRow key={item.label} item={item} />
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black text-slate-950">
              Salud operativa del sistema
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
Estado resumido de los componentes principales de la beta operativa comercial.
            </p>

            <div className="mt-5 space-y-3">
              {systemHealth.map((item) => (
                <StatusRow key={item.label} item={item} />
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black text-slate-950">
              Módulos pendientes
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Próximos módulos necesarios para acercar el MVP a una versión comercial seria.
            </p>

            <div className="mt-5 space-y-3">
              {pendingModules.map((item) => (
                <StatusRow key={item.label} item={item} />
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black text-slate-950">
              Próximas acciones recomendadas
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Orden recomendado para continuar sin romper la beta actual.
            </p>

            <div className="mt-5 space-y-3">
              {nextActions.map((action) => (
                <div
                  key={action}
                  className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm font-medium leading-6 text-slate-700"
                >
                  {action}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-950 p-6 text-white shadow-sm">
  <h2 className="text-xl font-black">
  Diagnóstico ejecutivo
</h2>

<p className="mt-3 text-sm leading-6 text-slate-300">
  Centinela IA Documentos funciona actualmente como beta operativa comercial,
  con landing pública, dashboard, expedientes, bóveda documental, visor PDF,
  análisis documental beta, historial IA, reportes, usuarios, auditoría,
  configuración interna, recuperación de contraseña, seguridad fuerte,
  permisos por rol y material comercial preparado. El foco actual es pasar
  del MVP validado a los primeros contactos reales con prospectos, demos
  comerciales y registro de respuestas del mercado.
</p>

<div className="mt-5 rounded-2xl border border-white/10 bg-white/10 p-4 text-sm font-bold">
  Estado actual: Sprint 15 — Bloque 6 — contacto comercial real y primeras demos
</div>
          </div>
        </section>

        <section className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row">
          <Link
            href="/configuracion"
            className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-center text-sm font-bold text-slate-700 hover:bg-slate-50"
          >
            Volver a configuración
          </Link>

          <Link
            href="/configuracion/roadmap"
            className="rounded-2xl bg-slate-950 px-5 py-3 text-center text-sm font-bold text-white hover:bg-slate-800"
          >
            Ver roadmap interno
          </Link>
        </section>
      </div>
    </AppShell>
  );
}