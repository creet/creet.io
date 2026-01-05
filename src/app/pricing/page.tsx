"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, X, Sparkles, Zap, Infinity as InfinityIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const FeatureItem = ({ included, text, bold = false }: { included: boolean; text: string; bold?: boolean }) => (
    <div className={`flex items-start gap-3 text-sm ${included ? "text-foreground" : "text-muted-foreground/50"}`}>
        {included ? (
            <Check className="w-5 h-5 text-[#BFFF00] shrink-0" />
        ) : (
            <X className="w-5 h-5 text-muted-foreground/30 shrink-0" />
        )}
        <span className={`${bold ? "font-bold" : ""} ${included ? "" : "line-through decoration-muted-foreground/30"}`}>
            {text}
        </span>
    </div>
);

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PricingPage() {
    const [isLoadingPro, setIsLoadingPro] = useState(false);
    const [isLoadingLifetime, setIsLoadingLifetime] = useState(false);

    const handleBuyPro = async () => {
        setIsLoadingPro(true);
        try {
            const response = await fetch('/api/payments/checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ plan: 'pro' }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create checkout session');
            }

            if (data.checkoutUrl) {
                // Redirect to DoDoPayments checkout
                window.location.href = data.checkoutUrl;
            } else {
                throw new Error('No checkout URL returned');
            }
        } catch (error: any) {
            console.error('Checkout error:', error);
            toast.error(error.message || 'Failed to start checkout. Please try again.');
            setIsLoadingPro(false);
        }
    };

    const handleBuyLifetime = async () => {
        setIsLoadingLifetime(true);
        try {
            const response = await fetch('/api/payments/checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ plan: 'lifetime' }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create checkout session');
            }

            if (data.checkoutUrl) {
                // Redirect to DoDoPayments checkout
                window.location.href = data.checkoutUrl;
            } else {
                throw new Error('No checkout URL returned');
            }
        } catch (error: any) {
            console.error('Checkout error:', error);
            toast.error(error.message || 'Failed to start checkout. Please try again.');
            setIsLoadingLifetime(false);
        }
    };

    return (
        <div className="w-full min-h-screen bg-[#0A0A0A] text-white p-6 md:p-10 pb-20 relative overflow-x-hidden">
            {/* Minimal Back Navigation */}
            <div className="absolute top-6 left-6 md:top-8 md:left-10 z-50">
                <Link href="/dashboard" className="flex items-center gap-2 text-zinc-600 hover:text-white transition-colors group">
                    <div className="p-2 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300">Back</span>
                </Link>
            </div>

            {/* Background Decor */}
            <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-[#BFFF00]/5 blur-[120px] rounded-full pointer-events-none opacity-50 mix-blend-screen" />
            <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 blur-[120px] rounded-full pointer-events-none opacity-30 mix-blend-screen" />

            {/* Header Section */}
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-4 pt-12 md:pt-20">
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-4xl md:text-5xl font-bold font-heading tracking-tight"
                >
                    Simple pricing. <span className="text-[#BFFF00]">No hidden fees.</span>
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="text-xl text-zinc-400"
                >
                    Start for free, upgrade when you grow. <br />
                    <span className="text-sm font-medium text-zinc-500 mt-2 block">
                        🔒 30-day money-back guarantee on all paid plans.
                    </span>
                </motion.p>
            </div>

            {/* Pricing Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto mb-20 relative z-10">

                {/* Starter Plan */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex flex-col h-full bg-[#0F0F11]/50 border border-white/10 rounded-3xl p-8 hover:border-white/20 transition-colors"
                >
                    <div className="mb-6">
                        <h3 className="text-xl font-bold mb-2">Starter</h3>
                        <p className="text-sm text-zinc-500 min-h-[40px]">For hobbyists and testing.</p>
                        <div className="flex items-baseline gap-1 mt-4">
                            <span className="text-4xl font-bold">$0</span>
                            <span className="text-zinc-500">/ month</span>
                        </div>
                    </div>

                    <div className="flex-grow space-y-4 mb-8">
                        <FeatureItem included={true} text="15 Total Testimonials" />
                        <FeatureItem included={true} text="1 Project / Workspace" />
                        <FeatureItem included={true} text="2 Minutes Max Video Duration" />
                        <FeatureItem included={true} text="Standard Video Quality (720p)" />
                        <FeatureItem included={false} text="Remove Branding" bold={true} />
                        <FeatureItem included={false} text="Import from Social Media" />
                    </div>

                    <Button variant="outline" className="w-full h-12 rounded-full border-white/10 hover:bg-white/5 font-semibold">
                        Current Plan
                    </Button>
                </motion.div>

                {/* Pro Plan - Highlighted */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex flex-col h-full bg-[#0F0F11] border-2 border-[#BFFF00] rounded-3xl p-8 relative shadow-[0_0_50px_-15px_rgba(191,255,0,0.15)] transform scale-[1.02] md:-mt-4"
                >
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#BFFF00] text-black text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider">
                        Most Popular
                    </div>

                    <div className="mb-6">
                        <h3 className="text-xl font-bold mb-2 text-[#BFFF00]">Pro</h3>
                        <p className="text-sm text-zinc-400 min-h-[40px]">For serious businesses & agencies.</p>
                        <div className="flex items-baseline gap-1 mt-4">
                            <span className="text-4xl font-bold">$9</span>
                            <span className="text-zinc-500">/ month</span>
                        </div>
                    </div>

                    <div className="flex-grow space-y-4 mb-8">
                        <FeatureItem included={true} text="Unlimited Video Testimonials" />
                        <FeatureItem included={true} text="Unlimited Text Testimonials" />
                        <div className="flex flex-col gap-1">
                            <FeatureItem included={true} text="3 Projects / Workspaces" />
                            <span className="text-[10px] text-green-400 pl-8 font-bold uppercase tracking-wide">Launch Offer 🎁</span>
                        </div>
                        <FeatureItem included={true} text="5 Minutes Max Video Duration" />
                        <FeatureItem included={true} text="HD Video Quality (1080p)" />
                        <FeatureItem included={true} text="Remove Branding (White-label)" bold={true} />
                        <FeatureItem included={true} text="Auto-Import (X, LinkedIn)" />
                        <FeatureItem included={true} text="Premium Widgets" />
                    </div>

                    <Button
                        onClick={handleBuyPro}
                        disabled={isLoadingPro}
                        className="w-full h-12 rounded-full bg-[#BFFF00] text-black hover:bg-[#D4FF50] font-bold shadow-[0_0_20px_-5px_rgba(191,255,0,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoadingPro ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Redirecting...
                            </>
                        ) : (
                            'Buy Pro'
                        )}
                    </Button>
                </motion.div>

                {/* Lifetime Deal */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex flex-col h-full bg-gradient-to-b from-amber-900/10 to-[#0F0F11] border border-amber-500/30 rounded-3xl p-8 relative hover:border-amber-500/50 transition-colors"
                >
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-500 text-black text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                        <Sparkles className="w-3 h-3 fill-black" />
                        Only 49 Left
                    </div>

                    <div className="mb-6">
                        <h3 className="text-xl font-bold mb-2 text-amber-500">Founder Lifetime</h3>
                        <p className="text-sm text-zinc-500 min-h-[40px]">Pay once, own it forever.</p>
                        <div className="flex items-center gap-3 mt-4 flex-wrap">
                            <span className="text-lg text-zinc-600 line-through font-medium">$399</span>
                            <span className="text-4xl font-bold text-white">$99</span>
                            <span className="bg-amber-500/10 text-amber-500 text-xs font-bold px-2 py-1 rounded">ONE-TIME</span>
                        </div>
                    </div>

                    <div className="flex-grow space-y-4 mb-8">
                        <div className="flex items-center gap-2 mb-6 p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
                            <InfinityIcon className="w-5 h-5 text-amber-500" />
                            <span className="text-sm font-semibold text-amber-200">Everything in Pro Plan</span>
                        </div>
                        <FeatureItem included={true} text="Lifetime Access (No monthly fees)" bold={true} />
                        <FeatureItem included={true} text="Remove Branding (White-label)" />
                        <FeatureItem included={true} text="Auto-Import (X, LinkedIn)" />
                        <FeatureItem included={true} text="Priority Founder Support" />
                    </div>

                    <Button
                        onClick={handleBuyLifetime}
                        disabled={isLoadingLifetime}
                        className="w-full h-12 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-black border-0 hover:brightness-110 font-bold shadow-[0_0_20px_-5px_rgba(245,158,11,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoadingLifetime ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Redirecting...
                            </>
                        ) : (
                            'Get Lifetime Access'
                        )}
                    </Button>
                </motion.div>
            </div>

            {/* Feature Comparison Table */}
            <div className="max-w-4xl mx-auto rounded-3xl border border-white/5 bg-[#0F0F11]/50 overflow-hidden hidden md:block">
                <div className="grid grid-cols-4 bg-white/5 border-b border-white/10 p-5 text-sm font-bold text-center">
                    <div className="text-left pl-4 text-zinc-300">Features</div>
                    <div className="text-zinc-400">Starter</div>
                    <div className="text-[#BFFF00]">Pro</div>
                    <div className="text-amber-500">Lifetime</div>
                </div>

                <div className="divide-y divide-white/5 text-sm">
                    {/* Rows */}
                    {[
                        { name: "Total Testimonials", starter: "15", pro: "Unlimited", life: "Unlimited" },
                        { name: "Max Duration", starter: "2 Min", pro: "5 Min", life: "5 Min" },
                        { name: "Active Projects", starter: "1", pro: "3 (Launch)", life: "3" },
                        { name: "Remove Branding", starter: false, pro: true, life: true },
                        { name: "Social Import", starter: false, pro: true, life: true },
                        { name: "Premium Widgets", starter: false, pro: true, life: true },
                    ].map((row, i) => (
                        <div key={i} className="grid grid-cols-4 p-4 items-center text-center hover:bg-white/[0.02] transition-colors">
                            <div className="text-left pl-4 font-medium text-zinc-400">{row.name}</div>
                            <div className="text-zinc-500">
                                {typeof row.starter === 'boolean' ? (row.starter ? <Check className="w-5 h-5 text-[#BFFF00] mx-auto" /> : <X className="w-5 h-5 text-zinc-700 mx-auto" />) : row.starter}
                            </div>
                            <div className={typeof row.pro === 'string' ? "font-bold text-[#BFFF00]" : ""}>
                                {typeof row.pro === 'boolean' ? (row.pro ? <Check className="w-5 h-5 text-[#BFFF00] mx-auto" /> : <X className="w-5 h-5 text-zinc-700 mx-auto" />) : row.pro}
                            </div>
                            <div className={typeof row.life === 'string' ? "font-bold text-amber-500" : ""}>
                                {typeof row.life === 'boolean' ? (row.life ? <Check className="w-5 h-5 text-amber-500 mx-auto" /> : <X className="w-5 h-5 text-zinc-700 mx-auto" />) : row.life}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            {/* Enterprise / Contact Section */}
            <div className="max-w-4xl mx-auto mt-16 text-center pb-12">
                <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm">
                    <h3 className="text-2xl font-bold mb-3">Need Higher Limits or Enterprise Plan?</h3>
                    <p className="text-zinc-400 mb-6 max-w-xl mx-auto">
                        Looking for custom limits, dedicated support, or custom integrations?
                        We offer tailored plans for high-volume agencies and enterprises.
                    </p>
                    <a href="mailto:support@creet.io">
                        <Button variant="secondary" className="bg-white text-black hover:bg-zinc-200 font-bold px-8 h-12 rounded-full">
                            Contact Sales
                        </Button>
                    </a>
                </div>
            </div>
        </div >
    );
}
