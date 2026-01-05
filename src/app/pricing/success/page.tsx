"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PaymentSuccessPage() {
    return (
        <div className="w-full min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center relative overflow-hidden">
            {/* Background Glow */}
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#BFFF00]/10 blur-[150px] rounded-full pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 text-center max-w-lg mx-auto px-6"
            >
                {/* Success Icon */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="mb-8"
                >
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-[#BFFF00]/20 border-2 border-[#BFFF00]/30">
                        <CheckCircle className="w-12 h-12 text-[#BFFF00]" />
                    </div>
                </motion.div>

                {/* Title */}
                <h1 className="text-4xl font-bold mb-4">
                    Welcome to <span className="text-[#BFFF00]">Pro!</span>
                </h1>

                {/* Description */}
                <p className="text-zinc-400 text-lg mb-8">
                    Your payment was successful. You now have access to unlimited testimonials,
                    premium widgets, and all Pro features.
                </p>

                {/* Features Unlocked */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 text-left">
                    <p className="text-sm font-bold text-[#BFFF00] uppercase tracking-wider mb-4">
                        ✨ Features Unlocked
                    </p>
                    <ul className="space-y-3 text-sm text-zinc-300">
                        <li className="flex items-center gap-3">
                            <CheckCircle className="w-4 h-4 text-[#BFFF00]" />
                            Unlimited Video & Text Testimonials
                        </li>
                        <li className="flex items-center gap-3">
                            <CheckCircle className="w-4 h-4 text-[#BFFF00]" />
                            Remove "Powered by Creet" Branding
                        </li>
                        <li className="flex items-center gap-3">
                            <CheckCircle className="w-4 h-4 text-[#BFFF00]" />
                            Auto-Import from X & LinkedIn
                        </li>
                        <li className="flex items-center gap-3">
                            <CheckCircle className="w-4 h-4 text-[#BFFF00]" />
                            Premium Widget Designs
                        </li>
                    </ul>
                </div>

                {/* CTA */}
                <Link href="/dashboard">
                    <Button className="bg-[#BFFF00] hover:bg-[#D4FF50] text-black font-bold h-12 px-8 rounded-full shadow-[0_0_20px_-5px_rgba(191,255,0,0.4)] transition-all">
                        Go to Dashboard
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </Link>
            </motion.div>
        </div>
    );
}
