import type { Metadata } from 'next';
import Link from 'next/link';
import { RevealSection } from '@/components/landing-reveal-section';

export const metadata: Metadata = {
  title: 'Planes y acceso beta | Centinela IA',
  description:
    'Conocé las condiciones iniciales, el acompañamiento y las opciones de acceso beta de Centinela IA.',
};

const whatsappUrl =
  'https://wa.me/543794733321?text=Hola,%20quiero%20coordinar%20una%20presentaci%C3%B3n%20de%20Centinela%20IA';

const betaItems = [
  'Setup inicial',
  'Configuración de organización',
  'Usuarios y roles',
  'Acompañamiento básico',
  'Planes beta con precio reducido',
  'Ajustes según feedback',
  'Opción de desarrollo a medida',
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm font-bold uppercase tracking-[0.22em] text-sky-600">
      {children}
    </p>
  );
}

function SectionGlow() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -left-24 top-16 h-64 w-64 rounded-full bg-sky-300/15 blur-3xl" />
      <div className="absolute -right-24 bottom-10 h-72 w-72 rounded-full bg-cyan-300/15 blur-3xl" />
    </div>
  );
}

export default function PlanesPage() {
  return (
    <main className="min-h-screen bg-white text-slate-950">
      <RevealSection className="relative flex min-h-screen items-center overflow-hidden px-6 py-16 md:py-24">
        <SectionGlow />
        <div className="relative z-10 mx-auto w-full max-w-5xl">
          <Link
            href="/"
            className="inline-flex text-sm font-black text-sky-700 transition-colors hover:text-sky-900"
          >
            ← Volver al inicio
          </Link>

          <div className="mt-10 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm md:p-10">
            <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
              <div>
                <SectionLabel>Acceso beta</SectionLabel>
                <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 md:text-5xl">
                  Acceso inicial para primeros clientes.
                </h1>
                <p className="mt-5 text-base leading-8 text-slate-600">
                  Centinela IA se ofrece inicialmente bajo modalidad de acceso beta, con cupos
                  limitados para organizaciones que quieran validar el sistema en un entorno
                  controlado.
                </p>

                <p className="mt-4 text-sm font-semibold leading-6 text-slate-500">
                  También se puede presupuestar una versión personalizada según los
                  requerimientos de cada cliente. Cupos limitados y acompañamiento básico
                  incluido durante la etapa beta.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {betaItems.map((item) => (
                  <div
                    key={item}
                    className="landing-card rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-700"
                  >
                    {item}
                  </div>
                ))}

                <div className="flex justify-start sm:col-span-2">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex rounded-md bg-sky-500 px-2.5 py-1.5 text-center text-[11px] font-black text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-sky-600"
                  >
                    Consultar
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </RevealSection>
    </main>
  );
}
