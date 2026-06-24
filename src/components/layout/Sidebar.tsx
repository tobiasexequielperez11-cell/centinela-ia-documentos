import Link from 'next/link';
import { BarChart3, FileText, FolderKanban, Settings, Users } from 'lucide-react';
import { getUserProfile } from '@/lib/auth/getUserProfile';
import { isUserRole } from '@/lib/permissions/roles';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: BarChart3, roles: ['admin', 'employee', 'auditor', 'client'] },
  { name: 'Expedientes', href: '/expedientes', icon: FolderKanban, roles: ['admin', 'employee', 'auditor', 'client'] },
  { name: 'Documentos', href: '/documentos', icon: FileText, roles: ['admin', 'employee', 'auditor', 'client'] },
  { name: 'Usuarios', href: '/usuarios', icon: Users, roles: ['admin'] },
  { name: 'Reportes', href: '/reportes', icon: BarChart3, roles: ['admin', 'employee', 'auditor'] },
  { name: 'Configuración', href: '/configuracion', icon: Settings, roles: ['admin'] },
];

export async function Sidebar() {
  const { profile } = await getUserProfile();
  const role = isUserRole(profile?.role) ? profile.role : null;
  const visibleNavigation = role
    ? navigation.filter((item) => item.roles.includes(role))
    : [];

  return (
    <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-white/10 bg-[#071326] px-5 py-6 shadow-[18px_0_55px_rgba(0,0,0,0.24)] lg:block">
      <Link href="/dashboard" className="mb-8 block">
        <p className="text-xs font-semibold uppercase tracking-[0.25em]">
          <span className="text-white">Centinela</span>{' '}
          <span className="text-[#1E9BF0]">IA</span>
        </p>
        <h1 className="mt-2 text-xl font-bold text-white">
          Panel operativo
        </h1>
      </Link>

      <nav className="space-y-1">
        {visibleNavigation.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-[#C2CCD9] transition-all hover:bg-[#1E9BF0]/12 hover:text-[#29C5FF]"
            >
              <Icon className="h-4 w-4 text-current" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-6 left-5 right-5 rounded-3xl border border-white/10 bg-white/[0.055] p-5 text-white shadow-[0_20px_45px_rgba(0,0,0,0.22)]">
        <p className="text-sm font-bold">
          MVP V1
        </p>

        <p className="mt-2 text-xs font-semibold text-sky-200">
          Entorno beta seguro
        </p>

        <p className="mt-2 text-xs leading-5 text-[#C2CCD9]">
          Acceso protegido por organización y rol.
        </p>
      </div>
    </aside>
  );
}
