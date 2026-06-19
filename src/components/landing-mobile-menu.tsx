'use client';

import Link from 'next/link';
import { useState } from 'react';

const navigationItems = [
  { href: '#beneficios', label: 'Beneficios' },
  { href: '#rubros', label: 'Rubros' },
  { href: '#seguridad', label: 'Seguridad' },
  { href: '#demo', label: 'Presentación' },
  { href: '#beta', label: 'Acceso beta' },
];

export function LandingMobileMenu({ whatsappUrl }: { whatsappUrl: string }) {
  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = () => setIsOpen(false);

  return (
    <div className="relative lg:hidden">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls="landing-mobile-navigation"
        aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
        onClick={() => setIsOpen((current) => !current)}
        className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[#12345d]/20 bg-white/70 text-[#0b1f3a] shadow-sm transition-colors hover:bg-white"
      >
        {isOpen ? (
          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
            <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
            <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        )}
      </button>

      {isOpen ? (
        <div
          id="landing-mobile-navigation"
          className="absolute right-0 top-14 w-[min(20rem,calc(100vw-2rem))] rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_24px_60px_rgba(2,13,41,0.2)]"
        >
          <nav aria-label="Navegación móvil" className="grid gap-1">
            {navigationItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={closeMenu}
                className="rounded-xl px-4 py-3 text-sm font-bold text-slate-800 transition-colors hover:bg-sky-50 hover:text-sky-700"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="mt-3 grid gap-2 border-t border-slate-100 pt-3">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              onClick={closeMenu}
              className="rounded-xl bg-sky-500 px-4 py-3 text-center text-sm font-black text-white hover:bg-sky-600"
            >
              Coordinar presentación
            </a>
            <Link
              href="/login"
              onClick={closeMenu}
              className="rounded-xl border border-slate-200 px-4 py-3 text-center text-sm font-black text-[#0b1f3a] hover:bg-slate-50"
            >
              Ingresar al sistema
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
