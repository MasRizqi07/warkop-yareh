'use client';

import React, { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Boxes,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  Download,
  Edit3,
  FileText,
  Filter,
  Plus,
  PlusCircle,
  Scale,
  Search,
  ShoppingCart,
  Trash2,
  TrendingUp,
  Truck,
  Wallet,
  X,
} from 'lucide-react';

interface InventoryItem {
  sku: string;
  name: string;
  batch: string;
  category: string;
  currentStock: number;
  maxCapacity: number;
  unit: string;
  threshold: number;
  burnRate: string;
  runwayDays: number;
  health: 'critical' | 'low' | 'healthy';
  supplier: string;
  leadTime: string;
}

const INITIAL_ITEMS: InventoryItem[] = [
  {
    sku: 'SKU-COF-IJN01',
    name: 'Ijen Highland Anaerobic Green Beans',
    batch: 'Batch #IJN-2608 • East Java Silo A',
    category: 'Specialty Bean',
    currentStock: 14.5,
    maxCapacity: 100,
    unit: 'kg',
    threshold: 25.0,
    burnRate: '7.2 kg / day',
    runwayDays: 2.0,
    health: 'low',
    supplier: 'Ijen Farmers Coop',
    leadTime: '48h Lead Time',
  },
  {
    sku: 'SKU-MILK-OAT02',
    name: 'Oatly Barista Edition 1L',
    batch: 'Batch #OAT-9941 • Chiller #02',
    category: 'Plant Milk',
    currentStock: 18,
    maxCapacity: 120,
    unit: 'Ctn',
    threshold: 30,
    burnRate: '12.0 Ctn / day',
    runwayDays: 1.5,
    health: 'critical',
    supplier: 'Oatly Indonesia Dist.',
    leadTime: '24h Express SLA',
  },
  {
    sku: 'SKU-SYR-ARN01',
    name: 'Organic Coconut Sugar Aren Liquid',
    batch: 'Batch #ARN-1022 • Ambient Dry Shelf',
    category: 'Organic Sweetener',
    currentStock: 42.0,
    maxCapacity: 60.0,
    unit: 'L',
    threshold: 20.0,
    burnRate: '3.8 L / day',
    runwayDays: 11.0,
    health: 'healthy',
    supplier: 'Petani Aren Pacet',
    leadTime: '72h SLA',
  },
  {
    sku: 'SKU-DAI-MILK01',
    name: 'Diamond Fresh Whole Milk Pasteurized',
    batch: 'Batch #DM-8820 • Chiller #01 (4°C)',
    category: 'Fresh Dairy',
    currentStock: 64.0,
    maxCapacity: 100.0,
    unit: 'L',
    threshold: 30.0,
    burnRate: '28.0 L / day',
    runwayDays: 2.3,
    health: 'healthy',
    supplier: 'Diamond Cold Chain Sby',
    leadTime: 'Daily 05:00 Drop',
  },
  {
    sku: 'SKU-PKG-CUP16',
    name: 'Biodegradable Bagasse Cups 16oz',
    batch: 'Lot #BGS-3310 • Annex Warehouse Bay 3',
    category: 'Eco Packaging',
    currentStock: 180,
    maxCapacity: 1500,
    unit: 'pcs',
    threshold: 500,
    burnRate: '140 pcs / day',
    runwayDays: 1.2,
    health: 'critical',
    supplier: 'Surabaya Bio-Pack Solusindo',
    leadTime: '24h Local Hub',
  },
  {
    sku: 'SKU-KTCH-PAS01',
    name: 'Beef Pastrami Smoked Cured',
    batch: 'Batch #PAS-091 • Kitchen Deep Freezer (-18°C)',
    category: 'Kitchen Provision',
    currentStock: 8.4,
    maxCapacity: 15.0,
    unit: 'kg',
    threshold: 5.0,
    burnRate: '1.8 kg / day',
    runwayDays: 4.6,
    health: 'healthy',
    supplier: 'Artisan Butchery Gubeng',
    leadTime: '48h SLA',
  },
  {
    sku: 'SKU-TEA-MAT01',
    name: 'Ceremonial Uji Matcha Powder Grade A',
    batch: 'Import Batch #MAT-412 • Airtight Nitrogen Vault',
    category: 'Specialty Tea',
    currentStock: 3.2,
    maxCapacity: 5.0,
    unit: 'kg',
    threshold: 2.0,
    burnRate: '0.4 kg / day',
    runwayDays: 8.0,
    health: 'healthy',
    supplier: 'Kyoto Specialty Importer',
    leadTime: 'Air Freight 5d',
  },
];

