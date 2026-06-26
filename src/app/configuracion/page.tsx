import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { getUserProfile } from '@/lib/auth/getUserProfile';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import {
  INDUSTRY_TYPES,
  industryLabels,
  normalizeIndustryType,
} from '@/lib/industries/documentTypes';
import { updateOrganizationIndustryType } from './actions';

interface ConfigCardProps {
  title: string;
  description: string;
  status: string;
  badge: string;
  href?: string;
  adminOnly?: boolean;
  isAdmin: boolean;
}

function ConfigCard({
  title,
  description,
  status,
  badge,
  href,
  adminOnly = false,
  isAdmin,
}: ConfigCardProps) {
  const isLocked = adminOnly && !isAdmin;

  const content = (
    <div
      className={`h-full rounded-3xl border p-6 shadow-sm transition ${isLocked
        ? 'border-slate-200 bg-slate-50 opacity-75'
        : 'border-slate-200 bg-white hover:-translate-y-0.5 hover:shadow-md'
        }`}
    >
      <div className="flex items-start justify-between gap-4">
        <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-sky-700">
          {badge}
        </span>

        <span
          className={`rounded-full px-3 py-1 text-xs font-black ${isLocked
            ? 'bg-slate-200 text-slate-600'
            : 'bg-emerald-50 text-emerald-700'
            }`}
        >
          {isLocked ? 'Solo admin' : status}
        </span>
      </div>

      <h2 className="mt-5 text-xl font-black tracking-tight text-slate-950">
        {title}
      </h2>

      <p className="mt-3 text-sm leading-6 text-slate-600">
        {description}
      </p>

      <div className="mt-6">
        {isLocked ? (
          <span className="inline-flex rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-500">
            Acceso restringido
          </span>
        ) : href ? (
          <span className="inline-flex rounded-2xl bg-slate-950 px-4 py-2 text-sm font-bold text-white">
            Abrir módulo
          </span>
        ) : (
          <span className="inline-flex rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600">
            Próximo bloque
          </span>
        )}
      </div>
    </div>
  );

  if (href && !isLocked) {
    return (
      <Link href={href} className="block h-full">
        {content}
      </Link>
    );
  }

  return content;
}

