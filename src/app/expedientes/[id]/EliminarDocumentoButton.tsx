'use client';

import { useTransition } from 'react';
import { Trash2, Loader2 } from 'lucide-react';
import { deleteDocumentFromCase } from '@/app/documentos/actions';

export function EliminarDocumentoButton({
  documentId,
  caseId,
  fileName,
}: {
  documentId: string;
  caseId: string;
  fileName: string;
}) {
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    if (
      !window.confirm(
        `Vas a borrar "${fileName}" de forma permanente:\n\n• Se elimina el archivo y sus análisis de IA\n• Se borran sus datos de búsqueda\n• Se libera el ítem del checklist que lo tuviera vinculado\n\nEsta acción no se puede deshacer. ¿Continuar?`
      )
    ) {
      return;
    }
    const formData = new FormData();
    formData.append('document_id', documentId);
    formData.append('case_id', caseId);
    startTransition(() => {
      deleteDocumentFromCase(formData);
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      title="Eliminar documento"
      className="group inline-flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-medium text-rose-300 transition-all duration-200 hover:border-rose-400/60 hover:bg-rose-500/20 hover:text-rose-200 hover:shadow-[0_0_14px_rgba(244,63,94,0.25)] active:scale-95 disabled:opacity-60"
    >
      {isPending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Trash2 className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-rotate-12 group-hover:scale-110" />
      )}
      {isPending ? 'Eliminando…' : 'Eliminar'}
    </button>
  );
}
