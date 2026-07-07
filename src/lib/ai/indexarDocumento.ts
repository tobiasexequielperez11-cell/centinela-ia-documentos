'use server';

import type { SupabaseClient } from '@supabase/supabase-js';
import { generarEmbedding, partirEnFragmentos } from './embeddings';

export async function indexarDocumento(
  supabase: SupabaseClient,
  params: { documentId: string; organizationId: string; texto: string }
): Promise<{ ok: boolean; chunks: number; motivo?: string }> {
  const { documentId, organizationId, texto } = params;

  const fragmentos = partirEnFragmentos(texto);
  if (fragmentos.length === 0) return { ok: false, chunks: 0, motivo: 'sin-fragmentos' };

  await supabase.from('document_chunks').delete().eq('document_id', documentId);

  const filas: {
    document_id: string;
    organization_id: string;
    chunk_index: number;
    content: string;
    embedding: string;
  }[] = [];

  for (let i = 0; i < fragmentos.length; i++) {
    const emb = await generarEmbedding(fragmentos[i]);
    if (!emb) continue;
    filas.push({
      document_id: documentId,
      organization_id: organizationId,
      chunk_index: i,
      content: fragmentos[i],
      embedding: JSON.stringify(emb),
    });
  }

  if (filas.length === 0) return { ok: false, chunks: 0, motivo: 'embeddings-fallaron' };

  const { error } = await supabase.from('document_chunks').insert(filas);
  if (error) {
    console.error('Index insert error:', error);
    return { ok: false, chunks: 0, motivo: 'insert:' + error.message };
  }

  return { ok: true, chunks: filas.length };
}
