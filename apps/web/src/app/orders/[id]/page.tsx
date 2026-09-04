"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function OrderRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const id = (params?.id as string) || "YRH-8492";

  useEffect(() => {
    if (id) {
      router.replace(`/order/track/${id}`);
    }
  }, [id, router]);

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white flex items-center justify-center">
      <div className="w-6 h-6 rounded-full border-2 border-[#f59e0b] border-t-transparent animate-spin" />
    </div>
  );
}
