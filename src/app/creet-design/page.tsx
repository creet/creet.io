'use client';

import React from 'react';
import {
    ChevronRight,
    Check,
    Circle,
    ArrowUpRight,
    Sparkles,
    Copy,
    Eye,
    Settings2,
    Plus,
    Search,
} from 'lucide-react';
import Logo from '@/components/ui/Logo';

/**
 * Creed.io Design System v2.2
 * 
 * Philosophy: "The Design Studio"
 * 
 * We are NOT a developer tool. We are a design tool for social proof.
 * Our dark theme exists to let the user's colorful testimonials shine.
 * 
 * Key Principles:
 * 1. ELEVATION = LIGHT: Shadows + inner highlights create physical depth
 * 2. WHITE IS UTILITY: Focus rings, toggles, checkboxes — functional elements
 * 3. LIME IS DESTINY: Only for primary CTAs and brand moments (10% max)
 * 4. WARMTH IN DARKNESS: Subtle gradients prevent the "code editor" feel
 */

// Reusable shadow presets for consistency
const shadows = {
    level1: '0 1px 2px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.2), inset 0 1px 0 0 rgba(255,255,255,0.04)',
    level2: '0 4px 8px rgba(0,0,0,0.4), 0 12px 32px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.06), inset 0 1px 0 0 rgba(255,255,255,0.06)',
    level3: '0 8px 16px rgba(0,0,0,0.5), 0 24px 48px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.08), inset 0 1px 0 0 rgba(255,255,255,0.1)',
};

