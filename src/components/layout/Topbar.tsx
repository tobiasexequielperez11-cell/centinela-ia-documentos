import Link from 'next/link';
import { Search, Upload } from 'lucide-react';
import { BackButton } from './BackButton';
import { signOut } from '@/app/login/actions';
import { getUserProfile } from '@/lib/auth/getUserProfile';
import { canUploadDocument, isUserRole } from '@/lib/permissions/roles';

export async function Topbar() {
  const { profile } = await getUserProfile();
  const canUpload = isUserRole(profile?.role) && canUploadDocument(profile.role);

  return (
    <header className="sticky top-0 z-10 border-b border-white/10 bg-[#0A1830]/92 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <BackButton />
          <div className="hidden items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.055] px-4 py-2 shadow-[0_12px_30px_rgba(0,0,0,0.16)] lg:flex">
            <Search className="h-4 w-4 text-[#29C5FF]" />
            <span className="text-sm text-[#C2CCD9]">
              Buscar expediente, documento o cliente...
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 lg:ml-auto">
          {canUpload ? (
            <Link
              href="/documentos/subir"
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-bold text-white transition-all"
            >
              <Upload className="h-4 w-4" />
              Subir documento
            </Link>
          ) : null}

          <form action={signOut}>
            <button className="rounded-2xl border border-white/20 bg-white/[0.025] px-4 py-2 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:border-sky-300/50 hover:bg-white/[0.08]">
              Salir
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
