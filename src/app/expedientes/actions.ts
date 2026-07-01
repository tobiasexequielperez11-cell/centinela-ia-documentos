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

export async function linkChecklistItemDocument(formData: FormData) {
  const { user, profile } = await getUserProfile();

  if (!user) redirect('/login');
  if (!profile) redirect('/onboarding');

  if (!isUserRole(profile.role) || !canUpdateCase(profile.role)) {
    denyCaseAction();
  }

  const caseId = String(formData.get('case_id') || '');
  const itemId = String(formData.get('item_id') || '');
  const documentId = String(formData.get('document_id') || '').trim();

  if (!caseId || !itemId) {
    redirect('/expedientes');
  }

  const supabase = await createClient();

  const { data: checklistItem, error: itemError } = await supabase
    .from('checklist_items')
    .select('id, title, document_id, checklists!inner(id, case_id, organization_id)')
    .eq('id', itemId)
    .eq('checklists.case_id', caseId)
    .eq('checklists.organization_id', profile.organization_id)
    .maybeSingle();

  if (itemError || !checklistItem) {
    console.error('Checklist item document link lookup error:', itemError);
    revalidatePath(`/expedientes/${caseId}`);
    return;
  }

  let linkedDocumentId: string | null = null;

  if (documentId) {
    const { data: documentRecord, error: documentError } = await supabase
      .from('documents')
      .select('id, file_name, case_id')
      .eq('id', documentId)
      .eq('organization_id', profile.organization_id)
      .maybeSingle();

    if (documentError || !documentRecord) {
      console.error('Checklist document link document lookup error:', documentError);
      revalidatePath(`/expedientes/${caseId}`);
      return;
    }

    linkedDocumentId = documentRecord.id;

    if (!documentRecord.case_id) {
      const { error: documentCaseError } = await supabase
        .from('documents')
        .update({ case_id: caseId })
        .eq('id', documentRecord.id)
        .eq('organization_id', profile.organization_id)
        .is('case_id', null);

      if (documentCaseError) {
        console.error('Checklist document case assignment error:', documentCaseError);
      }
    }
  }

  const { error } = await supabase
    .from('checklist_items')
    .update({
      document_id: linkedDocumentId,
      status: linkedDocumentId ? 'received' : 'pending',
    })
    .eq('id', itemId);

  if (error) {
    console.error('Checklist item document link error:', error);
  } else {
    await createAuditLog({
      organizationId: profile.organization_id,
      userId: user.id,
      action: linkedDocumentId
        ? 'checklist_item_linked'
        : 'checklist_item_unlinked',
      resourceType: 'case',
      resourceId: caseId,
      metadata: {
        checklist_item_id: itemId,
        document_id: linkedDocumentId,
      },
    });
  }

  revalidatePath(`/expedientes/${caseId}`);
}

export async function toggleChecklistItemNotRequired(formData: FormData) {
  const { user, profile } = await getUserProfile();
  if (!user) redirect('/login');
  if (!profile) redirect('/onboarding');
  if (!isUserRole(profile.role) || !canUpdateCase(profile.role)) denyCaseAction();

  const caseId = String(formData.get('case_id') || '');
  const itemId = String(formData.get('item_id') || '');
  const currentStatus = String(formData.get('current_status') || '');
  const nextStatus = currentStatus === 'not_required' ? 'pending' : 'not_required';

  if (!caseId || !itemId) redirect('/expedientes');
  const supabase = await createClient();

  const { data: checklistItem, error: itemError } = await supabase
    .from('checklist_items')
    .select('id, status, checklists!inner(id, case_id, organization_id)')
    .eq('id', itemId)
    .eq('checklists.case_id', caseId)
    .eq('checklists.organization_id', profile.organization_id)
    .maybeSingle();

  if (itemError || !checklistItem) {
    revalidatePath(`/expedientes/${caseId}`);
    return;
  }

  const { error } = await supabase
    .from('checklist_items')
    .update({ status: nextStatus })
    .eq('id', itemId);

  if (!error) {
    await createAuditLog({
      organizationId: profile.organization_id,
      userId: user.id,
      action: 'checklist_item_marked',
      resourceType: 'case',
      resourceId: caseId,
      metadata: { checklist_item_id: itemId, previous_status: currentStatus, next_status: nextStatus },
    });
  }
  revalidatePath(`/expedientes/${caseId}`);
}

