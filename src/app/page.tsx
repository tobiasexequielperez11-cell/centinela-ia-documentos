import Link from 'next/link';

const whatsappUrl =
  'https://wa.me/543794733321?text=Hola,%20quiero%20solicitar%20una%20demo%20de%20Centinela%20IA';

const emailUrl =
  'mailto:tobiasexequielperez11@gmail.com?subject=Solicitud%20de%20demo%20Centinela%20IA';

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

const features = [
  {
    title: 'Dashboard operativo',
    description: 'Métricas generales de expedientes, documentos, análisis y actividad.',
  },
  {
    title: 'Expedientes',
    description: 'Carpetas de trabajo para organizar casos, operaciones o trámites.',
  },
  {
    title: 'Bóveda documental',
    description: 'Carga y consulta de documentos PDF en un entorno privado.',
  },
  {
    title: 'Visor PDF',
    description: 'Visualización de archivos mediante enlaces temporales seguros.',
  },
  {
    title: 'Análisis documental',
    description: 'Lectura asistida para clasificación, sensibilidad y revisión inicial.',
  },
  {
    title: 'Reportes',
    description: 'Vistas operativas para documentos, invitaciones, actividad y auditoría.',
  },
  {
    title: 'Usuarios y roles',
    description: 'Control de accesos según perfil y organización.',
  },
  {
    title: 'Auditoría',
    description: 'Registro de acciones relevantes dentro del sistema.',
  },
];

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

const securityItems = [
  'Login seguro',
  'Roles por usuario',
  'Acceso por organización',
  'Documentos privados',
  'Enlaces temporales',
  'Auditoría de actividad',
  'Rutas sensibles protegidas',
];

const aiItems = [
  'Clasificación inicial de documentos',
  'Detección de sensibilidad',
  'Resumen operativo',
  'Alertas documentales',
  'Historial de análisis',
  'Base preparada para futuras integraciones',
];

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

const betaItems = [
  'Setup inicial',
  'Configuración de organización',
  'Usuarios y roles',
  'Acompañamiento básico',
  'Mensualidad accesible',
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
      <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 md:text-5xl">
        {title}
      </h2>
      <p className="mt-4 text-base leading-7 text-slate-600 md:text-lg">
        {description}
      </p>
    </div>
  );
}

