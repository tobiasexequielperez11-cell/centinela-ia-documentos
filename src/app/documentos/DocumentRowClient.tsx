'use client';

import { useTransition, useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { MotionTableRow } from '@/components/ui/MotionTableRow';
import { Badge } from '@/components/ui/Badge';
import { MoreVertical } from 'lucide-react';
import { analyzeDocument, archiveDocument, unarchiveDocument, deleteDocument } from './actions';

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
  isArchived: boolean;
  canArchive: boolean;
  canDelete: boolean;
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
  isArchived,
  canArchive,
  canDelete,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isMenuOpen]);

  const handleAnalyze = () => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append('document_id', documentId);
      await analyzeDocument(formData);
    });
  };

  return (
    <MotionTableRow index={index} className="border-t border-white/5 transition-colors hover:bg-white/[0.03]">
      <td className="px-2 py-2 font-bold text-white max-w-[150px] md:max-w-[200px] lg:max-w-[300px] truncate" title={fileName}>
        {fileName}
      </td>

      <td className="px-2 py-2 text-slate-300">
        {documentTypeLabel}
      </td>

      <td className="px-2 py-2 text-slate-300">
        <Badge tone={isDangerSensitivity ? 'danger' : 'neutral'}>
          {sensitivityLabel}
        </Badge>
      </td>

      <td className="px-2 py-2">
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

      <td className="hidden md:table-cell px-2 py-2">
        {expiryStatus === 'sin_vencimiento' ? (
          <span className="text-slate-500">—</span>
        ) : (
          <Badge tone={expiryStatus === 'vencido' ? 'danger' : 'warning'}>
            {expiryText}
          </Badge>
        )}
      </td>

      <td className="hidden md:table-cell px-2 py-2 text-slate-300">
        {fileSizeLabel}
      </td>

      <td className="px-2 py-2">
        <div className="flex items-center justify-end gap-1">
          <Link
            href={`/documentos/${documentId}`}
            className="rounded-lg border border-white/10 bg-transparent px-2 py-1 text-xs font-bold text-slate-300 transition-all hover:bg-white/5 hover:text-white"
          >
            Ver
          </Link>
          {isPendingAi && isAnalyzable ? (
            <button
              onClick={handleAnalyze}
              disabled={isPending}
              className={`rounded-lg border border-white/10 bg-gradient-to-r from-cyan-500/20 to-brandviolet/20 px-2 py-1 text-xs font-bold text-white transition-all hover:from-cyan-500/30 hover:to-brandviolet/30 ${isPending ? 'cursor-not-allowed opacity-70' : ''}`}
              title="Analizar IA"
            >
              {isPending ? (
                <span className="flex items-center gap-1.5">
                  <svg className="h-3 w-3 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                </span>
              ) : (
                'Analizar'
              )}
            </button>
          ) : null}
          {isPendingAi && !isAnalyzable ? (
            <span className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs font-bold text-slate-400">
              Sin IA
            </span>
          ) : null}

          {(canArchive || canDelete) && (
            <div className="relative ml-1 flex items-center" ref={menuRef}>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900/50 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
              >
                <MoreVertical className="h-4 w-4" />
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 top-10 z-50 w-48 overflow-hidden rounded-xl border border-slate-700 bg-slate-800 shadow-xl">
                  <div className="flex flex-col py-1">
                    {canArchive && !isArchived && (
                      <form action={archiveDocument} className="w-full">
                        <input type="hidden" name="document_id" value={documentId} />
                        <button
                          type="submit"
                          className="w-full px-4 py-2 text-left text-sm text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
                        >
                          Archivar
                        </button>
                      </form>
                    )}

                    {canArchive && isArchived && (
                      <form action={unarchiveDocument} className="w-full">
                        <input type="hidden" name="document_id" value={documentId} />
                        <button
                          type="submit"
                          className="w-full px-4 py-2 text-left text-sm text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
                        >
                          Desarchivar
                        </button>
                      </form>
                    )}

                    {canDelete && (
                      <form action={deleteDocument} className="w-full" onSubmit={(e) => {
                        if (!window.confirm("Vas a borrar este documento de forma permanente: se elimina el archivo, sus análisis de IA y sus datos de búsqueda. Esta acción no se puede deshacer. ¿Continuar?")) {
                          e.preventDefault();
                        }
                      }}>
                        <input type="hidden" name="document_id" value={documentId} />
                        <button
                          type="submit"
                          className="w-full px-4 py-2 text-left text-sm font-semibold text-rose-500 transition-colors hover:bg-rose-500/10"
                        >
                          Eliminar
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </td>
    </MotionTableRow>
  );
}
