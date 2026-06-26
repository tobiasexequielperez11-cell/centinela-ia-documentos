import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getUserProfile } from '@/lib/auth/getUserProfile';
import { createClient } from '@/lib/supabase/server';
import { AppShell } from '@/components/layout/AppShell';
import { MetricCard } from '@/components/dashboard/MetricCard';
import {
  getDocumentTypeLabel,
  normalizeIndustryType,
} from '@/lib/industries/documentTypes';
import {
  getDashboardCards,
  type DashboardCardKey,
} from '@/lib/industries/caseConfig';
import { analyzeDocument } from '../documentos/actions';
import { canViewAudit, isUserRole } from '@/lib/permissions/roles';

interface DashboardDocument {
  id: string;
  file_name: string;
  file_mime_type?: string | null;
  document_type?: string | null;
  sensitivity_level: string;
  created_at?: string | null;
}

interface DashboardActivityLog {
  id: string;
  action: string;
  resource_type?: string | null;
  created_at?: string | null;
  metadata?: Record<string, unknown> | null;
}

function formatDate(value?: string | null) {
  if (!value) return 'Sin registro';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return 'Sin registro';

  return new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
}

function formatSensitivity(value: string) {
  const labels: Record<string, string> = {
    low: 'Baja',
    medium: 'Media',
    high: 'Alta',
    critical: 'Critica',
  };

  return labels[value] ?? value;
}

function isSensitiveDocument(value?: string | null) {
  const normalized = String(value ?? '').toLowerCase();
  return ['high', 'critical', 'alto', 'alta', 'critica', 'crítica'].includes(
    normalized
  );
}

function formatAuditAction(action: string) {
  const labels: Record<string, string> = {
    document_uploaded: 'Documento cargado',
    document_viewed: 'Documento visualizado',
    document_analyzed: 'Analisis documental',
    case_created: 'Expediente creado',
    case_updated: 'Expediente actualizado',
    invitation_created: 'Invitacion creada',
    invitation_accepted: 'Invitacion aceptada',
    invitation_cancelled: 'Invitacion cancelada',
    user_role_updated: 'Rol actualizado',
  };

  return (
    labels[action] ??
    action
      .split('_')
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ')
  );
}

function getAuditDetail(log: DashboardActivityLog) {
  const metadata = log.metadata ?? {};
  const candidates = [
    metadata.file_name,
    metadata.case_title,
    metadata.email,
    metadata.target_email,
    log.resource_type,
  ];

  const detail = candidates.find(
    (value) => typeof value === 'string' && value.trim().length > 0
  );

  return typeof detail === 'string' ? detail : 'Actividad registrada';
}

function buildMetricCard(
  card: DashboardCardKey,
  values: {
    activeCases: number;
    loadedDocuments: number;
    pendingAnalysis: number;
    sensitiveDocuments: number;
  }
) {
  switch (card) {
    case 'expedientes_activos':
      return {
        label: 'Expedientes activos',
        value: String(values.activeCases),
        helper: 'Estado Activo',
      };
    case 'documentos_cargados':
      return {
        label: 'Documentos cargados',
        value: String(values.loadedDocuments),
        helper: 'Boveda privada',
      };
    case 'analisis_pendientes':
      return {
        label: 'Analisis pendientes',
        value: String(values.pendingAnalysis),
        helper: 'Sin analisis IA',
      };
    case 'documentos_sensibles':
      return {
        label: 'Documentos sensibles',
        value: String(values.sensitiveDocuments),
        helper: 'Alta o critica',
      };
    case 'actividad_reciente':
      return null;
    default:
      return null;
  }
}

