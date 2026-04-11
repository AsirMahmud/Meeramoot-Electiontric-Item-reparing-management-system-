"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { login, signup } from "@/lib/api";

type Mode = "login" | "signup";

export default function AuthCard({ mode }: { mode: Mode }) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isSignup = mode === "signup";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isSignup) {
        if (!form.name.trim()) throw new Error("Full name is required.");
        if (!form.username.trim()) throw new Error("Username is required.");
        if (!form.email.trim()) throw new Error("Email is required.");
        if (!form.phone.trim()) throw new Error("Phone number is required.");
        if (!form.password) throw new Error("Password is required.");
        if (form.password !== form.confirm) throw new Error("Passwords do not match.");

        const data = await signup({
          name: form.name.trim(),
          username: form.username.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          password: form.password,
        });

        localStorage.setItem("meramot.token", data.token);
        localStorage.setItem("meramot.user", JSON.stringify(data.user));
      } else {
        if (!form.email.trim()) throw new Error("Username or email is required.");
        if (!form.password) throw new Error("Password is required.");

        const data = await login({
          identifier: form.email.trim(),
          password: form.password,
        });

        localStorage.setItem("meramot.token", data.token);
        localStorage.setItem("meramot.user", JSON.stringify(data.user));
      }

      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not authenticate.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-[440px] rounded-[2rem] border border-white/60 bg-white/90 px-8 py-6 shadow-2xl backdrop-blur">
      <div className="mb-4 text-center">
        <div className="mb-3 flex justify-center">
          <Image
            src="/images/meramot.svg"
            alt="Meramot"
            width={160}
            height={48}
            className="h-10 w-auto object-contain"
            priority
          />
        </div>

        <h1 className="text-3xl font-bold leading-tight text-accent-dark">
          {isSignup ? "Create your account" : "Welcome back"}
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          {isSignup
            ? "Sign up to request repairs, compare shops, and save viewed items."
            : "Log in to continue to your customer dashboard."}
        </p>
      </div>

      <form className="space-y-3" onSubmit={handleSubmit}>
        {isSignup && (
          <>
            <input
              className="w-full rounded-2xl border border-border px-4 py-2.5 text-sm"
              placeholder="Full name"
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            />

            <input
              className="w-full rounded-2xl border border-border px-4 py-2.5 text-sm"
              placeholder="Username"
              value={form.username}
              onChange={(event) => setForm((prev) => ({ ...prev, username: event.target.value }))}
            />
          </>
        )}

        <input
          className="w-full rounded-2xl border border-border px-4 py-2.5 text-sm"
          type={isSignup ? "email" : "text"}
          placeholder={isSignup ? "Email" : "Username or email"}
          value={form.email}
          onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
        />

        {isSignup && (
          <input
            className="w-full rounded-2xl border border-border px-4 py-2.5 text-sm"
            type="tel"
            placeholder="Phone number"
            value={form.phone}
            onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
          />
        )}

        <input
          className="w-full rounded-2xl border border-border px-4 py-2.5 text-sm"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
        />

        {isSignup && (
          <input
            className="w-full rounded-2xl border border-border px-4 py-2.5 text-sm"
            type="password"
            placeholder="Confirm password"
            value={form.confirm}
            onChange={(event) => setForm((prev) => ({ ...prev, confirm: event.target.value }))}
          />
        )}

        {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}

        <button
          disabled={loading}
          className="w-full rounded-2xl bg-accent-dark py-2.5 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Please wait..." : isSignup ? "Sign up" : "Log in"}
        </button>
      </form>

      <div className="my-4 flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">or</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <button
        type="button"
        className="w-full rounded-2xl border border-border bg-mint-50 py-2.5 text-sm font-semibold text-accent-dark shadow-sm"
      >
        Continue with Google
      </button>

      <p className="mt-2 text-center text-[11px] text-muted-foreground">
        Google sign-in will be wired next.
      </p>

      <p className="mt-4 text-center text-sm text-muted-foreground">
        {isSignup ? "Already have an account?" : "Need an account?"}{" "}
        <Link
          href={isSignup ? "/login" : "/signup"}
          className="font-semibold text-accent-dark underline underline-offset-4"
        >
          {isSignup ? "Log in" : "Sign up"}
        </Link>
      </p>
    </div>
  );
}