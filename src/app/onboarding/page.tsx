"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createProject } from "@/lib/actions/projects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Logo from "@/components/ui/Logo";
import { Loader2, ArrowRight, Sparkles } from "lucide-react";

// Design system shadows
const shadows = {
    level1: '0 1px 2px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.2), inset 0 1px 0 0 rgba(255,255,255,0.04)',
    level2: '0 4px 8px rgba(0,0,0,0.4), 0 12px 32px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.06), inset 0 1px 0 0 rgba(255,255,255,0.06)',
    level3: '0 8px 16px rgba(0,0,0,0.5), 0 24px 48px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.08), inset 0 1px 0 0 rgba(255,255,255,0.1)',
};

export default function OnboardingPage() {
    const [projectName, setProjectName] = useState("");
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState("");
    const [isFocused, setIsFocused] = useState(false);
    const router = useRouter();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!projectName.trim()) {
            setError("Project name is required");
            return;
        }

        startTransition(async () => {
            try {
                const formData = new FormData();
                formData.append("name", projectName);
                const result = await createProject(formData);

                // Project created successfully, redirect to dashboard
                router.push("/dashboard");
                router.refresh();
            } catch (err: any) {
                setError(err.message || "Failed to create project");
            }
        });
    };

    return (
        <div className="min-h-screen bg-[#09090B] flex items-center justify-center p-6 relative overflow-hidden">
            {/* Ambient glow effect */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: 'radial-gradient(60% 40% at 50% 0%, rgba(191, 255, 0, 0.08) 0%, transparent 60%)',
                }}
            />

            {/* Subtle grid pattern for depth */}
            <div
                className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                    backgroundImage: `linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)`,
                    backgroundSize: '64px 64px'
                }}
            />

            <div className="relative w-full max-w-md z-10">
                {/* Logo and Welcome */}
                <div className="text-center mb-12">
                    <div
                        className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#18181B] border border-white/[0.08] mb-6 transition-transform hover:scale-105"
                        style={{ boxShadow: shadows.level2 }}
                    >
                        <Logo size={40} />
                    </div>
                    <h1
                        className="text-3xl font-bold text-white mb-3 tracking-tight"
                        style={{ fontFamily: 'var(--font-heading)' }}
                    >
                        Welcome to Creet
                    </h1>
                    <p className="text-zinc-400 text-base leading-relaxed">
                        Let's create your first project to get started
                    </p>
                </div>

                {/* Onboarding Card */}
                <div
                    className="rounded-2xl bg-[#1C1C1F] border border-white/[0.08] p-8 relative"
                    style={{ boxShadow: shadows.level3 }}
                >
                    {/* Subtle gradient warmth */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#BFFF00]/[0.02] via-transparent to-transparent pointer-events-none rounded-2xl" />

                    <div className="relative">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-3">
                                <Label
                                    htmlFor="projectName"
                                    className="text-sm font-medium text-zinc-300"
                                >
                                    Project name
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="projectName"
                                        type="text"
                                        value={projectName}
                                        onChange={(e) => setProjectName(e.target.value)}
                                        onFocus={() => setIsFocused(true)}
                                        onBlur={() => setIsFocused(false)}
                                        placeholder="Acme Inc"
                                        className={`h-12 bg-[#18181B] border-white/[0.08] text-white placeholder:text-zinc-500 rounded-xl transition-all duration-200 ${isFocused
                                            ? 'border-white/20 ring-2 ring-white/10'
                                            : 'hover:border-white/[0.12]'
                                            }`}
                                        disabled={isPending}
                                        autoFocus
                                        required
                                    />
                                </div>
                                <p className="text-xs text-zinc-500 leading-relaxed">
                                    Choose a name for your workspace. You can always change this later.
                                </p>
                            </div>

                            {error && (
                                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                                    {error}
                                </div>
                            )}

                            <Button
                                type="submit"
                                disabled={isPending || !projectName.trim()}
                                className="w-full h-12 bg-[#BFFF00] hover:bg-[#D4FF50] text-black font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
                                style={{ boxShadow: isPending || !projectName.trim() ? 'none' : '0 0 20px rgba(191, 255, 0, 0.2)' }}
                            >
                                {isPending ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Creating workspace...
                                    </>
                                ) : (
                                    <>
                                        Continue
                                        <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-0.5" />
                                    </>
                                )}
                            </Button>
                        </form>
                    </div>
                </div>

                {/* Footer note */}
                <p className="text-center text-sm text-zinc-500 mt-8">
                    Need help?{" "}
                    <a
                        href="mailto:support@creet.io"
                        className="text-white hover:text-zinc-300 underline underline-offset-2 transition-colors"
                    >
                        Get in touch
                    </a>
                </p>
            </div>
        </div>
    );
}