export default async function ConfiguracionPage() {
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

  const isAdmin = profile.role === 'admin';
  const supabase = await createClient();
  const { data: organization } = await supabase
    .from('organizations')
    .select('id, name, industry_type')
    .eq('id', profile.organization_id)
    .maybeSingle();

  const admin = createAdminClient();
  let isPlatformOwner = false;

  if (admin) {
    const { data: platformOwner } = await admin
      .from('platform_admins')
      .select('user_id')
      .eq('user_id', user.id)
      .eq('active', true)
      .maybeSingle();

    isPlatformOwner = Boolean(platformOwner);
  }

  const organizationIndustry = normalizeIndustryType(
    organization?.industry_type
  );

  const configCards = [
    {
      title: 'Estado operativo',
      description:
        'Panel interno para revisar versión, métricas, testers activos, checklist operativo, actividad reciente y próximos pasos comerciales.',
      status: 'Activo',
      badge: 'Beta',
      href: '/configuracion/estado-beta',
      adminOnly: true,
    },
    {
      title: 'Resumen general',
      description:
        'Vista ejecutiva del estado actual del MVP, módulos activos, módulos protegidos, beta operativa comercial, IA, seguridad, deploy y próximos pasos.',
      status: 'Activo',
      badge: 'Sistema',
      href: '/configuracion/resumen',
      adminOnly: true,
    },
    {
      title: 'Seguridad y permisos',
      description:
        'Resumen operativo de roles, rutas sensibles, protección de usuario admin y restricciones aplicadas a perfiles employee.',
      status: 'Controlado',
      badge: 'Accesos',
      href: '/configuracion/seguridad',
      adminOnly: true,
    },
    {
      title: 'Variables y entorno',
      description:
        'Recordatorio de variables usadas en Vercel y criterios para no exponer claves privadas en GitHub.',
      status: 'Seguro',
      badge: 'Entorno',
      href: '/configuracion/entorno',
      adminOnly: true,
    },
    {
      title: 'Documentación interna',
      description:
        'Espacio recomendado para vincular documentos de cierre, registro de incidencias, checklist de tester y decisiones de sprint.',
      status: 'Manual',
      badge: 'Docs',
      href: '/configuracion/documentacion',
      adminOnly: true,
    },
    {
      title: 'Modo IA',
      description:
        'La beta continúa funcionando con análisis IA en modo controlado. No se utilizan proveedores externos ni claves privadas durante esta etapa.',
      status: 'Controlado',
      badge: 'IA',
      href: '/configuracion/ia',
      adminOnly: true,
    },
    {
      title: 'Próximos módulos',
      description:
        'Base para futuras pantallas de recuperación de contraseña, aceptación real de invitaciones y mejoras de onboarding.',
      status: 'Pendiente',
      badge: 'Roadmap',
      href: '/configuracion/roadmap',
      adminOnly: true,
    },
  ];

  return (
    <AppShell>
      <div className="space-y-8">
        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.35em] text-sky-600">
                Módulo interno
              </p>

              <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
                Configuración
              </h1>

              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
Centro operativo para controlar el estado de la beta operativa comercial, seguridad, permisos, entorno, documentación interna y próximos pasos del sistema.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-700">
              <p className="font-black text-slate-950">Sesión actual</p>
              <p className="mt-1">
                Rol: <span className="font-bold">{profile.role ?? 'sin rol'}</span>
              </p>
              <p className="mt-1">
                Estado:{' '}
                <span className="font-bold">{profile.status ?? 'sin estado'}</span>
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {configCards.map((card) => (
            <ConfigCard
              key={card.title}
              title={card.title}
              description={card.description}
              status={card.status}
              badge={card.badge}
              href={card.href}
              adminOnly={card.adminOnly}
              isAdmin={isAdmin}
            />
          ))}
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.35em] text-sky-600">
                Rubro documental
              </p>
              <h2 className="mt-3 text-xl font-black text-slate-950">
                Configuracion por rubro
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Define que diccionario documental usa esta organizacion al
                cargar y clasificar documentos. No modifica documentos ya
                cargados.
              </p>

              <div className="mt-4 inline-flex rounded-full border border-sky-100 bg-sky-50 px-4 py-2 text-sm font-black text-sky-800">
                {industryLabels[organizationIndustry]}
              </div>
            </div>

            {isPlatformOwner && organization?.id ? (
              <form
                action={updateOrganizationIndustryType}
                className="w-full max-w-sm rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
                <input
                  type="hidden"
                  name="organization_id"
                  value={organization.id}
                />

                <label
                  htmlFor="industry_type"
                  className="text-sm font-black text-slate-950"
                >
                  Cambiar rubro
                </label>

                <select
                  id="industry_type"
                  name="industry_type"
                  defaultValue={organizationIndustry}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:border-sky-400"
                >
                  {INDUSTRY_TYPES.map((industry) => (
                    <option key={industry} value={industry}>
                      {industryLabels[industry]}
                    </option>
                  ))}
                </select>

                <button
                  type="submit"
                  className="mt-4 w-full rounded-2xl bg-sky-500 px-5 py-3 text-sm font-black text-white transition hover:bg-sky-600"
                >
                  Guardar rubro
                </button>
              </form>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-600">
                <p className="font-black text-slate-950">Solo lectura</p>
                <p className="mt-1">
                  Por ahora solo el dueno de plataforma puede cambiar este
                  valor.
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black text-slate-950">
              Variables operativas de la beta
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Estas variables no deben cargarse en GitHub. Los valores reales se
              administran desde Vercel y desde el archivo local privado.
            </p>

            <div className="mt-5 space-y-3">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-sm font-black text-slate-800">
                  NEXT_PUBLIC_SUPABASE_URL
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  URL pública del proyecto Supabase.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-sm font-black text-slate-800">
                  NEXT_PUBLIC_SUPABASE_ANON_KEY
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Clave pública anon de Supabase usada por la app.
                </p>
              </div>

              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
         <p className="text-sm font-black text-emerald-900">
  Integración IA externa
</p>
<p className="mt-1 text-xs text-emerald-700">
  No activa. La beta mantiene el análisis IA en modo controlado para validar el flujo documental.
</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black text-slate-950">
              Reglas de seguridad actuales
            </h2>

            <div className="mt-5 space-y-3 text-sm leading-6 text-slate-700">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                No subir <span className="font-black">.env.local</span> a GitHub.
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                No compartir accesos a Supabase, Vercel ni GitHub con testers.
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                No cargar documentos reales sensibles durante la beta operativa comercial.
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                Los usuarios employee no deben acceder a usuarios, invitaciones
                ni auditoría.
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-slate-950 p-6 text-white shadow-sm">
          <h2 className="text-xl font-black">
            Estado general del módulo configuración
          </h2>

          <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-300">
            Esta pantalla reemplaza el placeholder inicial de configuración y
            centraliza el control operativo de la beta. Los accesos sensibles se
            mantienen limitados a usuarios admin, mientras que los perfiles
            employee solo pueden ver información general no crítica.
          </p>
        </section>
      </div>
    </AppShell>
  );
}
