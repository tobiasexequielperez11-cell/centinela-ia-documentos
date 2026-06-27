'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isIndustryType, normalizeIndustryType } from '@/lib/industries/documentTypes';

export async function updateOrganizationIndustryType(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const organizationId = String(formData.get('organization_id') || '');
  const industryType = String(formData.get('industry_type') || '');

  if (!organizationId || !isIndustryType(industryType)) {
    redirect('/configuracion?error=industry_invalid');
  }

  const admin = createAdminClient();

  if (!admin) {
    redirect('/configuracion?error=platform_unavailable');
  }

  const { data: owner } = await admin
    .from('platform_admins')
    .select('user_id, active')
    .eq('user_id', user.id)
    .eq('active', true)
    .maybeSingle();

  const isPlatformOwner = Boolean(owner);

  const { data: actingProfile } = await admin
    .from('profiles')
    .select('role, organization_id, status')
    .eq('id', user.id)
    .maybeSingle();

  const { data: currentOrganization } = await admin
    .from('organizations')
    .select('industry_type')
    .eq('id', organizationId)
    .maybeSingle();

  const currentIndustry = normalizeIndustryType(
    currentOrganization?.industry_type
  );
  const isUnset = currentIndustry === 'general';

  const isOrgAdmin =
    actingProfile?.role === 'admin' &&
    actingProfile?.status === 'active' &&
    actingProfile?.organization_id === organizationId;

  const canChange = isPlatformOwner || (isOrgAdmin && isUnset);

  if (!canChange) {
    redirect('/configuracion?error=industry_locked');
  }

  const { error } = await admin
    .from('organizations')
    .update({ industry_type: industryType })
    .eq('id', organizationId);

  if (error) {
    console.error('Organization industry update failed:', error);
    redirect('/configuracion?error=industry_update_failed');
  }

  const { error: auditError } = await admin.from('audit_logs').insert({
    organization_id: organizationId,
    user_id: user.id,
    action: 'organization_industry_updated',
    resource_type: 'organization',
    resource_id: organizationId,
    metadata: {
      from: currentOrganization?.industry_type ?? null,
      to: industryType,
    },
  });

  if (auditError) {
    console.error('Organization industry audit log failed:', auditError);
  }

  revalidatePath('/configuracion');
  revalidatePath('/documentos/subir');
  redirect('/configuracion?success=industry_updated');
}
