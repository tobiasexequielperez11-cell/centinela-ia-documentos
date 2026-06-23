import Link from 'next/link';

export function BackHomeLink() {
  return (
    <div className="mx-auto w-full max-w-7xl px-6 pt-6">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm font-bold text-[#C2CCD9] transition-colors hover:text-[#1E9BF0]"
      >
        <span aria-hidden="true">←</span>
        Volver al inicio
      </Link>
    </div>
  );
}
