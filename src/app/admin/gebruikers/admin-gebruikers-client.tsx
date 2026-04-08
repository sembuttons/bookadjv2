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
    return "bg-purple-500/20 text-purple-200 ring-purple-500/40";
  if (r === "dj") return "bg-green-500/20 text-green-200 ring-green-500/40";
  return "bg-blue-500/20 text-blue-200 ring-blue-500/40";
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
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Gebruikers
        </h1>
        <p className="mt-1 text-sm text-gray-400">
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
                  ? "bg-green-500/20 text-green-300 ring-1 ring-green-500/40"
                  : "bg-[#111827] text-gray-400 ring-1 ring-gray-800 hover:text-white"
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
          className="w-full max-w-md rounded-xl border border-gray-800 bg-[#111827] px-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-green-500/50 focus:outline-none focus:ring-2 focus:ring-green-500/20"
        />
      </div>

      {error ? (
        <p className="rounded-lg border border-red-500/35 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="text-gray-400">Laden…</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-800 bg-[#0f172a]">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-xs font-semibold uppercase tracking-wide text-gray-500">
                <th className="px-4 py-3">Naam</th>
                <th className="px-4 py-3">E-mail</th>
                <th className="px-4 py-3">Rol</th>
                <th className="px-4 py-3">Aangemaakt</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Acties</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
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
                    <tr key={u.id} className="text-gray-200">
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium text-white">
                            {displayName(u)}
                          </span>
                          {suspended ? (
                            <span className="rounded-full bg-red-500/25 px-2 py-0.5 text-[10px] font-bold uppercase text-red-200 ring-1 ring-red-500/40">
                              Geschorst
                            </span>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-400">
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
                          <span className="text-red-300">Opgeschort</span>
                        ) : (
                          <span className="text-green-300">Actief</span>
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
                            className="rounded-lg bg-gray-800 px-2 py-1.5 text-xs font-semibold text-white ring-1 ring-gray-700 hover:bg-gray-700 disabled:opacity-50"
                          >
                            {suspended ? "Activeer account" : "Schors account"}
                          </button>
                          <button
                            type="button"
                            disabled={!!actingId || isSelf}
                            onClick={() => setDeleteTarget(u)}
                            className="rounded-lg bg-red-900/40 px-2 py-1.5 text-xs font-semibold text-red-200 ring-1 ring-red-800 hover:bg-red-900/60 disabled:opacity-50"
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
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-gray-800 bg-[#0f172a] p-6 shadow-xl">
            <h2 className="text-lg font-bold text-white">Account verwijderen</h2>
            <p className="mt-3 text-sm text-gray-300">
              Weet je zeker dat je dit account wilt verwijderen? Dit kan niet
              ongedaan worden gemaakt.
            </p>
            <p className="mt-2 text-sm font-semibold text-amber-200">
              {displayName(deleteTarget)} ({deleteTarget.email})
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="rounded-xl px-4 py-2 text-sm font-semibold text-gray-300 hover:bg-gray-800"
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
