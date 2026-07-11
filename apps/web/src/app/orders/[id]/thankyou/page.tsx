'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Star, CheckCircle2, Coffee } from 'lucide-react';
import { motion } from 'framer-motion';

const StarRating = ({ value, onChange, label }: { value: number, onChange: (v: number) => void, label: string }) => {
  return (
    <div className="mb-4">
      <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{label}</p>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              star <= value ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Star className={`w-5 h-5 ${star <= value ? 'fill-amber-500' : ''}`} />
          </button>
        ))}
      </div>
    </div>
  );
};

export default function ThankYouPage() {
  const params = useParams();
  const router = useRouter();
  const [productRating, setProductRating] = useState(0);
  const [serviceRating, setServiceRating] = useState(0);
  const [atmosphereRating, setAtmosphereRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post(`/orders/${params.id}/feedback`, {
        productRating,
        serviceRating,
        atmosphereRating,
        comment,
      });
      setSubmitted(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold font-display text-slate-900 dark:text-white mb-2">Thank You!</h1>
          <p className="text-slate-600 dark:text-slate-400 mb-8">We appreciate your feedback and hope to see you again soon.</p>
          <button 
            onClick={() => router.push('/')}
            className="bg-brand-600 hover:bg-brand-700 text-white font-medium py-3 px-8 rounded-xl transition-colors"
          >
            Return to Home
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center p-4 pt-12">
      <div className="w-20 h-20 bg-brand-100 dark:bg-brand-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <Coffee className="w-10 h-10 text-brand-600 dark:text-brand-400" />
      </div>
      <h1 className="text-3xl font-bold font-display text-slate-900 dark:text-white text-center mb-2">Order Complete!</h1>
      <p className="text-slate-600 dark:text-slate-400 text-center mb-8 max-w-sm">
        We hope you enjoyed your time at {process.env.NEXT_PUBLIC_BRAND_NAME || "Cold 'N Brew"}. How was your experience?
      </p>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-6 shadow-xl border border-slate-200 dark:border-slate-800">
        <StarRating label="Product Quality (Food & Drinks)" value={productRating} onChange={setProductRating} />
        <StarRating label="Service Speed & Friendliness" value={serviceRating} onChange={setServiceRating} />
        <StarRating label="Atmosphere & Cleanliness" value={atmosphereRating} onChange={setAtmosphereRating} />

        <div className="mt-6 mb-8">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Any additional comments?</label>
          <textarea 
            rows={3}
            value={comment}
            onChange={e => setComment(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
            placeholder="Tell us what you loved or what we can improve..."
          />
        </div>

        <button 
          type="submit"
          disabled={loading || productRating === 0 || serviceRating === 0 || atmosphereRating === 0}
          className="w-full bg-brand-600 hover:bg-brand-500 text-white font-medium py-3 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? 'Submitting...' : 'Submit Feedback'}
        </button>
        
        <button 
          type="button"
          onClick={() => router.push('/')}
          className="w-full mt-3 text-slate-500 font-medium py-3 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
        >
          Skip for now
        </button>
      </form>
    </div>
  );
}
