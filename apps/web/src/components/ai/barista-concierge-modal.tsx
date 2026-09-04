"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Send, Coffee, Plus, Check } from "lucide-react";
import { useCartStore } from "@/stores";
import type { Product } from "@warkop-yareh/types";

interface Message {
  id: string;
  sender: "user" | "barista";
  text: string;
  recommendation?: {
    id: string;
    name: string;
    price: number;
    description: string;
    flavorNotes: string[];
    pairingReason: string;
  };
  snackPairing?: {
    id: string;
    name: string;
    price: number;
    reason: string;
  };
}

const PRESET_CHIPS = [
  { label: "☕ Manis & Creamy", query: "Mau kopi yang manis creamy dan santai" },
  { label: "🍓 Asam Segar Fruity (V60)", query: "Cari manual brew V60 yang fruity dan aromatik" },
  { label: "⚡ Kafein Kuat Begadang", query: "Lagi butuh kafein tinggi dan bold untuk kerja" },
  { label: "🍵 Non-Kopi Segar", query: "Rekomendasi minuman non-kopi yang segar" },
];

function createMessageId(sender: "u" | "b") {
  return `${sender}-${crypto.randomUUID()}`;
}

export function BaristaConciergeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [addedItems, setAddedItems] = useState<Record<string, boolean>>({});

  const { addItem } = useCartStore();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "m0",
      sender: "barista",
      text: "Halo! Saya **Barista AI Warkop Ya'reh**. Ceritakan seleramu atau pilih rekomendasi di bawah ini untuk menemukan racikan dan pairing camilan yang paling pas!",
    },
  ]);

  const handleSend = async (queryText?: string) => {
    const text = queryText || inputMessage;
    if (!text.trim() || loading) return;

    const userMsgId = createMessageId("u");
    setMessages((prev) => [...prev, { id: userMsgId, sender: "user", text }]);
    if (!queryText) setInputMessage("");
    setLoading(true);

    try {
      // 1. Call Barista Chat & Recommend API
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";
      
      const [chatRes, recRes] = await Promise.all([
        fetch(`${apiUrl}/ai/barista-chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: text }),
        }).then((r) => (r.ok ? r.json() : null)).catch(() => null),
        fetch(`${apiUrl}/ai/recommend-pairings`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userQuery: text }),
        }).then((r) => (r.ok ? r.json() : null)).catch(() => null),
      ]);

      const replyText = chatRes?.reply || "Berikut racikan spesial yang paling cocok dengan seleramu hari ini:";
      const primaryRec = recRes?.highlightedProducts?.[0];
      const snackRec = recRes?.pairingSnack;

      const botMsgId = createMessageId("b");
      setMessages((prev) => [
        ...prev,
        {
          id: botMsgId,
          sender: "barista",
          text: replyText,
          recommendation: primaryRec,
          snackPairing: snackRec,
        },
      ]);
    } catch {
      // Fallback
      setMessages((prev) => [
        ...prev,
        {
          id: createMessageId("b"),
          sender: "barista",
          text: "Pilihan terbaik untuk seleramu adalah **Kopi Susu Aren Signature** kami yang creamy dipadu dengan **Tahu Walik Crispy**!",
          recommendation: {
            id: "p1",
            name: "Kopi Susu Aren Signature",
            price: 28000,
            description: "Espresso blend Arabica-Robusta dengan gula aren murni Tuban.",
            flavorNotes: ["Aren", "Creamy", "Caramel"],
            pairingReason: "Rasa manis legit seimbang dengan body espresso mantap.",
          },
          snackPairing: {
            id: "s1",
            name: "Tahu Walik Crispy",
            price: 18000,
            reason: "Gurih renyah sempurna menemani kopi susu.",
          },
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (item: { id: string; name: string; price: number }) => {
    const productItem: Product = {
      id: item.id,
      name: item.name,
      price: item.price,
      description: item.name,
      image: "https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=400",
      category: "coffee",
      tags: ["Specialty", "Concierge"],
      isPopular: true,
      isNew: false,
      rating: 4.9,
      reviewCount: 120,
      preparationTime: 5,
      branchAvailability: ["all"],
    };
    addItem(productItem, 1);
    setAddedItems((prev) => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setAddedItems((prev) => ({ ...prev, [item.id]: false }));
    }, 2000);
  };

  return (
    <>
      {/* Floating Concierge Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-5 py-3.5 rounded-full bg-[var(--accent-fill)] text-[var(--text-on-brand)] font-bold text-xs shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer border border-white/20 min-h-[48px]"
        aria-label="Tanya Barista AI"
      >
        <div className="relative flex items-center justify-center">
          <Sparkles className="w-4 h-4 animate-spin-slow" />
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-white animate-ping" />
        </div>
        <span>Tanya Barista AI</span>
      </button>

      {/* Concierge Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative w-full max-w-lg bg-[var(--bg-surface-raised)] border border-[var(--border-default)] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[85vh] sm:h-[680px] z-10 text-[var(--text-primary)]"
            >
              {/* Header */}
              <div className="p-4 sm:p-5 border-b border-[var(--border-default)] flex items-center justify-between bg-[var(--bg-surface-overlay)]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[var(--accent-fill)] text-[var(--text-on-brand)] flex items-center justify-center shadow-md">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-sm text-[var(--text-primary)] flex items-center gap-1.5">
                      Barista AI Concierge
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-[var(--gold-highlight)]/15 text-[var(--gold-highlight)] border border-[var(--gold-highlight)]/30 uppercase">
                        Active
                      </span>
                    </h3>
                    <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">Konsultasi racikan kopi & pairing camilan</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-9 h-9 rounded-xl hover:bg-[var(--border-default)]/20 flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                  aria-label="Tutup modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Chat Feed */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 no-scrollbar">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                        m.sender === "user"
                          ? "bg-[var(--accent-fill)] text-[var(--text-on-brand)] font-medium rounded-br-none shadow-sm"
                          : "bg-[var(--bg-surface-overlay)] border border-[var(--border-default)] text-[var(--text-primary)] rounded-bl-none shadow-sm"
                      }`}
                    >
                      <p className="whitespace-pre-line">{m.text.replace(/\*\*(.*?)\*\*/g, "$1")}</p>
                    </div>

                    {/* Rich Recommendation Card */}
                    {m.recommendation && (
                      <div className="mt-3 w-full max-w-[92%] bg-[var(--bg-surface-overlay)] border border-[var(--accent-fill)]/30 rounded-2xl p-4 shadow-md space-y-3 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-[var(--accent-fill)]/15 text-[var(--accent-fill)] flex items-center justify-center">
                              <Coffee className="w-4 h-4" />
                            </div>
                            <div>
                              <h4 className="font-bold text-xs text-[var(--text-primary)]">{m.recommendation.name}</h4>
                              <span className="font-mono text-xs font-bold text-[var(--accent-fill)]">
                                Rp {m.recommendation.price.toLocaleString("id-ID")}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleAddToCart(m.recommendation!)}
                            className="px-3 py-1.5 rounded-xl bg-[var(--accent-fill)] text-[var(--text-on-brand)] font-bold text-[10px] flex items-center gap-1 shadow-sm hover:scale-105 active:scale-95 transition-all cursor-pointer min-h-[36px]"
                          >
                            {addedItems[m.recommendation.id] ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Ditambahkan</span>
                              </>
                            ) : (
                              <>
                                <Plus className="w-3.5 h-3.5" />
                                <span>Pesan Ini</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* Flavor Notes Chips */}
                        {m.recommendation.flavorNotes && m.recommendation.flavorNotes.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {m.recommendation.flavorNotes.map((note) => (
                              <span
                                key={note}
                                className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[var(--bg-surface-raised)] border border-[var(--border-default)] text-[var(--text-secondary)]"
                              >
                                {note}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Snack Pairing Suggestion */}
                        {m.snackPairing && (
                          <div className="pt-2 border-t border-[var(--border-default)]/40 flex items-center justify-between">
                            <div>
                              <p className="text-[10px] text-[var(--text-secondary)]">Pairing Camilan:</p>
                              <p className="text-[11px] font-bold text-[var(--text-primary)]">{m.snackPairing.name}</p>
                              <p className="text-[9px] text-[var(--text-secondary)]/80 italic">{m.snackPairing.reason}</p>
                            </div>
                            <button
                              onClick={() => handleAddToCart(m.snackPairing!)}
                              className="px-2.5 py-1 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface-raised)] hover:bg-[var(--bg-surface-overlay)] text-[var(--text-primary)] font-bold text-[10px] flex items-center gap-1 transition-colors cursor-pointer shrink-0 ml-2"
                            >
                              {addedItems[m.snackPairing.id] ? <Check className="w-3 h-3 text-[var(--green-500)]" /> : <Plus className="w-3 h-3" />}
                              <span>+Rp {m.snackPairing.price.toLocaleString("id-ID")}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}

                {loading && (
                  <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] bg-[var(--bg-surface-overlay)] p-3 rounded-2xl w-fit border border-[var(--border-default)]">
                    <Sparkles className="w-4 h-4 animate-spin text-[var(--accent-fill)]" />
                    <span>Barista sedang meracik rekomendasi...</span>
                  </div>
                )}
              </div>

              {/* Quick Presets */}
              <div className="px-4 py-2.5 border-t border-[var(--border-default)] bg-[var(--bg-surface-overlay)] flex gap-2 overflow-x-auto no-scrollbar">
                {PRESET_CHIPS.map((chip) => (
                  <button
                    key={chip.label}
                    onClick={() => handleSend(chip.query)}
                    className="px-3 py-1.5 rounded-full text-[10px] font-bold whitespace-nowrap bg-[var(--bg-surface-raised)] border border-[var(--border-default)] hover:border-[var(--accent-fill)]/60 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer shrink-0"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>

              {/* Input Bar */}
              <div className="p-3 sm:p-4 border-t border-[var(--border-default)] bg-[var(--bg-surface-raised)] flex items-center gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Ketik selera kopimu (cth: manis creamy, asam fruity)..."
                  className="flex-1 bg-[var(--bg-surface-overlay)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-fill)] transition-all"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!inputMessage.trim() || loading}
                  className="w-11 h-11 rounded-xl bg-[var(--accent-fill)] text-[var(--text-on-brand)] flex items-center justify-center shadow-md disabled:opacity-40 disabled:pointer-events-none hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
                  aria-label="Kirim pesan"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
