import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { BarChart3, FileText, FolderKanban, Users, AlertCircle, Calculator, FileSignature, CalendarDays, ScanLine, Search, Settings } from 'lucide-react';
import { getUserProfile } from '@/lib/auth/getUserProfile';
import { isUserRole } from '@/lib/permissions/roles';
import { createClient } from '@/lib/supabase/server';
import { normalizeIndustryType, type IndustryType } from '@/lib/industries/documentTypes';

type NavItem = {
  name: string;
  href: string;
  icon: LucideIcon;
  roles: string[];
  industries?: IndustryType[];
  group: string;
};

const navigation: NavItem[] = [
  { name: 'Inicio', href: '/dashboard', icon: BarChart3, roles: ['admin', 'employee', 'auditor', 'client'], group: 'Operación' },
  { name: 'Expedientes', href: '/expedientes', icon: FolderKanban, roles: ['admin', 'employee', 'auditor', 'client'], group: 'Operación' },
  { name: 'Documentos', href: '/documentos', icon: FileText, roles: ['admin', 'employee', 'auditor', 'client'], group: 'Operación' },
  { name: 'Buscar', href: '/buscar', icon: Search, roles: ['admin', 'employee'], group: 'Utilidades' },
  { name: 'Observaciones', href: '/observaciones', icon: AlertCircle, roles: ['admin', 'employee', 'auditor', 'client'], group: 'Gestión' },
  { name: 'Calculadoras', href: '/calculadoras', icon: Calculator, roles: ['admin', 'employee', 'auditor', 'client'], industries: ['legal', 'escribania'], group: 'Herramientas jurídicas' },
  { name: 'Modelos', href: '/modelos', icon: FileSignature, roles: ['admin', 'employee', 'auditor', 'client'], industries: ['legal', 'escribania'], group: 'Herramientas jurídicas' },
  { name: 'Agenda', href: '/agenda', icon: CalendarDays, roles: ['admin', 'employee', 'auditor', 'client'], industries: ['legal', 'escribania'], group: 'Herramientas jurídicas' },
  { name: 'Herramientas', href: '/herramientas', icon: ScanLine, roles: ['admin', 'employee', 'auditor', 'client'], industries: ['legal', 'escribania'], group: 'Utilidades' },
  { name: 'Usuarios', href: '/usuarios', icon: Users, roles: ['admin'], group: 'Gestión' },
  { name: 'Reportes', href: '/reportes', icon: BarChart3, roles: ['admin', 'employee', 'auditor'], group: 'Gestión' },
  { name: 'Configuración', href: '/configuracion', icon: Settings, roles: ['admin'], group: 'Gestión' },
];

export async function Sidebar() {
  const { profile } = await getUserProfile();
  const role = isUserRole(profile?.role) ? profile.role : null;

  let industry: IndustryType = 'general';
  if (profile?.organization_id) {
    const supabase = await createClient();
    const { data: org } = await supabase
      .from('organizations')
      .select('industry_type')
      .eq('id', profile.organization_id)
      .maybeSingle();
    industry = normalizeIndustryType(org?.industry_type);
  }

  const visibleNavigation = role
    ? navigation.filter(
        (item) =>
          item.roles.includes(role) &&
          (!item.industries || item.industries.includes(industry))
      )
    : [];

  const groupOrder = ['Operación', 'Herramientas jurídicas', 'Utilidades', 'Gestión'];

  return (
    <aside className="fixed inset-y-0 left-0 hidden h-screen w-72 flex-col border-r border-white/10 bg-[#071326] px-5 py-4 shadow-[18px_0_55px_rgba(0,0,0,0.24)] lg:flex">
      <Link href="/dashboard" className="mb-6 block">
        <p className="text-xs font-semibold uppercase tracking-[0.25em]">
          <span className="text-white">Centinela</span>{' '}
          <span className="text-[#1E9BF0]">IA</span>
        </p>
        <h1 className="mt-2 text-xl font-bold text-white">
          Panel operativo
        </h1>
      </Link>

      <nav className="space-y-1 flex-1 overflow-y-auto pb-6">
        {groupOrder.map((group) => {
          const items = visibleNavigation.filter((i) => i.group === group);
          if (items.length === 0) return null;
          return (
            <div key={group} className="mb-0.5">
              <p className="px-3 pt-1.5 pb-0.5 text-[10px] leading-none font-semibold uppercase tracking-wider text-slate-500">
                {group}
              </p>
              {items.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-2.5 rounded-2xl px-3 py-1.5 text-sm font-semibold text-[#C2CCD9] transition-all hover:bg-[#1E9BF0]/12 hover:text-[#29C5FF]"
                  >
                    <Icon className="h-[18px] w-[18px] text-current" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
