"use client";

import { motion } from "framer-motion";
import { Check, X, Sparkles, Zap, Infinity as InfinityIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

const FeatureItem = ({ included, text, bold = false }: { included: boolean; text: string; bold?: boolean }) => (
    <div className={`flex items-start gap-3 text-sm ${included ? "text-foreground" : "text-muted-foreground/50"}`}>
        {included ? (
            <Check className="w-5 h-5 text-primary shrink-0" />
        ) : (
            <X className="w-5 h-5 text-muted-foreground/30 shrink-0" />
        )}
        <span className={`${bold ? "font-bold" : ""} ${included ? "" : "line-through decoration-muted-foreground/30"}`}>
            {text}
        </span>
    </div>
);

export default function Pricing() {
    return (
        <section id="pricing" className="py-24 relative overflow-hidden bg-background">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-1/3 h-1/2 bg-primary/5 blur-[100px] rounded-full pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
                        Simple pricing. No hidden fees.
                    </h2>
                    <p className="text-xl text-muted-foreground mb-8">
                        Start for free, upgrade when you grow.
                        <br />
                        <span className="text-sm font-medium mt-2 block opacity-70">
                            🔒 30-day money-back guarantee on all paid plans.
                        </span>
                    </p>

                    {/* Toggle Placeholder */}
                    <div className="inline-flex items-center p-1 rounded-full bg-secondary/50 border border-white/5 backdrop-blur-sm">
                        <span className="px-6 py-2 rounded-full bg-background shadow-sm text-sm font-semibold">Monthly</span>
                        <span className="px-6 py-2 rounded-full text-sm font-medium text-muted-foreground opacity-50 cursor-not-allowed">
                            Yearly (Coming Soon)
                        </span>
                    </div>
                </div>

                {/* Pricing Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto mb-24">

                    {/* Plan 1: Starter */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="p-8 rounded-3xl bg-card border border-white/10 flex flex-col h-full hover:border-white/20 transition-all"
                    >
                        <div className="mb-8">
                            <h3 className="text-xl font-bold mb-2">Starter</h3>
                            <p className="text-sm text-muted-foreground mb-6">For hobbyists and testing.</p>
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-bold">$0</span>
                                <span className="text-muted-foreground">/ month</span>
                            </div>
                        </div>

                        <a href="https://app.creet.io" className="mb-8 block">
                            <Button variant="outline" className="w-full h-12 rounded-full font-semibold border-white/10 hover:bg-white/5">
                                Start for Free
                            </Button>
                        </a>

                        <div className="space-y-4 flex-grow">
                            <FeatureItem included={true} text="15 Total Testimonials (Video + Text)" />
                            <FeatureItem included={true} text="1 Project / Workspace" />
                            <FeatureItem included={true} text="2 Minutes Max Video Duration" />
                            <FeatureItem included={true} text="Standard Video Quality (720p)" />
                            <FeatureItem included={false} text="Remove 'Powered by Creet' Branding" bold={true} />
                            <FeatureItem included={false} text="Import from Social Media" />
                            <FeatureItem included={false} text="Premium Widget Designs" />
                        </div>
                    </motion.div>

                    {/* Plan 2: Pro */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="p-8 rounded-3xl bg-card border-2 border-primary/50 flex flex-col h-full relative shadow-[0_0_40px_-10px_hsl(var(--primary)/0.2)]"
                    >
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-black font-bold text-xs rounded-full uppercase tracking-wider">
                            Most Popular
                        </div>

                        <div className="mb-8">
                            <h3 className="text-xl font-bold mb-2 text-primary">Pro</h3>
                            <p className="text-sm text-muted-foreground mb-6">For serious businesses & agencies.</p>
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-bold">$9</span>
                                <span className="text-muted-foreground">/ month</span>
                            </div>
                        </div>

                        <a href="https://app.creet.io/pricing" className="mb-8 block">
                            <Button className="w-full h-12 rounded-full font-bold bg-primary text-primary-foreground hover:bg-primary/90">
                                Buy Now
                            </Button>
                        </a>

                        <div className="space-y-4 flex-grow">
                            <FeatureItem included={true} text="Unlimited Video Testimonials" />
                            <FeatureItem included={true} text="Unlimited Text Testimonials" />
                            <div className="flex flex-col gap-1">
                                <FeatureItem included={true} text="3 Projects / Workspaces" />
                                <span className="text-[10px] text-green-400 pl-8 font-medium uppercase tracking-wide">
                                    Launch Offer Only 🎁
                                </span>
                            </div>
                            <FeatureItem included={true} text="5 Minutes Max Video Duration" />
                            <FeatureItem included={true} text="HD Video Quality (1080p)" />
                            <FeatureItem included={true} text="Remove Branding (White-label)" bold={true} />
                            <FeatureItem included={true} text="Auto-Import (Twitter, LinkedIn)" />
                            <FeatureItem included={true} text="Premium Widgets (Masonry, Carousel)" />
                        </div>
                    </motion.div>

                    {/* Plan 3: Lifetime Founder */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="p-8 rounded-3xl bg-gradient-to-b from-amber-900/20 to-card border border-amber-500/30 flex flex-col h-full relative"
                    >
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-amber-500 text-black font-bold text-xs rounded-full uppercase tracking-wider flex items-center gap-1">
                            <Sparkles className="w-3 h-3 fill-black" />
                            Only 49 Left
                        </div>

                        <div className="mb-8">
                            <h3 className="text-xl font-bold mb-2 text-amber-400">Founder Lifetime</h3>
                            <p className="text-sm text-muted-foreground mb-6">Pay once, own it forever.</p>
                            <div className="flex items-baseline gap-2 flex-wrap">
                                <span className="text-xl text-muted-foreground/50 line-through decoration-red-500/50 decoration-2">$399</span>
                                <span className="text-4xl font-bold text-white">$99</span>
                                <span className="text-muted-foreground text-sm font-medium badge p-1 rounded bg-amber-500/10 text-amber-400">one-time</span>
                            </div>
                        </div>

                        <a href="https://app.creet.io/pricing" className="mb-8 block">
                            <Button className="w-full h-12 rounded-full font-bold bg-gradient-to-r from-amber-500 to-yellow-500 text-black hover:opacity-90 transition-opacity border-0">
                                Get Lifetime Access
                            </Button>
                        </a>

                        <div className="space-y-4 flex-grow">
                            <div className="flex items-center gap-2 mb-6 p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 text-left">
                                <InfinityIcon className="w-5 h-5 text-amber-400 shrink-0" />
                                <span className="text-sm font-semibold text-amber-200">Everything in Pro Plan included</span>
                            </div>

                            {/* Key Value Props Repeated for Visual Weight */}
                            <FeatureItem included={true} text="Lifetime Access (No monthly fees)" bold={true} />
                            <FeatureItem included={true} text="Remove Branding (White-label)" />
                            <FeatureItem included={true} text="Auto-Import (X, LinkedIn, etc.)" />
                            <FeatureItem included={true} text="Priority Founder Support" />
                        </div>
                    </motion.div>
                </div>

                {/* Feature Comparison Table */}
                <div className="max-w-4xl mx-auto rounded-3xl border border-white/5 bg-card/50 overflow-hidden backdrop-blur-sm hidden md:block">
                    {/* Header */}
                    <div className="grid grid-cols-4 bg-white/5 border-b border-white/10 p-4 text-sm font-bold text-center">
                        <div className="text-left pl-4">Feature Category</div>
                        <div className="">Starter</div>
                        <div className="text-primary">Pro</div>
                        <div className="text-amber-400">Lifetime</div>
                    </div>

                    {/* Table Body */}
                    <div className="divide-y divide-white/5 text-sm">
                        {/* Collection & Limits */}
                        <div className="grid grid-cols-4 p-4 items-center text-center hover:bg-white/[0.02]">
                            <div className="text-left pl-4 font-medium text-muted-foreground">Total Testimonials</div>
                            <div>15 (Video + Text)</div>
                            <div className="font-bold text-primary">Unlimited</div>
                            <div>Unlimited</div>
                        </div>
                        <div className="grid grid-cols-4 p-4 items-center text-center hover:bg-white/[0.02]">
                            <div className="text-left pl-4 font-medium text-muted-foreground">Max Duration</div>
                            <div>120 Sec</div>
                            <div>5 Mins</div>
                            <div>5 Mins</div>
                        </div>
                        <div className="grid grid-cols-4 p-4 items-center text-center hover:bg-white/[0.02]">
                            <div className="text-left pl-4 font-medium text-muted-foreground">Active Projects</div>
                            <div>1</div>
                            <div className="font-bold text-green-400">3 (Launch)</div>
                            <div>3</div>
                        </div>

                        {/* Branding */}
                        <div className="grid grid-cols-4 p-4 items-center text-center hover:bg-white/[0.02] bg-white/[0.01]">
                            <div className="text-left pl-4 font-medium text-muted-foreground">Remove Branding</div>
                            <div className="flex justify-center"><X className="w-4 h-4 text-muted-foreground/30" /></div>
                            <div className="flex justify-center"><Check className="w-4 h-4 text-primary" /></div>
                            <div className="flex justify-center"><Check className="w-4 h-4 text-amber-400" /></div>
                        </div>

                        {/* Imports */}
                        <div className="grid grid-cols-4 p-4 items-center text-center hover:bg-white/[0.02]">
                            <div className="text-left pl-4 font-medium text-muted-foreground">Social Import (X/LinkedIn)</div>
                            <div className="flex justify-center"><X className="w-4 h-4 text-muted-foreground/30" /></div>
                            <div className="flex justify-center"><Check className="w-4 h-4 text-primary" /></div>
                            <div className="flex justify-center"><Check className="w-4 h-4 text-amber-400" /></div>
                        </div>


                    </div>
                </div>

            </div>
        </section>
    );
}
