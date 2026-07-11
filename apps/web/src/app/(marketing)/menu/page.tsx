"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/stores";
import { products } from "@/data/mock";
import { 
  IconLocation, 
  IconSearch, 
  IconSearchOff, 
  IconTrending, 
  IconPlus, 
  IconCart 
} from "@/lib/icons";

export default function MenuPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [branch, setBranch] = useState("darmo");
  const { itemCount, addItem, toggleCart } = useCartStore();
  
  const count = itemCount();

  // Filter products by category and search query
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Filter by branch availability if applicable
    result = result.filter((p) => p.branchAvailability?.includes(branch) ?? true);

    // Filter by category
    if (activeCategory !== "all") {
      result = result.filter((p) => p.category === activeCategory);
    }

    // Filter by search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags?.some((t: string) => t.includes(q))
      );
    }

    return result;
  }, [search, activeCategory, branch]);

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen">
      {/* Noise Overlay */}
      <div className="fixed inset-0 organic-noise pointer-events-none z-[-1]"></div>

      {/* Main Content Area */}
      <main className="pt-24 pb-32 px-margin-mobile max-w-container-max mx-auto">
        
        {/* Search & Branding */}
        <section className="mb-8">
          <h1 className="font-display-lg text-headline-md text-primary dark:text-primary-fixed tracking-tight mb-6">Warkop Ya&apos;reh</h1>
          
          <div className="flex flex-col gap-4">
            {/* Branch Selector */}
            <div className="flex items-center gap-3">
              <IconLocation size={24} className="text-primary dark:text-primary-fixed" />
              <div className="flex flex-col">
                <span className="font-receipt-label text-receipt-label opacity-60">Pick up from</span>
                <select
                  title="Select Branch"
                  aria-label="Select Branch"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="bg-transparent border-none p-0 font-headline-md text-headline-md text-primary dark:text-primary-fixed focus:ring-0 cursor-pointer outline-none"
                >
                  <option value="darmo" className="bg-surface text-on-surface">Warkop Ya&apos;reh: Darmo</option>
                  <option value="dharmahusada" className="bg-surface text-on-surface">Warkop Ya&apos;reh: Dharmahusada</option>
                </select>
              </div>
            </div>

            <div className="relative mt-2">
              <IconSearch size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-surface-container-highest/50 border border-white/5 rounded-xl py-4 pl-12 pr-4 font-receipt-label text-receipt-label focus:border-primary focus:ring-1 focus:ring-primary outline-none backdrop-blur-md"
                placeholder="Search your fuel..."
                type="text"
              />
            </div>
          </div>
        </section>

        {/* Categories Bar */}
        <nav className="flex gap-4 mb-10 overflow-x-auto pb-4 custom-scroll no-scrollbar">
          {[
            { id: "all", label: "All Menu" },
            { id: "coffee", label: "Coffee" },
            { id: "non-coffee", label: "Non-Coffee" },
            { id: "food", label: "Food" },
            { id: "snacks", label: "Snacks" }
          ].map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex-shrink-0 px-6 py-2 rounded-full font-headline-md text-[14px] transition-all ${
                  isActive
                    ? "bg-primary-container text-on-primary-container"
                    : "bg-surface-container-highest/50 text-on-surface-variant hover:bg-surface-container-high"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </nav>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-gutter">
          <AnimatePresence mode="popLayout">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  key={product.id} 
                  className="glass-card rounded-2xl overflow-hidden flex flex-col group hover:-translate-y-2 transition-all duration-300"
                >
                  <div className="relative h-56 w-full overflow-hidden">
                    <Image
                      alt={product.name}
                      className="object-cover transition-transform duration-700 hover:scale-110"
                      src={product.image && product.image.startsWith("http") ? product.image : "https://lh3.googleusercontent.com/aida-public/AB6AXuA12GYBUOApK8TOhl-_xJHF8c3O63XZJBaY0Cl4Qxtb169bQUm9MscI9B3ucDNRRsva-KUYw6j2JBvsRIyfvIv7QYDpRyL0uKW8lcQcQGo_Yw-KjJtvFjQD4egaXMpVR9sO06SmoR8BDAyFDY1iSGTBFxSmKIUk3c9f0W9cdeDY_yHgZPwlvVWOvSSs2oWxINGdismkZlB6cCJioCbb5c2VCYj-48eJ16SGSQU_jX72kpaiVIM6UMP7N-pTYJRIlCWz3Bjx58XNrCA"}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    {product.isPopular && (
                      <div className="absolute top-4 right-4 bg-primary/20 backdrop-blur-md border border-primary/30 rounded-full px-3 py-1">
                        <span className="font-receipt-label text-receipt-label text-primary">Best Seller</span>
                      </div>
                    )}
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-headline-md text-headline-md text-on-surface">
                        {product.name}
                      </h3>
                      <span className="font-code-sm text-code-sm text-primary-fixed">
                        Rp {(product.price / 1000).toFixed(0)}k
                      </span>
                    </div>
                    <p className="text-on-surface-variant/70 text-sm mb-6 flex-grow">
                      {product.description}
                    </p>
                    <div className="flex justify-between items-center mt-auto">
                      <div className="flex items-center gap-2 text-outline">
                        <IconTrending size={18} />
                        <span className="font-receipt-label text-receipt-label">{product.calories || 120} kcal</span>
                      </div>
                      <button
                        title={`Add ${product.name} to cart`}
                        aria-label={`Add ${product.name} to cart`}
                        onClick={(e) => {
                          addItem(product);
                          
                          // Splash effect
                          const splash = document.createElement('div');
                          splash.className = 'fixed w-2 h-2 bg-primary rounded-full z-[100] pointer-events-none transition-all duration-500';
                          splash.style.left = e.clientX + 'px';
                          splash.style.top = e.clientY + 'px';
                          document.body.appendChild(splash);
                          
                          requestAnimationFrame(() => {
                              const cartBtn = document.getElementById('cartBtn');
                              if(cartBtn) {
                                const rect = cartBtn.getBoundingClientRect();
                                splash.style.left = (rect.left + rect.width / 2) + 'px';
                                splash.style.top = (rect.top + rect.height / 2) + 'px';
                                splash.style.opacity = '0';
                                splash.style.transform = 'scale(0.1)';
                              }
                          });
                          
                          setTimeout(() => splash.remove(), 500);
                        }}
                        className="bg-primary-container text-on-primary-container w-10 h-10 rounded-full flex items-center justify-center hover:scale-110 transition-transform active:scale-90"
                      >
                        <IconPlus size={24} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-24 glass-card rounded-2xl border border-white/5">
                <IconSearchOff size={48} className="text-outline mb-2 mx-auto" />
                <h3 className="text-lg font-bold">No items found</h3>
                <p className="text-sm text-on-surface-variant/70 mt-1">Try another search keyword or category.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <div className="fixed bottom-24 right-6 z-[60] md:bottom-28">
        <button 
          id="cartBtn"
          onClick={toggleCart}
          className="bg-primary-container text-on-primary-container flex items-center gap-3 px-6 py-4 rounded-full shadow-2xl shadow-roasted-black/50 hover:scale-105 active:scale-95 transition-all group"
        >
          <IconCart size={24} />
          <span className="font-headline-md text-[16px]">View Cart</span>
          {count > 0 && (
            <div className="bg-primary-fixed text-on-primary-fixed w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold animate-in zoom-in duration-300">
              {count}
            </div>
          )}
        </button>
      </div>
    </div>
  );
}
