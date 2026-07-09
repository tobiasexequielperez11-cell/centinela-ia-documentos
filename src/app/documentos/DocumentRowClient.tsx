'use client';

import { useTransition } from 'react';
import Link from 'next/link';
import { MotionTableRow } from '@/components/ui/MotionTableRow';
import { Badge } from '@/components/ui/Badge';
import { analyzeDocument } from './actions';

interface Props {
  index: number;
  documentId: string;
  fileName: string;
  documentTypeLabel: string;
  sensitivityLabel: string;
  isDangerSensitivity: boolean;
  aiStatusLabel: string;
  isPendingAi: boolean;
  isAnalyzable: boolean;
  expiryStatus: string;
  expiryText: string;
  fileSizeLabel: string;
}

export function DocumentRowClient({
  index,
  documentId,
  fileName,
  documentTypeLabel,
  sensitivityLabel,
  isDangerSensitivity,
  aiStatusLabel,
  isPendingAi,
  isAnalyzable,
  expiryStatus,
  expiryText,
  fileSizeLabel,
}: Props) {
  const [isPending, startTransition] = useTransition();

  const handleAnalyze = () => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append('document_id', documentId);
      await analyzeDocument(formData);
    });
  };

  return (
    <MotionTableRow index={index} className="border-t border-white/5 transition-colors hover:bg-white/[0.03]">
      <td className="px-4 py-3 font-bold text-white">
        {fileName}
      </td>

      <td className="px-4 py-3 text-slate-300">
        {documentTypeLabel}
      </td>

      <td className="px-4 py-3 text-slate-300">
        <Badge tone={isDangerSensitivity ? 'danger' : 'neutral'}>
          {sensitivityLabel}
        </Badge>
      </td>

      <td className="px-4 py-3">
        {isPending ? (
          <Badge tone="accent">
            <span className="flex items-center gap-1.5 animate-pulse">
              <svg className="h-3 w-3 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              Analizando...
            </span>
          </Badge>
        ) : (
          <Badge tone={isPendingAi ? 'neutral' : 'accent'}>
            {aiStatusLabel}
          </Badge>
        )}
      </td>

      <td className="px-4 py-3">
        {expiryStatus === 'sin_vencimiento' ? (
          <span className="text-slate-500">—</span>
        ) : (
          <Badge tone={expiryStatus === 'vencido' ? 'danger' : 'warning'}>
            {expiryText}
          </Badge>
        )}
      </td>

      <td className="px-4 py-3 text-slate-300">
        {fileSizeLabel}
      </td>

      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-2">
          <Link
            href={`/documentos/${documentId}`}
            className="rounded-lg border border-white/10 bg-transparent px-3 py-1.5 text-xs font-bold text-slate-300 transition-all hover:bg-white/5 hover:text-white"
          >
            Ver
          </Link>
          {isPendingAi && isAnalyzable ? (
            <button
              onClick={handleAnalyze}
              disabled={isPending}
              className={`rounded-lg border border-white/10 bg-gradient-to-r from-cyan-500/20 to-brandviolet/20 px-3 py-1.5 text-xs font-bold text-white transition-all hover:from-cyan-500/30 hover:to-brandviolet/30 ${isPending ? 'cursor-not-allowed opacity-70' : ''}`}
            >
              {isPending ? (
                <span className="flex items-center gap-1.5">
                  <svg className="h-3 w-3 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Analizando...
                </span>
              ) : (
                'Analizar IA'
              )}
            </button>
          ) : null}
          {isPendingAi && !isAnalyzable ? (
            <span className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-slate-400">
              Sin IA
            </span>
          ) : null}
        </div>
      </td>
    </MotionTableRow>
  );
}
