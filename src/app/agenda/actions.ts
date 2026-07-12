'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getUserProfile } from '@/lib/auth/getUserProfile';

export type GuardarEventoResult =
  | { ok: true }
  | { ok: false; motivo: 'no_auth' | 'error'; mensaje?: string };

export async function guardarEventoManual(input: {
  titulo: string;
  fecha: string; // 'YYYY-MM-DD'
  detalle?: string;
  caseId?: string;
}): Promise<GuardarEventoResult> {
  const { user, profile } = await getUserProfile();
  if (!user || !profile) return { ok: false, motivo: 'no_auth' };

  const titulo = input.titulo?.trim();
  const fecha = input.fecha?.trim();
  if (!titulo || !fecha) return { ok: false, motivo: 'error', mensaje: 'Faltan datos.' };

  const supabase = await createClient();
  const { error } = await supabase.from('agenda_plazos').insert({
    organization_id: profile.organization_id,
    titulo,
    fecha,
    detalle: input.detalle?.trim() || null,
    categoria: 'manual',
    created_by: user.id,
    case_id: input.caseId ?? null,
  });

  if (error) return { ok: false, motivo: 'error', mensaje: error.message };

  revalidatePath('/agenda');
  if (input.caseId) revalidatePath(`/expedientes/${input.caseId}`);
  return { ok: true };
}

export async function guardarPlazoDetectado(input: {
  titulo: string;
  fecha: string; // 'YYYY-MM-DD'
  detalle?: string;
  caseId?: string;
}): Promise<GuardarEventoResult> {
  const { user, profile } = await getUserProfile();
  if (!user || !profile) return { ok: false, motivo: 'no_auth' };

  const titulo = input.titulo?.trim();
  const fecha = input.fecha?.trim();
  if (!titulo || !fecha) return { ok: false, motivo: 'error', mensaje: 'Faltan datos.' };

  const supabase = await createClient();
  const { error } = await supabase.from('agenda_plazos').insert({
    organization_id: profile.organization_id,
    titulo,
    fecha,
    detalle: input.detalle?.trim() || null,
    categoria: 'plazo',
    created_by: user.id,
    case_id: input.caseId ?? null,
  });

  if (error) return { ok: false, motivo: 'error', mensaje: error.message };

  revalidatePath('/agenda');
  if (input.caseId) revalidatePath(`/expedientes/${input.caseId}`);
  return { ok: true };
}

export async function guardarTurno(input: {
  titulo: string;
  fecha: string; // 'YYYY-MM-DD'
  hora?: string; // 'HH:MM'
  tipo: 'turno' | 'firma';
  detalle?: string;
  caseId?: string;
}): Promise<GuardarEventoResult> {
  const { user, profile } = await getUserProfile();
  if (!user || !profile) return { ok: false, motivo: 'no_auth' };

  const titulo = input.titulo?.trim();
  const fecha = input.fecha?.trim();
  if (!titulo || !fecha) return { ok: false, motivo: 'error', mensaje: 'Faltan datos.' };

  const categoria = input.tipo === 'firma' ? 'firma' : 'turno';

  const supabase = await createClient();
  const { error } = await supabase.from('agenda_plazos').insert({
    organization_id: profile.organization_id,
    titulo,
    fecha,
    hora: input.hora?.trim() || null,
    detalle: input.detalle?.trim() || null,
    categoria,
    created_by: user.id,
    case_id: input.caseId ?? null,
  });

  if (error) return { ok: false, motivo: 'error', mensaje: error.message };

  revalidatePath('/agenda');
  if (input.caseId) revalidatePath(`/expedientes/${input.caseId}`);
  return { ok: true };
}
