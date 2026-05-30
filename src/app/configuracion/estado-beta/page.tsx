import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { createClient } from '@/lib/supabase/server';
import { getUserProfile } from '@/lib/auth/getUserProfile';

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
      label: 'IA simulada sin OpenAI API paga',
      status: 'Activo',
    },
  ];

  const pendingItems = [
    'Mejorar pantalla de configuración general.',
    'Automatizar aceptación real de invitaciones.',
    'Crear recuperación de contraseña controlada.',
    'Mejorar documentación interna del sistema.',
    'Evaluar IA real solo si se decide activar API paga.',
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
                Estado de beta cerrada
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                Panel interno para revisar el estado operativo de la beta online,
                usuarios activos, documentos, análisis IA simulados, invitaciones
                y actividad reciente del sistema.
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-950">
              <p className="font-black">Estado general</p>
              <p className="mt-1">Beta cerrada online funcional</p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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
            description="Salidas generadas por IA simulada/local."
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
            title="API OpenAI"
            value="No activa"
            description="La beta continúa usando IA simulada/local."
            tone="success"
          />
        </section>

        <section className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-slate-950">
                  Checklist de beta
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Controles mínimos que ya fueron validados para la beta cerrada.
                </p>
              </div>
            </div>

            <div className="mt-5 divide-y divide-slate-100">
              {betaChecklist.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between gap-4 py-4"
                >
                  <p className="text-sm font-semibold text-slate-800">
                    {item.label}
                  </p>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black text-slate-950">
              Pendientes próximos
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Mejoras sugeridas para próximos bloques.
            </p>

            <div className="mt-5 space-y-3">
              {pendingItems.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm font-medium leading-6 text-slate-700"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-950">
                Actividad reciente
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Últimos eventos registrados en auditoría.
              </p>
            </div>

            <Link
              href="/reportes?vista=auditoria"
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
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
                      <p className="font-black text-slate-800">
                        {log.action ?? 'Evento sin acción'}
                      </p>
                      <p className="text-xs text-slate-500">
                        Acción registrada
                      </p>
                    </div>

                    <div>
                      <p className="font-semibold text-slate-700">
                        {log.resource_type ?? 'Sin recurso'}
                      </p>
                      <p className="text-xs text-slate-500">
                        Tipo de recurso
                      </p>
                    </div>

                    <div className="text-slate-600">
                      {formatDate(log.created_at)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-sm text-slate-500">
                Todavía no hay actividad reciente para mostrar.
              </div>
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-slate-950 p-6 text-white shadow-sm">
          <h2 className="text-xl font-black">
            Criterio actual de beta cerrada
          </h2>
          <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-300">
            La beta se considera funcional mientras no existan bugs críticos o
            altos abiertos, el login online funcione, el tester externo pueda
            navegar los módulos permitidos, las rutas sensibles sigan bloqueadas
            y no se utilicen documentos reales sensibles ni API paga de OpenAI.
          </p>
        </section>
      </div>
    </AppShell>
  );
}