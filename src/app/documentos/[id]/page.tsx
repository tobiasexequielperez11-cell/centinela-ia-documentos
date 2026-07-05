import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { createClient } from '@/lib/supabase/server';
import { getUserProfile } from '@/lib/auth/getUserProfile';
import { createAuditLog } from '@/lib/audit/createAuditLog';
import { getDocumentTypeLabel } from '@/lib/industries/documentTypes';
import { formatFileSize } from '@/lib/format/fileSize';
import { getDocumentExpiryStatus, expiryStatusLabel, getExpiryBadgeStyles } from '@/lib/documents/expiry';
import { analyzeDocument } from '../actions';
import { AnalyzeButton } from '../AnalyzeButton';
import type { DocumentRecord } from '@/types/document';

interface DocumentDetailPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; analysis?: string }>;
}

interface AiAnalysisResult {
  modo?: string;
  resumen?: string;
  tipo_documental_detectado?: string;
  sensibilidad_detectada?: string;
  datos_relevantes?: string[];
  alertas?: string[];
  proximas_acciones?: string[];
  texto_extraido_preview?: string;
  caracteres_extraidos?: number;
}

interface AiOutputRecord {
  id: string;
  output_type: string;
  model_name?: string | null;
  result_json?: AiAnalysisResult | null;
  created_at?: string | null;
}

function sensitivityLabel(value?: string | null) {
  const normalizedValue = String(value ?? '').toLowerCase();

  const labels: Record<string, string> = {
    low: 'Bajo',
    medium: 'Medio',
    high: 'Alto',
    critical: 'Crítico',
    bajo: 'Bajo',
    medio: 'Medio',
    alto: 'Alto',
    critico: 'Crítico',
    crítico: 'Crítico',
  };

  return labels[normalizedValue] ?? value ?? 'Sin clasificar';
}

function formatDate(value?: string | null) {
  if (!value) return '-';

  return new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
}

function formatExpiryDate(value?: string | null) {
  if (!value) return 'Sin fecha de vencimiento';
  const [year, month, day] = value.split('-');
  return `${day}/${month}/${year}`;
}

function canPreview(mimeType?: string | null) {
  if (!mimeType) return false;

  return (
    mimeType === 'application/pdf' ||
    mimeType === 'image/jpeg' ||
    mimeType === 'image/png'
  );
}

function getErrorMessage(error?: string) {
  const messages: Record<string, string> = {
    only_pdf_supported:
      'Por ahora el análisis IA solo está disponible para documentos PDF.',
    download_failed: 'No se pudo descargar el archivo desde Storage.',
    empty_pdf_text:
      'No se pudo extraer texto del PDF. Puede ser un PDF escaneado.',
    ai_save_failed: 'El análisis se generó, pero no se pudo guardar.',
  };

  return error ? messages[error] : null;
}

function getDocumentAiStatus(count: number) {
  if (count <= 0) return 'Sin análisis';
  if (count === 1) return 'Analizado';
  return `Reanalizado x${count}`;
}

function normalizeText(value?: string | null) {
  return String(value ?? '').toLowerCase();
}

function getRiskAssessment(
  document: DocumentRecord,
  aiResult?: AiAnalysisResult | null
) {
  const manualSensitivity = normalizeText(document.sensitivity_level);
  const detectedSensitivity = normalizeText(aiResult?.sensibilidad_detectada);
  const alertsCount = aiResult?.alertas?.length ?? 0;
  const extractedChars = aiResult?.caracteres_extraidos ?? 0;

  let score = 25;

  if (manualSensitivity.includes('medium')) score = 45;
  if (manualSensitivity.includes('high')) score = 70;
  if (manualSensitivity.includes('critical')) score = 90;

  if (detectedSensitivity.includes('medium')) score = Math.max(score, 45);
  if (detectedSensitivity.includes('high')) score = Math.max(score, 70);
  if (detectedSensitivity.includes('critical')) score = Math.max(score, 90);

  if (alertsCount >= 1) score += 10;
  if (alertsCount >= 2) score += 10;
  if (extractedChars > 0 && extractedChars < 500) score += 10;

  score = Math.min(score, 100);

  if (score >= 80) {
    return {
      label: 'Crítico',
      score,
      className: 'bg-rose-50 text-rose-700 border-rose-200',
      barClassName: 'bg-rose-500',
      description:
        'Documento de alta sensibilidad. Conviene mantener acceso restringido, revisar permisos y asociarlo correctamente al expediente.',
    };
  }

  if (score >= 60) {
    return {
      label: 'Alto',
      score,
      className: 'bg-amber-50 text-amber-800 border-amber-200',
      barClassName: 'bg-amber-500',
      description:
        'Documento sensible. Requiere validación operativa, control de acceso y revisión de información personal o institucional.',
    };
  }

  if (score >= 35) {
    return {
      label: 'Medio',
      score,
      className: 'bg-sky-50 text-sky-700 border-sky-200',
      barClassName: 'bg-sky-500',
      description:
        'Documento de sensibilidad moderada. Puede gestionarse con controles estándar y revisión documental básica.',
    };
  }

  return {
    label: 'Bajo',
    score,
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    barClassName: 'bg-emerald-500',
    description:
      'Documento de bajo riesgo operativo. Mantener clasificación y registro dentro de la bóveda documental.',
  };
}

