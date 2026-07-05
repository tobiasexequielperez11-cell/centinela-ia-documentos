import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { createClient } from '@/lib/supabase/server';
import { getUserProfile } from '@/lib/auth/getUserProfile';
import { getDocumentTypeLabel } from '@/lib/industries/documentTypes';
import { formatFileSize } from '@/lib/format/fileSize';
import { getDocumentExpiryStatus, expiryStatusLabel, getExpiryBadgeStyles, getDaysUntilExpiry } from '@/lib/documents/expiry';
import { sensitivityLabel } from '@/lib/documents/sensitivity';
import { analyzeDocument } from './actions';
import { AnalyzeButton } from './AnalyzeButton';
import type { DocumentRecord } from '@/types/document';

interface DocumentsPageProps {
  searchParams: Promise<{ ia?: string; q?: string }>;
}

type IaFilter = 'todos' | 'pendientes' | 'analizados';



function normalizeIaFilter(value?: string): IaFilter {
  if (value === 'pendientes' || value === 'analizados') {
    return value;
  }

  return 'todos';
}

function getAiStatus(count: number) {
  if (count <= 0) {
    return {
      label: 'Pendiente',
      countLabel: null,
      className: 'bg-slate-100 text-slate-500',
    };
  }

  return {
    label: 'Analizado IA',
    countLabel: null,
    className: 'bg-sky-50 text-sky-700',
  };
}

