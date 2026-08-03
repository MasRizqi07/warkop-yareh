'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth.store';
import { Coffee, Mail, KeyRound, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function OTPPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    try {
      await api.post('/auth/otp/send', { email });
      setStep('code');
      setMessage('A 6-digit code has been sent to your email.');
    } catch (err: unknown) {
      const errorMsg = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message;
      setError(errorMsg || 'Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await api.post('/auth/otp/verify', { email, code });
      
      const { accessToken } = response.data.data;
      
      const meResponse = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      
      setAuth(meResponse.data.data, accessToken);
      router.push('/');
    } catch (err: unknown) {
      const errorMsg = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message;
      setError(errorMsg || 'Invalid or expired OTP code.');
    } finally {
      setIsLoading(false);
    }
  };

  const brandName = process.env.NEXT_PUBLIC_BRAND_NAME || 'Our Store';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="h-14 w-14 bg-brand-600 rounded-2xl flex items-center justify-center shadow-lg shadow-brand-500/20">
            <Coffee className="h-8 w-8 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-display font-bold tracking-tight text-slate-900 dark:text-white">
          Passwordless Login
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
          Sign in instantly to {brandName} using an OTP code
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 py-8 px-4 shadow-xl shadow-slate-200/50 dark:shadow-none sm:rounded-2xl sm:px-10 border border-slate-100 dark:border-slate-800"
        >
          {error && (
            <div className="mb-6 p-3 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {message && (
            <div className="mb-6 p-3 rounded-lg bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-900 flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
              <p className="text-sm text-green-600 dark:text-green-400">{message}</p>
            </div>
          )}

          {step === 'email' ? (
            <form className="space-y-6" onSubmit={handleSendOtp}>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Email address
                </label>
                <div className="mt-2 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <Input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-500/20 h-11"
                disabled={isLoading}
              >
                {isLoading ? 'Sending Code...' : 'Send Magic Code'}
              </Button>
            </form>
          ) : (
            <form className="space-y-6" onSubmit={handleVerifyOtp}>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  6-Digit OTP Code
                </label>
                <div className="mt-2 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <KeyRound className="h-5 w-5 text-slate-400" />
                  </div>
                  <Input
                    type="text"
                    required
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                    className="pl-10 text-center tracking-widest text-lg font-mono"
                    placeholder="------"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-500/20 h-11"
                disabled={isLoading || code.length !== 6}
              >
                {isLoading ? 'Verifying...' : 'Verify & Sign In'}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setStep('email')}
                  className="text-sm font-medium text-brand-600 hover:text-brand-500"
                >
                  Use a different email
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
}
