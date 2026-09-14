'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@warkop-yareh/ui';
import { Input } from '@warkop-yareh/ui';
import { useAuthStore } from '@/stores/auth.store';
import { api } from '@/lib/api';
import { Coffee, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const brandName = process.env.NEXT_PUBLIC_BRAND_NAME || 'Our Store';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      const { accessToken, user } = response.data.data;
      
      setAuth(user, accessToken);
      const params = new URLSearchParams(window.location.search);
      const requestedPath = params.get('returnTo') ?? params.get('redirect_url');
      const safePath =
        requestedPath?.startsWith('/') && !requestedPath.startsWith('//')
          ? requestedPath
          : '/';
      router.replace(safePath);
    } catch (err: unknown) {
      const errorMsg = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message;
      setError(errorMsg || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="h-14 w-14 bg-brand-600 rounded-2xl flex items-center justify-center shadow-lg shadow-brand-500/20">
            <Coffee className="h-8 w-8 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-display font-bold tracking-tight text-slate-900 dark:text-white">
          Welcome back
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
          Sign in to your {brandName} account
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 py-8 px-4 shadow-xl shadow-slate-200/50 dark:shadow-none sm:rounded-2xl sm:px-10 border border-slate-100 dark:border-slate-800"
        >
          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Email address
              </label>
              <div className="mt-2 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <Input
                  id="login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="login-password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Password
              </label>
              <div className="mt-2 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <Input
                  id="login-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-500/20 h-11"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-800" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-slate-900 text-slate-500">
                  Or login with
                </span>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <a
                href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}/auth/google`}
                className="w-full block"
                id="google-login-button"
              >
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-11 border-slate-200 dark:border-slate-800 font-medium flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  Masuk dengan Google
                </Button>
              </a>

              <Link href="/otp" className="w-full block">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-11 border-slate-200 dark:border-slate-800 font-medium"
                >
                  <Mail className="h-5 w-5 mr-2 text-slate-500" />
                  Email Magic Link (OTP)
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>

        <p className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-medium text-brand-600 hover:text-brand-500 flex items-center justify-center gap-1 mt-2">
            Create account <ArrowRight className="h-4 w-4" />
          </Link>
        </p>
      </div>
    </div>
  );
}