function buildSuggestedChecklist(
  document: DocumentRecord,
  aiResult?: AiAnalysisResult | null
) {
  const detectedType = normalizeText(aiResult?.tipo_documental_detectado);
  const manualType = normalizeText(document.document_type);
  const fileName = normalizeText(document.file_name);

  const source = `${detectedType} ${manualType} ${fileName}`;

  if (
    source.includes('contrato') ||
    source.includes('compraventa') ||
    source.includes('alquiler') ||
    source.includes('real_estate')
  ) {
    return [
      'Verificar identificación de las partes intervinientes.',
      'Controlar fechas, firmas y vigencia del documento.',
      'Revisar montos, condiciones, cláusulas y anexos asociados.',
      'Confirmar que el documento esté vinculado al expediente correcto.',
      'Validar si corresponde marcarlo como documento sensible.',
    ];
  }

  if (
    source.includes('plan') ||
    source.includes('estudio') ||
    source.includes('acad') ||
    source.includes('curricular')
  ) {
    return [
      'Verificar institución emisora y carrera o programa académico.',
      'Revisar materias, carga horaria, correlatividades y fechas.',
      'Confirmar si el documento requiere certificación o firma institucional.',
      'Clasificar el archivo como académico o curricular.',
      'Asociar el documento al expediente correspondiente si aplica.',
    ];
  }

  return [
    'Verificar nombre del archivo y tipo documental.',
    'Revisar si contiene datos personales, financieros o institucionales.',
    'Confirmar que esté asociado al expediente correcto.',
    'Validar nivel de sensibilidad asignado.',
    'Registrar observaciones si requiere revisión manual.',
  ];
}

function buildMissingDocuments(
  document: DocumentRecord,
  aiResult?: AiAnalysisResult | null
) {
  const detectedType = normalizeText(aiResult?.tipo_documental_detectado);
  const manualType = normalizeText(document.document_type);
  const fileName = normalizeText(document.file_name);

  const source = `${detectedType} ${manualType} ${fileName}`;

  if (
    source.includes('contrato') ||
    source.includes('compraventa') ||
    source.includes('alquiler') ||
    source.includes('real_estate')
  ) {
    return [
      'DNI o CUIT de las partes.',
      'Comprobante o constancia respaldatoria.',
      'Anexos o documentación complementaria.',
      'Firma o validación final si corresponde.',
    ];
  }

  if (
    source.includes('plan') ||
    source.includes('estudio') ||
    source.includes('acad') ||
    source.includes('curricular')
  ) {
    return [
      'Constancia institucional si corresponde.',
      'Programa completo o resolución vinculada.',
      'Certificación, firma o sello si aplica.',
    ];
  }

  return [
    'Documento respaldatorio asociado.',
    'Validación de origen o emisor.',
    'Archivo complementario si corresponde.',
  ];
}

function buildSecurityRecommendations(
  document: DocumentRecord,
  aiResult?: AiAnalysisResult | null
) {
  const risk = getRiskAssessment(document, aiResult);

  if (risk.score >= 60) {
    return [
      'Mantener el documento en acceso restringido.',
      'Evitar compartir enlaces temporales fuera del equipo autorizado.',
      'Revisar permisos de usuarios antes de habilitar descarga.',
      'Conservar registro de auditoría ante cada visualización o análisis.',
    ];
  }

  return [
    'Mantener clasificación documental actualizada.',
    'Revisar permisos si el documento se asocia a un expediente sensible.',
    'Usar enlaces temporales únicamente cuando sea necesario.',
  ];
}