export async function addChecklistItem(formData: FormData) {
  const { user, profile } = await getUserProfile();
  if (!user) redirect('/login');
  if (!profile) redirect('/onboarding');
  if (!isUserRole(profile.role) || !canUpdateCase(profile.role)) denyCaseAction();

  const caseId = String(formData.get('case_id') || '');
  const title = String(formData.get('title') || '').trim();

  if (!caseId || !title) {
    revalidatePath(`/expedientes/${caseId}`);
    return;
  }
  const supabase = await createClient();

  let checklistId: string | undefined = undefined;
  const { data: existingChecklist } = await supabase
    .from('checklists')
    .select('id')
    .eq('case_id', caseId)
    .eq('organization_id', profile.organization_id)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (existingChecklist) {
    checklistId = existingChecklist.id;
  } else {
    const { data: newChecklist, error: newChecklistError } = await supabase
      .from('checklists')
      .insert({
        organization_id: profile.organization_id,
        case_id: caseId,
        name: 'Checklist documental',
        template_type: 'custom',
      })
      .select('id')
      .single();
    if (!newChecklistError && newChecklist) {
      checklistId = newChecklist.id;
    }
  }

  if (checklistId) {
    const { error } = await supabase
      .from('checklist_items')
      .insert({ checklist_id: checklistId, title, status: 'pending' });

    if (!error) {
      await createAuditLog({
        organizationId: profile.organization_id,
        userId: user.id,
        action: 'checklist_item_added',
        resourceType: 'case',
        resourceId: caseId,
        metadata: { title },
      });
    }
  }
  revalidatePath(`/expedientes/${caseId}`);
}

export async function removeChecklistItem(formData: FormData) {
  const { user, profile } = await getUserProfile();
  if (!user) redirect('/login');
  if (!profile) redirect('/onboarding');
  if (!isUserRole(profile.role) || !canUpdateCase(profile.role)) denyCaseAction();

  const caseId = String(formData.get('case_id') || '');
  const itemId = String(formData.get('item_id') || '');

  if (!caseId || !itemId) redirect('/expedientes');
  const supabase = await createClient();

  const { data: checklistItem, error: itemError } = await supabase
    .from('checklist_items')
    .select('id, checklists!inner(id, case_id, organization_id)')
    .eq('id', itemId)
    .eq('checklists.case_id', caseId)
    .eq('checklists.organization_id', profile.organization_id)
    .maybeSingle();

  if (itemError || !checklistItem) {
    revalidatePath(`/expedientes/${caseId}`);
    return;
  }

  const { error } = await supabase
    .from('checklist_items')
    .delete()
    .eq('id', itemId);

  if (!error) {
    await createAuditLog({
      organizationId: profile.organization_id,
      userId: user.id,
      action: 'checklist_item_removed',
      resourceType: 'case',
      resourceId: caseId,
      metadata: { checklist_item_id: itemId },
    });
  }
  revalidatePath(`/expedientes/${caseId}`);
}

export async function createCaseEvent(input: { caseId: string; eventDate: string; eventType: string; title: string; description?: string; }) {
  const { user, profile } = await getUserProfile();
  if (!user) redirect('/login');
  if (!profile) redirect('/onboarding');
  if (!isUserRole(profile.role) || !canUpdateCase(profile.role)) denyCaseAction();

  const title = input.title.trim();
  if (!title) {
    throw new Error('Title is required');
  }

  const supabase = await createClient();

  const { data: caseRecord, error: caseError } = await supabase
    .from('cases')
    .select('id')
    .eq('id', input.caseId)
    .eq('organization_id', profile.organization_id)
    .maybeSingle();

  if (caseError || !caseRecord) {
    revalidatePath(`/expedientes/${input.caseId}`);
    return;
  }

  const { error } = await supabase
    .from('case_events')
    .insert({
      organization_id: profile.organization_id,
      case_id: input.caseId,
      event_date: input.eventDate,
      event_type: input.eventType || 'otro',
      title,
      description: input.description?.trim() || null,
      created_by: user.id
    });

  if (!error) {
    await createAuditLog({
      organizationId: profile.organization_id,
      userId: user.id,
      action: 'case_event_added',
      resourceType: 'case',
      resourceId: input.caseId,
      metadata: { title, event_type: input.eventType },
    });
  }

  revalidatePath(`/expedientes/${input.caseId}`);
}

export async function deleteCaseEvent(input: { eventId: string; caseId: string }) {
  const { user, profile } = await getUserProfile();
  if (!user) redirect('/login');
  if (!profile) redirect('/onboarding');
  if (!isUserRole(profile.role) || !canUpdateCase(profile.role)) denyCaseAction();

  const supabase = await createClient();

  const { error } = await supabase
    .from('case_events')
    .delete()
    .eq('id', input.eventId)
    .eq('organization_id', profile.organization_id);

  if (!error) {
    await createAuditLog({
      organizationId: profile.organization_id,
      userId: user.id,
      action: 'case_event_removed',
      resourceType: 'case',
      resourceId: input.caseId,
      metadata: { event_id: input.eventId },
    });
  }
  
  revalidatePath(`/expedientes/${input.caseId}`);
}
