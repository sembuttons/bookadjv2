import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Next.js 16+: `middleware.ts` is deprecated in favor of `proxy.ts`.
 * Runs in the Node.js runtime (not Edge).
 */
export async function proxy(req: NextRequest) {
  let res = NextResponse.next({ request: req });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            req.cookies.set(name, value),
          );
          res = NextResponse.next({ request: req });
          cookiesToSet.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/auth")) return res;

  const protectedRoutes = ["/dashboard", "/admin", "/berichten"];
  const isProtected = protectedRoutes.some((r) => pathname.startsWith(r));

  if (isProtected && !session) {
    const redirectUrl = new URL("/auth", req.url);
    redirectUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (session && isProtected) {
    const { data: userRow } = await supabase
      .from("users")
      .select("is_suspended")
      .eq("id", session.user.id)
      .maybeSingle();
    if ((userRow as { is_suspended?: boolean } | null)?.is_suspended) {
      await supabase.auth.signOut();
      const suspendedUrl = new URL("/auth", req.url);
      suspendedUrl.searchParams.set("error", "suspended");
      return NextResponse.redirect(suspendedUrl);
    }
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};
