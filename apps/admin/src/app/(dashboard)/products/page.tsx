"use client";

import React, { useState } from "react";
import { Search, Plus, Edit, Check, X } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";

interface Product {
  id: string;
  name: string;
  category: "COFFEE" | "NON-COFFEE" | "FOOD" | "SNACKS";
  price: string;
  stockStatus: "AVAILABLE" | "OUT_OF_STOCK" | "LOW_STOCK";
  popularity: "HIGH" | "MEDIUM" | "LOW";
}

export default function ProductsPage() {
  const [filter, setFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const products: Product[] = [
    { id: "PROD-001", name: "Toraja Arabica Drip", category: "COFFEE", price: "Rp 32,000", stockStatus: "AVAILABLE", popularity: "HIGH" },
    { id: "PROD-002", name: "Es Kopi Susu Aren", category: "COFFEE", price: "Rp 24,000", stockStatus: "AVAILABLE", popularity: "HIGH" },
    { id: "PROD-003", name: "Premium Matcha Latte", category: "NON-COFFEE", price: "Rp 28,000", stockStatus: "AVAILABLE", popularity: "MEDIUM" },
    { id: "PROD-004", name: "Tahu Walik Crispy", category: "SNACKS", price: "Rp 18,000", stockStatus: "LOW_STOCK", popularity: "MEDIUM" },
    { id: "PROD-005", name: "Nasi Goreng Ya'reh", category: "FOOD", price: "Rp 38,000", stockStatus: "OUT_OF_STOCK", popularity: "HIGH" },
  ];

  const filteredProducts = products.filter((product) => {
    const matchesFilter = filter === "ALL" || product.category === filter;
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-[var(--text-primary)]">Menu & Catalog</h1>
          <p className="font-sans text-xs text-[var(--text-secondary)] mt-0.5">Manage products, pricing overrides, and instant roaster availability</p>
        </div>
        <div className="flex gap-3 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
            <input
              type="text"
              placeholder="Search product..."
              className="bg-[var(--surface-tertiary)] border border-[var(--border-default)] rounded-xl pl-10 pr-4 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] w-60 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button 
            onClick={() => alert("Add product modal")}
            className="bg-[var(--interactive-primary)] text-white hover:bg-[var(--interactive-primary-hover)] font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md hover:shadow-lg active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" /> ADD ITEM
          </button>
        </div>
      </div>

      {/* Categories Tabs */}
      <div className="flex gap-2 border-b border-[var(--border-default)] overflow-x-auto pb-px">
        {["ALL", "COFFEE", "NON-COFFEE", "FOOD", "SNACKS"].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors border-b-2 shrink-0 ${
              filter === cat
                ? "border-[var(--color-primary)] text-[var(--text-brand)] font-bold"
                : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((p) => (
          <div key={p.id} className="relative overflow-hidden rounded-2xl bg-[var(--surface-tertiary)] border border-[var(--border-default)] p-6 hover:shadow-xl transition-all duration-300 group">
            {/* Header row */}
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider font-semibold">{p.id}</span>
              <StatusBadge status={p.stockStatus} />
            </div>

            {/* Title & Category */}
            <h3 className="font-heading text-lg font-bold text-[var(--text-primary)] group-hover:text-[var(--text-brand)] transition-colors">{p.name}</h3>
            <p className="font-sans text-xs text-[var(--text-secondary)] mt-0.5 capitalize">{p.category.toLowerCase().replace("-", " ")}</p>

            {/* Pricing Details */}
            <div className="mt-6 flex justify-between items-baseline border-t border-[var(--border-default)]/50 pt-4">
              <div>
                <p className="font-mono text-[10px] text-[var(--text-tertiary)] uppercase font-semibold">Base Price</p>
                <p className="font-mono text-lg font-bold text-[var(--text-primary)] mt-0.5">{p.price}</p>
              </div>
              <div className="flex gap-2">
                <button 
                  title={`Edit product ${p.name}`}
                  aria-label={`Edit product ${p.name}`}
                  onClick={() => alert(`Edit product ${p.name}`)}
                  className="p-2 border border-[var(--border-default)] hover:bg-[var(--surface-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg transition-colors"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button 
                  title={`Toggle status for ${p.name}`}
                  aria-label={`Toggle status for ${p.name}`}
                  onClick={() => alert(`Toggle status for ${p.name}`)}
                  className={`p-2 border rounded-lg transition-colors flex items-center justify-center ${
                    p.stockStatus === "AVAILABLE"
                      ? "border-[var(--success-500)]/30 bg-[var(--success-500)]/10 text-[var(--success-500)] hover:bg-[var(--success-500)]/20"
                      : "border-[var(--error-500)]/30 bg-[var(--error-500)]/10 text-[var(--error-500)] hover:bg-[var(--error-500)]/20"
                  }`}
                >
                  {p.stockStatus === "AVAILABLE" ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
