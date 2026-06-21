import Link from 'next/link';
import { Search, Upload } from 'lucide-react';
import { signOut } from '@/app/login/actions';
import { getUserProfile } from '@/lib/auth/getUserProfile';
import { canUploadDocument, isUserRole } from '@/lib/permissions/roles';

export async function Topbar() {
  const { profile } = await getUserProfile();
  const canUpload = isUserRole(profile?.role) && canUploadDocument(profile.role);

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="hidden items-center gap-3 rounded-2xl border border-slate-200 px-4 py-2 lg:flex">
          <Search className="h-4 w-4 text-slate-400" />
          <span className="text-sm text-slate-500">
            Buscar expediente, documento o cliente...
          </span>
        </div>

        <div className="flex items-center gap-3 lg:ml-auto">
          {canUpload ? (
            <Link
              href="/documentos/subir"
              className="inline-flex items-center gap-2 rounded-2xl bg-sky-500 px-4 py-2 text-sm font-bold text-white hover:bg-sky-600"
            >
              <Upload className="h-4 w-4" />
              Subir documento
            </Link>
          ) : null}

          <form action={signOut}>
            <button className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">
              Salir
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
