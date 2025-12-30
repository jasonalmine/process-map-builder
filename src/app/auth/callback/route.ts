import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

// Validate redirect path to prevent open redirect attacks
function isValidRedirectPath(path: string): boolean {
  // Must start with / and not contain protocol indicators
  if (!path.startsWith('/')) return false;
  // Prevent protocol-relative URLs (//evil.com)
  if (path.startsWith('//')) return false;
  // Prevent encoded slashes that could bypass checks
  if (path.includes('%2f') || path.includes('%2F')) return false;
  // Prevent backslash tricks
  if (path.includes('\\')) return false;
  return true;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const nextParam = searchParams.get('next') ?? '/';

  // Validate and sanitize the redirect path
  const next = isValidRedirectPath(nextParam) ? nextParam : '/';

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
