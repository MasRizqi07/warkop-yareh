"use client";

import React, { useState } from "react";
import { Button, Card, Input, Badge, BrandEmblem } from "@warkop-yareh/ui";

export default function TestDesignSystemPage() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  return (
    <div data-theme={theme} className={theme === "dark" ? "dark bg-canvas-obsidian min-h-screen text-text-primary p-8 pb-48 transition-colors" : "light bg-canvas-obsidian min-h-screen text-text-primary p-8 pb-48 transition-colors"}>
      <div className="max-w-4xl mx-auto space-y-8 pb-32">
        <div className="flex items-center justify-between pb-6 border-b border-border-subtle">
          <div className="flex items-center gap-4">
            <BrandEmblem size={44} />
            <div>
              <h1 className="text-2xl font-bold font-heading">Design System Isolated Component Harness</h1>
              <p className="text-sm text-text-muted">Verifying packages/ui tokens in {theme.toUpperCase()} mode</p>
            </div>
          </div>
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high border border-border-subtle text-sm font-semibold transition-all"
            id="theme-toggle"
          >
            Switch to {theme === "dark" ? "Light" : "Dark"}
          </button>
        </div>

        {/* 1. BUTTONS */}
        <section id="component-button" className="p-6 rounded-2xl bg-surface-card border border-border-subtle space-y-4">
          <h2 className="text-lg font-bold font-heading">1. Button Component</h2>
          <div className="flex flex-wrap gap-4 items-center">
            <Button variant="default" size="default">Primary Button</Button>
            <Button variant="secondary" size="default">Secondary Button</Button>
            <Button variant="outline" size="default">Outline Button</Button>
            <Button variant="gold" size="default">Gold Button</Button>
            <Button variant="destructive" size="default">Destructive Button</Button>
          </div>
        </section>

        {/* 2. CARDS */}
        <section id="component-card" className="p-6 rounded-2xl bg-surface-card border border-border-subtle space-y-4">
          <h2 className="text-lg font-bold font-heading">2. Card Component</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card withHover className="p-6 space-y-3">
              <h3 className="text-base font-bold font-heading text-text-primary">Specialty Single Origin</h3>
              <p className="text-xs text-cream-beige font-mono">Sumatra Gayo Anaerobic Natural</p>
              <p className="text-sm text-text-muted">
                Notes of dark cocoa, roasted macadamia, and wild palm nectar. Slow drip extraction.
              </p>
              <div className="pt-2 flex justify-between items-center">
                <span className="font-mono font-bold text-accent-amber">Rp 32.000</span>
                <Button size="sm">Order Now</Button>
              </div>
            </Card>

            <Card className="p-6 space-y-3">
              <h3 className="text-base font-bold font-heading text-text-primary">Coworking Sanctuary</h3>
              <p className="text-xs text-accent-amber font-mono">Floor 1 Quiet Pod #04</p>
              <p className="text-sm text-text-muted">
                Sub-35dB acoustic noise-isolated workstation with Herman Miller Aeron and gigabit mesh.
              </p>
              <div className="pt-2 flex justify-between items-center">
                <Badge variant="success">Available Now</Badge>
                <Button variant="secondary" size="sm">Reserve Pod</Button>
              </div>
            </Card>
          </div>
        </section>

        {/* 3. INPUTS */}
        <section id="component-input" className="p-6 rounded-2xl bg-surface-card border border-border-subtle space-y-4">
          <h2 className="text-lg font-bold font-heading">3. Input Component</h2>
          <div className="max-w-md space-y-3">
            <Input placeholder="Search artisan single-origin coffees..." />
            <Input placeholder="Enter table number (e.g. T-04)" defaultValue="T-04" />
          </div>
        </section>

        {/* 4. BADGES */}
        <section id="component-badge" className="p-6 rounded-2xl bg-surface-card border border-border-subtle space-y-4">
          <h2 className="text-lg font-bold font-heading">4. Badge Component</h2>
          <div className="flex flex-wrap gap-3 items-center">
            <Badge variant="default">Default Badge</Badge>
            <Badge variant="secondary">Secondary Badge</Badge>
            <Badge variant="gold">Gold Artisan</Badge>
            <Badge variant="outline">Outline Badge</Badge>
            <Badge variant="success">Active Online</Badge>
            <Badge variant="error">Critical Stock</Badge>
            <Badge variant="gradient">Obsidian Elite</Badge>
          </div>
        </section>
      </div>
    </div>
  );
}
