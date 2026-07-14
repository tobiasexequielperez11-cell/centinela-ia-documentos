import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getUserProfile } from '@/lib/auth/getUserProfile';
import { AppShell } from '@/components/layout/AppShell';
import { FormSubmitButton } from '@/components/ui/FormSubmitButton';
import { canManageRental, isUserRole } from '@/lib/permissions/roles';
import { createRentalContract } from '../actions';

export default async function NewRentalPage() {
  const { user, profile } = await getUserProfile();
  if (!user) redirect('/login');
  if (!profile) redirect('/onboarding');
  if (!isUserRole(profile.role) || !canManageRental(profile.role)) {
    redirect('/acceso-denegado?motivo=rol&accion=crear');
  }

  const supabase = await createClient();
  const { data: propertiesData } = await supabase
    .from('properties')
    .select('id, name')
    .eq('organization_id', profile.organization_id)
    .is('archived_at', null)
    .order('name');

  const properties = propertiesData || [];

  const inputStyle = "w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-cyan-400";
  const selectStyle = "w-full rounded-xl border border-white/10 bg-[#0C2340] px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-cyan-400";
  const labelStyle = "mb-1.5 block text-xs font-semibold text-slate-400";

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <Link
            href="/alquileres"
            className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-400 hover:text-cyan-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a alquileres
          </Link>
          <div className="mt-4">
            <h1 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Registrar nuevo contrato
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Cargá los datos del alquiler para llevar su seguimiento y calcular los ajustes futuros.
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-6 sm:p-8">
          <form action={createRentalContract} className="space-y-8">
            
            <section>
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-500">Datos principales</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className={labelStyle}>Propiedad (opcional)</label>
                  <select name="property_id" className={selectStyle}>
                    <option value="">Seleccionar propiedad...</option>
                    {properties.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="sm:col-span-2">
                  <label className={labelStyle}>Inquilino</label>
                  <input
                    name="tenant_name"
                    type="text"
                    className={inputStyle}
                    placeholder="Nombre del inquilino"
                  />
                </div>

                <div>
                  <label className={labelStyle}>Monto inicial del alquiler *</label>
                  <input
                    name="base_amount"
                    type="number"
                    step="0.01"
                    required
                    className={inputStyle}
                    placeholder="Ej. 350000"
                  />
                </div>
                
                <div>
                  <label className={labelStyle}>Moneda</label>
                  <select name="currency" className={selectStyle}>
                    <option value="ARS">ARS ($)</option>
                    <option value="USD">USD (u$s)</option>
                  </select>
                </div>
              </div>
            </section>

            <section>
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-500">Condiciones de ajuste</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelStyle}>Índice de ajuste</label>
                  <select name="index_type" className={selectStyle}>
                    <option value="ICL">ICL (BCRA)</option>
                    <option value="IPC">IPC (INDEC)</option>
                    <option value="CASA_PROPIA">Casa Propia</option>
                    <option value="FIJO">Porcentaje fijo</option>
                  </select>
                </div>
                
                <div>
                  <label className={labelStyle}>% por período (si es fijo)</label>
                  <input
                    name="fixed_pct"
                    type="number"
                    step="0.01"
                    className={inputStyle}
                    placeholder="Ej. 15"
                  />
                </div>

                <div>
                  <label className={labelStyle}>Periodicidad de ajuste (meses)</label>
                  <select name="adjustment_period_months" className={selectStyle}>
                    <option value="3">Cada 3 meses (Trimestral)</option>
                    <option value="4">Cada 4 meses (Cuatrimestral)</option>
                    <option value="6">Cada 6 meses (Semestral)</option>
                    <option value="12">Cada 12 meses (Anual)</option>
                  </select>
                </div>
              </div>
            </section>

            <section>
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-500">Fechas y Estado</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelStyle}>Inicio del contrato *</label>
                  <input
                    name="start_date"
                    type="date"
                    required
                    className={inputStyle}
                  />
                </div>

                <div>
                  <label className={labelStyle}>Último ajuste (si ya tuvo)</label>
                  <input
                    name="last_adjustment_date"
                    type="date"
                    className={inputStyle}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className={labelStyle}>Estado</label>
                  <select name="status" className={selectStyle}>
                    <option value="vigente">Vigente</option>
                    <option value="finalizado">Finalizado</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className={labelStyle}>Observaciones</label>
                  <textarea
                    name="notes"
                    rows={4}
                    className={inputStyle}
                    placeholder="Información adicional sobre el contrato..."
                  ></textarea>
                </div>
              </div>
            </section>

            <div className="flex justify-end pt-4 border-t border-white/10">
              <FormSubmitButton label="Guardar contrato" loadingLabel="Guardando..." />
            </div>
          </form>
        </div>
      </div>
    </AppShell>
  );
}
