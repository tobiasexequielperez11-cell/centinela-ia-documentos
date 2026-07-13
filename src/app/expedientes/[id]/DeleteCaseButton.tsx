'use client';

import { useFormStatus } from 'react-dom';

export function DeleteCaseButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      onClick={(e) => {
        if (
          !window.confirm(
            'Vas a borrar esta operación y todo su contenido interno (checklist, cronología, análisis del expediente y turnos de agenda). Los documentos quedan guardados en la Bóveda. Esta acción no se puede deshacer. ¿Continuar?'
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
