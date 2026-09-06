'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, ArrowRight, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { BrandEmblem } from '@warkop-yareh/ui';
import { adminLogin } from '@/lib/api';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await adminLogin(email.trim(), password);
      const destination = new URLSearchParams(window.location.search).get(
        'redirect_url',
      );
      router.replace(destination?.startsWith('/') ? destination : '/');
      router.refresh();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Unable to sign in. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0a0a0c] px-4 py-12 text-[#e5e1e4]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(156,107,58,0.18),transparent_32%),radial-gradient(circle_at_80%_80%,rgba(245,158,11,0.10),transparent_35%)]" />
      <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-[#111114]/95 p-6 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-9">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#9c6b3a] text-white shadow-lg shadow-[#9c6b3a]/20">
            <BrandEmblem className="h-7 w-7" />
          </div>
          <div>
            <p className="font-heading text-lg font-extrabold tracking-tight text-white">
              Warkop Ya&apos;reh
            </p>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#f59e0b]">
              Enterprise Admin
            </p>
          </div>
        </div>

        <div className="mb-7">
          <h1 className="font-heading text-3xl font-bold tracking-tight text-white">
            Welcome back
          </h1>
          <p className="mt-2 text-sm leading-6 text-[#94a3b8]">
            Sign in with an authorized staff account to continue.
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          {error && (
            <div
              className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300"
              role="alert"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#cbd5e1]">
              Email
            </span>
            <span className="relative block">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748b]" />
              <input
                autoComplete="email"
                className="h-12 w-full rounded-xl border border-white/10 bg-[#18181c] pl-10 pr-4 text-sm text-white outline-none transition focus:border-[#9c6b3a] focus:ring-2 focus:ring-[#9c6b3a]/30"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="staff@warkopyareh.com"
                required
                type="email"
                value={email}
              />
            </span>
          </label>

          <div>
            <label
              className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#cbd5e1]"
              htmlFor="admin-password"
            >
              Password
            </label>
            <span className="relative block">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748b]" />
              <input
                autoComplete="current-password"
                className="h-12 w-full rounded-xl border border-white/10 bg-[#18181c] pl-10 pr-12 text-sm text-white outline-none transition focus:border-[#9c6b3a] focus:ring-2 focus:ring-[#9c6b3a]/30"
                id="admin-password"
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                required
                type={showPassword ? 'text' : 'password'}
                value={password}
              />
              <button
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-[#64748b] transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9c6b3a]"
                onClick={() => setShowPassword((visible) => !visible)}
                type="button"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </span>
          </div>

          <button
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#9c6b3a] px-4 text-sm font-bold text-white shadow-lg shadow-[#9c6b3a]/20 transition hover:bg-[#b07b45] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f59e0b] focus-visible:ring-offset-2 focus-visible:ring-offset-[#111114] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? 'Signing in…' : 'Sign in to terminal'}
            {!isSubmitting && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>

        <p className="mt-6 text-center text-xs leading-5 text-[#64748b]">
          Access is restricted to authorized staff, managers, administrators,
          and owners.
        </p>
      </div>
    </main>
  );
}
