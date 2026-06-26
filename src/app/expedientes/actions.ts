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
import { getCaseTemplate } from '@/lib/industries/caseTemplates';
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

  return getCaseStatuses(industry)[0]?.value ?? 'active';
}

async function createCaseChecklist(input: {
  caseId: string;
  organizationId: string;
  userId: string;
  caseType: string;
}) {
  const template = getCaseTemplate(input.caseType);
  const checklistItems = template.checklist.filter((item) => item.trim());

  if (checklistItems.length === 0) return;

  const supabase = await createClient();

  const { data: checklist, error: checklistError } = await supabase
    .from('checklists')
    .insert({
      organization_id: input.organizationId,
      case_id: input.caseId,
      name: 'Checklist documental',
      template_type: input.caseType || 'Otro',
    })
    .select('id')
    .single();

  if (checklistError || !checklist) {
    console.error('Create case checklist error:', checklistError);
    return;
  }

  const { error: itemsError } = await supabase.from('checklist_items').insert(
    checklistItems.map((title) => ({
      checklist_id: checklist.id,
      title,
      status: 'pending',
    }))
  );

  if (itemsError) {
    console.error('Create case checklist items error:', itemsError);
    return;
  }

  await createAuditLog({
    organizationId: input.organizationId,
    userId: input.userId,
    action: 'case_checklist_created',
    resourceType: 'case',
    resourceId: input.caseId,
    metadata: {
      case_type: input.caseType,
      items_count: checklistItems.length,
    },
  });
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

  await createCaseChecklist({
    caseId: data.id,
    organizationId: profile.organization_id,
    userId: user.id,
    caseType,
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

export async function toggleChecklistItem(formData: FormData) {
  const { user, profile } = await getUserProfile();

  if (!user) redirect('/login');
  if (!profile) redirect('/onboarding');

  if (!isUserRole(profile.role) || !canUpdateCase(profile.role)) {
    denyCaseAction();
  }

  const caseId = String(formData.get('case_id') || '');
  const itemId = String(formData.get('item_id') || '');
  const currentStatus = String(formData.get('current_status') || 'pending');
  const nextStatus = currentStatus === 'pending' ? 'received' : 'pending';

  if (!caseId || !itemId) {
    redirect('/expedientes');
  }

  const supabase = await createClient();

  const { data: checklistItem, error: itemError } = await supabase
    .from('checklist_items')
    .select('id, status, checklists!inner(id, case_id, organization_id)')
    .eq('id', itemId)
    .eq('checklists.case_id', caseId)
    .eq('checklists.organization_id', profile.organization_id)
    .maybeSingle();

  if (itemError || !checklistItem) {
    console.error('Checklist item lookup error:', itemError);
    revalidatePath(`/expedientes/${caseId}`);
    return;
  }

  const { error } = await supabase
    .from('checklist_items')
    .update({ status: nextStatus })
    .eq('id', itemId);

  if (error) {
    console.error('Toggle checklist item error:', error);
  } else {
    await createAuditLog({
      organizationId: profile.organization_id,
      userId: user.id,
      action: 'checklist_item_toggled',
      resourceType: 'case',
      resourceId: caseId,
      metadata: {
        checklist_item_id: itemId,
        previous_status: currentStatus,
        next_status: nextStatus,
      },
    });
  }

  revalidatePath(`/expedientes/${caseId}`);
}
