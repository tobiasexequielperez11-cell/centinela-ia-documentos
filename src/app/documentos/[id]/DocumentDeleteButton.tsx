'use client';

import { useFormStatus } from 'react-dom';

export function DocumentDeleteButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      onClick={(e) => {
        if (
          !window.confirm(
            'Vas a borrar este documento de forma permanente: se elimina el archivo, sus análisis de IA y sus datos de búsqueda. Esta acción no se puede deshacer. ¿Continuar?'
          )
        ) {
          e.preventDefault();
        }
      }}
      className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-500 transition-all hover:bg-red-500/20 disabled:opacity-50"
    >
      {pending ? 'Borrando...' : 'Borrar definitivamente'}
    </button>
  );
}
