import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { createClient } from '@/lib/supabase/server';
import { getUserProfile } from '@/lib/auth/getUserProfile';
import { getDocumentTypeLabel } from '@/lib/industries/documentTypes';
import { analyzeDocument } from './actions';
import type { DocumentRecord } from '@/types/document';

interface DocumentsPageProps {
  searchParams: Promise<{ ia?: string }>;
}

type IaFilter = 'todos' | 'pendientes' | 'analizados' | 'reanalizados';

function sensitivityLabel(value: string) {
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

  return labels[String(value ?? '').toLowerCase()] ?? value;
}

function formatSize(size?: number | null) {
  if (!size) return '-';

  const mb = size / 1024 / 1024;
  return `${mb.toFixed(2)} MB`;
}

function normalizeIaFilter(value?: string): IaFilter {
  if (
    value === 'pendientes' ||
    value === 'analizados' ||
    value === 'reanalizados'
  ) {
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

  if (count === 1) {
    return {
      label: 'Analizado IA',
      countLabel: null,
      className: 'bg-sky-50 text-sky-700',
    };
  }

  return {
    label: 'Reanalizado',
    countLabel: `x${count}`,
    className: 'bg-emerald-50 text-emerald-700',
  };
}

export default async function DocumentsPage({
  searchParams,
}: DocumentsPageProps) {
  const query = await searchParams;
  const activeFilter = normalizeIaFilter(query.ia);

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

  const totalDocuments = records.length;

  const pendingDocuments = records.filter(
    (item) => (analysisCountByDocument.get(item.id) ?? 0) === 0
  ).length;

  const analyzedDocuments = records.filter(
    (item) => (analysisCountByDocument.get(item.id) ?? 0) > 0
  ).length;

  const reanalyzedDocuments = records.filter(
    (item) => (analysisCountByDocument.get(item.id) ?? 0) > 1
  ).length;

  const filteredRecords = records.filter((item) => {
    const count = analysisCountByDocument.get(item.id) ?? 0;

    if (activeFilter === 'pendientes') return count === 0;
    if (activeFilter === 'analizados') return count === 1;
    if (activeFilter === 'reanalizados') return count > 1;

    return true;
  });

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
      href: '/documentos',
    },
    {
      label: 'Pendientes IA',
      value: 'pendientes',
      count: pendingDocuments,
      href: '/documentos?ia=pendientes',
    },
    {
      label: 'Analizados',
      value: 'analizados',
      count: analyzedDocuments,
      href: '/documentos?ia=analizados',
    },
    {
      label: 'Reanalizados',
      value: 'reanalizados',
      count: reanalyzedDocuments,
      href: '/documentos?ia=reanalizados',
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

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">
            Reanalizados
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-950">
            {reanalyzedDocuments}
          </p>
        </div>
      </div>

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

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-4">Archivo</th>
              <th className="px-5 py-4">Tipo</th>
              <th className="px-5 py-4">Sensibilidad</th>
              <th className="px-5 py-4">Estado IA</th>
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

                  <td className="px-5 py-4 text-slate-600">
                    {formatSize(item.file_size)}
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

                          <button className="rounded-xl bg-slate-950 px-3 py-2 text-xs font-bold text-white hover:bg-slate-800">
                            Analizar IA
                          </button>
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
              No hay documentos para este filtro.
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