export default async function DashboardPage() {
  const { user, profile } = await getUserProfile();

  if (!user) redirect('/login');
  if (!profile) redirect('/onboarding');

  const role = isUserRole(profile.role) ? profile.role : null;
  const mayViewAudit = role ? canViewAudit(role) : false;

  const supabase = await createClient();

  const [
    organizationResult,
    casesCount,
    documentsCount,
    documentsResult,
    aiOutputsResult,
    activityLogsResult,
  ] = await Promise.all([
    supabase
      .from('organizations')
      .select('industry_type')
      .eq('id', profile.organization_id)
      .maybeSingle(),

    supabase
      .from('cases')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', profile.organization_id)
      .eq('status', 'Activo'),

    supabase
      .from('documents')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', profile.organization_id),

    supabase
      .from('documents')
      .select('id, file_name, file_mime_type, document_type, sensitivity_level, created_at')
      .eq('organization_id', profile.organization_id)
      .order('created_at', { ascending: false }),

    supabase
      .from('ai_outputs')
      .select('document_id')
      .eq('organization_id', profile.organization_id)
      .eq('output_type', 'document_analysis'),

    mayViewAudit
      ? supabase
          .from('audit_logs')
          .select('id, action, resource_type, metadata, created_at')
          .eq('organization_id', profile.organization_id)
          .order('created_at', { ascending: false })
          .limit(5)
      : Promise.resolve({ data: [], error: null }),
  ]);

  const industry = normalizeIndustryType(organizationResult.data?.industry_type);
  const dashboardCards = getDashboardCards(industry);
  const documents = (documentsResult.data ?? []) as DashboardDocument[];
  const aiOutputs = aiOutputsResult.data ?? [];
  const recentActivity =
    (activityLogsResult.data ?? []) as DashboardActivityLog[];

  const analysisCountByDocument = new Map<string, number>();

  for (const item of aiOutputs) {
    const documentId = String(item.document_id || '');
    if (!documentId) continue;

    analysisCountByDocument.set(
      documentId,
      (analysisCountByDocument.get(documentId) ?? 0) + 1
    );
  }

  const analyzedDocuments = documents.filter(
    (document) => (analysisCountByDocument.get(document.id) ?? 0) > 0
  );

  const pendingDocuments = documents.filter(
    (document) => (analysisCountByDocument.get(document.id) ?? 0) === 0
  );

  const reanalyzedDocuments = documents.filter(
    (document) => (analysisCountByDocument.get(document.id) ?? 0) > 1
  );

  const coverage =
    documents.length > 0
      ? Math.round((analyzedDocuments.length / documents.length) * 100)
      : 0;

  const pendingPreview = pendingDocuments.slice(0, 5);
  const sensitiveDocuments = documents.filter((document) =>
    isSensitiveDocument(document.sensitivity_level)
  );

  const metricCards = dashboardCards
    .map((card) =>
      buildMetricCard(card, {
        activeCases: casesCount.count ?? 0,
        loadedDocuments: documentsCount.count ?? 0,
        pendingAnalysis: pendingDocuments.length,
        sensitiveDocuments: sensitiveDocuments.length,
      })
    )
    .filter((card): card is NonNullable<typeof card> => Boolean(card));

  const showRecentActivity = dashboardCards.includes('actividad_reciente');

  return (
    <AppShell>
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">
          Panel principal
        </p>

        <h2 className="mt-2 text-3xl font-bold text-slate-950">
          Bienvenido, {profile.full_name}
        </h2>

        <p className="mt-2 text-sm text-slate-600">
          Resumen operativo de expedientes, documentos, analisis IA y actividad auditada.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </div>

      {showRecentActivity ? (
        <section className="mt-8 rounded-3xl border border-white/10 bg-white/[0.055] p-6 shadow-[0_18px_45px_rgba(0,0,0,0.18)] backdrop-blur-sm">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-400">
                Actividad reciente
              </p>
              <h3 className="mt-2 text-2xl font-bold text-white">
                Ultimos eventos auditados
              </h3>
            </div>
            <Link
              href="/reportes"
              className="rounded-2xl border border-white/10 px-5 py-3 text-center text-sm font-bold text-white hover:border-sky-400 hover:text-sky-300"
            >
              Ver reportes
            </Link>
          </div>

          <div className="mt-5 space-y-3">
            {!mayViewAudit ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-slate-300">
                Tu rol no tiene acceso a la auditoria.
              </div>
            ) : recentActivity.length > 0 ? (
              recentActivity.map((log) => (
                <div
                  key={log.id}
                  className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-bold text-white">
                      {formatAuditAction(log.action)}
                    </p>
                    <p className="mt-1 text-sm text-slate-400">
                      {getAuditDetail(log)}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-slate-400">
                    {formatDate(log.created_at)}
                  </span>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-slate-300">
                Todavia no hay actividad auditada para mostrar.
              </div>
            )}
          </div>
        </section>
      ) : null}

      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">
                IA documental
              </p>

              <h3 className="mt-2 text-2xl font-bold text-slate-950">
                Cobertura de analisis
              </h3>

              <p className="mt-2 text-sm text-slate-600">
                Seguimiento de documentos procesados, pendientes y reanalizados.
              </p>
            </div>

            <Link
              href="/documentos?ia=pendientes"
              className="rounded-2xl bg-slate-950 px-5 py-3 text-center text-sm font-bold text-white hover:bg-slate-800"
            >
              Ver pendientes
            </Link>
          </div>

          <div className="mt-6">
            <div className="mb-2 flex justify-between text-sm">
              <span className="font-semibold text-slate-600">
                Cobertura IA
              </span>
              <span className="font-bold text-slate-950">{coverage}%</span>
            </div>

            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-sky-500"
                style={{ width: `${coverage}%` }}
              />
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Procesados
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-950">
                {analyzedDocuments.length}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Pendientes
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-950">
                {pendingDocuments.length}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Reanalizados
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-950">
                {reanalyzedDocuments.length}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-slate-950">
                Documentos pendientes de analisis
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Primeros documentos que todavia requieren procesamiento IA.
              </p>
            </div>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
              {pendingDocuments.length} pendientes
            </span>
          </div>

          <div className="mt-5 space-y-3">
            {pendingPreview.length > 0 ? (
              pendingPreview.map((document) => {
                const isPdf = document.file_mime_type === 'application/pdf';

                return (
                  <div
                    key={document.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <Link href={`/documentos/${document.id}`}>
                      <p className="font-bold text-slate-950 hover:text-sky-700">
                        {document.file_name}
                      </p>
                    </Link>

                    <p className="mt-1 text-xs text-slate-500">
                      Tipo: {getDocumentTypeLabel(document.document_type)} - Sensibilidad:{' '}
                      {formatSensitivity(document.sensitivity_level)}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <Link
                        href={`/documentos/${document.id}`}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                      >
                        Ver documento
                      </Link>

                      {isPdf ? (
                        <form action={analyzeDocument}>
                          <input
                            type="hidden"
                            name="document_id"
                            value={document.id}
                          />

                          <button className="rounded-xl bg-slate-950 px-3 py-2 text-xs font-bold text-white hover:bg-slate-800">
                            Analizar IA
                          </button>
                        </form>
                      ) : (
                        <span className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-500">
                          IA solo PDF
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-2xl bg-sky-50 p-4 text-sm text-sky-800">
                Todos los documentos cargados ya tienen al menos un analisis IA.
              </div>
            )}
          </div>

          {pendingDocuments.length > 5 ? (
            <Link
              href="/documentos?ia=pendientes"
              className="mt-5 inline-flex text-sm font-bold text-sky-600 hover:text-sky-700"
            >
              Ver todos los pendientes
            </Link>
          ) : null}
        </section>
      </div>
    </AppShell>
  );
}
