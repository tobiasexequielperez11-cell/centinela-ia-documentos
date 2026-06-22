import Link from 'next/link';
import { LandingContactForm } from '@/components/landing-contact-form';
import { LandingHashNavigation } from '@/components/landing-hash-navigation';
import { RevealSection } from '@/components/landing-reveal-section';
import { PremiumHero } from '@/components/premium-hero';
import { SiteHeader } from '@/components/SiteHeader';

const whatsappUrl =
  'https://wa.me/543794733321?text=Hola,%20quiero%20coordinar%20una%20presentaci%C3%B3n%20de%20Centinela%20IA';

const emailUrl =
  'mailto:tobiasexequielperez11@gmail.com?subject=Consulta%20comercial%20Centinela%20IA';

const problemCards = [
  {
    title: 'Documentos dispersos',
    description: 'Archivos repartidos entre WhatsApp, correo, carpetas locales o Drive.',
  },
  {
    title: 'Poca trazabilidad',
    description: 'Dificultad para saber quién accedió, revisó o gestionó información.',
  },
  {
    title: 'Expedientes desordenados',
    description: 'Carpetas, contratos y documentos sin una estructura clara.',
  },
  {
    title: 'Accesos sin control',
    description: 'Usuarios, permisos y documentación sensible sin una gestión centralizada.',
  },
];

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Centinela IA',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  url: 'https://centinela-ia-documentos.vercel.app/',
  description:
    'Plataforma web para centralizar expedientes, documentos PDF, usuarios, permisos y actividad auditada en un entorno privado.',
};

const industries = [
  {
    title: 'Estudios jurídicos',
    description:
      'Expedientes, escritos, sentencias, contratos y documentación asociada a clientes o causas.',
  },
  {
    title: 'Inmobiliarias',
    description:
      'Contratos de alquiler, reservas, boletos, documentación de clientes, garantías y operaciones.',
  },
  {
    title: 'Escribanías',
    description:
      'Trámites, escrituras, poderes, certificados y documentación crítica por operación.',
  },
  {
    title: 'Empresas',
    description:
      'Áreas administrativas, legales, contables, comerciales o de recursos humanos.',
  },
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm font-bold uppercase tracking-[0.22em] text-sky-300">
      {children}
    </p>
  );
}

function SectionTitle({
  label,
  title,
  description,
}: {
  label: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <SectionLabel>{label}</SectionLabel>
      <h2 className="mt-3 text-3xl font-black tracking-tight text-white md:text-5xl">
        {title}
      </h2>
      <p className="mt-4 text-base leading-7 text-[#C2CCD9] md:text-lg">
        {description}
      </p>
    </div>
  );
}

function SectionGlow() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -left-24 top-16 h-64 w-64 rounded-full bg-sky-400/10 blur-3xl" />
      <div className="absolute -right-24 bottom-10 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
    </div>
  );
}

