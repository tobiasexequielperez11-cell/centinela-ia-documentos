import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getUserProfile } from '@/lib/auth/getUserProfile';
import { createClient } from '@/lib/supabase/server';
import { AppShell } from '@/components/layout/AppShell';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { analyzeDocument } from '../documentos/actions';

interface DashboardDocument {
  id: string;
  file_name: string;
  file_mime_type?: string | null;
  document_type?: string | null;
  sensitivity_level: string;
  created_at?: string | null;
}

interface InvitationMetricsRecord {
  total_invitations?: number | null;
  pending_invitations?: number | null;
  accepted_invitations?: number | null;
  cancelled_invitations?: number | null;
  expired_invitations?: number | null;
  last_invitation_created_at?: string | null;
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

function getMetricValue(value?: number | null) {
  return value ?? 0;
}

function formatDocumentType(value?: string | null) {
  if (!value) return 'Sin clasificar';

  const labels: Record<string, string> = {
    general: 'General',
    rental: 'Contrato de alquiler',
    real_estate_purchase: 'Compraventa inmobiliaria',
    contrato: 'Contrato',
    factura: 'Factura',
    recibo: 'Recibo',
    escritura: 'Escritura',
    dni: 'DNI',
    demanda: 'Demanda',
    escrito: 'Escrito',
    boleto_compraventa: 'Boleto de compraventa',
    certificado: 'Certificado',
    poder: 'Poder',
    garantia: 'Garantía',
    reserva: 'Reserva',
    otro: 'Otro',
  };

  return labels[value] ?? value;
}

function formatSensitivity(value: string) {
  const labels: Record<string, string> = {
    low: 'Baja',
    medium: 'Media',
    high: 'Alta',
    critical: 'Crítica',
  };

  return labels[value] ?? value;
}

export default async function DashboardPage() {
  const { user, profile } = await getUserProfile();

  if (!user) redirect('/login');
  if (!profile) redirect('/onboarding');

  const supabase = await createClient();

  const [
    casesCount,
    documentsCount,
    aiRunsCount,
    activityCount,
    documentsResult,
    aiOutputsResult,
    invitationMetricsResult,
  ] = await Promise.all([
    supabase
      .from('cases')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', profile.organization_id)
      .neq('status', 'archived'),

    supabase
      .from('documents')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', profile.organization_id),

    supabase
      .from('ai_outputs')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', profile.organization_id)
      .eq('output_type', 'document_analysis'),

    supabase
      .from('audit_logs')
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

    supabase
      .from('invitation_operational_metrics')
      .select(
        'total_invitations, pending_invitations, accepted_invitations, cancelled_invitations, expired_invitations, last_invitation_created_at'
      )
      .maybeSingle(),
  ]);

  const documents = (documentsResult.data ?? []) as DashboardDocument[];
  const aiOutputs = aiOutputsResult.data ?? [];
  const invitationMetrics =
    (invitationMetricsResult.data as InvitationMetricsRecord | null) ?? null;

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

  const totalInvitations = getMetricValue(invitationMetrics?.total_invitations);
  const pendingInvitations = getMetricValue(invitationMetrics?.pending_invitations);
  const acceptedInvitations = getMetricValue(invitationMetrics?.accepted_invitations);
  const cancelledInvitations = getMetricValue(invitationMetrics?.cancelled_invitations);
  const expiredInvitations = getMetricValue(invitationMetrics?.expired_invitations);
  const hasInvitationMetricsError = Boolean(invitationMetricsResult.error);
  const hasExpiredInvitations = expiredInvitations > 0;

  const metrics = [
    {
      label: 'Expedientes activos',
      value: String(casesCount.count ?? 0),
      helper: 'No archivados',
    },
    {
      label: 'Documentos cargados',
      value: String(documentsCount.count ?? 0),
      helper: 'Bóveda privada',
    },
    {
      label: 'Procesamientos IA',
      value: String(aiRunsCount.count ?? 0),
      helper: 'Análisis registrados',
    },
    {
      label: 'Cobertura IA',
      value: `${coverage}%`,
      helper: 'Documentos procesados',
    },
    {
      label: 'Pendientes de revisión',
      value: String(pendingDocuments.length),
      helper: 'Requieren análisis IA',
    },
    {
      label: 'Actividad auditada',
      value: String(activityCount.count ?? 0),
      helper: 'Eventos registrados',
    },
  ];

  const invitationCards = [
    {
      label: 'Pendientes',
      value: pendingInvitations,
      helper: 'Esperando gestión',
    },
    {
      label: 'Vencidas',
      value: expiredInvitations,
      helper: 'Requieren revisión',
    },
    {
      label: 'Aceptadas',
      value: acceptedInvitations,
      helper: 'Accesos validados',
    },
    {
      label: 'Canceladas',
      value: cancelledInvitations,
      helper: 'Sin continuidad',
    },
  ];

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
          Resumen operativo de expedientes, documentos, análisis IA, invitaciones y actividad auditada.
        </p>
      </div>

      {hasInvitationMetricsError ? (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-semibold text-amber-800">
          No se pudieron leer las métricas de invitaciones. Verificá que exista la vista
          public.invitation_operational_metrics.
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </div>

      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">
              Invitaciones operativas
            </p>

            <h3 className="mt-2 text-2xl font-bold text-slate-950">
              Estado de invitaciones
            </h3>

            <p className="mt-2 text-sm text-slate-600">
              Seguimiento de altas, invitaciones pendientes y accesos gestionados durante la beta.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/usuarios/invitaciones"
              className="rounded-2xl bg-slate-950 px-5 py-3 text-center text-sm font-bold text-white hover:bg-slate-800"
            >
              Gestionar invitaciones
            </Link>

            <Link
              href="/reportes?vista=invitaciones"
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-center text-sm font-bold text-slate-700 hover:bg-slate-50"
            >
              Ver reporte
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {invitationCards.map((metric) => (
            <div
              key={metric.label}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
            >
              <p className="text-sm font-semibold text-slate-500">
                {metric.label}
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-950">
                {metric.value}
              </p>

              <p className="mt-3 text-xs text-slate-500">
                {metric.helper}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-5 grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm font-bold text-slate-950">
              Última invitación creada
            </p>

            <p className="mt-2 text-sm text-slate-600">
              {formatDate(invitationMetrics?.last_invitation_created_at)}
            </p>

            <p className="mt-3 text-xs leading-5 text-slate-500">
              Este dato permite revisar actividad reciente de altas e invitaciones dentro de la organización.
            </p>
          </div>

          <div
            className={`rounded-2xl border p-5 ${
              hasExpiredInvitations
                ? 'border-amber-200 bg-amber-50'
                : 'border-emerald-200 bg-emerald-50'
            }`}
          >
            <p
              className={`text-sm font-bold ${
                hasExpiredInvitations ? 'text-amber-950' : 'text-emerald-950'
              }`}
            >
              Estado operativo de accesos
            </p>

            <p
              className={`mt-2 text-sm leading-6 ${
                hasExpiredInvitations ? 'text-amber-800' : 'text-emerald-800'
              }`}
            >
              {hasExpiredInvitations
                ? 'Hay invitaciones vencidas. Conviene revisarlas antes de avanzar con nuevos usuarios o testers externos.'
                : 'No se detectan invitaciones vencidas. El control operativo de accesos se mantiene estable.'}
            </p>

            <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold">
              <span className="rounded-full bg-white/70 px-3 py-1 text-slate-700">
                {totalInvitations} totales
              </span>

              <span className="rounded-full bg-white/70 px-3 py-1 text-slate-700">
                {pendingInvitations} pendientes
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">
                IA documental
              </p>

              <h3 className="mt-2 text-2xl font-bold text-slate-950">
                Cobertura de análisis
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
                Documentos pendientes de análisis
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Primeros documentos que todavía requieren procesamiento IA.
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
                      Tipo: {formatDocumentType(document.document_type)} · Sensibilidad:{' '}
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
                Todos los documentos cargados ya tienen al menos un análisis IA.
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