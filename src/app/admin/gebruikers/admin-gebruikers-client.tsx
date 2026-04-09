"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase-browser";

type UserRow = {
  id: string;
  full_name?: string | null;
  email?: string | null;
  role?: string | null;
  created_at?: string | null;
  is_suspended?: boolean | null;
};

function displayName(u: UserRow): string {
  const n = u.full_name?.trim();
  if (n) return n;
  const em = u.email?.trim() || "";
  if (em) return em.split("@")[0] || em;
  return "-";
}

function roleBadge(role: string | null | undefined) {
  const r = (role ?? "").toLowerCase();
  if (r === "admin")
    return "bg-purple-100 text-purple-800 ring-purple-200";
  if (r === "dj") return "bg-green-100 text-green-800 ring-green-200";
  return "bg-blue-100 text-blue-800 ring-blue-200";
}

function roleLabel(role: string | null | undefined): string {
  const r = (role ?? "").toLowerCase();
  if (r === "customer") return "klant";
  if (r === "klant" || r === "dj" || r === "admin") return r;
  return r || "-";
}

function selectRoleValue(role: string | null | undefined): "klant" | "dj" | "admin" {
  const r = roleLabel(role);
  if (r === "dj" || r === "admin") return r;
  return "klant";
}

type RoleFilter = "all" | "klant" | "dj" | "admin" | "suspended";

export function AdminGebruikersClient() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [selfId, setSelfId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<RoleFilter>("all");
  const [actingId, setActingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserRow | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.access_token) {
      setError("Geen sessie.");
      setLoading(false);
      return;
    }
    setSelfId(session.user.id);
    const res = await fetch("/api/admin/users", {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    const json = (await res.json()) as { error?: string; users?: UserRow[] };
    if (!res.ok) {
      setError(json.error ?? "Laden mislukt.");
      setUsers([]);
    } else {
      setUsers(json.users ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      const r = roleLabel(u.role);
      if (filter === "klant" && r !== "klant") return false;
      if (filter === "dj" && r !== "dj") return false;
      if (filter === "admin" && r !== "admin") return false;
      if (filter === "suspended" && !u.is_suspended) return false;
      if (!q) return true;
      const name = displayName(u).toLowerCase();
      const em = (u.email ?? "").toLowerCase();
      return name.includes(q) || em.includes(q);
    });
  }, [users, filter, search]);

  const patchUser = async (id: string, body: Record<string, unknown>) => {
    setActingId(id);
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.access_token) {
      setActingId(null);
      return;
    }
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(body),
    });
    setActingId(null);
    if (res.ok) await load();
    else {
      const j = (await res.json()) as { error?: string };
      setError(j.error ?? "Actie mislukt.");
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    setActingId(id);
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.access_token) {
      setActingId(null);
      return;
    }
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    setActingId(null);
    setDeleteTarget(null);
    if (res.ok) await load();
    else {
      const j = (await res.json()) as { error?: string };
      setError(j.error ?? "Verwijderen mislukt.");
    }
  };

  const tabs: { key: RoleFilter; label: string }[] = [
    { key: "all", label: "Alle" },
    { key: "klant", label: "Klanten" },
    { key: "dj", label: "DJ's" },
    { key: "admin", label: "Admins" },
    { key: "suspended", label: "Geschorst" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Gebruikers
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Rollen beheren, accounts schorsen of verwijderen.
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setFilter(t.key)}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                filter === t.key
                  ? "bg-green-100 text-green-800 ring-1 ring-green-300"
                  : "bg-gray-100 text-gray-600 ring-1 ring-gray-200 hover:bg-gray-200 hover:text-slate-900"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Zoek op naam of e-mail…"
          className="w-full max-w-md rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-gray-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
        />
      </div>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="text-gray-500">Laden…</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
                <th className="px-4 py-3">Naam</th>
                <th className="px-4 py-3">E-mail</th>
                <th className="px-4 py-3">Rol</th>
                <th className="px-4 py-3">Aangemaakt</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Acties</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    Geen gebruikers.
                  </td>
                </tr>
              ) : (
                filtered.map((u) => {
                  const rl = roleLabel(u.role);
                  const sel = selectRoleValue(u.role);
                  const suspended = Boolean(u.is_suspended);
                  const isSelf = u.id === selfId;
                  return (
                    <tr key={u.id} className="text-slate-700">
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium text-slate-900">
                            {displayName(u)}
                          </span>
                          {suspended ? (
                            <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold uppercase text-red-700 ring-1 ring-red-200">
                              Geschorst
                            </span>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {u.email ?? "-"}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={sel}
                          disabled={!!actingId || isSelf}
                          onChange={(e) =>
                            void patchUser(u.id, { role: e.target.value })
                          }
                          className={`rounded-lg border-0 px-2 py-1 text-xs font-semibold ring-1 focus:outline-none focus:ring-2 focus:ring-green-500/30 disabled:opacity-50 ${roleBadge(u.role)}`}
                        >
                          <option value="klant">klant</option>
                          <option value="dj">dj</option>
                          <option value="admin">admin</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {u.created_at
                          ? new Date(u.created_at).toLocaleString("nl-NL")
                          : "-"}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {suspended ? (
                          <span className="font-medium text-red-600">Opgeschort</span>
                        ) : (
                          <span className="font-medium text-green-700">Actief</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                          <button
                            type="button"
                            disabled={!!actingId || isSelf}
                            onClick={() =>
                              void patchUser(u.id, {
                                is_suspended: !suspended,
                              })
                            }
                            className="rounded-lg bg-gray-200 px-2 py-1.5 text-xs font-semibold text-slate-900 ring-1 ring-gray-300 hover:bg-gray-300 disabled:opacity-50"
                          >
                            {suspended ? "Activeer account" : "Schors account"}
                          </button>
                          <button
                            type="button"
                            disabled={!!actingId || isSelf}
                            onClick={() => setDeleteTarget(u)}
                            className="rounded-lg bg-red-50 px-2 py-1.5 text-xs font-semibold text-red-700 ring-1 ring-red-200 hover:bg-red-100 disabled:opacity-50"
                          >
                            Verwijder account
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {deleteTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div
            role="presentation"
            className="absolute inset-0"
            onClick={() => setDeleteTarget(null)}
            aria-hidden
          />
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold text-slate-900">Account verwijderen</h2>
            <p className="mt-3 text-sm text-gray-600">
              Weet je zeker dat je dit account wilt verwijderen? Dit kan niet
              ongedaan worden gemaakt.
            </p>
            <p className="mt-2 text-sm font-semibold text-amber-800">
              {displayName(deleteTarget)} ({deleteTarget.email})
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="rounded-xl px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100"
              >
                Annuleren
              </button>
              <button
                type="button"
                disabled={actingId === deleteTarget.id}
                onClick={() => void confirmDelete()}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-500 disabled:opacity-50"
              >
                Verwijderen
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
