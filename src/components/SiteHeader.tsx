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
  const [isScrolled, setIsScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const closeMenu = () => setIsOpen(false);
  const isActive = (href: string) => !href.includes('#') && pathname === href;
  const hasSolidBackground = pathname !== '/' || isScrolled || isOpen;

  useEffect(() => {
    const updateHeader = () => setIsScrolled(window.scrollY > 20);
    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });
    return () => window.removeEventListener('scroll', updateHeader);
  }, []);

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
    <header
      className={`site-header sticky top-0 z-40 px-4 py-2 sm:px-6 ${
        hasSolidBackground
          ? 'site-header-solid border-b border-white/10 bg-[#0A1830]/95 shadow-[0_10px_35px_rgba(0,0,0,0.22)] backdrop-blur-xl'
          : 'border-b border-transparent bg-[#0A1830]'
      }`}
    >
      <div className="mx-auto grid max-w-7xl grid-cols-[1fr_auto] items-center gap-2 sm:gap-4 lg:grid-cols-[1fr_auto_1fr]">
        <nav
          aria-label="Navegación principal"
          className="hidden items-center gap-5 text-sm font-bold text-slate-300 lg:flex"
        >
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? 'page' : undefined}
              className={`landing-nav-link whitespace-nowrap ${
                isActive(item.href)
                  ? 'text-[#1E9BF0] underline decoration-2 underline-offset-8'
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
            src="/brand/centinela-logo-header-dark.png"
            alt="Centinela IA"
            className="h-full w-full object-contain"
          />
        </Link>

        <div className="hidden items-center justify-end gap-2 lg:flex">
          <Link
            href="/login"
            className="rounded-2xl border border-white/20 bg-white/[0.025] px-4 py-2 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:border-sky-300/50 hover:bg-white/[0.08] hover:shadow-sm"
          >
            Ingresar
          </Link>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-2xl bg-[#1E9BF0] px-4 py-2 text-sm font-black text-[#061426] shadow-[0_10px_28px_rgba(30,155,240,0.22)] transition-all hover:-translate-y-0.5 hover:bg-sky-300"
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
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 bg-white/[0.06] text-white shadow-sm transition-colors hover:border-sky-300/40 hover:bg-white/[0.1]"
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
              className="absolute right-0 top-14 w-[min(20rem,calc(100vw-2rem))] rounded-2xl border border-white/10 bg-[#0C2340]/95 p-3 shadow-[0_24px_60px_rgba(0,0,0,0.38)] backdrop-blur-xl"
            >
              <nav aria-label="Navegación móvil" className="grid gap-1">
                {navigationItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMenu}
                    aria-current={isActive(item.href) ? 'page' : undefined}
                    className={`rounded-xl px-4 py-3 text-sm font-bold transition-colors hover:bg-white/[0.07] hover:text-sky-300 ${
                      isActive(item.href)
                        ? 'bg-sky-400/10 text-sky-300'
                        : 'text-slate-200'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>

              <div className="mt-3 grid gap-2 border-t border-white/10 pt-3">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={closeMenu}
                  className="rounded-xl bg-[#1E9BF0] px-4 py-3 text-center text-sm font-black text-[#061426] hover:bg-sky-300"
                >
                  Coordinar presentación
                </a>
                <Link
                  href="/login"
                  onClick={closeMenu}
                  className="rounded-xl border border-white/15 px-4 py-3 text-center text-sm font-black text-white hover:bg-white/[0.07]"
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
