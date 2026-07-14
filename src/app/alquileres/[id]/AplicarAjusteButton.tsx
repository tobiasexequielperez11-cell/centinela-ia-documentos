'use client';

import { aplicarAjusteAlquiler } from '../actions';

interface AplicarAjusteButtonProps {
  rentalId: string;
  montoLabel: string;
}

export function AplicarAjusteButton({ rentalId, montoLabel }: AplicarAjusteButtonProps) {
  return (
    <form action={aplicarAjusteAlquiler}>
      <input type="hidden" name="rental_id" value={rentalId} />
      <button 
        type="submit"
        className="w-full rounded-xl bg-cyan-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-cyan-500"
        onClick={(e) => {
          if (!window.confirm(`¿Confirmás aplicar el ajuste y actualizar el monto a ${montoLabel}?`)) {
            e.preventDefault();
          }
        }}
      >
        Aplicar ajuste
      </button>
    </form>
  );
}
