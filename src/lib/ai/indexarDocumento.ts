'use server';

import type { SupabaseClient } from '@supabase/supabase-js';
import { generarEmbedding, partirEnFragmentos } from './embeddings';

/** Indexa (o re-indexa) un documento: parte el texto, genera embeddings y guarda. */
export async function indexarDocumento(
  supabase: SupabaseClient,
  params: { documentId: string; organizationId: string; texto: string }
): Promise<{ ok: boolean; chunks: number }> {
  const { documentId, organizationId, texto } = params;

  const fragmentos = partirEnFragmentos(texto);
  if (fragmentos.length === 0) return { ok: false, chunks: 0 };

  // Borramos indexación previa de este documento (re-indexar limpio)
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
      embedding: JSON.stringify(emb), // pgvector acepta "[...]" como texto
    });
  }

  if (filas.length === 0) return { ok: false, chunks: 0 };

  const { error } = await supabase.from('document_chunks').insert(filas);
  if (error) {
    console.error('Index insert error:', error);
    return { ok: false, chunks: 0 };
  }

  return { ok: true, chunks: filas.length };
}
