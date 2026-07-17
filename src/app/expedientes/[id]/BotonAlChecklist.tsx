'use client';
import { useActionState } from 'react';
import { addChecklistItemConEstado } from '../actions';
export function BotonAlChecklist({ caseId, title }: { caseId: string; title: string }) {
const [state, formAction, isPending] = useActionState(addChecklistItemConEstado, null);
const agregado = state?.ok === true;
return (
<form action={formAction} className="shrink-0">
<input type="hidden" name="case_id" value={caseId} />
<input type="hidden" name="title" value={title} />
<button
type="submit"
disabled={isPending || agregado}
className={`rounded-lg px-3 py-1.5 text-xs font-medium transition disabled:opacity-80 ${
agregado
? 'bg-emerald-500/20 text-emerald-300 cursor-default'
: 'bg-white/10 text-white hover:bg-white/20'
}`}
>
{isPending ? 'Agregando…' : agregado ? '✓ Agregado al checklist' : ' Al checklist'}
</button>
</form>
);
}
