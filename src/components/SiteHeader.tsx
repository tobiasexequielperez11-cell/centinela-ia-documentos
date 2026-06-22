'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

const whatsappUrl =
  'https://wa.me/543794733321?text=Hola,%20quiero%20coordinar%20una%20presentaci%C3%B3n%20de%20Centinela%20IA';

const navigationItems = [
  { href: '/funciones', label: 'Beneficios' },
  { href: '/#rubros', label: 'Rubros' },
  { href: '/seguridad', label: 'Seguridad' },
  { href: '/analisis-documental', label: 'Análisis documental' },
  { href: '/como-funciona', label: 'Presentación' },
  { href: '/planes', label: 'Acceso beta' },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const closeMenu = () => setIsOpen(false);
  const isActive = (href: string) => !href.includes('#') && pathname === href;

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeMenu();
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !menuRef.current?.contains(event.target)) {
        closeMenu();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('pointerdown', handlePointerDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [isOpen]);

  return (
    <header className="relative z-40 border-b border-[#c8dbea] bg-[#eaf2f8] px-4 py-3 shadow-sm sm:px-6">
      <div className="mx-auto grid max-w-7xl grid-cols-[1fr_auto] items-center gap-2 sm:gap-4 lg:grid-cols-[1fr_auto_1fr]">
        <nav
          aria-label="Navegación principal"
          className="hidden items-center gap-5 text-sm font-bold text-slate-950 lg:flex"
        >
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? 'page' : undefined}
              className={`landing-nav-link whitespace-nowrap ${
                isActive(item.href)
                  ? 'text-sky-700 underline decoration-2 underline-offset-8'
                  : ''
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/"
          className="flex h-20 w-44 items-center justify-start overflow-hidden transition-transform hover:scale-[1.03] sm:h-24 sm:w-64 lg:h-28 lg:w-96 lg:justify-center"
          aria-label="Centinela IA - Ir al inicio"
        >
          <img
            src="/brand/centinela-logo-transparent.png"
            alt="Centinela IA"
            className="h-full w-full object-contain"
          />
        </Link>

        <div className="hidden items-center justify-end gap-2 lg:flex">
          <Link
            href="/login"
            className="rounded-2xl border border-[#12345d]/20 px-4 py-2 text-sm font-bold text-[#0b1f3a] transition-all hover:-translate-y-0.5 hover:bg-white/70 hover:shadow-sm"
          >
            Ingresar
          </Link>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-2xl bg-sky-500 px-4 py-2 text-sm font-black text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-sky-600"
          >
            Coordinar presentación
          </a>
        </div>

        <div ref={menuRef} className="relative lg:hidden">
          <button
            type="button"
            aria-expanded={isOpen}
            aria-controls="site-mobile-navigation"
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
              id="site-mobile-navigation"
              className="absolute right-0 top-14 w-[min(20rem,calc(100vw-2rem))] rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_24px_60px_rgba(2,13,41,0.2)]"
            >
              <nav aria-label="Navegación móvil" className="grid gap-1">
                {navigationItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMenu}
                    aria-current={isActive(item.href) ? 'page' : undefined}
                    className={`rounded-xl px-4 py-3 text-sm font-bold transition-colors hover:bg-sky-50 hover:text-sky-700 ${
                      isActive(item.href)
                        ? 'bg-sky-50 text-sky-700'
                        : 'text-slate-800'
                    }`}
                  >
                    {item.label}
                  </Link>
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
      </div>
    </header>
  );
}
