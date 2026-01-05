"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Logo from "@/components/ui/Logo";
import { Loader2, ArrowLeft, Mail } from "lucide-react";
import { toast } from "sonner";

// Design system shadows (matching login page)
const shadows = {
    level1: '0 1px 2px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.2), inset 0 1px 0 0 rgba(255,255,255,0.04)',
    level2: '0 4px 8px rgba(0,0,0,0.4), 0 12px 32px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.06), inset 0 1px 0 0 rgba(255,255,255,0.06)',
    level3: '0 8px 16px rgba(0,0,0,0.5), 0 24px 48px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.08), inset 0 1px 0 0 rgba(255,255,255,0.1)',
};

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const supabase = createClient();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrorMessage(null);

        if (!email) {
            setErrorMessage("Please enter your email address.");
            return;
        }

        setIsSubmitting(true);

        // Redirect to the callback route to handle the token exchange, 
        // passing the final destination as a 'next' param.
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/callback?next=/update-password`,
        });

        setIsSubmitting(false);

        if (error) {
            // Rate limit error or other issues
            setErrorMessage(error.message);
            return;
        }

        setIsSuccess(true);
        toast.success("Password reset email sent!");
    };

    return (
        <main className="min-h-screen flex items-center justify-center bg-[#09090B] p-6 relative overflow-hidden">
            {/* Ambient glow effect */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: 'radial-gradient(60% 40% at 50% 0%, rgba(191, 255, 0, 0.08) 0%, transparent 60%)',
                }}
            />

            <div className="w-full max-w-md relative z-10">
                {/* Logo Section */}
                <div className="text-center mb-10">
                    <div
                        className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#18181B] border border-white/[0.08] mb-6"
                        style={{ boxShadow: shadows.level2 }}
                    >
                        <Logo size={40} />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                        Reset Password
                    </h1>
                    <p className="text-zinc-400 text-sm">
                        Enter your email to receive a password reset link
                    </p>
                </div>

                {/* Card */}
                <div
                    className="rounded-2xl bg-[#1C1C1F] border border-white/[0.08] p-8"
                    style={{ boxShadow: shadows.level3 }}
                >
                    {/* Subtle gradient warmth */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#BFFF00]/[0.02] via-transparent to-transparent pointer-events-none rounded-2xl" />

                    <div className="relative">
                        {isSuccess ? (
                            <div className="text-center space-y-6">
                                <div className="mx-auto w-16 h-16 bg-[#BFFF00]/10 rounded-full flex items-center justify-center mb-4">
                                    <Mail className="w-8 h-8 text-[#BFFF00]" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-semibold text-white">Check your email</h3>
                                    <p className="text-zinc-400 text-sm">
                                        We've sent a password reset link to <span className="text-white font-medium">{email}</span>. Please check your inbox and spam folder.
                                    </p>
                                </div>
                                <Button
                                    variant="outline"
                                    className="w-full h-12 border-white/10 hover:bg-white/5 text-white"
                                    onClick={() => {
                                        setIsSuccess(false);
                                        setEmail("");
                                    }}
                                >
                                    Try another email
                                </Button>
                                <Link
                                    href="/login"
                                    className="block text-sm text-zinc-500 hover:text-white transition-colors mt-4"
                                >
                                    Back to Sign In
                                </Link>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-sm font-medium text-zinc-300">
                                        Email address
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="Enter your email"
                                        autoComplete="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="h-12 bg-[#18181B] border-white/[0.08] text-white placeholder:text-zinc-500 focus:ring-2 focus:ring-white/20 focus:border-white/20 rounded-xl"
                                    />
                                </div>

                                {errorMessage && (
                                    <div role="alert" className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                                        {errorMessage}
                                    </div>
                                )}

                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full h-12 bg-[#BFFF00] hover:bg-[#D4FF50] text-black font-semibold rounded-xl transition-all duration-200 disabled:opacity-50"
                                    style={{ boxShadow: isSubmitting ? 'none' : '0 0 20px rgba(191, 255, 0, 0.2)' }}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Sending link...
                                        </>
                                    ) : (
                                        "Send Reset Link"
                                    )}
                                </Button>

                                <div className="text-center pt-2">
                                    <Link
                                        href="/login"
                                        className="inline-flex items-center text-sm text-zinc-500 hover:text-white transition-colors"
                                    >
                                        <ArrowLeft className="w-4 h-4 mr-2" />
                                        Back to Sign In
                                    </Link>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
