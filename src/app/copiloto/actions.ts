'use server';

import { createClient } from '@/lib/supabase/server';
import { getUserProfile } from '@/lib/auth/getUserProfile';
import { calcularProximoAjuste, estadoVencimiento } from '@/lib/rentals/labels';
import { generarBriefingInmobiliaria } from '@/lib/ai/copilotoInmobiliaria';
import type { RentalContract } from '@/types/rental';

export async function generarBriefing() {
  const { user, profile } = await getUserProfile();
  if (!user || !profile) return { ok: false as const, motivo: 'sin_sesion' as const };

  const supabase = await createClient();
  const orgId = profile.organization_id;

  const [propsRes, casesRes, clientsRes, rentalsRes] = await Promise.all([
    supabase.from('properties').select('status').eq('organization_id', orgId).is('archived_at', null),
    supabase.from('cases').select('status').eq('organization_id', orgId),
    supabase.from('clients').select('status').eq('organization_id', orgId).is('archived_at', null),
    supabase.from('rental_contracts').select('*').eq('organization_id', orgId).is('archived_at', null),
  ]);

  const countBy = (arr: Array<{ status?: string | null }> | null) => {
    const m: Record<string, number> = {};
    for (const x of arr || []) {
      const k = x.status || 'sin_estado';
      m[k] = (m[k] || 0) + 1;
    }
    return m;
  };

  const rentals = (rentalsRes.data || []) as RentalContract[];
  const rentalAlerts = rentals.map((r) => {
    const prox = calcularProximoAjuste(r.start_date, r.last_adjustment_date, r.adjustment_period_months);
    const est = estadoVencimiento(prox, r.status);
    return {
      tenant: r.tenant_name || 'Contrato sin inquilino',
      fecha: prox ? prox.toLocaleDateString('es-AR') : '-',
      estado: est,
    };
  });

  const snapshot = {
    propiedades: { total: (propsRes.data || []).length, porEstado: countBy(propsRes.data) },
    operaciones: { total: (casesRes.data || []).length, porEstado: countBy(casesRes.data) },
    clientes: { total: (clientsRes.data || []).length, porEstado: countBy(clientsRes.data) },
    alquileres: {
      total: rentals.length,
      vencidos: rentalAlerts.filter((r) => r.estado.tipo === 'vencido').map((r) => `${r.tenant} (${r.estado.label})`),
      proximos: rentalAlerts.filter((r) => r.estado.tipo === 'proximo').map((r) => `${r.tenant} — ${r.fecha} (${r.estado.label})`),
    },
  };

  return generarBriefingInmobiliaria(snapshot);
}