export default async function DocumentsPage({
  searchParams,
}: DocumentsPageProps) {
  const query = await searchParams;
  const activeFilter = normalizeIaFilter(query.ia);
  const searchTerm = (query.q ?? '').trim();
  const normalizedTerm = searchTerm.toLowerCase();

  const { user, profile } = await getUserProfile();

  if (!user) redirect('/login');
  if (!profile) redirect('/onboarding');

  const supabase = await createClient();

  const { data: documents } = await supabase
    .from('documents')
    .select('*')
    .eq('organization_id', profile.organization_id)
    .order('created_at', { ascending: false });

  const { data: aiOutputs } = await supabase
    .from('ai_outputs')
    .select('document_id')
    .eq('organization_id', profile.organization_id)
    .eq('output_type', 'document_analysis');

  const analysisCountByDocument = new Map<string, number>();

  for (const item of aiOutputs ?? []) {
    const documentId = String(item.document_id || '');
    if (!documentId) continue;

    analysisCountByDocument.set(
      documentId,
      (analysisCountByDocument.get(documentId) ?? 0) + 1
    );
  }

  const records = (documents ?? []) as DocumentRecord[];

  let expiringDocs = 0;
  let expiredDocs = 0;

  for (const item of records) {
    const status = getDocumentExpiryStatus(item.expires_at);
    if (status === 'por_vencer') expiringDocs++;
    if (status === 'vencido') expiredDocs++;
  }

  const totalDocuments = records.length;

  const pendingDocuments = records.filter(
    (item) => (analysisCountByDocument.get(item.id) ?? 0) === 0
  ).length;

  const analyzedDocuments = records.filter(
    (item) => (analysisCountByDocument.get(item.id) ?? 0) > 0
  ).length;


  const filteredRecords = records.filter((item) => {
    const count = analysisCountByDocument.get(item.id) ?? 0;

    const matchesFilter =
      activeFilter === 'pendientes' ? count === 0 :
      activeFilter === 'analizados' ? count > 0 :
      true;

    const matchesTerm =
      !normalizedTerm ||
      (item.file_name ?? '').toLowerCase().includes(normalizedTerm) ||
      getDocumentTypeLabel(item.document_type).toLowerCase().includes(normalizedTerm);

    return matchesFilter && matchesTerm;
  });

  const qs = normalizedTerm ? `&q=${encodeURIComponent(searchTerm)}` : '';

  const filters: {
    label: string;
    value: IaFilter;
    count: number;
    href: string;
  }[] = [
    {
      label: 'Todos',
      value: 'todos',
      count: totalDocuments,
      href: normalizedTerm ? `/documentos?q=${encodeURIComponent(searchTerm)}` : '/documentos',
    },
    {
      label: 'Pendientes IA',
      value: 'pendientes',
      count: pendingDocuments,
      href: `/documentos?ia=pendientes${qs}`,
    },
    {
      label: 'Analizados',
      value: 'analizados',
      count: analyzedDocuments,
      href: `/documentos?ia=analizados${qs}`,
    },
  ];

  return (
    <AppShell>
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">
            Documentos
          </p>

          <h2 className="mt-2 text-3xl font-bold text-slate-950">
            Bóveda documental
          </h2>

          <p className="mt-2 text-sm text-slate-600">
            Control operativo de documentos cargados, clasificación y estado de análisis IA.
          </p>
        </div>

        <Link
          href="/documentos/subir"
          className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800"
        >
          Subir documento
        </Link>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">
            Documentos totales
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-950">
            {totalDocuments}
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">
            Pendientes de revisión
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-950">
            {pendingDocuments}
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">
            Con análisis IA
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-950">
            {analyzedDocuments}
          </p>
        </div>

      </div>

      <form method="get" className="mb-4 flex gap-2">
        {activeFilter !== 'todos' ? (
          <input type="hidden" name="ia" value={activeFilter} />
        ) : null}
        <input
          type="search"
          name="q"
          defaultValue={searchTerm}
          placeholder="Buscar por nombre de archivo o tipo…"
          className="w-full max-w-md rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none"
        />
        <button type="submit" className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">
          Buscar
        </button>
      </form>

      <div className="mb-6 flex flex-wrap gap-3">
        {filters.map((filter) => {
          const isActive = activeFilter === filter.value;

          return (
            <Link
              key={filter.value}
              href={filter.href}
              className={`rounded-2xl px-4 py-2 text-sm font-bold ${
                isActive
                  ? 'bg-slate-950 text-white'
                  : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {filter.label} · {filter.count}
            </Link>
          );
        })}
      </div>

      {pendingDocuments > 0 ? (
        <div className="mb-6 rounded-3xl border border-amber-200 bg-amber-50 p-5">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="font-bold text-amber-950">
                Hay documentos pendientes de análisis IA.
              </p>
              <p className="mt-1 text-sm text-amber-800">
                Revisá los pendientes y ejecutá el análisis IA para completar la cobertura documental.
              </p>
            </div>

            <Link
              href="/documentos?ia=pendientes"
              className="rounded-2xl bg-amber-900 px-5 py-3 text-center text-sm font-bold text-white hover:bg-amber-800"
            >
              Ver pendientes IA
            </Link>
          </div>
        </div>
      ) : (
        <div className="mb-6 rounded-3xl border border-emerald-200 bg-emerald-50 p-5">
          <p className="font-bold text-emerald-900">
            Cobertura IA completa.
          </p>
          <p className="mt-1 text-sm text-emerald-800">
            Todos los documentos cargados tienen al menos un análisis IA registrado.
          </p>
        </div>
      )}

      {expiringDocs > 0 || expiredDocs > 0 ? (
        <div className="mb-6 rounded-3xl border border-amber-200 bg-amber-50 p-5">
          <p className="font-bold text-amber-950">
            Alertas de vencimiento
          </p>
          <p className="mt-1 text-sm text-amber-800">
            {expiringDocs > 0 ? `${expiringDocs} documento(s) por vencer` : ''} 
            {expiringDocs > 0 && expiredDocs > 0 ? ' y ' : ''}
            {expiredDocs > 0 ? `${expiredDocs} documento(s) vencido(s)` : ''}.
          </p>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-4">Archivo</th>
              <th className="px-5 py-4">Tipo</th>
              <th className="px-5 py-4">Sensibilidad</th>
              <th className="px-5 py-4">Estado IA</th>
              <th className="px-5 py-4">Vencimiento</th>
              <th className="px-5 py-4">Tamaño</th>
              <th className="px-5 py-4">Acción</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200">
            {filteredRecords.map((item) => {
              const analysisCount = analysisCountByDocument.get(item.id) ?? 0;
              const aiStatus = getAiStatus(analysisCount);
              const isPending = analysisCount === 0;
              const isPdf = item.file_mime_type === 'application/pdf';

              const expiryStatus = getDocumentExpiryStatus(item.expires_at);
              const expiryBadge = getExpiryBadgeStyles(expiryStatus);
              let expiryText = expiryStatusLabel(expiryStatus);
              if (expiryStatus === 'por_vencer') {
                const days = getDaysUntilExpiry(item.expires_at);
                if (days !== null) {
                  expiryText = `Por vencer · ${days} días`;
                }
              }

              return (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="px-5 py-4 font-bold text-slate-950">
                    {item.file_name}
                  </td>

                  <td className="px-5 py-4 text-slate-600">
                    {getDocumentTypeLabel(item.document_type)}
                  </td>

                  <td className="px-5 py-4 text-slate-600">
                    {sensitivityLabel(item.sensitivity_level)}
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex h-8 items-center gap-2 whitespace-nowrap rounded-full px-3 text-xs font-bold leading-none ${aiStatus.className}`}
                    >
                      <span>{aiStatus.label}</span>
                      {aiStatus.countLabel ? (
                        <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-white/70 px-1.5 text-[11px] font-black leading-none text-current">
                          {aiStatus.countLabel}
                        </span>
                      ) : null}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    {expiryStatus === 'sin_vencimiento' ? (
                      <span className="text-slate-400">—</span>
                    ) : (
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${expiryBadge.className}`}>
                        {expiryText}
                      </span>
                    )}
                  </td>

                  <td className="px-5 py-4 text-slate-600">
                    {formatFileSize(item.file_size)}
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <Link
                        href={`/documentos/${item.id}`}
                        className="font-bold text-sky-600 hover:text-sky-700"
                      >
                        Ver documento
                      </Link>

                      {isPending && isPdf ? (
                        <form action={analyzeDocument}>
                          <input
                            type="hidden"
                            name="document_id"
                            value={item.id}
                          />

                          <AnalyzeButton className="rounded-xl bg-slate-950 px-3 py-2 text-xs font-bold text-white hover:bg-slate-800" />
                        </form>
                      ) : null}

                      {isPending && !isPdf ? (
                        <span className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-500">
                          IA solo PDF
                        </span>
                      ) : null}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredRecords.length === 0 ? (
          <div className="p-10 text-center">
            <p className="font-bold text-slate-950">
              {searchTerm
                ? `No se encontraron documentos para «${searchTerm}».`
                : 'No hay documentos para este filtro.'}
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Probá cambiando el filtro o subiendo un nuevo documento.
            </p>
          </div>
        ) : null}
      </div>
    </AppShell>
  );
}
