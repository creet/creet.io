"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { XCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PaymentCancelPage() {
    return (
        <div className="w-full min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center relative overflow-hidden">
            {/* Background */}
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-zinc-500/5 blur-[150px] rounded-full pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 text-center max-w-lg mx-auto px-6"
            >
                {/* Icon */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="mb-8"
                >
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-zinc-800 border-2 border-zinc-700">
                        <XCircle className="w-12 h-12 text-zinc-500" />
                    </div>
                </motion.div>

                {/* Title */}
                <h1 className="text-3xl font-bold mb-4">
                    Payment Cancelled
                </h1>

                {/* Description */}
                <p className="text-zinc-400 text-lg mb-8">
                    No worries! Your payment was cancelled and you haven't been charged.
                    You can try again whenever you're ready.
                </p>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/pricing">
                        <Button className="bg-[#BFFF00] hover:bg-[#D4FF50] text-black font-bold h-12 px-8 rounded-full">
                            Try Again
                        </Button>
                    </Link>
                    <Link href="/dashboard">
                        <Button variant="outline" className="border-white/10 hover:bg-white/5 font-semibold h-12 px-8 rounded-full">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Dashboard
                        </Button>
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
