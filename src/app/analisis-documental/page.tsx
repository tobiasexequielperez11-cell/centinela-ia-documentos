import type { Metadata } from 'next';
import Link from 'next/link';
import { RevealSection } from '@/components/landing-reveal-section';

export const metadata: Metadata = {
  title: 'Análisis documental | Centinela IA',
  description:
    'Conocé las funciones de clasificación, sensibilidad y revisión documental asistida de Centinela IA.',
};

const aiItems = [
  'Clasificación inicial de documentos',
  'Detección de sensibilidad',
  'Resumen operativo',
  'Alertas documentales',
  'Historial de análisis',
  'Base preparada para futuras integraciones',
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm font-bold uppercase tracking-[0.22em] text-sky-600">
      {children}
    </p>
  );
}

export default function AnalisisDocumentalPage() {
  return (
    <main className="min-h-screen bg-white text-slate-950">
      <RevealSection className="flex min-h-screen items-center px-6 py-16 md:py-24">
        <div className="mx-auto w-full max-w-7xl">
          <Link
            href="/"
            className="inline-flex text-sm font-black text-sky-700 transition-colors hover:text-sky-900"
          >
            ← Volver al inicio
          </Link>

          <div className="mt-10 grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <SectionLabel>IA documental</SectionLabel>
              <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 md:text-5xl">
                Análisis documental en entorno beta controlado.
              </h1>
              <p className="mt-5 text-base leading-8 text-slate-600">
                La plataforma permite preparar lecturas documentales, detectar sensibilidad,
                generar revisiones iniciales y ordenar información clave dentro de un flujo
                controlado.
              </p>
              <p className="mt-4 text-base leading-8 text-slate-600">
                Durante el acceso beta, el objetivo es validar la utilidad real del análisis
                documental, la experiencia de uso y la trazabilidad antes de integrar
                proveedores externos.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {aiItems.map((item) => (
                <div
                  key={item}
                  className="landing-card rounded-2xl border border-sky-100 bg-sky-50 p-4 text-sm font-bold text-sky-900"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </RevealSection>
    </main>
  );
}
