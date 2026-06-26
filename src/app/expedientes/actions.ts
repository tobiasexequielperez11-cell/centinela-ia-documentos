'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getUserProfile } from '@/lib/auth/getUserProfile';
import { createAuditLog } from '@/lib/audit/createAuditLog';
import {
  getAllowedCaseStatuses,
  getCaseStatuses,
} from '@/lib/industries/caseConfig';
import { normalizeIndustryType } from '@/lib/industries/documentTypes';
import {
  canCreateCase,
  canUpdateCase,
  isUserRole,
} from '@/lib/permissions/roles';

const CASE_METADATA_PREFIX = 'case_metadata.';

function denyCaseAction() {
  redirect('/acceso-denegado?motivo=rol&accion=expedientes');
}

function collectCaseMetadata(formData: FormData) {
  const metadata: Record<string, string> = {};
  let hasMetadataFields = false;

  for (const [key, value] of formData.entries()) {
    if (!key.startsWith(CASE_METADATA_PREFIX)) continue;

    hasMetadataFields = true;

    const fieldKey = key.slice(CASE_METADATA_PREFIX.length);
    const fieldValue = typeof value === 'string' ? value.trim() : '';

    if (fieldKey && fieldValue) {
      metadata[fieldKey] = fieldValue;
    }
  }

  return { metadata, hasMetadataFields };
}

async function getOrganizationIndustry(
  supabase: Awaited<ReturnType<typeof createClient>>,
  organizationId: string
) {
  const { data } = await supabase
    .from('organizations')
    .select('industry_type')
    .eq('id', organizationId)
    .maybeSingle();

  return normalizeIndustryType(data?.industry_type);
}

function resolveCaseStatus(
  requestedStatus: string,
  industry: ReturnType<typeof normalizeIndustryType>
) {
  const allowedStatuses = getAllowedCaseStatuses(industry);

  if (allowedStatuses.includes(requestedStatus)) {
    return requestedStatus;
  }

  return getCaseStatuses(industry)[0] ?? 'Activo';
}

export async function createCase(formData: FormData) {
  const { user, profile } = await getUserProfile();

  if (!user) redirect('/login');
  if (!profile) redirect('/onboarding');

  if (!isUserRole(profile.role) || !canCreateCase(profile.role)) {
    denyCaseAction();
  }

  const title = String(formData.get('title') || '').trim();
  const clientName = String(formData.get('client_name') || '').trim();
  const caseType = String(formData.get('case_type') || 'general');
  const requestedStatus = String(formData.get('status') || '');
  const { metadata } = collectCaseMetadata(formData);

  if (!title) {
    redirect('/expedientes/nuevo?error=missing_title');
  }

  const supabase = await createClient();
  const industry = await getOrganizationIndustry(supabase, profile.organization_id);
  const status = resolveCaseStatus(requestedStatus, industry);

  const { data, error } = await supabase
    .from('cases')
    .insert({
      organization_id: profile.organization_id,
      title,
      client_name: clientName || null,
      case_type: caseType,
      status,
      metadata,
      assigned_to: user.id,
      created_by: user.id,
    })
    .select('id')
    .single();

  if (error || !data) {
    console.error('Create case error:', error);
    redirect('/expedientes/nuevo?error=create_failed');
  }

  await createAuditLog({
    organizationId: profile.organization_id,
    userId: user.id,
    action: 'case_created',
    resourceType: 'case',
    resourceId: data.id,
    metadata: {
      title,
      case_type: caseType,
      status,
      industry_type: industry,
    },
  });

  revalidatePath('/dashboard');
  revalidatePath('/expedientes');

  redirect(`/expedientes/${data.id}`);
}

export async function updateCaseStatus(formData: FormData) {
  const { user, profile } = await getUserProfile();

  if (!user) redirect('/login');
  if (!profile) redirect('/onboarding');

  if (!isUserRole(profile.role) || !canUpdateCase(profile.role)) {
    denyCaseAction();
  }

  const caseId = String(formData.get('case_id') || '');
  const requestedStatus = String(formData.get('status') || '');
  const { metadata, hasMetadataFields } = collectCaseMetadata(formData);

  if (!caseId) {
    redirect('/expedientes');
  }

  const supabase = await createClient();
  const industry = await getOrganizationIndustry(supabase, profile.organization_id);
  const status = resolveCaseStatus(requestedStatus, industry);
  const updatePayload: {
    status: string;
    metadata?: Record<string, string>;
  } = { status };

  if (hasMetadataFields) {
    updatePayload.metadata = metadata;
  }

  const { error } = await supabase
    .from('cases')
    .update(updatePayload)
    .eq('id', caseId)
    .eq('organization_id', profile.organization_id);

  if (!error) {
    await createAuditLog({
      organizationId: profile.organization_id,
      userId: user.id,
      action: 'case_status_updated',
      resourceType: 'case',
      resourceId: caseId,
      metadata: { status, industry_type: industry },
    });
  }

  revalidatePath('/dashboard');
  revalidatePath('/expedientes');
  revalidatePath(`/expedientes/${caseId}`);
}
