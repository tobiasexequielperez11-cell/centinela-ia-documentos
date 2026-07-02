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
    <section className="rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 to-white p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-sky-600">
            Primeros pasos
          </p>
          <h2 className="mt-1 text-lg font-semibold text-slate-950">
            {firstName ? `Bienvenido, ${firstName}` : 'Empecemos'} 👋
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Dejá tu estudio listo en unos pocos pasos. Podés hacerlo a tu ritmo.
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
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
                  ? 'border-emerald-100 bg-emerald-50/50'
                  : isNext
                    ? 'border-sky-200 bg-white shadow-sm'
                    : 'border-slate-100 bg-white'
              }`}
            >
              <span className="shrink-0">
                {step.done ? (
                  <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                ) : (
                  <Icon className="h-6 w-6 text-sky-500" />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p
                  className={`text-sm font-semibold ${
                    step.done ? 'text-slate-500 line-through' : 'text-slate-950'
                  }`}
                >
                  {step.title}
                </p>
                {!step.done && (
                  <p className="mt-0.5 text-xs text-slate-600">{step.description}</p>
                )}
              </div>
              {!step.done && (
                <Link
                  href={step.href}
                  className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-slate-950 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
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
