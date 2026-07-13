'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getUserProfile } from '@/lib/auth/getUserProfile';
import { createAuditLog } from '@/lib/audit/createAuditLog';
import { canManageProperty, isUserRole } from '@/lib/permissions/roles';

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

export async function createProperty(formData: FormData) {
  const { user, profile } = await getUserProfile();
  if (!user) redirect('/login');
  if (!profile) redirect('/onboarding');
  if (!isUserRole(profile.role) || !canManageProperty(profile.role)) {
    redirect('/acceso-denegado?motivo=rol&accion=crear');
  }

  const name = parseString(formData.get('name'));
  if (!name) {
    throw new Error('El nombre de la propiedad es requerido');
  }

  const propertyData = {
    organization_id: profile.organization_id,
    name,
    property_type: parseString(formData.get('property_type')),
    address: parseString(formData.get('address')),
    matricula: parseString(formData.get('matricula')),
    surface_total_m2: parseNumber(formData.get('surface_total_m2')),
    surface_covered_m2: parseNumber(formData.get('surface_covered_m2')),
    rooms: parseNumber(formData.get('rooms')),
    status: parseString(formData.get('status')),
    price: parseNumber(formData.get('price')),
    currency: parseString(formData.get('currency')),
    owners: parseString(formData.get('owners')),
    gravamenes: parseString(formData.get('gravamenes')),
    notes: parseString(formData.get('notes')),
    created_by: user.id,
  };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('properties')
    .insert([propertyData])
    .select('id')
    .single();

  if (error || !data) {
    throw new Error('No se pudo crear la propiedad');
  }

  await createAuditLog({
    organizationId: profile.organization_id,
    userId: user.id,
    action: 'property_created' as any,
    resourceType: 'property',
    resourceId: data.id,
    metadata: { name },
  });

  revalidatePath('/propiedades');
  redirect('/propiedades');
}

export async function updateProperty(formData: FormData) {
  const { user, profile } = await getUserProfile();
  if (!user) redirect('/login');
  if (!profile) redirect('/onboarding');
  if (!isUserRole(profile.role) || !canManageProperty(profile.role)) {
    redirect('/acceso-denegado?motivo=rol&accion=crear');
  }

  const propertyId = parseString(formData.get('property_id'));
  if (!propertyId) {
    redirect('/propiedades');
  }

  const name = parseString(formData.get('name'));
  if (!name) {
    throw new Error('El nombre de la propiedad es requerido');
  }

  const propertyData = {
    name,
    property_type: parseString(formData.get('property_type')),
    address: parseString(formData.get('address')),
    matricula: parseString(formData.get('matricula')),
    surface_total_m2: parseNumber(formData.get('surface_total_m2')),
    surface_covered_m2: parseNumber(formData.get('surface_covered_m2')),
    rooms: parseNumber(formData.get('rooms')),
    status: parseString(formData.get('status')),
    price: parseNumber(formData.get('price')),
    currency: parseString(formData.get('currency')),
    owners: parseString(formData.get('owners')),
    gravamenes: parseString(formData.get('gravamenes')),
    notes: parseString(formData.get('notes')),
    updated_at: new Date().toISOString(),
  };

  const supabase = await createClient();
  const { error } = await supabase
    .from('properties')
    .update(propertyData)
    .eq('id', propertyId)
    .eq('organization_id', profile.organization_id);

  if (error) {
    throw new Error('No se pudo actualizar la propiedad');
  }

  await createAuditLog({
    organizationId: profile.organization_id,
    userId: user.id,
    action: 'property_updated' as any,
    resourceType: 'property',
    resourceId: propertyId,
    metadata: { name },
  });

  revalidatePath('/propiedades');
  revalidatePath(`/propiedades/${propertyId}`);
  redirect(`/propiedades/${propertyId}`);
}