export default function HomePage() {
  return (
    <main className="premium-home min-h-screen bg-[#0A1830] text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <LandingHashNavigation />

      <SiteHeader />

      <PremiumHero />

      <RevealSection id="beneficios" className="premium-section-a relative flex min-h-screen items-center overflow-hidden px-6 py-24">
        <SectionGlow />
        <div className="relative z-10 mx-auto max-w-7xl">
          <SectionTitle
            label="Problema"
            title="Tus documentos importantes no deberían estar dispersos."
            description="Muchos equipos trabajan con contratos, expedientes, legajos y PDFs repartidos entre WhatsApp, correo, carpetas locales o Drive. Eso dificulta encontrar archivos, controlar accesos y saber qué pasó con cada documento. Centinela IA reúne todo eso en un solo lugar seguro."
          />

          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {problemCards.map((card) => (
              <div
                key={card.title}
                className="premium-card landing-card rounded-2xl border border-white/10 bg-white/[0.055] p-7 shadow-[0_18px_45px_rgba(0,0,0,0.18)] backdrop-blur-sm"
              >
                <h3 className="text-lg font-black text-white">{card.title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#C2CCD9]">
                  {card.description}
                </p>
              </div>
            ))}
          </div>

        </div>
      </RevealSection>

      <RevealSection className="premium-section-b relative overflow-hidden px-6 py-16 md:py-20">
        <SectionGlow />
        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <SectionLabel>Funciones</SectionLabel>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-white md:text-5xl">
            Todo lo que tu equipo necesita, en un solo panel.
          </h2>
          <p className="mx-auto mt-5 max-w-3xl text-base leading-8 text-[#C2CCD9] md:text-lg">
            Expedientes, bóveda documental, visor PDF, reportes, usuarios y auditoría — más
            resultados operativos concretos.
          </p>
          <Link
            href="/funciones"
            className="premium-primary-button mt-7 inline-flex rounded-2xl bg-[#1E9BF0] px-6 py-3.5 text-sm font-black text-[#061426] shadow-[0_12px_32px_rgba(30,155,240,0.22)]"
          >
            Ver funciones
          </Link>
        </div>
      </RevealSection>

      <RevealSection id="rubros" className="premium-section-a relative flex min-h-screen items-center overflow-hidden px-6 py-24">
        <SectionGlow />
        <div className="relative z-10 mx-auto max-w-7xl">
          <SectionTitle
            label="Rubros"
            title="Pensado para equipos que manejan documentación sensible."
            description="La plataforma está orientada inicialmente a rubros donde el orden documental, el control de acceso y la trazabilidad son claves."
          />

          <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {industries.map((industry) => (
              <div
                key={industry.title}
                className="premium-card landing-card rounded-2xl border border-white/10 bg-white/[0.055] p-7 shadow-[0_18px_45px_rgba(0,0,0,0.18)] backdrop-blur-sm"
              >
                <h3 className="text-xl font-black text-white">
                  {industry.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-[#C2CCD9]">
                  {industry.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </RevealSection>

      <RevealSection id="seguridad" className="premium-section-b px-6 py-16 text-white md:py-20">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-sky-300">
            Confidencialidad y seguridad
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight md:text-5xl">
            Tu información sensible, protegida y bajo control.
          </h2>
          <p className="mx-auto mt-5 max-w-3xl text-base leading-8 text-slate-300 md:text-lg">
            Aislamiento por organización, almacenamiento privado, permisos por rol y actividad
            auditada, con criterios de protección de datos personales.
          </p>
          <Link
            href="/seguridad"
            className="premium-primary-button mt-7 inline-flex rounded-2xl bg-[#1E9BF0] px-6 py-3.5 text-sm font-black text-[#061426] shadow-[0_12px_32px_rgba(30,155,240,0.22)]"
          >
            Ver seguridad
          </Link>
        </div>
      </RevealSection>

      <RevealSection className="premium-section-a px-6 py-16 md:py-20">
        <div className="mx-auto max-w-4xl text-center">
          <SectionLabel>IA documental</SectionLabel>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-white md:text-5xl">
            Análisis documental asistido, en entorno controlado.
          </h2>
          <p className="mx-auto mt-5 max-w-3xl text-base leading-8 text-[#C2CCD9] md:text-lg">
            Clasificación, detección de sensibilidad y revisión inicial de documentos para
            ordenar la información clave.
          </p>
          <Link
            href="/analisis-documental"
            className="premium-primary-button mt-7 inline-flex rounded-2xl bg-[#1E9BF0] px-6 py-3.5 text-sm font-black text-[#061426] shadow-[0_12px_32px_rgba(30,155,240,0.22)]"
          >
            Ver análisis documental
          </Link>
        </div>
      </RevealSection>

      <RevealSection id="demo" className="premium-section-b relative overflow-hidden px-6 py-16 md:py-20">
        <SectionGlow />
        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <SectionLabel>Presentación guiada</SectionLabel>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-white md:text-5xl">
            Conocé cómo funciona, paso a paso.
          </h2>
          <p className="mx-auto mt-5 max-w-3xl text-base leading-8 text-[#C2CCD9] md:text-lg">
            Un recorrido por el sistema: ingreso, expedientes, carga de documentos, visor PDF,
            análisis documental y auditoría.
          </p>
          <Link
            href="/como-funciona"
            className="premium-primary-button mt-7 inline-flex rounded-2xl bg-[#1E9BF0] px-6 py-3.5 text-sm font-black text-[#061426] shadow-[0_12px_32px_rgba(30,155,240,0.22)]"
          >
            Ver la presentación guiada
          </Link>
        </div>
      </RevealSection>

      <RevealSection id="beta" className="premium-section-a relative overflow-hidden px-6 py-16 md:py-20">
        <SectionGlow />
        <div className="premium-card relative z-10 mx-auto max-w-4xl rounded-2xl border border-white/10 bg-white/[0.055] p-8 text-center shadow-[0_22px_55px_rgba(0,0,0,0.2)] backdrop-blur-sm md:p-10">
          <SectionLabel>Acceso beta</SectionLabel>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-white md:text-5xl">
            Acceso beta para los primeros clientes.
          </h2>
          <p className="mx-auto mt-5 max-w-3xl text-base leading-8 text-[#C2CCD9] md:text-lg">
            Cupos limitados, acompañamiento incluido y opción de desarrollo a medida según tu
            organización.
          </p>
          <Link
            href="/planes"
            className="premium-primary-button mt-7 inline-flex rounded-2xl bg-[#1E9BF0] px-6 py-3.5 text-sm font-black text-[#061426] shadow-[0_12px_32px_rgba(30,155,240,0.22)]"
          >
            Ver planes
          </Link>
        </div>
      </RevealSection>

      <RevealSection id="contacto" className="premium-section-b relative overflow-hidden px-6 py-24">
        <SectionGlow />
        <div className="relative z-10 mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <SectionLabel>Contacto comercial</SectionLabel>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-white md:text-5xl">
              Contanos qué necesita tu organización.
            </h2>
            <p className="mt-5 text-base leading-8 text-[#C2CCD9]">
              Completá los datos básicos para preparar una conversación enfocada en tu rubro,
              flujo documental y necesidades de acceso.
            </p>
            <div className="mt-7 rounded-2xl border border-sky-300/15 bg-sky-400/[0.08] p-5 text-sm leading-6 text-sky-100">
              La consulta no crea una cuenta ni confirma una contratación. Sirve para coordinar
              una presentación y evaluar si la beta se adapta al caso de uso.
            </div>
          </div>

          <LandingContactForm />
        </div>
      </RevealSection>

      <RevealSection className="premium-section-a border-t border-white/[0.06] px-6 py-24 text-white">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-black tracking-tight md:text-5xl">
            Ordená tus expedientes y documentos desde un solo lugar.
          </h2>

          <p className="mt-5 text-base leading-8 text-slate-300 md:text-lg">
            Coordiná una presentación de Centinela IA y evaluá si la plataforma se adapta a tu
            estudio, inmobiliaria, escribanía o equipo de trabajo.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="premium-primary-button rounded-2xl bg-[#1E9BF0] px-6 py-4 text-center text-sm font-black text-[#061426]"
            >
              Coordinar presentación
            </a>

            <Link
              href="/login"
              className="premium-secondary-button rounded-2xl border border-white/20 bg-white/[0.025] px-6 py-4 text-center text-sm font-black text-white"
            >
              Ingresar al sistema
            </Link>
          </div>

          <p className="mt-6 text-sm font-semibold text-slate-400">
            Beta operativa comercial para primeros clientes.
          </p>
        </div>
      </RevealSection>

      <footer className="border-t border-white/10 bg-[#071326] px-6 pb-24 pt-8 md:py-8">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 text-sm text-slate-400 md:flex-row md:items-center">
          <p className="font-semibold text-slate-200">© 2026 Centinela IA</p>

          <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-6">
            <Link href="/privacidad" className="font-semibold text-slate-400 hover:text-sky-300">
              Privacidad
            </Link>

            <Link href="/terminos" className="font-semibold text-slate-400 hover:text-sky-300">
              Términos
            </Link>

            <a
              href={emailUrl}
              className="inline-flex items-center gap-2 font-semibold text-slate-400 hover:text-sky-300"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-4 w-4 text-sky-700"
                aria-hidden="true"
              >
                <path d="M1.5 8.67v8.58A2.25 2.25 0 0 0 3.75 19.5h16.5a2.25 2.25 0 0 0 2.25-2.25V8.67l-8.93 5.36a3 3 0 0 1-3.14 0L1.5 8.67Z" />
                <path d="M22.5 6.91V6.75a2.25 2.25 0 0 0-2.25-2.25H3.75A2.25 2.25 0 0 0 1.5 6.75v.16l9.7 5.82a1.5 1.5 0 0 0 1.6 0l9.7-5.82Z" />
              </svg>
              tobiasexequielperez11@gmail.com
            </a>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 font-semibold text-slate-400 hover:text-sky-300"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-4 w-4 text-emerald-600"
                aria-hidden="true"
              >
                <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.33 4.96L2 22.18l5.43-1.42a9.9 9.9 0 0 0 4.61 1.17h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.46 17.51 2 12.04 2Zm0 18.25h-.01a8.2 8.2 0 0 1-4.18-1.14l-.3-.18-3.22.84.86-3.13-.2-.32a8.18 8.18 0 0 1-1.25-4.4c0-4.58 3.73-8.3 8.31-8.3 2.22 0 4.3.86 5.87 2.43a8.26 8.26 0 0 1 2.43 5.87c0 4.58-3.73 8.33-8.31 8.33Zm4.56-6.23c-.25-.12-1.47-.72-1.7-.8-.23-.09-.39-.12-.56.12-.16.25-.64.8-.78.96-.14.16-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.14.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.41-.56-.42h-.48c-.17 0-.43.06-.66.31-.23.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.56.12.16 1.75 2.67 4.24 3.74.59.25 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.15-1.18-.06-.1-.23-.16-.48-.29Z" />
              </svg>
              +54 379 4733321
            </a>

          </div>
        </div>
      </footer>

<a
  href={whatsappUrl}
  target="_blank"
  rel="noreferrer"
  aria-label="Coordinar presentación por WhatsApp"
  className="group fixed bottom-5 right-4 z-50 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-emerald-500 text-white shadow-[0_12px_30px_rgba(16,185,129,0.3)] transition-all duration-300 hover:-translate-y-1 hover:bg-emerald-400 hover:shadow-[0_18px_40px_rgba(16,185,129,0.4)] active:translate-y-0 active:scale-95 sm:bottom-6 sm:right-6 sm:h-12 sm:w-12"
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="h-6 w-6 text-white"
    aria-hidden="true"
  >
    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.33 4.96L2 22.18l5.43-1.42a9.9 9.9 0 0 0 4.61 1.17h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.46 17.51 2 12.04 2Zm0 18.25h-.01a8.2 8.2 0 0 1-4.18-1.14l-.3-.18-3.22.84.86-3.13-.2-.32a8.18 8.18 0 0 1-1.25-4.4c0-4.58 3.73-8.3 8.31-8.3 2.22 0 4.3.86 5.87 2.43a8.26 8.26 0 0 1 2.43 5.87c0 4.58-3.73 8.33-8.31 8.33Zm4.56-6.23c-.25-.12-1.47-.72-1.7-.8-.23-.09-.39-.12-.56.12-.16.25-.64.8-.78.96-.14.16-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.14.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.41-.56-.42h-.48c-.17 0-.43.06-.66.31-.23.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.56.12.16 1.75 2.67 4.24 3.74.59.25 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.15-1.18-.06-.1-.23-.16-.48-.29Z" />
  </svg>
</a>
    </main>
  );
}
