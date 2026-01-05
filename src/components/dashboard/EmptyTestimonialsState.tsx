"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Sparkles, MessageSquarePlus, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export function EmptyTestimonialsState() {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div className="w-full h-full min-h-[500px] flex flex-col items-center justify-center p-8 text-center relative overflow-hidden rounded-2xl bg-zinc-950/30 border border-zinc-800/30">
            {/* Ambient Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[var(--color-accent)]/5 rounded-full blur-[100px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="relative z-10 flex flex-col items-center max-w-lg mx-auto"
            >
                {/* Floating Icon Composition */}
                <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="relative mb-10 group"
                >
                    {/* Glow effect behind icon */}
                    <div className="absolute inset-0 bg-[var(--color-accent)]/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                    <div className="relative size-24 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl shadow-black/50 flex items-center justify-center group-hover:border-[var(--color-accent)]/30 transition-colors duration-500">
                        <MessageSquarePlus className="size-10 text-[var(--color-accent)] opacity-90" />

                        {/* Orbiting Elements */}
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0"
                        >
                            <div className="absolute -top-3 -right-3 size-8 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center shadow-lg">
                                <Sparkles className="size-4 text-white" />
                            </div>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Text Content */}
                <div className="space-y-4 mb-10">
                    <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                        Start your collection engine
                    </h3>
                    <p className="text-zinc-400 text-sm md:text-base leading-relaxed max-w-md mx-auto">
                        Your dashboard is empty, but your reputation isn't. Create a form to start collecting video and text testimonials from your happy customers.
                    </p>
                </div>

                {/* Primary CTA */}
                <Link href="/forms" className="group relative">
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Button
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                            className="h-12 px-8 rounded-xl bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-black font-semibold text-base shadow-lg shadow-[var(--color-accent)]/20 transition-all duration-300 overflow-hidden"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                <Plus className="size-5" />
                                Create Collection Form
                            </span>

                            {/* Shine effect */}
                            <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent z-0" />
                        </Button>
                    </motion.div>
                </Link>

                {/* Secondary / Subtle Import Link */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="mt-8 flex items-center gap-2"
                >
                    <span className="text-zinc-500 text-xs">Already have reviews?</span>
                    <Link
                        href="/import/web"
                        className="text-xs font-medium text-zinc-400 hover:text-white transition-colors flex items-center gap-1 group/link"
                    >
                        Import them
                        <ArrowRight className="size-3 transition-transform group-hover/link:translate-x-0.5" />
                    </Link>
                </motion.div>
            </motion.div>
        </div>
    );
}
