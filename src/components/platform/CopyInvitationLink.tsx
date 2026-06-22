'use client';

import { useState } from 'react';

interface CopyInvitationLinkProps {
  invitationUrl: string;
}

export function CopyInvitationLink({ invitationUrl }: CopyInvitationLinkProps) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    await navigator.clipboard.writeText(invitationUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mt-4 space-y-3">
      <input
        aria-label="Enlace de invitacion"
        readOnly
        value={invitationUrl}
        className="w-full rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm text-slate-700"
      />
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={copyLink}
          className="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-700"
        >
          {copied ? 'Enlace copiado' : 'Copiar enlace'}
        </button>
        <a
          href={invitationUrl}
          target="_blank"
          rel="noreferrer"
          className="rounded-2xl border border-emerald-200 bg-white px-5 py-3 text-sm font-bold text-emerald-700 hover:bg-emerald-50"
        >
          Abrir invitacion
        </a>
      </div>
    </div>
  );
}