export default function CreedDesignSystem() {
    return (
        <div className="min-h-screen bg-[#09090B] text-[#E4E4E7] antialiased">
            {/* Navigation */}
            <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06] bg-[#09090B]/80 backdrop-blur-xl backdrop-saturate-150">
                <div className="max-w-7xl mx-auto px-8 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Logo size={22} color="#BFFF00" />
                        <span className="font-semibold text-white tracking-tight text-[15px]">Creed.io</span>
                        <span className="text-zinc-600 text-sm">/</span>
                        <span className="text-zinc-500 text-sm">Design System</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-7 px-3 rounded-md bg-white/[0.04] border border-white/[0.06] flex items-center gap-2 text-xs text-zinc-500">
                            <span className="font-mono">v2.2</span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-8 pt-28 pb-32">

                {/* Hero - With subtle gradient warmth */}
                <section className="mb-32 relative">
                    {/* Ambient glow - adds warmth to the hero */}
                    <div className="absolute -top-20 -left-20 w-96 h-96 bg-[#BFFF00]/[0.03] rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute -top-10 left-1/3 w-64 h-64 bg-white/[0.02] rounded-full blur-3xl pointer-events-none" />

                    <div className="max-w-3xl relative">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06] text-xs text-zinc-400 mb-8">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#BFFF00]" />
                            Design Language
                        </div>
                        <h1 className="text-[56px] font-semibold text-white leading-[1.08] tracking-[-0.03em] mb-6">
                            The Design
                            <br />
                            <span className="text-zinc-500">Studio.</span>
                        </h1>
                        <p className="text-xl text-zinc-400 leading-relaxed max-w-xl">
                            We build tools for creators, not code. Our dark canvas exists to make
                            <span className="text-white"> your testimonials </span> the brightest thing in the room.
                        </p>
                    </div>
                </section>

                {/* Section 01: Design Philosophy */}
                <section className="mb-32">
                    <SectionHeader number="01" title="Why This Darkness Works" />

                    <div className="grid grid-cols-12 gap-8 mt-12">
                        <div className="col-span-12 lg:col-span-6">
                            <div
                                className="p-8 rounded-2xl bg-gradient-to-br from-[#0F0F11] to-[#0F0F11] border border-white/[0.04] relative overflow-hidden"
                                style={{ boxShadow: shadows.level1 }}
                            >
                                {/* Subtle gradient overlay for warmth */}
                                <div className="absolute inset-0 bg-gradient-to-br from-[#BFFF00]/[0.02] via-transparent to-transparent pointer-events-none" />

                                <div className="relative">
                                    <h3 className="text-lg font-semibold text-white mb-4">The Canvas Principle</h3>
                                    <p className="text-sm text-zinc-400 leading-relaxed mb-6">
                                        Figma, Linear, and Framer use dark themes for one reason:
                                        <span className="text-white"> to make the user's content shine.</span>
                                    </p>
                                    <p className="text-sm text-zinc-400 leading-relaxed">
                                        When your users embed their Wall of Love, their colorful testimonials,
                                        photos, and videos become the focal point — not our UI.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="col-span-12 lg:col-span-6">
                            <div
                                className="p-8 rounded-2xl bg-[#0F0F11] border border-white/[0.04]"
                                style={{ boxShadow: shadows.level1 }}
                            >
                                <h3 className="text-lg font-semibold text-white mb-4">Not a Code Editor</h3>
                                <p className="text-sm text-zinc-400 leading-relaxed mb-4">
                                    Dark mode ≠ Developer tool. The difference is in the details:
                                </p>
                                <ul className="space-y-3 text-sm">
                                    <li className="flex items-start gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#BFFF00] mt-2 shrink-0" />
                                        <span className="text-zinc-300">Warm grays instead of pure black</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-white mt-2 shrink-0" />
                                        <span className="text-zinc-300">Subtle gradient accents for depth</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-zinc-500 mt-2 shrink-0" />
                                        <span className="text-zinc-300">Physical elevation (not flat shadows)</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 02: Color Philosophy */}
                <section className="mb-32">
                    <SectionHeader number="02" title="Color Philosophy" />

                    <div className="grid grid-cols-12 gap-6 mt-12">
                        {/* The Signal */}
                        <div className="col-span-12 md:col-span-4">
                            <div className="group relative h-[280px] rounded-2xl bg-[#BFFF00] p-8 flex flex-col justify-between overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <div className="relative">
                                    <Sparkles className="w-6 h-6 text-black/40" strokeWidth={1.5} />
                                </div>
                                <div className="relative">
                                    <h3 className="text-2xl font-semibold text-black tracking-tight mb-1">The Signal</h3>
                                    <p className="text-black/60 font-mono text-xs uppercase tracking-wider">#BFFF00</p>
                                </div>
                            </div>
                            <div className="mt-4 px-1">
                                <p className="text-sm text-zinc-500 leading-relaxed">
                                    <span className="text-zinc-300 font-medium">Use sparingly (10%).</span> Reserved for primary CTAs,
                                    success states, and brand identity. Never for borders or focus rings.
                                </p>
                            </div>
                        </div>

                        {/* The Focus */}
                        <div className="col-span-12 md:col-span-4">
                            <div
                                className="group relative h-[280px] rounded-2xl bg-white p-8 flex flex-col justify-between overflow-hidden"
                                style={{ boxShadow: '0 0 80px rgba(255,255,255,0.1)' }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-zinc-100 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <div className="relative">
                                    <Circle className="w-6 h-6 text-zinc-300" strokeWidth={1.5} />
                                </div>
                                <div className="relative">
                                    <h3 className="text-2xl font-semibold text-black tracking-tight mb-1">The Focus</h3>
                                    <p className="text-zinc-400 font-mono text-xs uppercase tracking-wider">#FFFFFF</p>
                                </div>
                            </div>
                            <div className="mt-4 px-1">
                                <p className="text-sm text-zinc-500 leading-relaxed">
                                    <span className="text-zinc-300 font-medium">Use functionally (30%).</span> Active toggles,
                                    checkboxes, focus rings, text highlighting. Our utility color.
                                </p>
                            </div>
                        </div>

                        {/* The Void */}
                        <div className="col-span-12 md:col-span-4">
                            <div className="group relative h-[280px] rounded-2xl bg-[#09090B] border border-white/[0.08] p-8 flex flex-col justify-between overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <div className="relative">
                                    <div className="w-6 h-6 rounded-full border border-white/20" />
                                </div>
                                <div className="relative">
                                    <h3 className="text-2xl font-semibold text-white tracking-tight mb-1">The Void</h3>
                                    <p className="text-zinc-600 font-mono text-xs uppercase tracking-wider">#09090B</p>
                                </div>
                            </div>
                            <div className="mt-4 px-1">
                                <p className="text-sm text-zinc-500 leading-relaxed">
                                    <span className="text-zinc-300 font-medium">The foundation (60%).</span> A deep,
                                    warm charcoal that provides depth for elements to breathe.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Surface Scale */}
                    <div className="mt-16">
                        <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-6">Surface Scale</h4>
                        <div className="flex gap-3">
                            {[
                                { name: 'Background', hex: '#09090B', className: 'bg-[#09090B] border border-white/[0.08]' },
                                { name: 'Surface 1', hex: '#0F0F11', className: 'bg-[#0F0F11]' },
                                { name: 'Surface 2', hex: '#18181B', className: 'bg-[#18181B]' },
                                { name: 'Surface 3', hex: '#27272A', className: 'bg-[#27272A]' },
                                { name: 'Border', hex: 'white/6%', className: 'bg-white/[0.06]' },
                                { name: 'Border Hover', hex: 'white/10%', className: 'bg-white/10' },
                            ].map((surface) => (
                                <div key={surface.name} className="flex-1 group cursor-pointer">
                                    <div className={`h-20 rounded-xl ${surface.className} transition-transform duration-200 group-hover:scale-[1.02]`} />
                                    <div className="mt-3">
                                        <p className="text-xs text-zinc-300">{surface.name}</p>
                                        <p className="text-[10px] font-mono text-zinc-600">{surface.hex}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Section 03: Elevation - THE CRITICAL SECTION */}
                <section className="mb-32">
                    <SectionHeader number="03" title="Elevation & Depth" />

                    <div className="mt-8 mb-12 max-w-2xl">
                        <p className="text-zinc-400 leading-relaxed">
                            Elevation isn't just shadow — it's <span className="text-white">light.</span> Every raised surface catches
                            light from above (inner highlight) and casts a shadow below. This creates physical presence.
                        </p>
                    </div>

                    <div className="grid grid-cols-12 gap-6 mt-12">
                        {/* Level 0 - Flat */}
                        <div className="col-span-12 md:col-span-3">
                            <div className="h-52 rounded-2xl bg-[#0F0F11] border border-white/[0.04] p-6 flex flex-col justify-between">
                                <div>
                                    <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider mb-2">Level 0</p>
                                    <p className="text-xs text-zinc-600 font-mono">No shadow</p>
                                </div>
                                <div>
                                    <p className="text-base text-white font-medium">Flat</p>
                                    <p className="text-xs text-zinc-500 mt-1">Static page content</p>
                                </div>
                            </div>
                        </div>

                        {/* Level 1 - Raised */}
                        <div className="col-span-12 md:col-span-3">
                            <div
                                className="h-52 rounded-2xl bg-[#0F0F11] border border-white/[0.05] p-6 flex flex-col justify-between transition-transform duration-300 hover:-translate-y-1"
                                style={{ boxShadow: shadows.level1 }}
                            >
                                <div>
                                    <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider mb-2">Level 1</p>
                                    <p className="text-xs text-zinc-600 font-mono">shadow.level1</p>
                                </div>
                                <div>
                                    <p className="text-base text-white font-medium">Raised</p>
                                    <p className="text-xs text-zinc-500 mt-1">Cards, containers</p>
                                </div>
                            </div>
                        </div>

                        {/* Level 2 - Floating */}
                        <div className="col-span-12 md:col-span-3">
                            <div
                                className="h-52 rounded-2xl bg-[#18181B] border border-white/[0.06] p-6 flex flex-col justify-between transition-transform duration-300 hover:-translate-y-1"
                                style={{ boxShadow: shadows.level2 }}
                            >
                                <div>
                                    <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider mb-2">Level 2</p>
                                    <p className="text-xs text-zinc-600 font-mono">shadow.level2</p>
                                </div>
                                <div>
                                    <p className="text-base text-white font-medium">Floating</p>
                                    <p className="text-xs text-zinc-500 mt-1">Dropdowns, popovers</p>
                                </div>
                            </div>
                        </div>

                        {/* Level 3 - Overlay */}
                        <div className="col-span-12 md:col-span-3">
                            <div
                                className="h-52 rounded-2xl bg-[#1C1C1F] border border-white/[0.08] p-6 flex flex-col justify-between transition-transform duration-300 hover:-translate-y-1"
                                style={{ boxShadow: shadows.level3 }}
                            >
                                <div>
                                    <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider mb-2">Level 3</p>
                                    <p className="text-xs text-zinc-600 font-mono">shadow.level3</p>
                                </div>
                                <div>
                                    <p className="text-base text-white font-medium">Overlay</p>
                                    <p className="text-xs text-zinc-500 mt-1">Modals, dialogs</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Shadow Recipe Card */}
                    <div
                        className="mt-12 p-6 rounded-2xl bg-[#0F0F11] border border-white/[0.04]"
                        style={{ boxShadow: shadows.level1 }}
                    >
                        <h4 className="text-sm font-medium text-white mb-4">Shadow Recipe</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs font-mono">
                            <div className="space-y-2">
                                <p className="text-zinc-400">Level 1 (Cards)</p>
                                <code className="block text-zinc-600 leading-relaxed">
                                    0 1px 2px rgba(0,0,0,0.3),<br />
                                    0 4px 12px rgba(0,0,0,0.2),<br />
                                    <span className="text-[#BFFF00]/60">inset 0 1px 0 rgba(255,255,255,0.04)</span>
                                </code>
                            </div>
                            <div className="space-y-2">
                                <p className="text-zinc-400">Level 2 (Dropdowns)</p>
                                <code className="block text-zinc-600 leading-relaxed">
                                    0 4px 8px rgba(0,0,0,0.4),<br />
                                    0 12px 32px rgba(0,0,0,0.35),<br />
                                    <span className="text-white/60">0 0 0 1px rgba(255,255,255,0.06)</span>,<br />
                                    <span className="text-[#BFFF00]/60">inset 0 1px 0 rgba(255,255,255,0.06)</span>
                                </code>
                            </div>
                            <div className="space-y-2">
                                <p className="text-zinc-400">Level 3 (Modals)</p>
                                <code className="block text-zinc-600 leading-relaxed">
                                    0 8px 16px rgba(0,0,0,0.5),<br />
                                    0 24px 48px rgba(0,0,0,0.4),<br />
                                    <span className="text-white/60">0 0 0 1px rgba(255,255,255,0.08)</span>,<br />
                                    <span className="text-[#BFFF00]/60">inset 0 1px 0 rgba(255,255,255,0.1)</span>
                                </code>
                            </div>
                        </div>
                        <p className="text-[10px] text-zinc-600 mt-4">
                            The <span className="text-[#BFFF00]/80">inner highlight</span> is what makes surfaces feel physical.
                        </p>
                    </div>
                </section>

                {/* Section 04: Typography */}
                <section className="mb-32">
                    <SectionHeader number="04" title="Typography" />

                    <div className="grid grid-cols-12 gap-16 mt-12">
                        {/* Display */}
                        <div className="col-span-12 lg:col-span-6">
                            <div
                                className="p-8 rounded-2xl bg-[#0F0F11] border border-white/[0.04]"
                                style={{ boxShadow: shadows.level1 }}
                            >
                                <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider mb-8">
                                    Display · Satoshi
                                </p>
                                <div className="space-y-8">
                                    <div>
                                        <h1 className="text-[48px] font-semibold text-white tracking-[-0.03em] leading-[1.1]">
                                            Display XL
                                        </h1>
                                        <p className="text-[10px] font-mono text-zinc-600 mt-2">48px / -3% tracking / 600</p>
                                    </div>
                                    <div>
                                        <h2 className="text-[32px] font-semibold text-white tracking-[-0.02em] leading-[1.2]">
                                            Display Large
                                        </h2>
                                        <p className="text-[10px] font-mono text-zinc-600 mt-2">32px / -2% tracking / 600</p>
                                    </div>
                                    <div>
                                        <h3 className="text-[24px] font-medium text-white tracking-[-0.01em] leading-[1.3]">
                                            Display Medium
                                        </h3>
                                        <p className="text-[10px] font-mono text-zinc-600 mt-2">24px / -1% tracking / 500</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="col-span-12 lg:col-span-6">
                            <div
                                className="p-8 rounded-2xl bg-[#0F0F11] border border-white/[0.04]"
                                style={{ boxShadow: shadows.level1 }}
                            >
                                <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider mb-8">
                                    Interface · Inter
                                </p>
                                <div className="space-y-8">
                                    <div>
                                        <p className="text-base text-zinc-200 leading-relaxed">
                                            Body text for primary content. The quick brown fox jumps over the lazy dog.
                                        </p>
                                        <p className="text-[10px] font-mono text-zinc-600 mt-2">16px / 160% line-height / 400</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-zinc-400 leading-relaxed">
                                            Secondary text for captions and labels. The quick brown fox jumps over the lazy dog.
                                        </p>
                                        <p className="text-[10px] font-mono text-zinc-600 mt-2">14px / 160% line-height / 400</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-zinc-500 uppercase tracking-widest font-medium">
                                            Micro Label
                                        </p>
                                        <p className="text-[10px] font-mono text-zinc-600 mt-2">12px / Uppercase / 500</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 05: Interactive Components */}
                <section className="mb-32">
                    <SectionHeader number="05" title="Interactive Components" />

                    <div className="grid grid-cols-12 gap-8 mt-12">

                        {/* Buttons */}
                        <div className="col-span-12 lg:col-span-6">
                            <div
                                className="p-8 rounded-2xl bg-[#0F0F11] border border-white/[0.04]"
                                style={{ boxShadow: shadows.level1 }}
                            >
                                <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider mb-8">
                                    Button Hierarchy
                                </p>

                                <div className="space-y-6">
                                    {/* Primary - THE SIGNAL */}
                                    <div className="flex items-center justify-between">
                                        <button
                                            className="h-10 px-5 bg-[#BFFF00] text-black font-semibold text-sm rounded-lg hover:bg-[#D4FF50] active:scale-[0.98] transition-all flex items-center gap-2"
                                            style={{ boxShadow: '0 0 20px rgba(191,255,0,0.15)' }}
                                        >
                                            Create Project
                                            <ChevronRight size={16} />
                                        </button>
                                        <span className="text-[10px] font-mono text-zinc-600">Primary · Lime</span>
                                    </div>

                                    {/* Secondary - THE FOCUS */}
                                    <div className="flex items-center justify-between">
                                        <button className="h-10 px-5 bg-white text-black font-medium text-sm rounded-lg hover:bg-zinc-100 active:scale-[0.98] transition-all">
                                            View Documentation
                                        </button>
                                        <span className="text-[10px] font-mono text-zinc-600">Secondary · White</span>
                                    </div>

                                    {/* Tertiary - Outlined */}
                                    <div className="flex items-center justify-between">
                                        <button className="h-10 px-5 bg-transparent border border-white/10 text-white font-medium text-sm rounded-lg hover:bg-white/[0.04] hover:border-white/20 active:scale-[0.98] transition-all">
                                            Settings
                                        </button>
                                        <span className="text-[10px] font-mono text-zinc-600">Tertiary · Outlined</span>
                                    </div>

                                    {/* Ghost */}
                                    <div className="flex items-center justify-between">
                                        <button className="h-10 px-5 text-zinc-400 font-medium text-sm rounded-lg hover:text-white hover:bg-white/[0.04] transition-all">
                                            Cancel
                                        </button>
                                        <span className="text-[10px] font-mono text-zinc-600">Ghost · Text only</span>
                                    </div>
                                </div>

                                <div className="mt-8 pt-6 border-t border-white/[0.04]">
                                    <p className="text-xs text-zinc-500 leading-relaxed">
                                        <span className="text-zinc-300">Rule:</span> Only one Lime button per view.
                                        It is the destination. Everything else guides.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Inputs & Form Controls */}
                        <div className="col-span-12 lg:col-span-6">
                            <div
                                className="p-8 rounded-2xl bg-[#0F0F11] border border-white/[0.04]"
                                style={{ boxShadow: shadows.level1 }}
                            >
                                <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider mb-8">
                                    Form Controls
                                </p>

                                <div className="space-y-6">
                                    {/* Text Input - Active */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-zinc-300">Project Name</label>
                                        <input
                                            type="text"
                                            defaultValue="Design System v2"
                                            className="w-full h-10 px-4 bg-[#18181B] border border-white/10 rounded-lg text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all"
                                            style={{ boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)' }}
                                        />
                                        <p className="text-[10px] text-zinc-600">Focus ring is White, not Lime.</p>
                                    </div>

                                    {/* Toggle - Active State */}
                                    <div
                                        className="flex items-center justify-between py-3 px-4 rounded-xl bg-white/[0.02] border border-white/[0.04]"
                                    >
                                        <div>
                                            <p className="text-sm text-white font-medium">Public Access</p>
                                            <p className="text-xs text-zinc-600">Anyone can view</p>
                                        </div>
                                        {/* Toggle ON: White handle, zinc track */}
                                        <div className="w-11 h-6 bg-zinc-700 rounded-full relative cursor-pointer border border-zinc-600 transition-colors">
                                            <div className="absolute right-0.5 top-0.5 bg-white w-5 h-5 rounded-full shadow-sm transition-all" />
                                        </div>
                                    </div>

                                    {/* Checkbox - Active State */}
                                    <div className="flex items-center gap-3 py-2">
                                        <div className="w-5 h-5 rounded bg-white flex items-center justify-center">
                                            <Check size={14} className="text-black" strokeWidth={2.5} />
                                        </div>
                                        <span className="text-sm text-white">Email notifications</span>
                                        <span className="text-[10px] font-mono text-zinc-600 ml-auto">Checked · White</span>
                                    </div>

                                    {/* Checkbox - Inactive */}
                                    <div className="flex items-center gap-3 py-2 opacity-60">
                                        <div className="w-5 h-5 rounded border border-zinc-600" />
                                        <span className="text-sm text-zinc-400">SMS alerts</span>
                                        <span className="text-[10px] font-mono text-zinc-600 ml-auto">Unchecked</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 06: Component Catalog */}
                <section className="mb-32">
                    <SectionHeader number="06" title="Component Catalog" />

                    <div className="grid grid-cols-12 gap-6 mt-12">

                        {/* Card - Interactive with gradient warmth */}
                        <div className="col-span-12 md:col-span-4">
                            <div
                                className="group p-6 rounded-2xl bg-[#0F0F11] border border-white/[0.04] hover:border-white/[0.08] transition-all cursor-pointer relative overflow-hidden"
                                style={{ boxShadow: shadows.level1 }}
                            >
                                {/* Subtle gradient on hover */}
                                <div className="absolute inset-0 bg-gradient-to-br from-[#BFFF00]/[0.02] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                                <div className="relative">
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center">
                                            <Sparkles className="w-5 h-5 text-zinc-400" strokeWidth={1.5} />
                                        </div>
                                        <span className="px-2 py-1 rounded-md bg-[#BFFF00]/10 text-[#BFFF00] text-[10px] font-semibold uppercase tracking-wide border border-[#BFFF00]/20">
                                            Active
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-semibold text-white tracking-tight mb-2 group-hover:text-zinc-100 transition-colors">
                                        Testimonial Campaign
                                    </h3>
                                    <p className="text-sm text-zinc-500 mb-6">
                                        Collecting feedback from early adopters via forms.
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <div className="flex -space-x-2">
                                            <div className="w-7 h-7 rounded-full bg-zinc-700 border-2 border-[#0F0F11]" />
                                            <div className="w-7 h-7 rounded-full bg-zinc-600 border-2 border-[#0F0F11]" />
                                            <div className="w-7 h-7 rounded-full bg-zinc-500 border-2 border-[#0F0F11] flex items-center justify-center text-[10px] text-white font-medium">
                                                +3
                                            </div>
                                        </div>
                                        <ArrowUpRight className="w-4 h-4 text-zinc-600 group-hover:text-white transition-colors" />
                                    </div>
                                </div>
                            </div>
                            <p className="text-[10px] text-zinc-600 mt-3 px-1">Card · Interactive</p>
                        </div>

                        {/* Search Input - Level 2 Elevation */}
                        <div className="col-span-12 md:col-span-4">
                            <div
                                className="p-1 rounded-xl bg-[#18181B] border border-white/[0.06]"
                                style={{ boxShadow: shadows.level2 }}
                            >
                                <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.04]">
                                    <Search className="w-4 h-4 text-zinc-500" />
                                    <input
                                        type="text"
                                        placeholder="Search testimonials..."
                                        className="flex-1 bg-transparent text-sm text-white placeholder:text-zinc-600 focus:outline-none"
                                    />
                                    <div className="flex items-center gap-1 text-[10px] text-zinc-600 font-mono">
                                        <span className="px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">⌘</span>
                                        <span className="px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">K</span>
                                    </div>
                                </div>
                                <div className="p-2 space-y-1">
                                    {['Recent testimonials', 'Starred items', 'All campaigns'].map((item) => (
                                        <div key={item} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/[0.04] cursor-pointer transition-colors">
                                            <Circle className="w-3 h-3 text-zinc-600" />
                                            <span className="text-sm text-zinc-300">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <p className="text-[10px] text-zinc-600 mt-3 px-1">Command Palette · Level 2</p>
                        </div>

                        {/* Action Bar */}
                        <div className="col-span-12 md:col-span-4">
                            <div
                                className="p-4 rounded-xl bg-[#18181B] border border-white/[0.06] flex items-center justify-between"
                                style={{ boxShadow: shadows.level1 }}
                            >
                                <div className="flex items-center gap-2">
                                    <button className="p-2 rounded-lg hover:bg-white/[0.04] transition-colors">
                                        <Copy className="w-4 h-4 text-zinc-400" />
                                    </button>
                                    <button className="p-2 rounded-lg hover:bg-white/[0.04] transition-colors">
                                        <Eye className="w-4 h-4 text-zinc-400" />
                                    </button>
                                    <button className="p-2 rounded-lg hover:bg-white/[0.04] transition-colors">
                                        <Settings2 className="w-4 h-4 text-zinc-400" />
                                    </button>
                                </div>
                                <button
                                    className="h-8 px-4 bg-[#BFFF00] text-black font-medium text-xs rounded-lg hover:bg-[#D4FF50] transition-all flex items-center gap-1.5"
                                    style={{ boxShadow: '0 0 12px rgba(191,255,0,0.1)' }}
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    Add
                                </button>
                            </div>
                            <p className="text-[10px] text-zinc-600 mt-3 px-1">Action Bar · Level 1</p>
                        </div>

                        {/* Toast Notifications */}
                        <div className="col-span-12 md:col-span-6">
                            <div className="space-y-3">
                                {/* Success */}
                                <div
                                    className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-[#18181B] border border-white/[0.06]"
                                    style={{ boxShadow: shadows.level2 }}
                                >
                                    <div className="w-2 h-2 rounded-full bg-[#BFFF00]" />
                                    <span className="text-sm text-zinc-200">Changes saved successfully</span>
                                </div>
                                {/* Error */}
                                <div
                                    className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-[#18181B] border border-red-900/30"
                                    style={{ boxShadow: shadows.level2 }}
                                >
                                    <div className="w-2 h-2 rounded-full bg-red-500" />
                                    <span className="text-sm text-zinc-200">Connection rejected</span>
                                </div>
                                {/* Neutral */}
                                <div
                                    className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-[#18181B] border border-white/[0.06]"
                                    style={{ boxShadow: shadows.level2 }}
                                >
                                    <div className="w-2 h-2 rounded-full bg-white" />
                                    <span className="text-sm text-zinc-200">Processing your request</span>
                                </div>
                            </div>
                            <p className="text-[10px] text-zinc-600 mt-3 px-1">Toast Notifications · Level 2</p>
                        </div>

                        {/* Data Row */}
                        <div className="col-span-12 md:col-span-6">
                            <div
                                className="rounded-xl overflow-hidden border border-white/[0.06]"
                                style={{ boxShadow: shadows.level1 }}
                            >
                                <div className="flex items-center px-4 py-3 bg-white/[0.02] border-b border-white/[0.04]">
                                    <span className="flex-1 text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Name</span>
                                    <span className="flex-1 text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Status</span>
                                    <span className="flex-1 text-[10px] font-medium text-zinc-500 uppercase tracking-wider text-right">Value</span>
                                </div>
                                {[
                                    { name: 'Campaign Alpha', status: 'Active', value: '2,450' },
                                    { name: 'Beta Launch', status: 'Archived', value: '1,280' },
                                    { name: 'Q4 Collection', status: 'Draft', value: '—' },
                                ].map((row, i) => (
                                    <div key={row.name} className={`flex items-center px-4 py-3.5 hover:bg-white/[0.02] cursor-pointer transition-colors ${i !== 2 ? 'border-b border-white/[0.04]' : ''}`}>
                                        <span className="flex-1 text-sm text-zinc-200">{row.name}</span>
                                        <span className="flex-1">
                                            <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wide ${row.status === 'Active'
                                                ? 'bg-[#BFFF00]/10 text-[#BFFF00] border border-[#BFFF00]/20'
                                                : row.status === 'Archived'
                                                    ? 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                                                    : 'bg-white/[0.04] text-zinc-500 border border-white/[0.06]'
                                                }`}>
                                                {row.status}
                                            </span>
                                        </span>
                                        <span className="flex-1 text-sm text-zinc-400 text-right tabular-nums">{row.value}</span>
                                    </div>
                                ))}
                            </div>
                            <p className="text-[10px] text-zinc-600 mt-3 px-1">Data Table · Level 1</p>
                        </div>

                    </div>
                </section>

                {/* Footer */}
                <footer className="pt-16 border-t border-white/[0.04]">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Logo size={20} color="#BFFF00" />
                            <span className="text-sm text-zinc-500">Creed.io Design System</span>
                        </div>
                        <p className="text-xs text-zinc-600">
                            The Design Studio for Social Proof.
                        </p>
                    </div>
                </footer>

            </main>
        </div>
    );
}

function SectionHeader({ number, title }: { number: string; title: string }) {
    return (
        <div className="flex items-center gap-4 pb-4 border-b border-white/[0.04]">
            <span className="text-xs font-mono text-zinc-600">{number}</span>
            <h2 className="text-xl font-semibold text-white tracking-tight">{title}</h2>
        </div>
    );
}
