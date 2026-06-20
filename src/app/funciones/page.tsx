import type { Metadata } from 'next';
import Link from 'next/link';
import { RevealSection } from '@/components/landing-reveal-section';

export const metadata: Metadata = {
  title: 'Funciones | Centinela IA',
  description:
    'Conocé las funciones y los resultados operativos de la plataforma documental Centinela IA.',
};

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

const commercialOutcomes = [
  {
    title: 'Menos dispersión documental',
    description:
      'Encontrá expedientes y documentos desde una estructura centralizada, sin depender de carpetas, emails o WhatsApp.',
  },
  {
    title: 'Mayor trazabilidad',
    description:
      'Consultá la actividad auditada para identificar acciones relevantes realizadas sobre documentos.',
  },
  {
    title: 'Control centralizado',
    description: 'Usuarios, permisos, documentos y reportes administrados desde un solo lugar.',
  },
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
      <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 md:text-5xl">
        {title}
      </h1>
      <p className="mt-4 text-base leading-7 text-slate-600 md:text-lg">{description}</p>
    </div>
  );
}

export default function FuncionesPage() {
  return (
    <main className="min-h-screen bg-white text-slate-950">
      <div className="mx-auto max-w-7xl px-6 pt-10">
        <Link
          href="/"
          className="inline-flex text-sm font-black text-sky-700 transition-colors hover:text-sky-900"
        >
          ← Volver al inicio
        </Link>
      </div>

      <RevealSection className="px-6 pb-24 pt-12">
        <div className="mx-auto max-w-7xl">
          <SectionTitle
            label="Módulos"
            title="Todo lo que tu equipo necesita para gestionar documentación sensible."
            description="Centinela IA reúne las herramientas principales para organizar expedientes, cargar documentos, visualizar PDFs, controlar usuarios y revisar actividad desde un entorno privado."
          />

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="landing-card rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm hover:border-sky-200"
              >
                <h2 className="text-base font-black text-slate-950">{feature.title}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-3xl bg-[#071a33] p-6 text-white shadow-xl sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-300">
              Resultados operativos
            </p>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {commercialOutcomes.map((outcome) => (
                <div
                  key={outcome.title}
                  className="rounded-2xl border border-white/10 bg-white/5 p-5"
                >
                  <h2 className="text-base font-black">{outcome.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    {outcome.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </RevealSection>
    </main>
  );
}