export default function EnterpriseInventoryPage() {
  const items = INITIAL_ITEMS;
  const [activeTab, setActiveTab] = useState<'master' | 'opname' | 'po' | 'waste'>('master');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedHealth, setSelectedHealth] = useState('all');
  const [showPoModal, setShowPoModal] = useState(false);
  const [showOpnameModal, setShowOpnameModal] = useState(false);
  const [scaleReading, setScaleReading] = useState(13.8);

  const filteredItems = items.filter((it) => {
    const matchSearch =
      it.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      it.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = selectedCategory === 'all' || it.category === selectedCategory;
    const matchHealth = selectedHealth === 'all' || it.health === selectedHealth;
    return matchSearch && matchCategory && matchHealth;
  });

  return (
    <div className="min-h-screen bg-canvas-obsidian text-text-primary font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* ══════════════════════════════════════════════════════════════
            1. BREADCRUMBS & SILO TELEMETRY HEADER
            ══════════════════════════════════════════════════════════════ */}
        <section className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-text-muted">
              <span>Supply Chain Ops</span>
              <span>/</span>
              <span>Central Inventory &amp; Silo Reserves</span>
              <span>/</span>
              <span className="text-text-primary font-medium">Surabaya Warehouses</span>
            </div>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight font-headline-xl">
                Silo &amp; Ingredient Telemetry
              </h1>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-card border border-border-subtle shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-amber opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-amber" />
                </span>
                <span className="font-mono text-[10px] text-accent-amber uppercase tracking-wider font-semibold">
                  IoT Silo Active • Sync 2m ago
                </span>
              </div>
            </div>
          </div>

          {/* Action Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => alert('Downloading Stock Audit CSV...')}
              className="px-3.5 py-2 rounded-xl bg-surface-card border border-border-subtle hover:bg-surface-container text-xs font-semibold text-text-muted hover:text-text-primary flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-4 h-4 text-text-muted" />
              <span>Audit Export</span>
            </button>
            <button
              onClick={() => setShowOpnameModal(true)}
              className="px-3.5 py-2 rounded-xl bg-surface-card border border-border-subtle hover:bg-surface-container text-xs font-semibold text-accent-amber flex items-center gap-1.5 transition-colors"
            >
              <Scale className="w-4 h-4" />
              <span>Schedule Opname</span>
            </button>
            <button
              onClick={() => setShowPoModal(true)}
              className="px-4 py-2 rounded-xl bg-brand-coffee hover:bg-primary-container text-text-primary text-xs font-bold flex items-center gap-1.5 transition-all shadow-md"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ New Purchase Order</span>
            </button>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════
            2. TOP EXECUTIVE KPI METRICS
            ══════════════════════════════════════════════════════════════ */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-surface-card border border-border-subtle rounded-2xl p-5 shadow-lg flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                Total Inventory Valuation
              </span>
              <Wallet className="w-5 h-5 text-accent-amber" />
            </div>
            <div className="text-2xl font-bold text-text-primary">Rp 142.850.000</div>
            <div className="flex items-center gap-2 font-mono text-[11px]">
              <span className="text-emerald-400 font-semibold">+4.2% MoM</span>
              <span className="text-text-muted">• 84 Active SKUs</span>
            </div>
          </div>

          <div className="bg-surface-card border border-border-subtle rounded-2xl p-5 shadow-lg flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                Critical Alerts
              </span>
              <AlertTriangle className="w-5 h-5 text-accent-amber" />
            </div>
            <div className="text-2xl font-bold text-accent-amber">3 Items Critical</div>
            <div className="flex flex-wrap gap-1 font-mono text-[10px]">
              <span className="px-2 py-0.5 rounded bg-surface-secondary text-text-muted">Ijen Green Beans</span>
              <span className="px-2 py-0.5 rounded bg-surface-secondary text-text-muted">Oatly 1L</span>
              <span className="px-2 py-0.5 rounded bg-surface-secondary text-text-muted">PLA 16oz</span>
            </div>
          </div>

          <div className="bg-surface-card border border-border-subtle rounded-2xl p-5 shadow-lg flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                Active POs
              </span>
              <Truck className="w-5 h-5 text-cream-beige" />
            </div>
            <div className="text-2xl font-bold text-text-primary">2 In Transit</div>
            <div className="font-mono text-xs text-text-muted">
              ETA Today 16:00 WIB • <span className="text-primary font-semibold">Val: Rp 18.4M</span>
            </div>
          </div>

          <div className="bg-surface-card border border-border-subtle rounded-2xl p-5 shadow-lg flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                7-Day Spoilage
              </span>
              <Trash2 className="w-5 h-5 text-text-muted" />
            </div>
            <div className="text-2xl font-bold text-text-primary">Rp 420.000</div>
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="text-emerald-400">0.29% throughput</span>
              <span className="text-text-muted">&lt;0.5% SLA</span>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════
            3. NAVIGATION TABS & SEARCH/FILTERS
            ══════════════════════════════════════════════════════════════ */}
        <section className="space-y-4">
          <div className="flex flex-wrap items-center gap-1.5 bg-surface-secondary p-1.5 rounded-xl border border-border-subtle">
            <button
              onClick={() => setActiveTab('master')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'master'
                  ? 'bg-surface-card text-primary shadow border border-border-subtle'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              <Boxes className="w-4 h-4" />
              <span>Stock Master</span>
              <span className="px-2 py-0.5 rounded-full bg-surface-container text-accent-amber font-mono text-[10px]">
                {items.length}
              </span>
            </button>
            <button
              onClick={() => setShowOpnameModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-text-muted hover:text-text-primary transition-all"
            >
              <ClipboardCheck className="w-4 h-4" />
              <span>Stock Opname &amp; Adjustments</span>
            </button>
            <button
              onClick={() => setShowPoModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-text-muted hover:text-text-primary transition-all"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Purchase Orders &amp; Suppliers</span>
              <span className="px-2 py-0.5 rounded-full bg-accent-amber/20 text-accent-amber font-mono text-[10px]">
                2 Pending
              </span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-surface-card border border-border-subtle p-4 rounded-xl shadow-sm">
            <div className="md:col-span-6 relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-text-muted" />
              <input
                aria-label="Search inventory"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by SKU, ingredient, batch or supplier..."
                className="w-full pl-10 pr-4 py-2 bg-surface-secondary border border-border-subtle text-text-primary placeholder:text-text-muted text-xs rounded-xl outline-none focus:border-accent-amber transition-all"
              />
            </div>

            <div className="md:col-span-3">
              <select
                aria-label="Filter inventory by category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 bg-surface-secondary border border-border-subtle text-text-primary text-xs rounded-xl outline-none"
              >
                <option value="all">All Categories</option>
                <option value="Specialty Bean">Specialty Bean</option>
                <option value="Plant Milk">Plant Milk</option>
                <option value="Organic Sweetener">Organic Sweetener</option>
                <option value="Fresh Dairy">Fresh Dairy</option>
                <option value="Eco Packaging">Eco Packaging</option>
                <option value="Kitchen Provision">Kitchen Provision</option>
                <option value="Specialty Tea">Specialty Tea</option>
              </select>
            </div>

            <div className="md:col-span-3">
              <select
                aria-label="Filter inventory by stock health"
                value={selectedHealth}
                onChange={(e) => setSelectedHealth(e.target.value)}
                className="w-full px-3 py-2 bg-surface-secondary border border-border-subtle text-accent-amber text-xs rounded-xl outline-none font-semibold"
              >
                <option value="all">All Health Status</option>
                <option value="critical">Critical Only</option>
                <option value="low">Low Stock Only</option>
                <option value="healthy">Healthy Only</option>
              </select>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════
            4. ADVANCED INVENTORY DATA TABLE
            ══════════════════════════════════════════════════════════════ */}
        <section className="bg-surface-card border border-border-subtle rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-surface-secondary text-text-muted font-mono text-[11px] uppercase tracking-wider border-b border-border-subtle">
                  <th className="py-3 px-4">SKU Code</th>
                  <th className="py-3 px-4">Ingredient / Item &amp; Batch</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Stock Level vs Capacity</th>
                  <th className="py-3 px-4">Threshold</th>
                  <th className="py-3 px-4">Burn Rate &amp; Runway</th>
                  <th className="py-3 px-4">Health Status</th>
                  <th className="py-3 px-4">Supplier</th>
                  <th className="py-3 px-4 text-right">Quick Ops</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {filteredItems.map((item) => {
                  const percent = Math.min(100, Math.round((item.currentStock / item.maxCapacity) * 100));
                  return (
                    <tr key={item.sku} className="hover:bg-surface-container/60 transition-colors">
                      <td className="py-3 px-4 font-mono text-text-muted">{item.sku}</td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-text-primary text-xs">{item.name}</span>
                          <span className="font-mono text-[10px] text-text-muted">{item.batch}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-surface-secondary text-cream-beige font-mono text-[10px] border border-border-subtle">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-1 w-32">
                          <div className="flex justify-between font-mono text-[11px]">
                            <span className={item.health === 'critical' ? 'text-red-400 font-bold' : 'text-text-primary'}>
                              {item.currentStock} {item.unit}
                            </span>
                            <span className="text-text-muted">/ {item.maxCapacity}</span>
                          </div>
                          <div className="w-full bg-surface-secondary h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                item.health === 'critical'
                                  ? 'bg-red-500'
                                  : item.health === 'low'
                                  ? 'bg-accent-amber'
                                  : 'bg-emerald-500'
                              }`}
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-text-muted">
                        Min. {item.threshold} {item.unit}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col font-mono text-[11px]">
                          <span className="text-text-primary">{item.burnRate}</span>
                          <span
                            className={
                              item.runwayDays <= 1.5
                                ? 'text-red-400 font-bold'
                                : item.runwayDays <= 2.5
                                ? 'text-accent-amber font-semibold'
                                : 'text-emerald-400'
                            }
                          >
                            {item.runwayDays} days runway
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-mono text-[10px] ${
                            item.health === 'critical'
                              ? 'bg-red-500/20 text-red-400 border border-red-500/30 font-bold'
                              : item.health === 'low'
                              ? 'bg-accent-amber/20 text-accent-amber font-semibold border border-accent-amber/30'
                              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              item.health === 'critical'
                                ? 'bg-red-400 animate-ping'
                                : item.health === 'low'
                                ? 'bg-accent-amber'
                                : 'bg-emerald-400'
                            }`}
                          />
                          {item.health.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col font-mono text-[11px]">
                          <span className="text-text-primary">{item.supplier}</span>
                          <span className="text-text-muted">{item.leadTime}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setShowPoModal(true)}
                            className="p-1.5 rounded-lg bg-surface-secondary hover:bg-brand-coffee text-text-primary transition-colors border border-border-subtle"
                            title="Trigger PO"
                          >
                            <ShoppingCart className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setShowOpnameModal(true)}
                            className="p-1.5 rounded-lg bg-surface-secondary hover:bg-surface-container text-text-muted hover:text-text-primary transition-colors border border-border-subtle"
                            title="Adjust Count"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════
            5. DIAL-IN CALIBRATION & SPOILAGE LOG + GAUGE
            ══════════════════════════════════════════════════════════════ */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-surface-card border border-border-subtle p-6 rounded-2xl shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-accent-amber" />
                <h3 className="text-base font-bold text-text-primary">Dial-in Calibration &amp; Spoilage Log</h3>
              </div>
              <button
                onClick={() => alert('Recording discard event...')}
                className="text-xs font-semibold text-accent-amber hover:underline flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> Record Discard
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-text-muted font-mono text-[10px] uppercase tracking-wider pb-2 border-b border-border-subtle">
                    <th className="pb-2">Event / SKU</th>
                    <th className="pb-2">Quantity</th>
                    <th className="pb-2">Loss Value</th>
                    <th className="pb-2">Reason</th>
                    <th className="pb-2 text-right">Barista</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  <tr>
                    <td className="py-2.5">
                      <div className="font-semibold text-text-primary">Morning Grinder Dial-in</div>
                      <div className="font-mono text-[10px] text-text-muted">SKU-COF-IJN01 (Ijen)</div>
                    </td>
                    <td className="py-2.5 font-mono text-text-muted">0.45 kg grounds</td>
                    <td className="py-2.5 font-mono text-accent-amber font-bold">Rp 67.500</td>
                    <td className="py-2.5">
                      <span className="px-2 py-0.5 rounded bg-surface-secondary text-primary font-mono text-[10px] border border-border-subtle">
                        Quality Dial-in
                      </span>
                    </td>
                    <td className="py-2.5 text-right font-mono text-text-muted">Rian H. (Opening)</td>
                  </tr>
                  <tr>
                    <td className="py-2.5">
                      <div className="font-semibold text-text-primary">Expired Fresh Milk Batch</div>
                      <div className="font-mono text-[10px] text-text-muted">SKU-DAI-MILK01 (Diamond)</div>
                    </td>
                    <td className="py-2.5 font-mono text-text-muted">2x 1L cartons</td>
                    <td className="py-2.5 font-mono text-accent-amber font-bold">Rp 54.000</td>
                    <td className="py-2.5">
                      <span className="px-2 py-0.5 rounded bg-surface-secondary text-red-400 font-mono text-[10px] border border-red-500/20">
                        Shelf Life
                      </span>
                    </td>
                    <td className="py-2.5 text-right font-mono text-text-muted">Dimas K. (Afternoon)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-surface-card border border-border-subtle p-6 rounded-2xl shadow-xl flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-text-primary">Monthly Spoilage Budget</h3>
              <Activity className="w-5 h-5 text-text-muted" />
            </div>

            <div className="flex flex-col items-center justify-center my-2">
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    fill="transparent"
                    r="40"
                    className="stroke-surface-secondary"
                    strokeWidth="8"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    fill="transparent"
                    r="40"
                    className="stroke-accent-amber"
                    strokeDasharray="251.2"
                    strokeDashoffset="180.8"
                    strokeLinecap="round"
                    strokeWidth="8"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-bold text-text-primary">28%</span>
                  <span className="font-mono text-[10px] text-text-muted uppercase">Tolerated Cap</span>
                </div>
              </div>
            </div>

            <div className="space-y-1.5 bg-surface-secondary p-3 rounded-xl font-mono text-xs border border-border-subtle">
              <div className="flex justify-between text-text-muted">
                <span>Total Loss (MTD):</span>
                <span className="text-accent-amber font-bold">Rp 420.000</span>
              </div>
              <div className="flex justify-between text-text-muted">
                <span>Allowable Threshold:</span>
                <span className="text-text-primary font-semibold">Rp 1.500.000</span>
              </div>
              <p className="text-[10px] text-emerald-400 pt-1">Optimal tolerance preserved (&lt;0.5% brew volume).</p>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════
            MODALS: PO AUTHORIZATION & STOCK OPNAME
            ══════════════════════════════════════════════════════════════ */}
        {showPoModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-surface-card border border-border-subtle rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-accent-amber" />
                  <div>
                    <h3 className="text-base font-bold text-text-primary">Quick PO Dispatch Authorization</h3>
                    <p className="font-mono text-[10px] text-text-muted">Target: VND-SBY-042 (Ijen Farmers Coop)</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPoModal(false)}
                  className="p-1 text-text-muted hover:text-text-primary"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2 bg-surface-secondary p-4 rounded-xl font-mono text-xs border border-border-subtle">
                <div className="flex justify-between items-center text-text-primary pb-1.5 border-b border-border-subtle">
                  <span>1. Ijen Highland Green Beans (+60.0 kg)</span>
                  <span>@ Rp 150.000 = Rp 9.000.000</span>
                </div>
                <div className="flex justify-between items-center text-text-primary pb-1.5 border-b border-border-subtle">
                  <span>2. Oatly Barista Edition 1L (+40 Cartons)</span>
                  <span>@ Rp 38.000 = Rp 1.520.000</span>
                </div>
                <div className="pt-2 flex justify-between items-center text-sm">
                  <span className="text-text-muted">Total Authorized Procurement:</span>
                  <span className="text-accent-amber font-bold text-base">Rp 10.520.000</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowPoModal(false)}
                  className="px-4 py-2 rounded-xl bg-surface-secondary border border-border-subtle text-text-muted hover:text-text-primary text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    alert('PO #PO-2026-0881 dispatched to Ijen Farmers Coop!');
                    setShowPoModal(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-brand-coffee hover:bg-primary-container text-text-primary text-xs font-bold shadow-md"
                >
                  Authorize &amp; Dispatch PO
                </button>
              </div>
            </div>
          </div>
        )}

        {showOpnameModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-surface-card border border-border-subtle rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
                <div className="flex items-center gap-2">
                  <Scale className="w-5 h-5 text-primary" />
                  <div>
                    <h3 className="text-base font-bold text-text-primary">Stock Opname &amp; Variance Audit</h3>
                    <p className="font-mono text-[10px] text-text-muted">Item: SKU-COF-IJN01 (Ijen Highland Green)</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowOpnameModal(false)}
                  className="p-1 text-text-muted hover:text-text-primary"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-surface-secondary rounded-xl font-mono text-xs border border-border-subtle">
                  <span className="text-text-muted block mb-1">Expected System Count</span>
                  <span className="text-text-primary text-lg font-bold">14.50 kg</span>
                </div>
                <div className="p-3 bg-surface-secondary rounded-xl font-mono text-xs border border-border-subtle">
                  <span className="text-accent-amber block mb-1">Physical Scale Reading</span>
                  <input
                    aria-label="Physical scale reading in kilograms"
                    type="number"
                    step="0.1"
                    value={scaleReading}
                    onChange={(e) => setScaleReading(parseFloat(e.target.value) || 0)}
                    className="w-full bg-transparent text-text-primary text-lg font-bold outline-none border-b border-accent-amber/40 pb-0.5"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-surface-secondary font-mono text-xs flex items-center justify-between border border-border-subtle">
                <div>
                  <span className="text-accent-amber font-semibold">
                    Variance Delta: {(scaleReading - 14.5).toFixed(2)} kg
                  </span>
                  <span className="text-text-muted block text-[10px]">
                    Monetary variance: Rp {((scaleReading - 14.5) * 150000).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowOpnameModal(false)}
                  className="px-4 py-2 rounded-xl bg-surface-secondary border border-border-subtle text-text-muted hover:text-text-primary text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    alert('Variance reconciled and inventory updated!');
                    setShowOpnameModal(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-coffee to-secondary-container hover:from-primary-container hover:to-secondary text-text-primary text-xs font-bold"
                >
                  Save &amp; Reconcile Ledger
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
