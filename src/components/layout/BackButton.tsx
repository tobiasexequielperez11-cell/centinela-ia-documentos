'use client';

import { usePathname, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

// Rutas de nivel principal donde NO se muestra el botón "Volver"
const HOME_ROUTES = ['/dashboard'];

export function BackButton() {
  const router = useRouter();
  const pathname = usePathname();

  // En la pantalla principal (Inicio) no se muestra
  if (HOME_ROUTES.includes(pathname)) return null;

  return (
    <button
      type="button"
      onClick={() => router.back()}
      aria-label="Volver atrás"
      className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100"
    >
      <ArrowLeft className="h-4 w-4" />
      Volver
    </button>
  );
}
