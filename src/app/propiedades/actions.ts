'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getUserProfile } from '@/lib/auth/getUserProfile';
import { createAuditLog } from '@/lib/audit/createAuditLog';
import { canManageProperty, isUserRole, canUseAi } from '@/lib/permissions/roles';
import { extraerDatosPropiedadDeArchivo } from '@/lib/ai/extraerPropiedad';

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

export async function extraerDatosPropiedadIA(propertyId: string, documentId: string) {
  const { user, profile } = await getUserProfile();
  if (!user || !profile || !isUserRole(profile.role)) {
    return { ok: false, error: 'no_autenticado' };
  }
  if (!canUseAi(profile.role)) {
    return { ok: false, error: 'sin_permiso' };
  }

  const supabase = await createClient();

  // Validar propiedad
  const { data: property, error: propError } = await supabase
    .from('properties')
    .select('id')
    .eq('id', propertyId)
    .eq('organization_id', profile.organization_id)
    .single();

  if (propError || !property) {
    return { ok: false, error: 'propiedad_no_encontrada' };
  }

  // Validar documento
  const { data: document, error: docError } = await supabase
    .from('documents')
    .select('file_path, file_mime_type')
    .eq('id', documentId)
    .eq('organization_id', profile.organization_id)
    .single();

  if (docError || !document) {
    return { ok: false, error: 'documento_no_encontrado' };
  }

  // Descargar archivo
  const { data: fileData, error: downloadError } = await supabase.storage
    .from('documents')
    .download(document.file_path);

  if (downloadError || !fileData) {
    console.error('Error al descargar archivo:', downloadError);
    return { ok: false, error: 'error_descarga' };
  }

  const buffer = Buffer.from(await fileData.arrayBuffer());
  const mimeType = document.file_mime_type || fileData.type;

  const extractedData = await extraerDatosPropiedadDeArchivo(buffer, mimeType);

  if (!extractedData) {
    return { ok: false, error: 'error_ia' };
  }

  await createAuditLog({
    organizationId: profile.organization_id,
    userId: user.id,
    action: 'property_ai_extract' as any,
    resourceType: 'property',
    resourceId: propertyId,
  });

  return { ok: true, data: extractedData };
}

export async function aplicarDatosIAPropiedad(formData: FormData) {
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

  const updatePayload: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };

  const setIfPresent = (key: string, value: any) => {
    if (value !== null && value !== undefined && value !== '') {
      updatePayload[key] = value;
    }
  };

  setIfPresent('address', parseString(formData.get('direccion')));
  setIfPresent('property_type', parseString(formData.get('tipo_propiedad')));
  setIfPresent('matricula', parseString(formData.get('matricula')));
  setIfPresent('surface_total_m2', parseNumber(formData.get('superficie_total_m2')));
  setIfPresent('surface_covered_m2', parseNumber(formData.get('superficie_cubierta_m2')));
  setIfPresent('rooms', parseNumber(formData.get('ambientes')));
  setIfPresent('owners', parseString(formData.get('titulares')));
  setIfPresent('gravamenes', parseString(formData.get('gravamenes')));
  setIfPresent('notes', parseString(formData.get('observaciones')));

  if (Object.keys(updatePayload).length > 1) { // > 1 porque siempre tiene updated_at
    const supabase = await createClient();
    const { error } = await supabase
      .from('properties')
      .update(updatePayload)
      .eq('id', propertyId)
      .eq('organization_id', profile.organization_id);

    if (error) {
      throw new Error('No se pudo aplicar los datos de la IA');
    }

    await createAuditLog({
      organizationId: profile.organization_id,
      userId: user.id,
      action: 'property_ai_autofill' as any,
      resourceType: 'property',
      resourceId: propertyId,
    });
  }

  revalidatePath(`/propiedades/${propertyId}`);
  redirect(`/propiedades/${propertyId}`);
}
