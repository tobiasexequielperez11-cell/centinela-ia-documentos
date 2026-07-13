import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Lock, Building2 } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { createClient } from '@/lib/supabase/server';
import { getUserProfile } from '@/lib/auth/getUserProfile';
import { isPlatformOwner as checkPlatformOwner } from '@/lib/permissions/platformOwner';
import { updateOrganizationIndustryType, updateOrganizationName, updateOrganizationLogo } from './actions';
import {
  ACTIVE_INDUSTRY_TYPES,
  industryLabels,
  normalizeIndustryType,
} from '@/lib/industries/documentTypes';
import { MotionCard } from '@/components/ui/MotionCard';
import { MotionButton } from '@/components/ui/MotionButton';

const ownerCards = [
  { name: 'Motor IA', href: '/configuracion/ia', description: 'Opciones de análisis y procesamiento documental.' },
  { name: 'Seguridad y acceso', href: '/configuracion/seguridad', description: 'Políticas, permisos y auditoría.' },
  { name: 'Documentación', href: '/configuracion/documentacion', description: 'Tipos documentales y reglas de almacenamiento.' },
  { name: 'Resumen operativo', href: '/configuracion/resumen', description: 'Visión general de la configuración de la organización.' },
  { name: 'Entorno de trabajo', href: '/configuracion/entorno', description: 'Personalización y ajustes del espacio.' },
  { name: 'Estado beta', href: '/configuracion/estado-beta', description: 'Gestión del entorno controlado y experimental.' },
  { name: 'Roadmap', href: '/configuracion/roadmap', description: 'Próximas actualizaciones y lanzamientos.' },
];

export default async function ConfiguracionPage() {
  const { user, profile } = await getUserProfile();

  if (!user) redirect('/login');
  if (!profile) redirect('/onboarding');

  if (profile.role !== 'admin') {
    redirect('/acceso-denegado');
  }

  const supabase = await createClient();
  const { data: org } = await supabase
    .from('organizations')
    .select('name, industry_type, logo_url')
    .eq('id', profile.organization_id)
    .single();

  const currentIndustry = normalizeIndustryType(org?.industry_type);

  const isPlatformOwner = await checkPlatformOwner(user.id);

  return (
    <AppShell>
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-soft">
          CONFIGURACIÓN GLOBAL
        </p>
        <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-white">
          Panel de <span className="text-gradient">Configuración</span>
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Administración central de la organización y módulos del sistema.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_2fr]">
        <div className="space-y-6">
          <MotionCard index={0} className="border border-white/10 bg-white/[0.03] p-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_16px_40px_-16px_rgba(0,0,0,0.7)] transition-colors hover:border-accent/40">
            <div className="mb-6">
              <h3 className="font-display text-xl font-semibold text-white">Datos de la organización</h3>
              <p className="mt-2 text-sm text-slate-400">
                {isPlatformOwner
                  ? "Como administrador de la plataforma podés editar los datos del estudio para testear."
                  : "Configuración y datos básicos de tu organización."}
              </p>
            </div>

            <div className="mb-8 flex items-center gap-6 rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/[0.05] border border-white/10">
                {org?.logo_url ? (
                  <img src={org.logo_url} alt="Logo" className="h-full w-full object-cover" />
                ) : (
                  <Building2 size={24} className="text-slate-400" />
                )}
              </div>
              <form action={updateOrganizationLogo} className="flex flex-1 flex-col sm:flex-row items-end gap-4">
                <input type="hidden" name="organization_id" value={profile.organization_id} />
                <div className="flex-1 space-y-1 w-full">
                  <label className="text-sm text-slate-400">Logo de la organización</label>
                  <input
                    type="file"
                    name="logo"
                    accept="image/*"
                    className="block w-full text-sm text-slate-400 file:mr-4 file:rounded-full file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-white/20 outline-none"
                  />
                </div>
                <MotionButton
                  type="submit"
                  className="w-full sm:w-auto bg-white/10 hover:bg-white/20"
                >
                  Subir logo
                </MotionButton>
              </form>
            </div>

            <form action={updateOrganizationName} className="mb-8 space-y-4 rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <input type="hidden" name="organization_id" value={profile.organization_id} />
              <div className="space-y-1">
                <label className="text-sm text-slate-400">Nombre del estudio / organización</label>
                <input
                  type="text"
                  name="name"
                  defaultValue={org?.name ?? ''}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                />
              </div>
              <MotionButton
                type="submit"
                className="w-full bg-accent hover:bg-accent-strong"
              >
                Guardar nombre
              </MotionButton>
            </form>

            <div className="mb-4">
              <h4 className="font-semibold text-white">Rubro de la organización</h4>
              <p className="text-sm text-slate-400">
                {isPlatformOwner
                  ? "Como administrador podés cambiar de rubro libremente."
                  : org?.industry_type
                    ? "El rubro define la estructura de legajos y documentos. Está configurado de forma permanente."
                    : "Elegí el rubro de tu organización. Esta acción se realiza una sola vez para estructurar el sistema."}
              </p>
            </div>

            {isPlatformOwner || !org?.industry_type ? (
              <form action={updateOrganizationIndustryType} className="space-y-4">
                <input type="hidden" name="organization_id" value={profile.organization_id} />
                
                <div className="mb-2">
                  <label className="text-sm text-slate-400">
                    Rubro actual: <span className="font-semibold text-white">{industryLabels[currentIndustry]}</span>
                  </label>
                </div>

                <select
                  name="industry_type"
                  defaultValue={currentIndustry}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                >
                  {ACTIVE_INDUSTRY_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {industryLabels[t]}
                    </option>
                  ))}
                </select>
                <MotionButton
                  type="submit"
                  className="w-full bg-accent hover:bg-accent-strong"
                >
                  Guardar rubro
                </MotionButton>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-4">
                  <label className="text-sm text-slate-400 block mb-1">Rubro actual:</label>
                  <span className="font-semibold text-white text-lg">{industryLabels[currentIndustry]}</span>
                </div>
                <p className="text-xs text-slate-500">
                  El rubro se define una vez al configurar la organización. Para cambiarlo, contactá al soporte de la plataforma.
                </p>
              </div>
            )}

            <div className="mt-8 border-t border-white/10 pt-6">
              <p className="text-sm text-slate-400">
                Plan: <span className="font-semibold text-white">Beta operativa comercial</span>
              </p>
            </div>
          </MotionCard>
        </div>

        <div className="space-y-6">
          {isPlatformOwner && (
            <section className="mt-8">
              <div className="mb-4 flex items-center gap-2">
                <Lock size={16} className="text-brandviolet-soft" />
                <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-brandviolet-soft">
                  Panel interno · solo plataforma
                </h3>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {ownerCards.map((panel, index) => (
                  <Link
                    key={panel.href}
                    href={panel.href}
                  >
                    <MotionCard index={index + 4} className="group flex h-full flex-col justify-between border border-brandviolet/20 bg-brandviolet/[0.03] p-5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_16px_40px_-16px_rgba(0,0,0,0.7)] transition-colors hover:border-brandviolet/40">
                    <div>
                      <h4 className="font-display text-base font-semibold text-white group-hover:text-brandviolet-soft">
                        {panel.name}
                      </h4>
                      <p className="mt-1 text-sm text-slate-400">
                        {panel.description}
                      </p>
                    </div>
                    </MotionCard>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </AppShell>
  );
}
