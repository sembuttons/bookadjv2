"use client";

import { useState } from "react";

const ONDERWERPEN = [
  "Boeking",
  "Betaling",
  "Technisch probleem",
  "Anders",
] as const;

const inputCls = "input-field mt-2";
const labelCls = "text-sm font-semibold text-white";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [onderwerp, setOnderwerp] = useState<string>(ONDERWERPEN[0]);
  const [bericht, setBericht] = useState("");
  const [gotcha, setGotcha] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "err">(
    "idle",
  );
  const [errMsg, setErrMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrMsg(null);
    setStatus("sending");
    try {
      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "contact_form",
          name: name.trim(),
          email: email.trim(),
          onderwerp,
          bericht: bericht.trim(),
          _gotcha: gotcha,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setErrMsg(data.error ?? "Versturen mislukt.");
        setStatus("err");
        return;
      }
      setStatus("ok");
      setName("");
      setEmail("");
      setOnderwerp(ONDERWERPEN[0]);
      setBericht("");
    } catch {
      setErrMsg("Netwerkfout. Probeer het later opnieuw.");
      setStatus("err");
    }
  }

  if (status === "ok") {
    return (
      <div
        className="rounded-xl border border-green-500/25 bg-green-500/10 px-5 py-6 text-white"
        role="status"
      >
        <p className="font-semibold">Bedankt! Je bericht is verstuurd.</p>
        <p className="mt-2 text-sm text-gray-400">
          We reageren zo snel mogelijk op{" "}
          <span className="font-medium">hallo@bookadj.nl</span>.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-4 text-sm font-semibold text-green-500 underline-offset-2 hover:underline"
        >
          Nog een bericht sturen
        </button>
      </div>
    );
  }

  return (
    <form
      noValidate
      onSubmit={(e) => void onSubmit(e)}
      className="space-y-5 rounded-2xl border border-gray-800 bg-[#111827] p-6 shadow-sm sm:p-8"
    >
      <input
        type="text"
        name="_gotcha"
        value={gotcha}
        onChange={(e) => setGotcha(e.target.value)}
        className="absolute -left-[9999px] h-0 w-0 opacity-0"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
      />

      {errMsg ? (
        <p
          className="rounded-lg border border-red-500/35 bg-red-500/10 px-3 py-2 text-sm text-red-400"
          role="alert"
        >
          {errMsg}
        </p>
      ) : null}

      <label className="block">
        <span className={labelCls}>Naam</span>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputCls}
          autoComplete="name"
        />
      </label>

      <label className="block">
        <span className={labelCls}>E-mail</span>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputCls}
          autoComplete="email"
        />
      </label>

      <label className="block">
        <span className={labelCls}>Onderwerp</span>
        <select
          value={onderwerp}
          onChange={(e) => setOnderwerp(e.target.value)}
          className={inputCls}
        >
          {ONDERWERPEN.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className={labelCls}>Bericht</span>
        <textarea
          required
          rows={6}
          value={bericht}
          onChange={(e) => setBericht(e.target.value)}
          className={inputCls}
          placeholder="Beschrijf je vraag of probleem…"
        />
      </label>

      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full rounded-lg bg-green-500 px-5 py-3 text-sm font-bold text-black transition-colors hover:bg-green-400 disabled:opacity-50 sm:w-auto"
      >
        {status === "sending" ? "Versturen…" : "Verstuur bericht"}
      </button>
    </form>
  );
}
