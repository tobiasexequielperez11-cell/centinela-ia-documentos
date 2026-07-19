'use client';

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
  return (
    <form
      action={deleteDocumentFromCase}
      onSubmit={(e) => {
        if (
          !window.confirm(
            `Vas a borrar "${fileName}" de forma permanente: se elimina el archivo, sus análisis de IA y sus datos de búsqueda, y se libera el ítem del checklist que lo tuviera vinculado. Esta acción no se puede deshacer. ¿Continuar?`
          )
        ) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="document_id" value={documentId} />
      <input type="hidden" name="case_id" value={caseId} />
      <button
        type="submit"
        className="text-xs font-medium text-red-400 transition-colors hover:text-red-300"
      >
        Eliminar
      </button>
    </form>
  );
}
