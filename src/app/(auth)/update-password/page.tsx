"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Logo from "@/components/ui/Logo";
import { Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const shadows = {
    level1: '0 1px 2px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.2), inset 0 1px 0 0 rgba(255,255,255,0.04)',
    level2: '0 4px 8px rgba(0,0,0,0.4), 0 12px 32px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.06), inset 0 1px 0 0 rgba(255,255,255,0.06)',
    level3: '0 8px 16px rgba(0,0,0,0.5), 0 24px 48px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.08), inset 0 1px 0 0 rgba(255,255,255,0.1)',
};

export default function UpdatePasswordPage() {
    const router = useRouter();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const supabase = createClient();

    // Protect the route: ensure user is authenticated (which they should be after clicking the email link)
    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                // If no session, they probably shouldn't be here, or the link expired.
                // But let's show the form anyway, the update will fail if not auth'd.
                // Actually, better to redirect to login if no session.
                router.replace("/login");
            }
        };
        checkSession();
    }, [supabase, router]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrorMessage(null);

        if (password.length < 6) {
            setErrorMessage("Password must be at least 6 characters");
            return;
        }

        if (password !== confirmPassword) {
            setErrorMessage("Passwords do not match");
            return;
        }

        setIsSubmitting(true);

        const { error } = await supabase.auth.updateUser({
            password: password
        });

        if (error) {
            setIsSubmitting(false);
            setErrorMessage(error.message);
            return;
        }

        toast.success("Password updated successfully!");

        // Redirect to dashboard
        router.replace("/dashboard");
        setIsSubmitting(false);
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
                        Set new password
                    </h1>
                    <p className="text-zinc-400 text-sm">
                        Your new password must be different from your previous used passwords
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
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-sm font-medium text-zinc-300">
                                    New Password
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="Enter new password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="h-12 bg-[#18181B] border-white/[0.08] text-white placeholder:text-zinc-500 focus:ring-2 focus:ring-white/20 focus:border-white/20 rounded-xl"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword" className="text-sm font-medium text-zinc-300">
                                    Confirm Password
                                </Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="Confirm new password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                                        Updating...
                                    </>
                                ) : (
                                    "Reset Password"
                                )}
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </main>
    );
}
