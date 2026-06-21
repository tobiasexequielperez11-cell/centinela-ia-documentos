import type { Metadata } from 'next';
import Link from 'next/link';
import { RevealSection } from '@/components/landing-reveal-section';

export const metadata: Metadata = {
  title: 'Planes y acceso beta | Centinela IA',
  description:
    'Conocé las condiciones iniciales, el acompañamiento y las opciones de acceso beta de Centinela IA.',
};

const plans = [
  {
    title: 'Beta Inicial',
    subtitle: 'Para equipos chicos que quieren probar la plataforma.',
    items: ['Setup inicial', 'Usuarios y roles', 'Acceso beta a la plataforma'],
    button: 'Consultar',
  },
  {
    title: 'Beta + Acompañamiento',
    subtitle: 'Para estudios e inmobiliarias que arrancan en serio.',
    items: [
      'Todo lo de Beta Inicial',
      'Configuración de organización',
      'Acompañamiento durante la beta',
      'Ajustes según feedback',
    ],
    button: 'Coordinar presentación',
    recommended: true,
  },
  {
    title: 'A Medida',
    subtitle: 'Para organizaciones con necesidades propias.',
    items: [
      'Todo lo de Beta + Acompañamiento',
      'Desarrollo a medida según requerimientos',
      'Preparado para integraciones futuras',
    ],
    button: 'Consultar a medida',
  },
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
        <div className="relative z-10 mx-auto w-full max-w-7xl">
          <Link
            href="/"
            className="inline-flex text-sm font-black text-sky-700 transition-colors hover:text-sky-900"
          >
            ← Volver al inicio
          </Link>

          <div className="mt-10 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm md:p-10">
            <div>
              <SectionLabel>Acceso beta</SectionLabel>
              <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 md:text-5xl">
                Acceso inicial para primeros clientes.
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600">
                Centinela IA se ofrece inicialmente bajo modalidad de acceso beta, con cupos
                limitados para organizaciones que quieran validar el sistema en un entorno
                controlado.
              </p>

              <p className="mt-4 max-w-3xl text-sm font-semibold leading-6 text-slate-500">
                También se puede presupuestar una versión personalizada según los
                requerimientos de cada cliente. Cupos limitados y acompañamiento básico
                incluido durante la etapa beta.
              </p>
            </div>

            <div className="mt-10 grid gap-6 lg:grid-cols-3">
              {plans.map((plan) => (
                <article
                  key={plan.title}
                  className={`landing-card relative flex h-full flex-col rounded-3xl border p-6 shadow-sm ${
                    plan.recommended
                      ? 'border-sky-400 bg-sky-50/70 ring-1 ring-sky-200'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  {plan.recommended ? (
                    <span className="mb-4 inline-flex w-fit rounded-full bg-sky-500 px-3 py-1 text-xs font-black uppercase tracking-wide text-white">
                      Recomendado
                    </span>
                  ) : null}

                  <h2 className="text-2xl font-black text-slate-950">{plan.title}</h2>
                  <p className="mt-3 min-h-12 text-sm leading-6 text-slate-600">
                    {plan.subtitle}
                  </p>
                  <p className="mt-6 text-2xl font-black text-slate-950">A consultar</p>

                  <p className="mt-6 text-xs font-black uppercase tracking-[0.16em] text-sky-700">
                    Incluye
                  </p>
                  <ul className="mt-4 flex-1 space-y-3 pl-5 text-sm leading-6 text-slate-700">
                    {plan.items.map((item) => (
                      <li key={item} className="list-disc marker:text-sky-500">
                        {item}
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/#contacto"
                    className="mt-8 inline-flex justify-center rounded-2xl bg-sky-500 px-5 py-3 text-center text-sm font-black text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-sky-600"
                  >
                    {plan.button}
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </div>
      </RevealSection>
    </main>
  );
}
