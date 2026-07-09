import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { MotionCard } from '@/components/ui/MotionCard';;
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getUserProfile } from '@/lib/auth/getUserProfile';
import { formatAuditActionLabel } from '@/lib/audit/actionLabels';

interface CountCardProps {
  title: string;
  value: number | string;
  description: string;
  tone?: 'default' | 'success' | 'warning' | 'danger';
}

interface AuditLogRecord {
  id?: string;
  action?: string | null;
  resource_type?: string | null;
  created_at?: string | null;
}

function getToneClasses(tone: CountCardProps['tone'] = 'default') {
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

function CountCard({ title, value, description, tone = 'default' }: CountCardProps) {
  return (
    <div className={`rounded-3xl border p-5 shadow-sm ${getToneClasses(tone)}`}>
      <p className="text-xs font-bold uppercase tracking-[0.22em] opacity-70">
        {title}
      </p>
      <p className="mt-3 text-3xl font-black">{value}</p>
      <p className="mt-2 text-sm leading-6 opacity-80">{description}</p>
    </div>
  );
}

function formatDate(value?: string | null) {
  if (!value) {
    return 'Sin fecha';
  }

  try {
    return new Intl.DateTimeFormat('es-AR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(value));
  } catch {
    return value;
  }
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

export default async function EstadoBetaPage() {
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
    totalDocuments,
    totalCases,
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
    getTableCount(supabase, 'documents', { organization_id: organizationId }),
    getTableCount(supabase, 'cases', { organization_id: organizationId }),
    getTableCount(supabase, 'ai_outputs'),
    getTableCount(supabase, 'user_invitations', {
      organization_id: organizationId,
      status: 'pending',
    }),
    getTableCount(supabase, 'audit_logs', { organization_id: organizationId }),
  ]);

  const { data: recentAuditLogs } = await supabase
    .from('audit_logs')
    .select('id, action, resource_type, created_at')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })
    .limit(6);

  const auditLogs = (recentAuditLogs ?? []) as AuditLogRecord[];

  const betaChecklist = [
    {
      label: 'Deploy online en Vercel',
      status: 'Validado',
    },
    {
      label: 'Login y logout online',
      status: 'Validado',
    },
    {
      label: 'Supabase conectado',
      status: 'Validado',
    },
    {
      label: 'Tester externo employee',
      status: 'Validado',
    },
    {
      label: 'Bloqueo de rutas sensibles',
      status: 'Validado',
    },
    {
      label: 'IA documental en entorno beta',
      status: 'Activo',
    },
  ];

  const pendingItems = [
    'Registrar feedback comercial de los primeros prospectos.',
    'Agendar y documentar demos controladas con clientes reales.',
    'Actualizar material comercial según objeciones y necesidades detectadas.',
    'Definir mejoras futuras según validación real del mercado.',
    'Evaluar integración IA externa solo después de validar costos, privacidad y demanda.',
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
                Estado de beta operativa comercial
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
                Panel interno para revisar el estado operativo de la beta online,
                usuarios activos, documentos, análisis IA documentales, invitaciones
                y actividad reciente del sistema.
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-4 text-sm text-emerald-950">
              <p className="font-black">Estado general</p>
              <p className="mt-1">Beta operativa comercial online</p>
            </div>
          </div>
        </MotionCard>

        <MotionCard index={1} className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <CountCard
            title="Usuarios"
            value={totalProfiles}
            description="Perfiles conectados a la organización actual."
          />

          <CountCard
            title="Testers activos"
            value={activeEmployees}
            description="Usuarios employee activos para prueba controlada."
            tone="success"
          />

          <CountCard
            title="Documentos"
            value={totalDocuments}
            description="Documentos registrados en la bóveda documental."
          />

          <CountCard
            title="Expedientes"
            value={totalCases}
            description="Expedientes cargados en la organización."
          />

          <CountCard
            title="Análisis IA"
            value={totalAiOutputs}
            description="Salidas generadas por análisis IA documental"
          />

          <CountCard
            title="Invitaciones pendientes"
            value={pendingInvitations}
            description="Invitaciones operativas pendientes de control."
            tone={pendingInvitations > 0 ? 'warning' : 'success'}
          />

          <CountCard
            title="Auditoría"
            value={totalAuditLogs}
            description="Eventos registrados en audit_logs."
          />

<CountCard
  title="Integración IA externa"
  value="No activa"
  description="La plataforma mantiene análisis documental beta en modo controlado.."
  tone="success"
/>
        </MotionCard>

        <MotionCard index={2} className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-white">
                  Checklist de beta
                </h2>
                <p className="mt-1 text-sm text-slate-300">
Controles mínimos que ya fueron validados para la beta operativa comercial.
                </p>
              </div>
            </div>

            <div className="mt-5 divide-y divide-slate-100">
              {betaChecklist.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between gap-4 py-4"
                >
                  <p className="text-sm font-semibold text-slate-200">
                    {item.label}
                  </p>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-sm">
            <h2 className="text-xl font-black text-white">
              Próximos pasos comerciales
            </h2>
            <p className="mt-1 text-sm text-slate-300">
              Acciones sugeridas para validar la beta operativa comercial con
              prospectos reales.
            </p>

            <div className="mt-5 space-y-3">
              {pendingItems.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 text-sm font-medium leading-6 text-slate-200"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </MotionCard>

        <MotionCard index={3} className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-black text-white">
                Actividad reciente
              </h2>
              <p className="mt-1 text-sm text-slate-300">
                Últimos eventos registrados en auditoría.
              </p>
            </div>

            <Link
              href="/reportes?vista=auditoria"
              className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-bold text-slate-200 hover:bg-white/[0.02]"
            >
              Ver auditoría completa
            </Link>
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl border border-slate-100">
            {auditLogs.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {auditLogs.map((log) => (
                  <div
                    key={log.id ?? `${log.action}-${log.created_at}`}
                    className="grid gap-2 p-4 text-sm md:grid-cols-[1fr_1fr_180px]"
                  >
                    <div>
                      <p className="font-black text-slate-200">
                        {formatAuditActionLabel(log.action)}
                      </p>
                      <p className="text-xs text-slate-400">
                        Acción registrada
                      </p>
                    </div>

                    <div>
                      <p className="font-semibold text-slate-200">
                        {log.resource_type ?? 'Sin recurso'}
                      </p>
                      <p className="text-xs text-slate-400">
                        Tipo de recurso
                      </p>
                    </div>

                    <div className="text-slate-300">
                      {formatDate(log.created_at)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-sm text-slate-400">
                Todavía no hay actividad reciente para mostrar.
              </div>
            )}
          </div>
        </MotionCard>

        <MotionCard index={4} className="rounded-3xl border border-white/10 bg-white/10 p-6 text-white shadow-sm">
          <h2 className="text-xl font-black">
Criterio actual de beta operativa comercial
          </h2>
          <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-300">
La beta operativa comercial se considera funcional mientras no existan bugs críticos o altos abiertos, el login online funcione correctamente, los roles se mantengan protegidos y el análisis documental beta opere en modo controlado.
          </p>
        </MotionCard>
      </div>
    </AppShell>
  );
}
