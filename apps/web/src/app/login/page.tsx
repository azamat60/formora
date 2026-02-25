"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import {
  ApiError,
  getGoogleAuthUrl,
  loginWithEmail,
  registerWithEmail,
} from "@/lib/api-client";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function validateForm(): string | null {
    const normalizedEmail = email.trim();
    if (!normalizedEmail) {
      return "Email is required.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return "Please enter a valid email address.";
    }

    if (!password) {
      return "Password is required.";
    }

    if (mode === "register") {
      if (name.trim().length < 2) {
        return "Full name must be at least 2 characters.";
      }

      if (password.length < 8) {
        return "Password must be at least 8 characters.";
      }

      const hasUpper = /[A-Z]/.test(password);
      const hasLower = /[a-z]/.test(password);
      const hasNumber = /\d/.test(password);
      if (!hasUpper || !hasLower || !hasNumber) {
        return "Password must contain uppercase, lowercase, and a number.";
      }
    }

    return null;
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    setIsSubmitting(true);

    try {
      if (mode === "login") {
        await loginWithEmail({ email: email.trim(), password });
      } else {
        await registerWithEmail({
          email: email.trim(),
          password,
          name: name.trim() || undefined,
        });
      }
      router.replace("/");
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Authentication failed. Check your credentials and try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-10 sm:px-6">
      <section className="mx-auto w-full max-w-md rounded-3xl border border-line/80 bg-white p-7 shadow-soft sm:p-9">
        <div className="mb-6 flex items-center gap-3">
          <Image
            src="/logo.svg"
            alt="Formora"
            width={36}
            height={36}
            priority
          />
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
              Formora
            </p>
            <h1 className="text-2xl font-semibold leading-tight text-zinc-900">
              {mode === "login" ? "Welcome back" : "Create your account"}
            </h1>
          </div>
        </div>

        <p className="mb-5 text-sm text-zinc-600">
          {mode === "login"
            ? "Sign in to continue building forms and collecting responses."
            : "Start with your email or use Google for instant access."}
        </p>

        <button
          type="button"
          onClick={() => {
            window.location.href = getGoogleAuthUrl();
          }}
          className="mb-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-line bg-white text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
        >
          <Image src="/google.svg" alt="Google" width={20} height={20} />
          Continue with Google
        </button>

        <div className="mb-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-line" />
          <span className="text-xs uppercase tracking-[0.16em] text-zinc-500">
            or
          </span>
          <div className="h-px flex-1 bg-line" />
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {mode === "register" ? (
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-zinc-700">
                Full name
              </span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="John Doe"
                autoComplete="name"
                className="h-11 w-full rounded-xl border border-line bg-white px-3 text-sm outline-none transition focus:border-zinc-500"
              />
            </label>
          ) : null}

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-zinc-700">
              Email
            </span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@company.com"
              autoComplete="email"
              required
              className="h-11 w-full rounded-xl border border-line bg-white px-3 text-sm outline-none transition focus:border-zinc-500"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-zinc-700">
              Password
            </span>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                autoComplete={
                  mode === "login" ? "current-password" : "new-password"
                }
                required
                minLength={8}
                className="h-11 w-full rounded-xl border border-line bg-white px-3 pr-10 text-sm outline-none transition focus:border-zinc-500"
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((current) => !current)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 transition hover:text-zinc-800"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {mode === "register" ? (
              <span className="mt-1.5 block text-xs text-zinc-500">
                Use 8+ chars with uppercase, lowercase, and a number.
              </span>
            ) : null}
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="h-11 w-full rounded-xl bg-zinc-900 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting
              ? "Please wait..."
              : mode === "login"
                ? "Sign in"
                : "Create account"}
          </button>
        </form>

        <p className="mt-5 text-sm text-zinc-600">
          {mode === "login" ? "No account yet?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() => setMode(mode === "login" ? "register" : "login")}
            className="font-semibold text-zinc-900 underline-offset-4 hover:underline"
          >
            {mode === "login" ? "Register" : "Login"}
          </button>
        </p>

        {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}
      </section>
    </main>
  );
}
