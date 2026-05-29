import Link from 'next/link';
import { BarChart3, Lock, ShieldCheck, Sparkles } from 'lucide-react';

const benefits = [
  {
    title: 'Bóveda segura',
    text: 'Documentos privados, organizados por expediente y preparados para control de acceso.',
    icon: Lock,
  },
  {
    title: 'IA documental',
    text: 'Resumen, clasificación y asistencia para detectar información relevante.',
    icon: Sparkles,
  },
  {
    title: 'Reportes claros',
    text: 'Estado documental, faltantes y actividad en reportes simples para el equipo.',
    icon: BarChart3,
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-20">
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-sky-400/30 bg-sky-400/10 px-4 py-2 text-sm font-semibold text-sky-300">
          <ShieldCheck className="h-4 w-4" />
          Centinela IA Documentos
        </div>

        <h1 className="mt-8 max-w-4xl text-4xl font-bold tracking-tight sm:text-6xl">
          Protegé, ordená y automatizá la documentación sensible de tu empresa con inteligencia artificial.
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
          Una bóveda documental segura para escribanías, estudios, inmobiliarias y PYMES que necesitan controlar archivos, permisos, faltantes, reportes y procesos internos.
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link href="/dashboard" className="rounded-2xl bg-sky-400 px-6 py-3 text-center text-sm font-bold text-slate-950 hover:bg-sky-300">
            Ver demo visual
          </Link>
          <a href="mailto:contacto@centinelaia.com" className="rounded-2xl border border-white/20 px-6 py-3 text-center text-sm font-bold text-white hover:bg-white/10">
            Solicitar presentación
          </a>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <div key={benefit.title} className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <Icon className="h-6 w-6 text-sky-300" />
                <h2 className="mt-4 text-lg font-bold">{benefit.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-400">{benefit.text}</p>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