function buildOperationalOpinion(
  document: DocumentRecord,
  aiResult?: AiAnalysisResult | null
) {
  if (!aiResult) {
    return 'El documento todavía no cuenta con análisis IA. Se recomienda ejecutar el análisis para generar una lectura operativa inicial.';
  }

  const risk = getRiskAssessment(document, aiResult);

  if (risk.score >= 80) {
    return 'Dictamen IA: documento crítico. Requiere revisión prioritaria, control de acceso estricto y validación manual antes de compartir o cerrar el expediente.';
  }

  if (risk.score >= 60) {
    return 'Dictamen IA: documento sensible. Conviene revisar contenido, faltantes y permisos antes de considerarlo completo dentro del expediente.';
  }

  if (risk.score >= 35) {
    return 'Dictamen IA: documento de riesgo medio. Puede continuar en circuito normal, pero se recomienda validar clasificación y documentación asociada.';
  }

  return 'Dictamen IA: documento de riesgo bajo. No se detectan señales críticas, aunque se recomienda mantener trazabilidad y clasificación correcta.';
}

export default async function DocumentDetailPage({
  params,
  searchParams,
}: DocumentDetailPageProps) {
  const { id } = await params;
  const query = await searchParams;

  const { user, profile } = await getUserProfile();

  if (!user) redirect('/login');
  if (!profile) redirect('/onboarding');

  const supabase = await createClient();

  const { data } = await supabase
    .from('documents')
    .select('*')
    .eq('id', id)
    .eq('organization_id', profile.organization_id)
    .single();

  if (!data) notFound();

  const document = data as DocumentRecord;

  const { data: signedUrlData } = await supabase.storage
    .from('documents')
    .createSignedUrl(document.file_path, 60 * 5);

  await createAuditLog({
    organizationId: profile.organization_id,
    userId: user.id,
    action: 'document_viewed',
    resourceType: 'document',
    resourceId: document.id,
    metadata: {
      file_name: document.file_name,
      document_type: document.document_type,
    },
  });

  const signedUrl = signedUrlData?.signedUrl ?? null;

  const { data: aiOutputs } = await supabase
    .from('ai_outputs')
    .select('*')
    .eq('organization_id', profile.organization_id)
    .eq('document_id', document.id)
    .eq('output_type', 'document_analysis')
    .order('created_at', { ascending: false });

  const aiHistory = (aiOutputs ?? []) as AiOutputRecord[];
  const latestAiOutput = aiHistory[0] ?? null;
  const previousAiOutputs = aiHistory.slice(1);
  const aiResult = latestAiOutput?.result_json ?? null;

  const risk = getRiskAssessment(document, aiResult);
  const checklist = buildSuggestedChecklist(document, aiResult);
  const missingDocuments = buildMissingDocuments(document, aiResult);
  const securityRecommendations = buildSecurityRecommendations(document, aiResult);
  const operationalOpinion = buildOperationalOpinion(document, aiResult);

  const errorMessage = getErrorMessage(query.error);
  const analyzeButtonLabel = aiResult
    ? 'Reanalizar IA'
    : 'Analizar IA';

  const aiStatus = getDocumentAiStatus(aiHistory.length);
  
  const expiryStatus = getDocumentExpiryStatus(document.expires_at);
  const expiryBadge = getExpiryBadgeStyles(expiryStatus);

  return (
    <AppShell>
      <div className="mb-8 flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">
            Visor documental
          </p>

          <h2 className="mt-2 text-3xl font-bold text-slate-950">
            {document.file_name}
          </h2>

          <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
              {document.file_mime_type ?? 'Formato desconocido'}
            </span>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
              {formatFileSize(document.file_size)}
            </span>

            <span className="rounded-full bg-sky-50 px-3 py-1 text-sky-700">
              IA: {aiStatus}
            </span>

            <span className={`rounded-full border px-3 py-1 ${risk.className}`}>
              Riesgo: {risk.label}
            </span>
          </div>

          <p className="mt-3 text-sm text-slate-600">
            Archivo privado con acceso temporal seguro.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <form action={analyzeDocument}>
            <input type="hidden" name="document_id" value={document.id} />

            <AnalyzeButton label={analyzeButtonLabel} className="rounded-2xl bg-sky-500 px-5 py-3 text-sm font-bold text-white hover:bg-sky-600" />
          </form>

          <Link
            href="/documentos"
            className="rounded-2xl border border-slate-200 px-5 py-3 text-center text-sm font-bold text-slate-700 hover:bg-slate-50"
          >
            Volver a documentos
          </Link>
        </div>
      </div>

      {errorMessage ? (
        <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {errorMessage}
        </div>
      ) : null}

{query.analysis === 'beta' ? (
  <div className="mb-6 rounded-2xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-800">
    Análisis IA generado y guardado correctamente.
  </div>
) : null}

      <div className="grid gap-6 xl:grid-cols-[0.78fr_1.22fr]">
        <section className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-950">
                  Datos del documento
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Estado operativo y clasificación manual del archivo.
                </p>
              </div>

              <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-sky-700">
                {aiStatus}
              </span>
            </div>

            <div className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Tipo documental
                </p>
                <p className="mt-2 font-bold text-slate-950">
{getDocumentTypeLabel(document.document_type)}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Sensibilidad
                </p>
                <p className="mt-2 font-bold text-slate-950">
                  {sensitivityLabel(document.sensitivity_level)}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Tamaño
                </p>
                <p className="mt-2 font-bold text-slate-950">
                  {formatFileSize(document.file_size)}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  MIME
                </p>
                <p className="mt-2 break-all font-bold text-slate-950">
                  {document.file_mime_type ?? '-'}
                </p>
              </div>
              
              <div className="rounded-2xl bg-slate-50 p-4 sm:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Vencimiento
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <p className="font-bold text-slate-950">
                    {formatExpiryDate(document.expires_at)}
                  </p>
                  {document.expires_at && (
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${expiryBadge.className}`}>
                      {expiryStatusLabel(expiryStatus)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {signedUrl ? (
                <a
                  href={signedUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800"
                >
                  Abrir enlace temporal
                </a>
              ) : null}

              <form action={analyzeDocument}>
                <input type="hidden" name="document_id" value={document.id} />

                <AnalyzeButton label={analyzeButtonLabel} className="w-full rounded-2xl bg-sky-500 px-5 py-3 text-sm font-bold text-white hover:bg-sky-600" />
              </form>
            </div>
          </div>

          <div className={`rounded-3xl border p-6 shadow-sm ${risk.className}`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em]">
Dictamen IA documental
                </p>

                <h3 className="mt-2 text-2xl font-bold">
                  Riesgo documental: {risk.label}
                </h3>
              </div>

              <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-bold">
                {risk.score}/100
              </span>
            </div>

            <div className="mt-5">
              <div className="mb-2 flex justify-between text-xs font-bold">
                <span>Índice operativo de riesgo</span>
                <span>{risk.score}%</span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-white/70">
                <div
                  className={`h-full rounded-full ${risk.barClassName}`}
                  style={{ width: `${risk.score}%` }}
                />
              </div>
            </div>

            <p className="mt-5 text-sm font-semibold leading-6">
              {operationalOpinion}
            </p>

            <p className="mt-3 text-sm leading-6">
              {risk.description}
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-600">
              Control documental sugerido
            </p>

            <h3 className="mt-2 text-xl font-bold text-slate-950">
              Checklist operativo
            </h3>

            <div className="mt-5 space-y-3">
              {checklist.map((item) => (
                <div
                  key={item}
                  className="flex gap-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700"
                >
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-100 text-xs font-bold text-sky-700">
                    ✓
                  </span>
                  <p>{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-600">
              Revisión manual recomendada
            </p>

            <h3 className="mt-2 text-xl font-bold text-slate-950">
              Posibles faltantes o respaldos
            </h3>

            <ul className="mt-5 space-y-3 text-sm text-slate-700">
              {missingDocuments.map((item) => (
                <li key={item} className="rounded-2xl bg-amber-50 p-4">
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Seguridad documental
            </p>

            <h3 className="mt-2 text-xl font-bold text-slate-950">
              Recomendaciones de acceso
            </h3>

            <ul className="mt-5 space-y-3 text-sm text-slate-700">
              {securityRecommendations.map((item) => (
                <li key={item} className="rounded-2xl bg-slate-50 p-4">
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {aiResult ? (
            <div className="rounded-3xl border border-sky-100 bg-sky-50 p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">
                    Último análisis IA
                  </p>

                  <p className="mt-2 text-xs font-semibold text-slate-500">
                    Modelo: {latestAiOutput?.model_name ?? 'analisis-documental-beta-v1'} ·{' '}
                    {formatDate(latestAiOutput?.created_at)}
                  </p>
                </div>

                <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-sky-700">
                  Última versión
                </span>
              </div>

              <p className="mt-4 text-sm font-semibold leading-6 text-slate-950">
                {aiResult.resumen}
              </p>

              <div className="mt-5 space-y-4 text-sm text-slate-700">
                <p>
                  <strong>Modo:</strong> {aiResult.modo ?? 'análisis documental'}
                </p>

                <p>
                  <strong>Tipo detectado:</strong>{' '}
                  {aiResult.tipo_documental_detectado ?? '-'}
                </p>

                <p>
                  <strong>Sensibilidad detectada:</strong>{' '}
                  {aiResult.sensibilidad_detectada ?? '-'}
                </p>

                <p>
                  <strong>Caracteres extraídos:</strong>{' '}
                  {aiResult.caracteres_extraidos ?? '-'}
                </p>

                {aiResult.datos_relevantes?.length ? (
                  <div>
                    <strong>Datos relevantes:</strong>
                    <ul className="mt-2 list-disc space-y-1 pl-5">
                      {aiResult.datos_relevantes.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {aiResult.alertas?.length ? (
                  <div>
                    <strong>Alertas:</strong>
                    <ul className="mt-2 list-disc space-y-1 pl-5">
                      {aiResult.alertas.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {aiResult.proximas_acciones?.length ? (
                  <div>
                    <strong>Próximas acciones:</strong>
                    <ul className="mt-2 list-disc space-y-1 pl-5">
                      {aiResult.proximas_acciones.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {aiResult.texto_extraido_preview ? (
                  <details className="rounded-2xl bg-white p-4">
                    <summary className="cursor-pointer font-bold">
                      Ver texto extraído parcial
                    </summary>
                    <p className="mt-3 text-xs leading-6 text-slate-600">
                      {aiResult.texto_extraido_preview}
                    </p>
                  </details>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="font-bold text-slate-950">
                Este documento todavía no tiene análisis IA.
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Ejecutá el análisis IA para generar una primera lectura documental.
              </p>
            </div>
          )}

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-950">
              Historial de análisis IA
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Cada reanálisis queda guardado como una nueva versión.
            </p>

            <div className="mt-5 space-y-3">
              {latestAiOutput ? (
                <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-bold text-slate-950">
                        Última versión · Análisis #{aiHistory.length}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {formatDate(latestAiOutput.created_at)}
                      </p>
                    </div>

                    <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-sky-700">
                      {latestAiOutput.model_name ?? 'analisis-documental-beta-v1'}
                    </span>
                  </div>

                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {latestAiOutput.result_json?.resumen ??
                      'Análisis guardado sin resumen disponible.'}
                  </p>
                </div>
              ) : null}

              {previousAiOutputs.length > 0 ? (
                <div className="pt-2">
                  <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400">
                    Versiones anteriores
                  </p>

                  <div className="space-y-3">
                    {previousAiOutputs.map((item, index) => (
                      <div
                        key={item.id}
                        className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-bold text-slate-950">
                              Análisis #{previousAiOutputs.length - index}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {formatDate(item.created_at)}
                            </p>
                          </div>

                          <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-600">
                            {item.model_name ?? 'analisis-documental-beta-v1'}
                          </span>
                        </div>

                        <p className="mt-3 text-sm leading-6 text-slate-600">
                          {item.result_json?.resumen ??
                            'Análisis guardado sin resumen disponible.'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {aiHistory.length === 0 ? (
                <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
                  Todavía no hay análisis guardados para este documento.
                </div>
              ) : null}
            </div>
          </div>
        </section>

        <section className="min-h-[520px] rounded-3xl border border-slate-200 bg-white p-4 shadow-sm xl:sticky xl:top-6 xl:h-[calc(100vh-3rem)]">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Vista previa
              </p>
              <p className="text-sm font-bold text-slate-950">
                {document.file_name}
              </p>
            </div>

            {signedUrl ? (
              <a
                href={signedUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Abrir
              </a>
            ) : null}
          </div>

          {signedUrl && canPreview(document.file_mime_type) ? (
            <iframe
              title={document.file_name}
              src={signedUrl}
              className="h-[calc(100vh-9rem)] min-h-[520px] w-full rounded-2xl border border-slate-200"
            />
          ) : (
            <div className="flex h-[520px] items-center justify-center rounded-2xl bg-slate-50 p-8 text-center">
              <div>
                <p className="font-bold text-slate-950">
                  Vista previa no disponible.
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  Este formato puede abrirse mediante el enlace temporal.
                </p>
              </div>
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