function MockupPanel() {
  return (
    <div className="landing-float rounded-[2rem] border border-white/15 bg-white/10 p-3 shadow-2xl backdrop-blur">
      <div className="rounded-[1.5rem] border border-slate-800 bg-slate-950 p-4">
        <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-300">
              Centinela IA
            </p>
            <p className="mt-1 text-lg font-black text-white">Panel operativo</p>
          </div>
          <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-300">
            Beta activa
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {[
            ['Expedientes', '3 activos'],
            ['Documentos', '8 cargados'],
            ['Análisis documental', '4 procesados'],
            ['Auditoría', 'Eventos trazables'],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl bg-white p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                {label}
              </p>
              <p className="mt-2 text-xl font-black text-slate-950">{value}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-white">Bóveda documental</p>
            <span className="rounded-full bg-sky-400/10 px-3 py-1 text-xs font-bold text-sky-300">
              PDF privado
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {[
              'Contrato_Alquiler_Demo.pdf',
              'Compraventa_Inmobiliaria.pdf',
              'Informe_Documental.pdf',
            ].map((item) => (
              <div
                key={item}
                className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-3"
              >
                <span className="text-xs font-semibold text-slate-200">{item}</span>
                <span className="text-xs font-bold text-emerald-300">Seguro</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 rounded-2xl bg-sky-400 p-4 text-slate-950">
          <p className="text-sm font-black">Análisis documental</p>
          <p className="mt-1 text-xs font-semibold leading-5">
            Clasificación, sensibilidad y revisión inicial en entorno controlado.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-slate-950">
      <header className="relative z-40 border-b border-[#c8dbea] bg-[#eaf2f8] px-6 py-3 shadow-sm">
        <div className="mx-auto grid max-w-7xl grid-cols-[1fr_auto] items-center gap-4 lg:grid-cols-[1fr_auto_1fr]">
          <nav className="hidden items-center gap-6 text-sm font-bold text-slate-950 lg:flex">
            <a href="#beneficios" className="transition-colors hover:text-sky-700">
              Beneficios
            </a>
            <a href="#rubros" className="transition-colors hover:text-sky-700">
              Rubros
            </a>
            <a href="#demo" className="transition-colors hover:text-sky-700">
              Demo
            </a>
            <a href="#beta" className="transition-colors hover:text-sky-700">
              Acceso beta
            </a>
          </nav>

          <Link
            href="/"
            className="flex h-20 w-56 items-center justify-start overflow-hidden lg:h-24 lg:w-80 lg:justify-center"
            aria-label="Centinela IA"
          >
            <img
              src="/brand/centinela-logo-transparent.png"
              alt="Centinela IA"
              className="h-full w-full object-contain"
            />
          </Link>

          <div className="flex items-center justify-end gap-2">
            <Link
              href="/login"
              className="rounded-2xl border border-[#12345d]/20 px-4 py-2 text-sm font-bold text-[#0b1f3a] transition-colors hover:bg-white/70"
            >
              Ingresar
            </Link>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="hidden rounded-2xl bg-[#0b1f3a] px-4 py-2 text-sm font-black text-white shadow-sm transition-colors hover:bg-[#12345d] sm:inline-flex"
            >
              Solicitar demo
            </a>
          </div>
        </div>
      </header>

      <section className="overflow-hidden bg-[radial-gradient(circle_at_top_right,_#124b73_0%,_#082746_34%,_#020d29_76%)] px-6 py-20 text-white lg:py-28">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1fr_0.95fr]">
          <div className="landing-reveal">
            <div className="inline-flex rounded-full border border-sky-300/20 bg-sky-300/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-sky-200">
              Gestión documental inteligente
            </div>

            <h1 className="mt-6 max-w-4xl text-4xl font-black tracking-tight md:text-6xl">
              Organizá expedientes, documentos y accesos desde un solo panel.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 md:text-lg">
              Centinela IA es una plataforma web para estudios jurídicos,
              inmobiliarias y escribanías que necesitan centralizar documentos PDF,
              controlar usuarios, revisar actividad y trabajar con análisis documental
              asistido en un entorno seguro.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-2xl bg-cyan-400 px-6 py-4 text-center text-sm font-black text-[#071a33] shadow-lg shadow-cyan-950/20 transition-all hover:-translate-y-0.5 hover:bg-cyan-300"
              >
                Solicitar demo
              </a>

              <Link
                href="/login"
                className="rounded-2xl border border-white/20 px-6 py-4 text-center text-sm font-black text-white transition-colors hover:bg-white/10"
              >
                Ingresar al sistema
              </Link>
            </div>

            <p className="mt-6 text-sm font-semibold text-slate-400">
              Beta operativa comercial · Acceso por roles · Documentos privados ·
              Actividad auditada
            </p>
          </div>

          <MockupPanel />
        </div>
      </section>

      <section id="beneficios" className="bg-[#f4f8fb] px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <SectionTitle
            label="Problema"
            title="Tus documentos importantes no deberían estar dispersos."
            description="Muchos equipos trabajan con contratos, expedientes, legajos y PDFs repartidos entre WhatsApp, correo, carpetas locales o Drive. Eso dificulta encontrar archivos, controlar accesos y saber qué pasó con cada documento."
          />

          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {problemCards.map((card) => (
              <div
                key={card.title}
                className="landing-card rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm"
              >
                <h3 className="text-lg font-black text-slate-950">{card.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {card.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <SectionTitle
            label="Módulos"
            title="Un panel operativo para tu gestión documental."
            description="Centinela IA reúne las herramientas principales para organizar expedientes, cargar documentos, visualizar PDFs, controlar usuarios y revisar actividad desde un entorno privado."
          />

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="landing-card rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm hover:border-sky-200"
              >
                <h3 className="text-base font-black text-slate-950">
                  {feature.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="rubros" className="bg-[#f4f8fb] px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <SectionTitle
            label="Rubros"
            title="Pensado para equipos que manejan documentación sensible."
            description="La plataforma está orientada inicialmente a rubros donde el orden documental, el control de acceso y la trazabilidad son claves."
          />

          <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {industries.map((industry) => (
              <div
                key={industry.title}
                className="landing-card rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm"
              >
                <h3 className="text-xl font-black text-slate-950">
                  {industry.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {industry.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[linear-gradient(135deg,_#020d29,_#082746)] px-6 py-20 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <SectionLabel>Seguridad</SectionLabel>
            <h2 className="mt-3 text-3xl font-black tracking-tight md:text-5xl">
              Accesos protegidos y actividad trazable.
            </h2>
            <p className="mt-5 text-base leading-8 text-slate-300">
              Centinela IA incorpora autenticación, roles, permisos por organización,
              almacenamiento privado y auditoría de acciones para mejorar el control
              interno.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {securityItems.map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm font-bold text-slate-100"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <SectionLabel>IA documental</SectionLabel>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 md:text-5xl">
                Análisis documental en entorno beta controlado.
              </h2>
              <p className="mt-5 text-base leading-8 text-slate-600">
                La plataforma permite preparar lecturas documentales, detectar
                sensibilidad, generar revisiones iniciales y ordenar información clave
                dentro de un flujo controlado.
              </p>
              <p className="mt-4 text-base leading-8 text-slate-600">
                Durante el acceso beta, el objetivo es validar la utilidad real del
                análisis documental, la experiencia de uso y la trazabilidad antes de
                integrar proveedores externos.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {aiItems.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-sky-100 bg-sky-50 p-4 text-sm font-bold text-sky-900"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="demo" className="bg-[#f4f8fb] px-6 py-20">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div>
            <SectionLabel>Demo guiada</SectionLabel>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 md:text-5xl">
              Conocé el flujo completo en una demo guiada.
            </h2>
            <p className="mt-5 text-base leading-8 text-slate-600">
              La demo muestra cómo una organización puede ingresar al sistema, revisar
              métricas, crear expedientes, cargar documentos, visualizar PDFs, consultar
              reportes, administrar usuarios y revisar actividad auditada.
            </p>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-7 inline-flex rounded-2xl bg-[#0b1f3a] px-6 py-4 text-sm font-black text-white transition-all hover:-translate-y-0.5 hover:bg-[#12345d]"
            >
              Solicitar demo
            </a>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {demoSteps.map((step, index) => (
              <div
                key={step}
                className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sm font-black text-sky-700">
                  {index + 1}
                </span>
                <p className="text-sm font-bold text-slate-800">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="beta" className="px-6 py-20">
        <div className="mx-auto max-w-5xl rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm md:p-10">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <SectionLabel>Acceso beta</SectionLabel>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 md:text-5xl">
                Acceso inicial para primeros clientes.
              </h2>
              <p className="mt-5 text-base leading-8 text-slate-600">
                Centinela IA se ofrece inicialmente bajo modalidad de acceso beta, con
                cupos limitados para organizaciones que quieran validar el sistema en un
                entorno controlado.
              </p>

              <p className="mt-4 text-sm font-semibold leading-6 text-slate-500">
                También se puede presupuestar una versión personalizada según los
                requerimientos de cada cliente.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {betaItems.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-700"
                >
                  {item}
                </div>
              ))}

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full max-w-sm justify-self-center rounded-2xl bg-sky-500 px-5 py-3.5 text-center text-sm font-black text-white hover:bg-sky-600 sm:col-span-2"
              >
                Consultar disponibilidad
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[linear-gradient(135deg,_#020d29,_#082746)] px-6 py-20 text-white">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-black tracking-tight md:text-5xl">
            Ordená tus expedientes y documentos desde un solo lugar.
          </h2>

          <p className="mt-5 text-base leading-8 text-slate-300 md:text-lg">
            Solicitá una demo de Centinela IA y evaluá si la plataforma se adapta a tu
            estudio, inmobiliaria, escribanía o equipo de trabajo.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-2xl bg-sky-400 px-6 py-4 text-center text-sm font-black text-slate-950 hover:bg-sky-300"
            >
              Solicitar demo
            </a>

            <Link
              href="/login"
              className="rounded-2xl border border-white/15 px-6 py-4 text-center text-sm font-black text-white hover:bg-white/10"
            >
              Ingresar al sistema
            </Link>
          </div>

          <p className="mt-6 text-sm font-semibold text-slate-400">
            Beta operativa comercial para primeros clientes.
          </p>
        </div>
      </section>

      <footer className="border-t border-[#c8dbea] bg-[#eaf2f8] px-6 py-8">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 text-sm text-slate-700 md:flex-row md:items-center">
          <p className="font-semibold text-[#0b1f3a]">© 2026 Centinela IA</p>

          <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-6">
            <a
              href={emailUrl}
              className="inline-flex items-center gap-2 font-semibold text-slate-700 hover:text-slate-950"
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
              className="inline-flex items-center gap-2 font-semibold text-slate-700 hover:text-slate-950"
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
  aria-label="Solicitar demo por WhatsApp"
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
