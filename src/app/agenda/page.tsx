import { redirect } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { createClient } from '@/lib/supabase/server';
import { getUserProfile } from '@/lib/auth/getUserProfile';
import { AgendaClient, type AgendaEvento } from './AgendaClient';

export default async function AgendaPage() {
  const { user, profile } = await getUserProfile();
  if (!user) redirect('/login');
  if (!profile) redirect('/onboarding');

  const supabase = await createClient();

  const [documentsResult, casesResult, plazosResult] = await Promise.all([
    supabase
      .from('documents')
      .select('id, file_name, expires_at')
      .eq('organization_id', profile.organization_id)
      .not('expires_at', 'is', null),
    supabase
      .from('cases')
      .select('id, title, metadata')
      .eq('organization_id', profile.organization_id)
      .neq('status', 'archived')
      .neq('status', 'Archivado'),
    supabase
      .from('agenda_plazos')
      .select('id, titulo, fecha, detalle, categoria')
      .eq('organization_id', profile.organization_id),
  ]);

  const documents = documentsResult.data ?? [];
  const cases = casesResult.data ?? [];
  const plazos = plazosResult.data ?? [];

  const eventos: AgendaEvento[] = [];

  for (const doc of documents) {
    if (!doc.expires_at) continue;
    eventos.push({
      id: `doc-${doc.id}`,
      fecha: String(doc.expires_at).slice(0, 10),
      titulo: doc.file_name ?? 'Documento',
      tipo: 'documento',
      href: `/documentos/${doc.id}`,
    });
  }

  for (const c of cases) {
    const fecha = ((c.metadata as Record<string, unknown> | null)?.fecha_relevante as string | undefined)?.trim();
    if (!fecha) continue;
    eventos.push({
      id: `case-${c.id}`,
      fecha: fecha.slice(0, 10),
      titulo: c.title || 'Expediente sin título',
      tipo: 'expediente',
      href: `/expedientes/${c.id}`,
    });
  }

  for (const p of plazos) {
    if (!p.fecha) continue;
    const esManual = (p as { categoria?: string }).categoria === 'manual';
    eventos.push({
      id: `${esManual ? 'evento' : 'plazo'}-${p.id}`,
      fecha: String(p.fecha).slice(0, 10),
      titulo: p.titulo ?? (esManual ? 'Evento' : 'Plazo procesal'),
      tipo: esManual ? 'evento' : 'plazo',
      href: '/agenda',
    });
  }

  return (
    <AppShell>
      <AgendaClient eventos={eventos} />
    </AppShell>
  );
}
