import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { CheckCircle2, FolderPlus, FileUp, UserPlus, ArrowRight } from 'lucide-react';

type PrimerosPasosProps = {
  hasCase: boolean;
  hasDocument: boolean;
  hasTeam: boolean;
  isAdmin: boolean;
  userName?: string | null;
};

type Step = {
  done: boolean;
  title: string;
  description: string;
  href: string;
  cta: string;
  icon: LucideIcon;
};

export function PrimerosPasos({
  hasCase,
  hasDocument,
  hasTeam,
  isAdmin,
  userName,
}: PrimerosPasosProps) {
  const steps: Step[] = [
    {
      done: hasCase,
      title: 'Creá tu primer expediente',
      description: 'Organizá tu trabajo por caso: datos, documentos y plazos en un solo lugar.',
      href: '/expedientes/nuevo',
      cta: 'Nuevo expediente',
      icon: FolderPlus,
    },
    {
      done: hasDocument,
      title: 'Subí tu primer documento',
      description: 'Cargá un archivo a la bóveda y asignalo a un expediente.',
      href: '/documentos',
      cta: 'Ir a Documentos',
      icon: FileUp,
    },
  ];

  if (isAdmin) {
    steps.push({
      done: hasTeam,
      title: 'Invitá a tu equipo',
      description: 'Sumá colaboradores con su rol (operador, auditor o cliente).',
      href: '/usuarios/invitaciones',
      cta: 'Invitar equipo',
      icon: UserPlus,
    });
  }

  const completed = steps.filter((s) => s.done).length;
  const total = steps.length;
  const nextStep = steps.find((s) => !s.done);
  const firstName = userName ? userName.split(' ')[0] : null;

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-cyan-400">
            Primeros pasos
          </p>
          <h2 className="mt-1 text-xl font-semibold text-white">
            {firstName ? `Bienvenido, ${firstName}` : 'Empecemos'} 👋
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Dejá tu estudio listo en unos pocos pasos. Podés hacerlo a tu ritmo.
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-slate-300">
          {completed}/{total}
        </span>
      </div>

      <ol className="mt-5 space-y-3">
        {steps.map((step) => {
          const Icon = step.icon;
          const isNext = step === nextStep;
          return (
            <li
              key={step.href}
              className={`flex items-center gap-4 rounded-xl border p-4 transition ${
                step.done
                  ? 'border-white/10 bg-white/5'
                  : isNext
                    ? 'border-cyan-500/40 bg-cyan-500/5'
                    : 'border-white/10 bg-white/5'
              }`}
            >
              <span className="shrink-0">
                {step.done ? (
                  <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                ) : (
                  <Icon className="h-6 w-6 text-slate-500" />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p
                  className={`text-sm font-medium ${
                    step.done ? 'text-slate-500 line-through' : 'text-white'
                  }`}
                >
                  {step.title}
                </p>
                {!step.done && (
                  <p className="mt-0.5 text-sm text-slate-400">{step.description}</p>
                )}
              </div>
              {!step.done && (
                <Link
                  href={step.href}
                  className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-cyan-500 to-violet-500 px-3 py-2 text-sm font-medium text-white hover:opacity-90"
                >
                  {step.cta}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
