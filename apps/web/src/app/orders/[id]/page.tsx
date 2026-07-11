"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { IconCoffee, IconCheck, IconTimer, IconStore } from "@/lib/icons";

import { io, Socket } from "socket.io-client";
import { api } from "@/lib/api";

type OrderStatus = "PENDING" | "PREPARING" | "READY" | "COMPLETED";

interface StatusTimelineItem {
  status: OrderStatus;
  label: string;
  description: string;
  icon: React.ElementType;
}

const TIMELINE: StatusTimelineItem[] = [
  { status: "PENDING", label: "Order Received", description: "Waiting for confirmation", icon: IconTimer },
  { status: "PREPARING", label: "Preparing", description: "Brewing your coffee", icon: IconCoffee },
  { status: "READY", label: "Ready for Pickup", description: "Your order is waiting at the counter", icon: IconStore },
  { status: "COMPLETED", label: "Completed", description: "Enjoy your drink!", icon: IconCheck },
];

export default function OrderTrackingPage() {
  const params = useParams();
  const id = params.id as string;
  
  const [currentStatusIndex, setCurrentStatusIndex] = useState(0);

  useEffect(() => {
    if (!id) return;

    // 1. Fetch initial status
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/orders/${id}`);
        const status = res.data.data.status as OrderStatus;
        const index = TIMELINE.findIndex(t => t.status === status);
        if (index !== -1) setCurrentStatusIndex(index);
      } catch (err) {
        console.error("Failed to fetch order", err);
      }
    };
    fetchOrder();

    // 2. Connect to WebSocket
    const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:3001';
    const socket: Socket = io(apiUrl);

    socket.on("connect", () => {
      socket.emit("joinOrder", { orderId: id });
    });

    socket.on("order.updated", (order: any) => {
      const index = TIMELINE.findIndex(t => t.status === order.status);
      if (index !== -1) setCurrentStatusIndex(index);
    });

    return () => {
      socket.emit("leaveRoom", { room: `order:${id}` });
      socket.disconnect();
    };
  }, [id]);

  return (
    <div className="bg-background text-on-background min-h-screen pb-32 pt-24 px-4">
      <div className="fixed inset-0 organic-noise pointer-events-none z-[-1] opacity-30"></div>

      <main className="max-w-xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface">Track Order</h1>
          <p className="font-receipt-label text-primary uppercase">Order #{id?.toUpperCase()}</p>
        </div>

        <div className="glass-card rounded-3xl p-8 space-y-8">
          <div className="relative">
            {/* Connecting line */}
            <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-surface-container-highest"></div>
            <div 
              className="absolute left-6 top-6 w-0.5 bg-primary transition-all duration-1000 ease-in-out"
              style={{ 
                height: `${(currentStatusIndex / (TIMELINE.length - 1)) * 100}%` 
              }}
            ></div>

            <div className="space-y-8 relative">
              {TIMELINE.map((item, index) => {
                const isCompleted = index <= currentStatusIndex;
                const isCurrent = index === currentStatusIndex;
                const Icon = item.icon;

                return (
                  <div key={item.status} className="flex gap-6 items-start">
                    <div 
                      className={`w-12 h-12 rounded-full border-2 flex items-center justify-center shrink-0 bg-background relative z-10 transition-colors duration-500 ${
                        isCompleted 
                          ? "border-primary text-primary" 
                          : "border-surface-container-highest text-on-surface-variant/50"
                      } ${isCurrent ? "shadow-[0_0_15px_rgba(212,175,55,0.3)] bg-primary/10" : ""}`}
                    >
                      <Icon size={24} />
                    </div>
                    <div className={`pt-2 transition-opacity duration-500 ${isCompleted ? "opacity-100" : "opacity-50"}`}>
                      <h3 className={`font-headline-md ${isCompleted ? "text-on-surface" : "text-on-surface-variant"}`}>
                        {item.label}
                      </h3>
                      <p className="text-sm text-on-surface-variant mt-1">{item.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {currentStatusIndex === TIMELINE.length - 1 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-primary/10 border border-primary/20 rounded-2xl text-center"
          >
            <p className="text-primary font-headline-md">Thank you for your order!</p>
          </motion.div>
        )}
      </main>
    </div>
  );
}
