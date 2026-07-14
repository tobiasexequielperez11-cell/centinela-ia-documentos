import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Trash2, TrendingUp, Info } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getUserProfile } from '@/lib/auth/getUserProfile';
import { AppShell } from '@/components/layout/AppShell';
import { canManageRental, isUserRole } from '@/lib/permissions/roles';
import { FormSubmitButton } from '@/components/ui/FormSubmitButton';
import { addIndexValue, deleteIndexValue } from '../actions';
import type { RentIndexValue } from '@/types/rental';
import { getIndexTypeLabel, formatPeriodo } from '@/lib/rentals/labels';

export default async function IndicesPage() {
  const { user, profile } = await getUserProfile();
  if (!user) redirect('/login');
  if (!profile) redirect('/onboarding');
  if (!isUserRole(profile.role) || !canManageRental(profile.role)) {
    redirect('/acceso-denegado?motivo=rol&accion=ver');
  }

  const supabase = await createClient();
  const { data: indicesData } = await supabase
    .from('rent_index_values')
    .select('*')
    .eq('organization_id', profile.organization_id)
    .order('index_type')
    .order('period', { ascending: false });

  const indices = (indicesData || []) as RentIndexValue[];

  const inputStyle = "mt-1.5 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-cyan-400";
  const selectStyle = "mt-1.5 w-full rounded-xl border border-white/10 bg-[#0C2340] px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-cyan-400";
  const labelStyle = "text-xs font-semibold text-slate-400";

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <Link
            href="/alquileres"
            className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-400 hover:text-cyan-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a alquileres
          </Link>
          <div className="mt-4 flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-cyan-500" />
            <div>
              <h1 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Índices de ajuste
              </h1>
              <p className="mt-2 text-sm text-slate-400">
                Registrá los valores históricos de los índices (ICL, IPC, Casa Propia) para el cálculo automático de ajustes.
              </p>
            </div>
          </div>
        </div>

        <div className="mb-8 rounded-2xl bg-cyan-950/30 border border-cyan-500/20 p-4 flex gap-3 text-sm text-cyan-200">
          <Info className="h-5 w-5 shrink-0 text-cyan-400" />
          <p>
            Cargá el valor mensual publicado por BCRA (ICL) / INDEC (IPC). 
            Ej: para actualizar un alquiler en febrero 2025 usando IPC, necesitarás tener cargado el índice IPC correspondiente al mes base y al mes de ajuste (según estipule el contrato).
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-6 sticky top-6">
              <h2 className="mb-6 font-display text-lg font-bold text-white">Nuevo valor</h2>
              
              <form action={addIndexValue} className="space-y-5">
                <div>
                  <label className={labelStyle}>Tipo de Índice *</label>
                  <select name="index_type" required className={selectStyle}>
                    <option value="ICL" className="bg-[#0C2340] text-white">ICL (BCRA)</option>
                    <option value="IPC" className="bg-[#0C2340] text-white">IPC (INDEC)</option>
                    <option value="CASA_PROPIA" className="bg-[#0C2340] text-white">Casa Propia</option>
                  </select>
                </div>

                <div>
                  <label className={labelStyle}>Período (Mes/Año) *</label>
                  <div className="flex gap-2">
                    <select name="period_month" required className={selectStyle}>
                      <option value="" disabled selected className="bg-[#0C2340] text-slate-500">Mes</option>
                      <option value="01" className="bg-[#0C2340] text-white">Enero</option>
                      <option value="02" className="bg-[#0C2340] text-white">Febrero</option>
                      <option value="03" className="bg-[#0C2340] text-white">Marzo</option>
                      <option value="04" className="bg-[#0C2340] text-white">Abril</option>
                      <option value="05" className="bg-[#0C2340] text-white">Mayo</option>
                      <option value="06" className="bg-[#0C2340] text-white">Junio</option>
                      <option value="07" className="bg-[#0C2340] text-white">Julio</option>
                      <option value="08" className="bg-[#0C2340] text-white">Agosto</option>
                      <option value="09" className="bg-[#0C2340] text-white">Septiembre</option>
                      <option value="10" className="bg-[#0C2340] text-white">Octubre</option>
                      <option value="11" className="bg-[#0C2340] text-white">Noviembre</option>
                      <option value="12" className="bg-[#0C2340] text-white">Diciembre</option>
                    </select>
                    <select name="period_year" required className={selectStyle}>
                      <option value="" disabled selected className="bg-[#0C2340] text-slate-500">Año</option>
                      {[2023, 2024, 2025, 2026, 2027, 2028].map(y => (
                        <option key={y} value={y} className="bg-[#0C2340] text-white">{y}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className={labelStyle}>Valor del índice *</label>
                  <input
                    type="number"
                    step="0.00000001"
                    name="value"
                    required
                    placeholder="Ej. 182.45"
                    className={inputStyle}
                  />
                </div>

                <div className="pt-2">
                  <FormSubmitButton label="Guardar valor" loadingLabel="Guardando..." />
                </div>
              </form>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="rounded-3xl border border-white/5 bg-white/[0.02] overflow-hidden">
              <div className="border-b border-white/5 px-6 py-5">
                <h3 className="font-display text-lg font-bold text-white">Valores registrados</h3>
              </div>
              
              {indices.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <p className="text-sm text-slate-400">No hay valores cargados en el sistema.</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {indices.map(idx => (
                    <div key={idx.id} className="flex items-center justify-between px-6 py-4 hover:bg-white/[0.02] transition">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white capitalize">{formatPeriodo(idx.period)}</span>
                          <span className="rounded-full bg-cyan-500/10 px-2 py-0.5 text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
                            {getIndexTypeLabel(idx.index_type)}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-slate-300">Valor: {idx.value}</p>
                      </div>
                      
                      <form action={deleteIndexValue}>
                        <input type="hidden" name="id" value={idx.id} />
                        <button 
                          type="submit"
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition"
                          title="Eliminar índice"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </form>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
