'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getUserProfile } from '@/lib/auth/getUserProfile';
import { createAuditLog } from '@/lib/audit/createAuditLog';
import { canManageRental, isUserRole } from '@/lib/permissions/roles';

function parseNumber(value: FormDataEntryValue | null): number | null {
  if (!value) return null;
  const str = String(value).trim();
  if (str === '') return null;
  const num = Number(str);
  return isNaN(num) ? null : num;
}

function parseString(value: FormDataEntryValue | null): string | null {
  if (!value) return null;
  const str = String(value).trim();
  return str === '' ? null : str;
}

export async function createRentalContract(formData: FormData) {
  const { user, profile } = await getUserProfile();
  if (!user) redirect('/login');
  if (!profile) redirect('/onboarding');
  if (!isUserRole(profile.role) || !canManageRental(profile.role)) {
    redirect('/acceso-denegado?motivo=rol&accion=crear');
  }

  const base_amount = parseNumber(formData.get('base_amount'));
  const start_date = parseString(formData.get('start_date'));

  if (base_amount === null || !start_date) {
    throw new Error('El monto inicial y la fecha de inicio son requeridos');
  }

  const rentalData = {
    organization_id: profile.organization_id,
    property_id: parseString(formData.get('property_id')),
    tenant_name: parseString(formData.get('tenant_name')),
    base_amount,
    current_amount: base_amount,
    currency: parseString(formData.get('currency')),
    index_type: parseString(formData.get('index_type')),
    fixed_pct: parseNumber(formData.get('fixed_pct')),
    adjustment_period_months: parseNumber(formData.get('adjustment_period_months')),
    start_date,
    last_adjustment_date: parseString(formData.get('last_adjustment_date')),
    status: parseString(formData.get('status')),
    notes: parseString(formData.get('notes')),
    created_by: user.id,
  };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('rental_contracts')
    .insert([rentalData])
    .select('id')
    .single();

  if (error || !data) {
    console.error('Error creando alquiler:', error);
    throw new Error('No se pudo crear el contrato de alquiler');
  }

  await createAuditLog({
    organizationId: profile.organization_id,
    userId: user.id,
    action: 'rental_created' as any,
    resourceType: 'rental',
    resourceId: data.id,
  });

  revalidatePath('/alquileres');
  redirect('/alquileres');
}

export async function updateRentalContract(formData: FormData) {
  const { user, profile } = await getUserProfile();
  if (!user) redirect('/login');
  if (!profile) redirect('/onboarding');
  if (!isUserRole(profile.role) || !canManageRental(profile.role)) {
    redirect('/acceso-denegado?motivo=rol&accion=editar');
  }

  const id = parseString(formData.get('rental_id'));
  if (!id) {
    redirect('/alquileres');
  }

  const rentalData = {
    property_id: parseString(formData.get('property_id')),
    tenant_name: parseString(formData.get('tenant_name')),
    base_amount: parseNumber(formData.get('base_amount')),
    currency: parseString(formData.get('currency')),
    index_type: parseString(formData.get('index_type')),
    fixed_pct: parseNumber(formData.get('fixed_pct')),
    adjustment_period_months: parseNumber(formData.get('adjustment_period_months')),
    start_date: parseString(formData.get('start_date')),
    last_adjustment_date: parseString(formData.get('last_adjustment_date')),
    status: parseString(formData.get('status')),
    notes: parseString(formData.get('notes')),
    updated_at: new Date().toISOString(),
  };

  const supabase = await createClient();
  const { error } = await supabase
    .from('rental_contracts')
    .update(rentalData)
    .eq('id', id)
    .eq('organization_id', profile.organization_id);

  if (error) {
    console.error('Error actualizando alquiler:', error);
    throw new Error('No se pudo actualizar el contrato de alquiler');
  }

  await createAuditLog({
    organizationId: profile.organization_id,
    userId: user.id,
    action: 'rental_updated' as any,
    resourceType: 'rental',
    resourceId: id,
  });

  revalidatePath('/alquileres');
  revalidatePath(`/alquileres/${id}`);
  redirect(`/alquileres/${id}`);
}
