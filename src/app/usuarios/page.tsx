import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { createClient } from '@/lib/supabase/server';
import { getUserProfile } from '@/lib/auth/getUserProfile';
import { updateUserAccess } from './actions';

interface UsuariosPageProps {
  searchParams: Promise<{
    success?: string;
    error?: string;
  }>;
}

interface ProfileRecord {
  id: string;
  organization_id?: string | null;
  full_name?: string | null;
  email?: string | null;
  role?: string | null;
  status?: string | null;
  last_login_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

interface AuditLogRecord {
  id: string;
  user_id?: string | null;
  action: string;
  resource_type?: string | null;
  resource_id?: string | null;
  created_at?: string | null;
  metadata?: Record<string, unknown> | null;
}

interface InvitationMetricsRecord {
  total_invitations?: number | null;
  pending_invitations?: number | null;
  accepted_invitations?: number | null;
  cancelled_invitations?: number | null;
  expired_invitations?: number | null;
  last_invitation_created_at?: string | null;
}

const roleOptions = [
  { value: 'admin', label: 'Administrador' },
  { value: 'employee', label: 'Operador' },
  { value: 'auditor', label: 'Auditor' },
  { value: 'client', label: 'Cliente' },
];

const statusOptions = [
  { value: 'active', label: 'Activo' },
  { value: 'invited', label: 'Invitado' },
  { value: 'inactive', label: 'Inactivo' },
];

function formatDate(value?: string | null) {
  if (!value) return 'Sin registro';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return 'Sin registro';

  return new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
}

function getInitials(name?: string | null, email?: string | null) {
  const source = name || email || 'Usuario';

  const parts = source
    .replace('@', ' ')
    .replace('.', ' ')
    .split(' ')
    .filter(Boolean);

  const first = parts[0]?.[0] ?? 'U';
  const second = parts[1]?.[0] ?? '';

  return `${first}${second}`.toUpperCase();
}

function roleLabel(role?: string | null) {
  const labels: Record<string, string> = {
    admin: 'Administrador',
    employee: 'Operador',
    auditor: 'Auditor',
    client: 'Cliente',
  };

  return labels[role ?? ''] ?? role ?? 'Sin rol';
}

function roleDescription(role?: string | null) {
  const descriptions: Record<string, string> = {
    admin: 'Puede administrar usuarios, accesos y operación general.',
    employee: 'Puede operar expedientes, documentos y análisis.',
    auditor: 'Puede revisar trazabilidad, actividad y documentación.',
    client: 'Perfil pensado para acceso limitado del cliente.',
  };

  return descriptions[role ?? ''] ?? 'Rol pendiente de definición.';
}

function roleTone(role?: string | null) {
  if (role === 'admin') return 'bg-slate-950 text-white';
  if (role === 'auditor') return 'bg-violet-50 text-violet-700';
  if (role === 'client') return 'bg-amber-50 text-amber-700';

  return 'bg-sky-50 text-sky-700';
}

function statusLabel(status?: string | null) {
  const labels: Record<string, string> = {
    active: 'Activo',
    inactive: 'Inactivo',
    invited: 'Invitado',
  };

  return labels[status ?? ''] ?? status ?? 'Sin estado';
}

function statusTone(status?: string | null) {
  if (status === 'active') return 'bg-emerald-50 text-emerald-700';
  if (status === 'inactive') return 'bg-rose-50 text-rose-700';
  if (status === 'invited') return 'bg-amber-50 text-amber-700';

  return 'bg-slate-100 text-slate-600';
}

function actionLabel(value: string) {
  const labels: Record<string, string> = {
    organization_created: 'Organización creada',
    case_created: 'Expediente creado',
    case_status_updated: 'Estado de expediente actualizado',
    document_uploaded: 'Documento cargado',
    document_viewed: 'Documento visualizado',
    document_analyzed_beta: 'Documento analizado con IA documental',
    user_access_updated: 'Acceso de usuario actualizado',
    user_invitation_created: 'Invitación de usuario creada',
  };

  return labels[value] ?? value;
}

function resourceLabel(value?: string | null) {
  const labels: Record<string, string> = {
    document: 'Documento',
    case: 'Expediente',
    organization: 'Organización',
    user: 'Usuario',
    user_invitation: 'Invitación de usuario',
    invitation: 'Invitación',
  };

  return labels[value ?? ''] ?? value ?? 'Sistema';
}

function countUserEvents(userId: string, auditLogs: AuditLogRecord[]) {
  return auditLogs.filter((item) => item.user_id === userId).length;
}

function getLastUserEvent(userId: string, auditLogs: AuditLogRecord[]) {
  return auditLogs.find((item) => item.user_id === userId) ?? null;
}

function getUsersByRole(users: ProfileRecord[], role: string) {
  return users.filter((item) => item.role === role).length;
}

function getMetricValue(value?: number | null) {
  return value ?? 0;
}

function getMessage(params: { success?: string; error?: string }) {
  if (params.success === 'access_updated') {
    return {
      type: 'success',
      text: 'Acceso de usuario actualizado correctamente.',
    };
  }

  const errors: Record<string, string> = {
    missing_fields: 'Faltan datos para actualizar el acceso.',
    invalid_role: 'El rol seleccionado no es válido.',
    invalid_status: 'El estado seleccionado no es válido.',
    admin_required: 'Solo un administrador puede modificar accesos.',
    user_not_found: 'No se encontró el usuario dentro de la organización.',
    self_change_blocked:
      'Por seguridad, no podés modificar tu propio rol o estado desde este panel.',
    update_failed:
      'No se pudo actualizar el acceso. Revisá políticas RLS o restricciones de la tabla profiles.',
  };

  if (params.error) {
    return {
      type: 'error',
      text: errors[params.error] ?? 'Ocurrió un error al procesar la acción.',
    };
  }

  return null;
}

export default async function UsuariosPage({ searchParams }: UsuariosPageProps) {
  const params = await searchParams;
  const message = getMessage(params);

  const { user, profile } = await getUserProfile();

  if (!user) redirect('/login');
  if (!profile) redirect('/onboarding');

  if (profile.role !== "admin") {
  redirect("/acceso-denegado");
}

  const supabase = await createClient();

  const [profilesResult, auditLogsResult, invitationMetricsResult] = await Promise.all([
    supabase
      .from('profiles')
      .select(
        'id, organization_id, full_name, email, role, status, last_login_at, created_at, updated_at'
      )
      .eq('organization_id', profile.organization_id)
      .order('created_at', { ascending: true }),

    supabase
      .from('audit_logs')
      .select('id, user_id, action, resource_type, resource_id, metadata, created_at')
      .eq('organization_id', profile.organization_id)
      .order('created_at', { ascending: false })
      .limit(80),

    supabase
      .from('invitation_operational_metrics')
      .select(
        'total_invitations, pending_invitations, accepted_invitations, cancelled_invitations, expired_invitations, last_invitation_created_at'
      )
      .maybeSingle(),
  ]);

  const users = (profilesResult.data ?? []) as ProfileRecord[];
  const auditLogs = (auditLogsResult.data ?? []) as AuditLogRecord[];
  const invitationMetrics =
    (invitationMetricsResult.data as InvitationMetricsRecord | null) ?? null;

  const sortedUsers = [...users].sort((a, b) => {
    if (a.id === user.id) return -1;
    if (b.id === user.id) return 1;

    return String(a.full_name ?? a.email ?? '').localeCompare(
      String(b.full_name ?? b.email ?? '')
    );
  }); 

  const activeUsers = users.filter((item) => item.status === 'active').length;
  const invitedUsers = users.filter((item) => item.status === 'invited').length;
  const inactiveUsers = users.filter((item) => item.status === 'inactive').length;

  const adminUsers = getUsersByRole(users, 'admin');
  const employeeUsers = getUsersByRole(users, 'employee');
  const auditorUsers = getUsersByRole(users, 'auditor');
  const clientUsers = getUsersByRole(users, 'client');

  const recentUserActivity = auditLogs.filter((item) => item.user_id).slice(0, 10);

  const canManageAccess = profile.role === 'admin';

  const totalInvitations = getMetricValue(invitationMetrics?.total_invitations);
  const pendingInvitations = getMetricValue(invitationMetrics?.pending_invitations);
  const acceptedInvitations = getMetricValue(invitationMetrics?.accepted_invitations);
  const cancelledInvitations = getMetricValue(invitationMetrics?.cancelled_invitations);
  const expiredInvitations = getMetricValue(invitationMetrics?.expired_invitations);

  const hasInvitationMetricsError = Boolean(invitationMetricsResult.error);
  const hasPendingExpiredInvitations = expiredInvitations > 0;

  const metrics = [
    {
      label: 'Usuarios totales',
      value: users.length,
      helper: 'Perfiles de la organización',
    },
    {
      label: 'Usuarios activos',
      value: activeUsers,
      helper: 'Con acceso habilitado',
    },
    {
      label: 'Invitados',
      value: invitedUsers,
      helper: 'Perfiles marcados como invitados',
    },
    {
      label: 'Inactivos',
      value: inactiveUsers,
      helper: 'Acceso deshabilitado',
    },
  ];

  const invitationCards = [
    {
      label: 'Invitaciones totales',
      value: totalInvitations,
      helper: 'Registros operativos creados',
    },
    {
      label: 'Pendientes',
      value: pendingInvitations,
      helper: 'Esperando activación manual',
    },
    {
      label: 'Aceptadas',
      value: acceptedInvitations,
      helper: 'Invitaciones ya completadas',
    },
    {
      label: 'Vencidas',
      value: expiredInvitations,
      helper: 'Pendientes fuera de plazo',
    },
  ];

  return (
    <AppShell>
      <div className="mb-8 flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">
            Usuarios
          </p>

          <h2 className="mt-2 text-3xl font-bold text-slate-950">
            Control de usuarios y accesos
          </h2>

          <p className="mt-2 text-sm text-slate-600">
            Administración controlada de perfiles, roles, estado de acceso, invitaciones
            operativas y actividad auditada.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/usuarios/invitaciones"
            className="rounded-2xl bg-sky-600 px-5 py-3 text-sm font-bold text-white hover:bg-sky-700"
          >
            Gestionar invitaciones
          </Link>

          <Link
            href="/reportes?vista=auditoria"
            className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
          >
            Ver auditoría
          </Link>

          <Link
            href="/documentos"
            className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800"
          >
            Ver documentos
          </Link>
        </div>
      </div>

      {message ? (
        <div
          className={`mb-6 rounded-2xl border px-5 py-4 text-sm font-semibold ${
            message.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-rose-200 bg-rose-50 text-rose-700'
          }`}
        >
          {message.text}
        </div>
      ) : null}

      {hasInvitationMetricsError ? (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-semibold text-amber-800">
          No se pudieron leer las métricas operativas de invitaciones. Verificá que la vista
          public.invitation_operational_metrics exista y tenga permisos de lectura.
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm font-semibold text-slate-500">{metric.label}</p>

            <p className="mt-2 text-3xl font-bold text-slate-950">{metric.value}</p>

            <p className="mt-3 text-xs text-slate-500">{metric.helper}</p>
          </div>
        ))}
      </div>

      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex flex-col justify-between gap-4 xl:flex-row xl:items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">
              Invitaciones operativas
            </p>

            <h3 className="mt-2 text-2xl font-bold text-slate-950">
              Estado general de invitaciones
            </h3>

            <p className="mt-2 text-sm text-slate-600">
Seguimiento de invitaciones, altas pendientes y accesos gestionados durante la beta operativa.
            </p>
          </div>

          <Link
            href="/usuarios/invitaciones"
            className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800"
          >
            Abrir bandeja de invitaciones
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {invitationCards.map((metric) => (
            <div
              key={metric.label}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
            >
              <p className="text-sm font-semibold text-slate-500">{metric.label}</p>

              <p className="mt-2 text-3xl font-bold text-slate-950">{metric.value}</p>

              <p className="mt-3 text-xs text-slate-500">{metric.helper}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 grid gap-4 xl:grid-cols-[1fr_0.8fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm font-bold text-slate-950">
              Última invitación creada
            </p>

            <p className="mt-2 text-sm text-slate-600">
              {formatDate(invitationMetrics?.last_invitation_created_at)}
            </p>

            <p className="mt-3 text-xs leading-5 text-slate-500">
              Esta fecha proviene de la vista operativa de invitaciones y sirve como
              referencia rápida para controlar actividad reciente de accesos e invitaciones.
            </p>
          </div>

          <div
            className={`rounded-2xl border p-5 ${
              hasPendingExpiredInvitations
                ? 'border-amber-200 bg-amber-50'
                : 'border-emerald-200 bg-emerald-50'
            }`}
          >
            <p
              className={`text-sm font-bold ${
                hasPendingExpiredInvitations ? 'text-amber-950' : 'text-emerald-950'
              }`}
            >
              Estado operativo
            </p>

            <p
              className={`mt-2 text-sm leading-6 ${
                hasPendingExpiredInvitations ? 'text-amber-800' : 'text-emerald-800'
              }`}
            >
              {hasPendingExpiredInvitations
                ? 'Hay invitaciones vencidas o pendientes fuera de plazo. Conviene cancelarlas o recrearlas para mantener limpio el control de accesos.'
                : 'No se detectan invitaciones vencidas. El control operativo de accesos se mantiene limpio.'}
            </p>

            <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold">
              <span
                className={`rounded-full px-3 py-1 ${
                  pendingInvitations > 0
                    ? 'bg-sky-100 text-sky-700'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {pendingInvitations} pendientes
              </span>

              <span
                className={`rounded-full px-3 py-1 ${
                  cancelledInvitations > 0
                    ? 'bg-rose-100 text-rose-700'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {cancelledInvitations} canceladas
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_0.75fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-col justify-between gap-4 xl:flex-row xl:items-start">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">
                Directorio
              </p>

              <h3 className="mt-2 text-2xl font-bold text-slate-950">
                Usuarios de la organización
              </h3>

              <p className="mt-2 text-sm text-slate-600">
                Perfiles registrados con control de rol y estado operativo.
              </p>
            </div>

            <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-600">
              {users.length} perfiles
            </span>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Usuario</th>
                  <th className="px-4 py-3">Rol actual</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Actividad</th>
                  <th className="px-4 py-3">Administración</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {sortedUsers.map((item) => {
                  const eventCount = countUserEvents(item.id, auditLogs);
                  const lastEvent = getLastUserEvent(item.id, auditLogs);
                  const isCurrentUser = item.id === user.id;

                  return (
                    <tr key={item.id} className="align-top hover:bg-slate-50">
                      <td className="px-4 py-4">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-sm font-bold text-white">
                            {getInitials(item.full_name, item.email)}
                          </div>

                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-bold text-slate-950">
                                {item.full_name ?? 'Usuario sin nombre'}
                              </p>

                              {isCurrentUser ? (
                                <span className="rounded-full bg-sky-50 px-2 py-1 text-[11px] font-bold text-sky-700">
                                  Tu usuario
                                </span>
                              ) : null}
                            </div>

                            <p className="mt-1 text-xs text-slate-500">
                              {item.email ?? 'Sin email registrado'}
                            </p>

                            <p className="mt-2 text-xs text-slate-400">
                              Último acceso: {formatDate(item.last_login_at)}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${roleTone(
                            item.role
                          )}`}
                        >
                          {roleLabel(item.role)}
                        </span>

                        <p className="mt-2 max-w-xs text-xs leading-5 text-slate-500">
                          {roleDescription(item.role)}
                        </p>
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${statusTone(
                            item.status
                          )}`}
                        >
                          {statusLabel(item.status)}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <p className="font-bold text-slate-950">
                          {eventCount} eventos
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Último:{' '}
                          {lastEvent ? actionLabel(lastEvent.action) : 'Sin actividad'}
                        </p>
                      </td>

                      <td className="px-4 py-4">
                        {!canManageAccess ? (
                          <div className="rounded-2xl bg-slate-50 p-3 text-xs font-semibold text-slate-500">
                            Solo administradores pueden modificar accesos.
                          </div>
                        ) : isCurrentUser ? (
                          <div className="rounded-2xl border border-sky-100 bg-sky-50 p-3 text-xs font-semibold leading-5 text-sky-700">
                            Usuario protegido. No podés modificar tu propio rol o estado desde
                            este panel.
                          </div>
                        ) : (
                          <form action={updateUserAccess} className="space-y-3">
                            <input type="hidden" name="user_id" value={item.id} />

                            <div>
                              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">
                                Rol
                              </label>

                              <select
                                name="role"
                                defaultValue={item.role ?? 'employee'}
                                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-sky-400"
                              >
                                {roleOptions.map((option) => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">
                                Estado
                              </label>

                              <select
                                name="status"
                                defaultValue={item.status ?? 'active'}
                                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-sky-400"
                              >
                                {statusOptions.map((option) => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <button
                              type="submit"
                              className="w-full rounded-xl bg-slate-950 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800"
                            >
                              Actualizar acceso
                            </button>
                          </form>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {sortedUsers.length === 0 ? (
              <div className="p-6 text-sm text-slate-500">
                Todavía no hay usuarios registrados para esta organización.
              </div>
            ) : null}
          </div>
        </section>

        <section className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">
              Roles
            </p>

            <h3 className="mt-2 text-2xl font-bold text-slate-950">
              Distribución de accesos
            </h3>

            <p className="mt-2 text-sm text-slate-600">
              Resumen de perfiles según rol operativo.
            </p>

            <div className="mt-6 grid gap-3">
              <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
                <div>
                  <p className="font-bold text-slate-950">Administradores</p>
                  <p className="text-xs text-slate-500">Control general</p>
                </div>
                <span className="text-2xl font-bold text-slate-950">
                  {adminUsers}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
                <div>
                  <p className="font-bold text-slate-950">Operadores</p>
                  <p className="text-xs text-slate-500">Trabajo documental</p>
                </div>
                <span className="text-2xl font-bold text-slate-950">
                  {employeeUsers}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
                <div>
                  <p className="font-bold text-slate-950">Auditores</p>
                  <p className="text-xs text-slate-500">Control y revisión</p>
                </div>
                <span className="text-2xl font-bold text-slate-950">
                  {auditorUsers}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
                <div>
                  <p className="font-bold text-slate-950">Clientes</p>
                  <p className="text-xs text-slate-500">Acceso limitado</p>
                </div>
                <span className="text-2xl font-bold text-slate-950">
                  {clientUsers}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
              Seguridad
            </p>

            <h3 className="mt-2 text-xl font-bold text-emerald-950">
              Administración protegida
            </h3>

            <p className="mt-2 text-sm leading-6 text-emerald-800">
              Solo usuarios administradores pueden modificar roles y estados. Además,
              el sistema bloquea cambios sobre el propio usuario para evitar perder acceso
              al panel.
            </p>
          </div>

          <div className="rounded-3xl border border-sky-200 bg-sky-50 p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">
              Gestión de accesos
            </p>

            <h3 className="mt-2 text-xl font-bold text-sky-950">
              Invitaciones operativas
            </h3>

            <p className="mt-2 text-sm leading-6 text-sky-800">
Las invitaciones permiten organizar altas, roles, estados y trazabilidad de accesos dentro de la organización.
            </p>

            <Link
              href="/usuarios/invitaciones"
              className="mt-5 inline-flex rounded-2xl bg-sky-700 px-5 py-3 text-sm font-bold text-white hover:bg-sky-800"
            >
              Revisar invitaciones
            </Link>
          </div>
        </section>
      </div>

      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex flex-col justify-between gap-4 xl:flex-row xl:items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">
              Trazabilidad
            </p>

            <h3 className="mt-2 text-2xl font-bold text-slate-950">
              Actividad reciente por usuarios
            </h3>

            <p className="mt-2 text-sm text-slate-600">
              Últimos eventos vinculados a usuarios dentro de la organización.
            </p>
          </div>

          <Link
            href="/reportes?vista=auditoria"
            className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
          >
            Abrir centro de auditoría
          </Link>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Evento</th>
                <th className="px-4 py-3">Usuario</th>
                <th className="px-4 py-3">Recurso</th>
                <th className="px-4 py-3">Fecha</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {recentUserActivity.map((event) => {
                const actor = users.find((item) => item.id === event.user_id);

                return (
                  <tr key={event.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <p className="font-bold text-slate-950">
                        {actionLabel(event.action)}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {event.action}
                      </p>
                    </td>

                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-800">
                        {actor?.full_name ?? actor?.email ?? 'Usuario no identificado'}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {roleLabel(actor?.role)}
                      </p>
                    </td>

                    <td className="px-4 py-3 text-slate-600">
                      {resourceLabel(event.resource_type)}
                    </td>

                    <td className="px-4 py-3 text-slate-500">
                      {formatDate(event.created_at)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {recentUserActivity.length === 0 ? (
            <div className="p-6 text-sm text-slate-500">
              Todavía no hay actividad auditada vinculada a usuarios.
            </div>
          ) : null}
        </div>
      </section>
    </AppShell>
  );
}