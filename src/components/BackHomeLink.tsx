import Link from 'next/link';

export function BackHomeLink() {
  return (
    <div className="px-6 pt-24 md:pt-28">
      <div className="mx-auto w-full max-w-7xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-bold text-[#C2CCD9] transition-colors hover:text-[#1E9BF0]"
        >
          <span aria-hidden="true">&larr;</span>
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
