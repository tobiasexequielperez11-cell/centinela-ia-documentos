import type { Metadata } from 'next';
import { RevealSection } from '@/components/landing-reveal-section';
import { SiteHeader } from '@/components/SiteHeader';

export const metadata: Metadata = {
  title: 'Cómo funciona | Centinela IA',
  description:
    'Conocé el recorrido de Centinela IA: ingreso, expedientes, documentos, análisis y auditoría.',
};

const whatsappUrl =
  'https://wa.me/543794733321?text=Hola,%20quiero%20coordinar%20una%20presentaci%C3%B3n%20de%20Centinela%20IA';

const demoSteps = [
  'Login seguro',
  'Dashboard operativo',
  'Expedientes',
  'Carga documental',
  'Visor PDF',
  'Análisis documental',
  'Reportes',
  'Usuarios y permisos',
  'Auditoría',
  'Propuesta beta',
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

export default function ComoFuncionaPage() {
  return (
    <main className="min-h-screen bg-[#f4f8fb] text-slate-950">
      <SiteHeader />
      <RevealSection className="relative flex min-h-screen items-center overflow-hidden px-6 py-16 md:py-24">
        <SectionGlow />
        <div className="relative z-10 mx-auto w-full max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
            <div>
              <SectionLabel>Presentación guiada</SectionLabel>
              <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 md:text-5xl">
                Conocé el flujo completo en una presentación guiada.
              </h1>
              <p className="mt-5 text-base leading-8 text-slate-600">
                La presentación muestra cómo una organización puede ingresar al sistema,
                revisar métricas, crear expedientes, cargar documentos, visualizar PDFs,
                consultar reportes, administrar usuarios y revisar actividad auditada.
              </p>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-7 inline-flex rounded-2xl bg-sky-500 px-6 py-3.5 text-sm font-black text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-sky-600"
              >
                Coordinar presentación
              </a>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {demoSteps.map((step, index) => (
                <div
                  key={step}
                  className="landing-card flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sm font-black text-sky-700">
                    {index + 1}
                  </span>
                  <p className="text-sm font-bold text-slate-800">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </RevealSection>
    </main>
  );
}
