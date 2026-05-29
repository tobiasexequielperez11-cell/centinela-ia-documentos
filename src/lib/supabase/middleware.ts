import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

interface AccessProfile {
  role?: string | null;
  status?: string | null;
}

function redirectTo(request: NextRequest, pathname: string, motivo?: string) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;

  if (motivo) {
    url.searchParams.set('motivo', motivo);
  }

  return NextResponse.redirect(url);
}

function isPrivatePath(pathname: string) {
  return (
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/expedientes') ||
    pathname.startsWith('/documentos') ||
    pathname.startsWith('/usuarios') ||
    pathname.startsWith('/reportes') ||
    pathname.startsWith('/configuracion') ||
    pathname.startsWith('/onboarding')
  );
}

function isAdminOnlyPath(pathname: string) {
  return pathname.startsWith('/usuarios');
}

function isSensitiveReportPath(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const view = request.nextUrl.searchParams.get('vista');

  if (!pathname.startsWith('/reportes')) return false;

  return view === 'auditoria' || view === 'invitaciones';
}

function canAccessSensitiveReport(profile: AccessProfile, request: NextRequest) {
  const view = request.nextUrl.searchParams.get('vista');

  if (view === 'invitaciones') {
    return profile.role === 'admin';
  }

  if (view === 'auditoria') {
    return profile.role === 'admin' || profile.role === 'auditor';
  }

  return true;
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isPrivateRoute = isPrivatePath(pathname);

  if (isPrivateRoute && !user) {
    return redirectTo(request, '/login');
  }

  if (!user) {
    return supabaseResponse;
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, status')
    .eq('id', user.id)
    .maybeSingle();

  if (pathname === '/login') {
    if (profile?.status === 'active') {
      return redirectTo(request, '/dashboard');
    }

    if (profile && profile.status !== 'active') {
      return redirectTo(request, '/acceso-denegado', 'estado');
    }

    return supabaseResponse;
  }

  if (isPrivateRoute && !profile && !pathname.startsWith('/onboarding')) {
    return redirectTo(request, '/onboarding');
  }

  if (isPrivateRoute && profile && profile.status !== 'active') {
    return redirectTo(request, '/acceso-denegado', 'estado');
  }

  if (isPrivateRoute && profile && isAdminOnlyPath(pathname)) {
    if (profile.role !== 'admin') {
      return redirectTo(request, '/acceso-denegado', 'rol');
    }
  }

  if (isPrivateRoute && profile && isSensitiveReportPath(request)) {
    if (!canAccessSensitiveReport(profile, request)) {
      return redirectTo(request, '/acceso-denegado', 'rol');
    }
  }

  return supabaseResponse;
}