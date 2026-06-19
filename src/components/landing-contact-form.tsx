'use client';

import Link from 'next/link';
import type { FormEvent } from 'react';

const industries = [
  'Estudio jurídico',
  'Inmobiliaria',
  'Escribanía',
  'Empresa',
  'Otro',
];

export function LandingContactForm() {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const message = [
      'Hola, quiero consultar por Centinela IA.',
      '',
      `Nombre: ${String(formData.get('name') ?? '')}`,
      `Organización: ${String(formData.get('organization') ?? '')}`,
      `Email: ${String(formData.get('email') ?? '')}`,
      `Rubro: ${String(formData.get('industry') ?? '')}`,
    ].join('\n');

    const url = `https://wa.me/543794733321?text=${encodeURIComponent(message)}`;
    const whatsappWindow = window.open(url, '_blank', 'noopener,noreferrer');
    if (whatsappWindow) whatsappWindow.opener = null;
  };

  const fieldClassName =
    'mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-950 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200';

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="text-sm font-bold text-slate-700">
          Nombre
          <input name="name" type="text" autoComplete="name" required className={fieldClassName} />
        </label>

        <label className="text-sm font-bold text-slate-700">
          Organización
          <input name="organization" type="text" autoComplete="organization" required className={fieldClassName} />
        </label>

        <label className="text-sm font-bold text-slate-700">
          Email
          <input name="email" type="email" autoComplete="email" required className={fieldClassName} />
        </label>

        <label className="text-sm font-bold text-slate-700">
          Rubro
          <select name="industry" required defaultValue="" className={fieldClassName}>
            <option value="" disabled>
              Seleccioná una opción
            </option>
            {industries.map((industry) => (
              <option key={industry} value={industry}>
                {industry}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="mt-5 flex items-start gap-3 text-xs leading-5 text-slate-600">
        <input name="privacy" type="checkbox" required className="mt-1 h-4 w-4 rounded border-slate-300 text-sky-500" />
        <span>
          Acepto que estos datos se utilicen para responder mi consulta, según la{' '}
          <Link href="/privacidad" className="font-bold text-sky-700 hover:text-sky-800">
            Política de privacidad
          </Link>
          .
        </span>
      </label>

      <button
        type="submit"
        className="mt-6 w-full rounded-xl bg-sky-500 px-5 py-3 text-sm font-black text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-sky-600 sm:w-auto"
      >
        Enviar consulta por WhatsApp
      </button>

      <p className="mt-4 text-xs leading-5 text-slate-500">
        Al enviar, se abrirá WhatsApp con los datos completados. La landing no guarda este formulario.
      </p>
    </form>
  );
}
