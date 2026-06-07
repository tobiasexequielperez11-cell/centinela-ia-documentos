import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { getUserProfile } from '@/lib/auth/getUserProfile';

interface InfoCardProps {
  title: string;
  description: string;
  status: string;
  badge: string;
  items: string[];
  tone?: 'default' | 'success' | 'warning' | 'danger';
}

interface ChecklistItem {
  label: string;
  status: string;
  tone: 'success' | 'warning' | 'danger';
}

function getToneClasses(tone: InfoCardProps['tone'] = 'default') {
  if (tone === 'success') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-950';
  }

  if (tone === 'warning') {
    return 'border-amber-200 bg-amber-50 text-amber-950';
  }

  if (tone === 'danger') {
    return 'border-rose-200 bg-rose-50 text-rose-950';
  }

  return 'border-slate-200 bg-white text-slate-950';
}

function StatusPill({
  children,
  tone = 'success',
}: {
  children: string;
  tone?: 'success' | 'warning' | 'danger' | 'default';
}) {
  const classes = {
    success: 'bg-emerald-50 text-emerald-700',
    warning: 'bg-amber-50 text-amber-700',
    danger: 'bg-rose-50 text-rose-700',
    default: 'bg-slate-100 text-slate-700',
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.16em] ${classes[tone]}`}
    >
      {children}
    </span>
  );
}

function InfoCard({
  title,
  description,
  status,
  badge,
  items,
  tone = 'default',
}: InfoCardProps) {
  return (
    <div className={`rounded-3xl border p-6 shadow-sm ${getToneClasses(tone)}`}>
      <div className="flex items-start justify-between gap-4">
        <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-black uppercase tracking-[0.18em]">
          {badge}
        </span>

        <StatusPill
          tone={
            tone === 'danger'
              ? 'danger'
              : tone === 'warning'
                ? 'warning'
                : tone === 'success'
                  ? 'success'
                  : 'default'
          }
        >
          {status}
        </StatusPill>
      </div>

      <h2 className="mt-5 text-xl font-black tracking-tight">{title}</h2>

      <p className="mt-3 text-sm leading-6 opacity-80">{description}</p>

      <div className="mt-5 space-y-3">
        {items.map((item) => (
          <div
            key={item}
            className="rounded-2xl border border-white/60 bg-white/60 p-4 text-sm font-medium leading-6"
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function IaConfigPage() {
  const { user, profile } = await getUserProfile();

  if (!user) {
    redirect('/login');
  }

  if (!profile) {
    redirect('/acceso-denegado?motivo=perfil');
  }

  if (profile.status !== 'active') {
    redirect('/acceso-denegado?motivo=estado');
  }

  if (profile.role !== 'admin') {
    redirect('/acceso-denegado?motivo=rol');
  }

  const infoCards: InfoCardProps[] = [
    {
      title: 'Estado actual de IA',
      description:
        'La beta cerrada utiliza análisis IA en modo controlado para validar el flujo documental sin generar costos externos.',
      status: 'Controlado',
      badge: 'Actual',
      tone: 'success',
      items: [
        'No se envían documentos a proveedores externos.',
        'No se consume crédito ni tokens de API.',
        'El flujo permite validar interfaz, historial, reportes y cobertura documental.',
        'Sirve para validar el producto antes de integrar servicios externos.',
      ],
    },
{
  title: 'Integración IA externa',
  description:
    'La integración con un proveedor IA externo queda reservada para una etapa futura, cuando la propuesta comercial y técnica esté validada.',
  status: 'No activa',
  badge: 'Externo',
  tone: 'warning',
  items: [
    'No cargar claves privadas en GitHub.',
    'No activar servicios externos sin control de costos.',
    'No enviar documentos sensibles a proveedores externos durante pruebas tempranas.',
    'Definir límites por usuario y organización antes de activar la integración.',
  ],
},
    {
      title: 'Qué valida la IA documental',
      description:
        'El análisis IA en modo controlado permite validar partes importantes del producto antes de integrar un proveedor externo.',
      status: 'Útil',
      badge: 'Beta',
      tone: 'success',
      items: [
        'Carga de documento.',
        'Generación de resultado de análisis.',
        'Historial de análisis IA.',
        'Visualización en reportes y dashboard.',
        'Auditoría operativa del flujo.',
      ],
    },
  ];

  const futureChecklist: ChecklistItem[] = [
    {
      label: 'Definir caso de uso comercial principal',
      status: 'Pendiente',
      tone: 'warning',
    },
    {
      label: 'Definir modelo de IA a utilizar',
      status: 'Pendiente',
      tone: 'warning',
    },
    {
      label: 'Crear variable segura para API key',
      status: 'Pendiente',
      tone: 'warning',
    },
    {
      label: 'Controlar costos por usuario',
      status: 'Pendiente',
      tone: 'warning',
    },
    {
      label: 'Guardar prompts y respuestas',
      status: 'Pendiente',
      tone: 'warning',
    },
    {
      label: 'Registrar errores de IA',
      status: 'Pendiente',
      tone: 'warning',
    },
    {
      label: 'Limitar uso por organización',
      status: 'Pendiente',
      tone: 'warning',
    },
    {
label: 'Activar integración IA externa en beta actual',
      status: 'No recomendado',
      tone: 'danger',
    },
  ];

  const aiRisks = [
    'Activar una integración IA externa antes de validar el mercado puede generar costos innecesarios.',
    'Enviar documentos reales a un proveedor externo requiere revisar privacidad, términos y seguridad.',
    'Sin límites de uso, un usuario podría generar consumo excesivo.',
    'Sin auditoría de prompts y respuestas, sería difícil diagnosticar errores.',
    'Sin propuesta comercial clara, no se puede definir correctamente el costo por cliente.',
  ];

  const futureFlow = [
    {
      step: '1',
      title: 'Documento cargado',
      detail: 'El usuario sube un PDF o documento compatible al expediente.',
    },
    {
      step: '2',
      title: 'Solicitud de análisis',
      detail: 'El sistema genera un prompt controlado y registra el pedido.',
    },
    {
      step: '3',
title: 'Proveedor IA externo procesa',
detail: 'Un proveedor IA externo procesa el documento y devuelve resumen, clasificación o alertas.',
    },
    {
      step: '4',
      title: 'Resultado guardado',
      detail: 'La respuesta se almacena en ai_outputs con trazabilidad.',
    },
    {
      step: '5',
      title: 'Control de consumo',
      detail: 'Se registra uso por usuario, organización y documento.',
    },
  ];

  return (
    <AppShell>
      <div className="space-y-8">
        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.35em] text-sky-600">
                Control interno
              </p>

              <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
                Modo IA
              </h1>

              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
Panel interno para controlar el estado del análisis IA documental, documentar el flujo actual y dejar preparado el criterio técnico para una futura integración con proveedor externo.
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-950">
              <p className="font-black">Estado actual</p>
              <p className="mt-1">IA documental en entorno beta sin costo API</p>
            </div>
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-3">
          {infoCards.map((card) => (
            <InfoCard
              key={card.title}
              title={card.title}
              description={card.description}
              status={card.status}
              badge={card.badge}
              items={card.items}
              tone={card.tone}
            />
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-950">
Checklist futuro para integración IA externa
                </h2>

                <p className="mt-1 text-sm text-slate-600">
Condiciones recomendadas antes de activar una integración IA externa.
                </p>
              </div>

              <Link
                href="/configuracion"
                className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                Volver a configuración
              </Link>
            </div>

            <div className="mt-5 divide-y divide-slate-100">
              {futureChecklist.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between gap-4 py-4"
                >
                  <p className="text-sm font-semibold text-slate-800">
                    {item.label}
                  </p>

                  <StatusPill tone={item.tone}>{item.status}</StatusPill>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-950 shadow-sm">
            <h2 className="text-xl font-black">
              Riesgos de activar IA paga ahora
            </h2>

            <p className="mt-2 text-sm leading-6 opacity-80">
Motivos por los que conviene mantener el análisis IA en modo controlado hasta definir la propuesta comercial.
            </p>

            <div className="mt-5 space-y-3">
              {aiRisks.map((risk) => (
                <div
                  key={risk}
                  className="rounded-2xl border border-white/70 bg-white/60 p-4 text-sm font-medium leading-6"
                >
                  {risk}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black text-slate-950">
Flujo futuro de integración IA externa
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Este flujo no está activo todavía. Sirve como referencia técnica para
            una futura integración cuando el producto esté comercialmente más
            definido.
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {futureFlow.map((item) => (
              <div
                key={item.step}
                className="rounded-3xl border border-slate-200 bg-slate-50 p-5"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-950 text-sm font-black text-white">
                  {item.step}
                </div>

                <h3 className="mt-4 text-base font-black text-slate-950">
                  {item.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {item.detail}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black text-slate-950">
              Reglas actuales
            </h2>

            <div className="mt-5 space-y-3 text-sm leading-6 text-slate-700">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
Mantener el análisis IA en modo controlado durante la beta cerrada.
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
No cargar claves privadas de proveedores externos en el repositorio.
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
No activar servicios externos sin límites de uso.
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
No enviar documentos sensibles a proveedores externos durante pruebas iniciales.
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black text-slate-950">
              Decisión recomendada
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-600">
La decisión técnica recomendada es mantener el análisis IA en modo controlado hasta completar la configuración interna, las invitaciones reales, la recuperación de contraseña, la seguridad fuerte, las mejoras de UX y la presentación comercial. Recién después conviene evaluar una integración externa con control de costos y límites por usuario.
            </p>

            <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-bold leading-6 text-emerald-900">
Estado recomendado: mantener el análisis IA en modo controlado durante la beta cerrada.
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-slate-950 p-6 text-white shadow-sm">
          <h2 className="text-xl font-black">Criterio operativo de IA</h2>

          <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-300">
El módulo de IA se considera correctamente controlado mientras el sistema mantenga análisis IA en modo controlado, no consuma servicios externos, no exponga claves privadas y documente claramente qué condiciones deben cumplirse antes de activar una integración IA externa.
          </p>
        </section>
      </div>
    </AppShell>
  );
}