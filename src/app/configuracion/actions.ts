'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isIndustryType } from '@/lib/industries/documentTypes';

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

  const { data: owner, error: ownerError } = await admin
    .from('platform_admins')
    .select('user_id, active')
    .eq('user_id', user.id)
    .eq('active', true)
    .maybeSingle();

  if (ownerError || !owner) {
    redirect('/configuracion?error=platform_owner_required');
  }

  const { data: currentOrganization } = await admin
    .from('organizations')
    .select('industry_type')
    .eq('id', organizationId)
    .maybeSingle();

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
