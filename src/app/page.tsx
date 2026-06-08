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
    <div className="rounded-[2rem] border border-white/10 bg-white/10 p-3 shadow-2xl backdrop-blur">
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
            ['Análisis IA', '4 pendientes'],
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
      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/95 px-6 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <Link href="/" className="text-lg font-black text-white">
            Centinela IA
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-bold text-slate-300 md:flex">
            <a href="#beneficios" className="hover:text-white">
              Beneficios
            </a>
            <a href="#rubros" className="hover:text-white">
              Rubros
            </a>
            <a href="#demo" className="hover:text-white">
              Demo
            </a>
            <a href="#beta" className="hover:text-white">
              Beta cerrada
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-2xl border border-white/15 px-4 py-2 text-sm font-bold text-white hover:bg-white/10"
            >
              Ingresar
            </Link>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="hidden rounded-2xl bg-sky-400 px-4 py-2 text-sm font-black text-slate-950 hover:bg-sky-300 sm:inline-flex"
            >
              Solicitar demo
            </a>
          </div>
        </div>
      </header>

      <section className="overflow-hidden bg-slate-950 px-6 py-20 text-white lg:py-28">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1fr_0.95fr]">
          <div>
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
              Beta operativa cerrada · Acceso por roles · Documentos privados ·
              Actividad auditada
            </p>
          </div>

          <MockupPanel />
        </div>
      </section>

      <section id="beneficios" className="bg-slate-50 px-6 py-20">
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
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
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
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:border-sky-200 hover:shadow-md"
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

      <section id="rubros" className="bg-slate-50 px-6 py-20">
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
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
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

      <section className="bg-slate-950 px-6 py-20 text-white">
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
                Durante la beta cerrada, el objetivo es validar la utilidad real del
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

      <section id="demo" className="bg-slate-50 px-6 py-20">
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
              className="mt-7 inline-flex rounded-2xl bg-slate-950 px-6 py-4 text-sm font-black text-white hover:bg-slate-800"
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
              <SectionLabel>Beta cerrada</SectionLabel>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 md:text-5xl">
                Acceso inicial para primeros clientes.
              </h2>
              <p className="mt-5 text-base leading-8 text-slate-600">
                Centinela IA se ofrece inicialmente bajo modalidad de beta cerrada, con
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
                className="rounded-2xl bg-sky-500 p-4 text-center text-sm font-black text-white hover:bg-sky-600 sm:col-span-2"
              >
                Consultar disponibilidad
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-950 px-6 py-20 text-white">
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
            Beta operativa cerrada para primeros clientes.
          </p>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white px-6 py-8">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 text-sm text-slate-500 md:flex-row md:items-center">
          <p className="font-bold text-slate-700">Centinela IA</p>

          <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-5">
            <a
              href={emailUrl}
              className="font-semibold text-slate-600 hover:text-slate-950"
            >
              tobiasexequielperez11@gmail.com
            </a>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-slate-600 hover:text-slate-950"
            >
              WhatsApp: +54 379 4733321
            </a>

            <Link
              href="/login"
              className="font-semibold text-slate-600 hover:text-slate-950"
            >
              Ingresar
            </Link>
          </div>
        </div>
      </footer>

<a
  href={whatsappUrl}
  target="_blank"
  rel="noreferrer"
  aria-label="Solicitar demo por WhatsApp"
  className="group fixed bottom-4 right-4 z-50 inline-flex items-center justify-center rounded-full bg-emerald-500 p-3 text-white shadow-[0_12px_30px_rgba(16,185,129,0.35)] transition-all duration-300 hover:-translate-y-1 hover:bg-emerald-400 hover:shadow-[0_18px_40px_rgba(16,185,129,0.45)] active:translate-y-0 active:scale-95 sm:bottom-5 sm:right-5 sm:gap-3 sm:px-5 sm:py-3.5"
>
  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/20 transition-transform duration-300 group-hover:scale-110 sm:h-9 sm:w-9">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      fill="currentColor"
      className="h-5 w-5 text-white sm:h-5 sm:w-5"
      aria-hidden="true"
    >
      <path d="M19.11 17.36c-.3-.15-1.77-.87-2.05-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.95 1.17-.17.2-.35.22-.65.07-.3-.15-1.28-.47-2.43-1.5-.9-.8-1.5-1.8-1.67-2.1-.17-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.05 1.02-1.05 2.5 0 1.47 1.07 2.9 1.22 3.1.15.2 2.1 3.2 5.1 4.48.71.3 1.27.48 1.7.62.71.23 1.35.2 1.86.12.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35z" />
      <path d="M16.03 3.2c-6.97 0-12.64 5.67-12.64 12.64 0 2.23.58 4.4 1.69 6.31L3.2 28.8l6.83-1.79a12.6 12.6 0 0 0 6 1.53h.01c6.97 0 12.64-5.67 12.64-12.64 0-3.37-1.31-6.54-3.69-8.93A12.54 12.54 0 0 0 16.03 3.2zm0 23.2h-.01a10.5 10.5 0 0 1-5.35-1.47l-.38-.22-4.05 1.06 1.08-3.95-.25-.4a10.45 10.45 0 0 1-1.6-5.57c0-5.78 4.7-10.48 10.48-10.48 2.8 0 5.43 1.09 7.41 3.07a10.4 10.4 0 0 1 3.07 7.41c0 5.78-4.7 10.48-10.4 10.48z" />
    </svg>
  </span>

  <span className="hidden text-sm font-black leading-none sm:inline">
    Solicitar demo
  </span>
</a>
    </main>
  );
}