"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { supabase } from "@/lib/supabase-browser";

type Tab = "login" | "signup";
type Role = "klant" | "dj";

export default function AuthPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("login");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [fullName, setFullName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [role, setRole] = useState<Role>("klant");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [signupDone, setSignupDone] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("tab") === "aanmelden") {
      setTab("signup");
    }
    const r = params.get("role")?.toLowerCase();
    if (r === "dj") setRole("dj");
    if (r === "klant" || r === "customer") setRole("klant");
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResetMessage(null);
    setFieldErrors({});
    const fe: Record<string, string> = {};
    if (!loginEmail.trim()) fe.loginEmail = "Dit veld is verplicht";
    else if (!emailOk(loginEmail)) fe.loginEmail = "Voer een geldig e-mailadres in.";
    if (!loginPassword) fe.loginPassword = "Dit veld is verplicht";
    setFieldErrors(fe);
    if (Object.keys(fe).length > 0) return;

    setLoading(true);
    const { error: signError } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    });
    setLoading(false);
    if (signError) {
      setError(signError.message);
      return;
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user) {
      setError("Kon sessie niet starten. Probeer opnieuw.");
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const redirectRaw = params.get("redirect") ?? params.get("returnTo");
    const redirectTo =
      redirectRaw &&
      redirectRaw.startsWith("/") &&
      !redirectRaw.startsWith("//")
        ? redirectRaw
        : null;

    if (redirectTo) {
      router.push(redirectTo);
      router.refresh();
      return;
    }

    const { data: row } = await supabase
      .from("users")
      .select("role")
      .eq("id", session.user.id)
      .maybeSingle();
    const dbRole = (row as { role?: string } | null)?.role?.toLowerCase();
    const metaRole = (
      session.user.user_metadata?.role as string | undefined
    )?.toLowerCase();
    const effective = dbRole || metaRole;

    if (effective === "admin") router.push("/admin");
    else if (effective === "dj") router.push("/dashboard/dj");
    else router.push("/dashboard/klant");
    router.refresh();
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResetMessage(null);
    setFieldErrors({});
    const fe: Record<string, string> = {};
    if (!fullName.trim()) fe.signupName = "Dit veld is verplicht";
    if (!signupEmail.trim()) fe.signupEmail = "Dit veld is verplicht";
    else if (!emailOk(signupEmail)) fe.signupEmail = "Voer een geldig e-mailadres in.";
    if (!signupPassword) fe.signupPassword = "Dit veld is verplicht";
    else if (signupPassword.length < 6)
      fe.signupPassword = "Minimaal 6 tekens.";
    setFieldErrors(fe);
    if (Object.keys(fe).length > 0) return;

    setLoading(true);
    const { data: signData, error: signError } = await supabase.auth.signUp({
      email: signupEmail,
      password: signupPassword,
      options: {
        data: {
          full_name: fullName.trim(),
          role,
        },
      },
    });
    setLoading(false);
    if (signError) {
      setError(signError.message);
      return;
    }

    if (signData.session) {
      const params = new URLSearchParams(window.location.search);
      const redirectRaw = params.get("redirect") ?? params.get("returnTo");
      const redirectTo =
        redirectRaw &&
        redirectRaw.startsWith("/") &&
        !redirectRaw.startsWith("//")
          ? redirectRaw
          : null;
      if (redirectTo) {
        router.push(redirectTo);
        router.refresh();
        return;
      }
    }

    setSignupDone(true);
  }

  async function handleForgotPassword() {
    setError(null);
    setResetMessage(null);
    if (!loginEmail.trim()) {
      setError("Vul je e-mailadres in om een resetlink te ontvangen.");
      return;
    }
    setLoading(true);
    const origin = window.location.origin;
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      loginEmail.trim(),
      { redirectTo: `${origin}/auth` },
    );
    setLoading(false);
    if (resetError) {
      setError(resetError.message);
      return;
    }
    setResetMessage(
      "Als dit e-mailadres bij ons bekend is, ontvang je zo een resetlink.",
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />

      <main className="mx-auto max-w-md px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-center text-2xl font-bold tracking-tight text-ink">
          Welkom bij bookadj
        </h1>
        <p className="mt-2 text-center text-sm text-ink-secondary">
          Log in of maak een account aan.
        </p>

        <div
          className="mt-8 flex rounded-lg border border-line bg-surface-muted p-1"
          role="tablist"
          aria-label="Inloggen of aanmelden"
        >
          <button
            type="button"
            role="tab"
            aria-selected={tab === "login"}
            onClick={() => {
              setTab("login");
              setError(null);
              setFieldErrors({});
              setResetMessage(null);
              setSignupDone(false);
            }}
            className={`flex-1 rounded-md py-2.5 text-sm font-semibold transition-colors ${
              tab === "login"
                ? "bg-surface text-ink shadow-sm"
                : "text-ink-secondary hover:text-ink"
            }`}
          >
            Inloggen
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "signup"}
            onClick={() => {
              setTab("signup");
              setError(null);
              setFieldErrors({});
              setResetMessage(null);
            }}
            className={`flex-1 rounded-md py-2.5 text-sm font-semibold transition-colors ${
              tab === "signup"
                ? "bg-surface text-ink shadow-sm"
                : "text-ink-secondary hover:text-ink"
            }`}
          >
            Aanmelden
          </button>
        </div>

        {error ? (
          <p
            className="mt-6 rounded-lg border border-danger/35 bg-danger/10 px-3 py-2 text-sm text-danger"
            role="alert"
          >
            {error}
          </p>
        ) : null}
        {resetMessage ? (
          <p
            className="mt-6 rounded-lg border border-bookadj/25 bg-bookadj/10 px-3 py-2 text-sm text-ink"
            role="status"
          >
            {resetMessage}
          </p>
        ) : null}

        {tab === "login" ? (
          <form
            className="mt-6 space-y-4"
            onSubmit={handleLogin}
            noValidate
          >
            <div>
              <label
                htmlFor="login-email"
                className="block text-sm font-medium text-ink-secondary"
              >
                E-mailadres
              </label>
              <input
                id="login-email"
                name="email"
                type="email"
                autoComplete="email"
                value={loginEmail}
                onChange={(e) => {
                  setLoginEmail(e.target.value);
                  setFieldErrors((p) => {
                    const n = { ...p };
                    delete n.loginEmail;
                    return n;
                  });
                }}
                className="input-field mt-1.5"
                placeholder="naam@voorbeeld.nl"
              />
              {fieldErrors.loginEmail ? (
                <p className="mt-1.5 text-sm text-danger" role="alert">
                  {fieldErrors.loginEmail}
                </p>
              ) : null}
            </div>
            <div>
              <label
                htmlFor="login-password"
                className="block text-sm font-medium text-ink-secondary"
              >
                Wachtwoord
              </label>
              <input
                id="login-password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={loginPassword}
                onChange={(e) => {
                  setLoginPassword(e.target.value);
                  setFieldErrors((p) => {
                    const n = { ...p };
                    delete n.loginPassword;
                    return n;
                  });
                }}
                className="input-field mt-1.5"
                placeholder="••••••••"
              />
              {fieldErrors.loginPassword ? (
                <p className="mt-1.5 text-sm text-danger" role="alert">
                  {fieldErrors.loginPassword}
                </p>
              ) : null}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="h-11 min-h-[44px] w-full rounded-lg bg-bookadj py-3 text-sm font-semibold text-white transition-colors hover:bg-bookadj-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Bezig…" : "Inloggen"}
            </button>
            <p className="text-center">
              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={loading}
                className="text-sm font-medium text-ink-secondary underline-offset-2 hover:text-ink hover:underline disabled:opacity-60"
              >
                Wachtwoord vergeten?
              </button>
            </p>
          </form>
        ) : signupDone ? (
          <div
            className="mt-8 rounded-2xl border border-bookadj/25 bg-bookadj/10 px-6 py-8 text-center"
            role="status"
          >
            <p className="text-lg font-semibold text-ink">
              Check je e-mail
            </p>
            <p className="mt-2 text-sm text-ink-secondary">
              We hebben je een bevestigingslink gestuurd. Open je inbox om je
              account te activeren.
            </p>
            <button
              type="button"
              onClick={() => {
                setSignupDone(false);
                setFullName("");
                setSignupEmail("");
                setSignupPassword("");
                setTab("login");
              }}
              className="mt-6 text-sm font-medium text-bookadj underline-offset-2 hover:underline"
            >
              Terug naar inloggen
            </button>
          </div>
        ) : (
          <form
            className="mt-6 space-y-4"
            onSubmit={handleSignup}
            noValidate
          >
            <div>
              <label
                htmlFor="full-name"
                className="block text-sm font-medium text-ink-secondary"
              >
                Volledige naam
              </label>
              <input
                id="full-name"
                name="full_name"
                type="text"
                autoComplete="name"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  setFieldErrors((p) => {
                    const n = { ...p };
                    delete n.signupName;
                    return n;
                  });
                }}
                className="input-field mt-1.5"
                placeholder="Jan Jansen"
              />
              {fieldErrors.signupName ? (
                <p className="mt-1.5 text-sm text-danger" role="alert">
                  {fieldErrors.signupName}
                </p>
              ) : null}
            </div>
            <div>
              <label
                htmlFor="signup-email"
                className="block text-sm font-medium text-ink-secondary"
              >
                E-mailadres
              </label>
              <input
                id="signup-email"
                name="email"
                type="email"
                autoComplete="email"
                value={signupEmail}
                onChange={(e) => {
                  setSignupEmail(e.target.value);
                  setFieldErrors((p) => {
                    const n = { ...p };
                    delete n.signupEmail;
                    return n;
                  });
                }}
                className="input-field mt-1.5"
                placeholder="naam@voorbeeld.nl"
              />
              {fieldErrors.signupEmail ? (
                <p className="mt-1.5 text-sm text-danger" role="alert">
                  {fieldErrors.signupEmail}
                </p>
              ) : null}
            </div>
            <div>
              <label
                htmlFor="signup-password"
                className="block text-sm font-medium text-ink-secondary"
              >
                Wachtwoord
              </label>
              <input
                id="signup-password"
                name="password"
                type="password"
                autoComplete="new-password"
                value={signupPassword}
                onChange={(e) => {
                  setSignupPassword(e.target.value);
                  setFieldErrors((p) => {
                    const n = { ...p };
                    delete n.signupPassword;
                    return n;
                  });
                }}
                className="input-field mt-1.5"
                placeholder="Minimaal 6 tekens"
              />
              {fieldErrors.signupPassword ? (
                <p className="mt-1.5 text-sm text-danger" role="alert">
                  {fieldErrors.signupPassword}
                </p>
              ) : null}
            </div>
            <div>
              <span
                id="role-label"
                className="block text-sm font-medium text-ink-secondary"
              >
                Ik ben een
              </span>
              <div
                className="mt-2 grid grid-cols-2 gap-2"
                role="group"
                aria-labelledby="role-label"
              >
                <label className="flex cursor-pointer items-center justify-center rounded-lg border border-line bg-surface px-3 py-2.5 text-sm font-medium has-[:checked]:border-bookadj has-[:checked]:bg-bookadj/5">
                  <input
                    type="radio"
                    name="role"
                    value="klant"
                    checked={role === "klant"}
                    onChange={() => setRole("klant")}
                    className="sr-only"
                  />
                  Klant
                </label>
                <label className="flex cursor-pointer items-center justify-center rounded-lg border border-line bg-surface px-3 py-2.5 text-sm font-medium has-[:checked]:border-bookadj has-[:checked]:bg-bookadj/5">
                  <input
                    type="radio"
                    name="role"
                    value="dj"
                    checked={role === "dj"}
                    onChange={() => setRole("dj")}
                    className="sr-only"
                  />
                  DJ
                </label>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="h-11 min-h-[44px] w-full rounded-lg bg-bookadj py-3 text-sm font-semibold text-white transition-colors hover:bg-bookadj-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Bezig…" : "Aanmelden"}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
