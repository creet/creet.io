"use client";

import React, { useState, useEffect, useTransition, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { uploadImageToStorage } from "@/lib/storage";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";

// ==================== TYPES ====================
type ProfileSummary = {
    id: string;
    full_name: string | null;
    plan: string | null;
    active_project_id: string | null;
    avatar_url?: string | null;
} | null;

type ProfileModalProps = {
    isOpen: boolean;
    onClose: () => void;
    user: User;
    profile: ProfileSummary;
};

type SidebarTab = "account" | "billing" | "support";

// Design system shadow presets
const shadows = {
    level1: '0 1px 2px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.2), inset 0 1px 0 0 rgba(255,255,255,0.04)',
    level2: '0 4px 8px rgba(0,0,0,0.4), 0 12px 32px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.06), inset 0 1px 0 0 rgba(255,255,255,0.06)',
    level3: '0 8px 16px rgba(0,0,0,0.5), 0 24px 48px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.08), inset 0 1px 0 0 rgba(255,255,255,0.08)',
    glowLime: '0 0 20px rgba(191,255,0,0.15)',
};

// ==================== ICONS ====================
const UserIcon = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
);

const CreditCardIcon = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <rect width="20" height="14" x="2" y="5" rx="2" />
        <line x1="2" x2="22" y1="10" y2="10" />
    </svg>
);

const HeadphonesIcon = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3" />
    </svg>
);

const MailIcon = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <rect width="20" height="16" x="2" y="4" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
);

const LogOutIcon = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" x2="9" y1="12" y2="12" />
    </svg>
);

const CloseIcon = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <line x1="18" x2="6" y1="6" y2="18" />
        <line x1="6" x2="18" y1="6" y2="18" />
    </svg>
);

const CameraIcon = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
        <circle cx="12" cy="13" r="3" />
    </svg>
);

const CheckIcon = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

const SparklesIcon = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
        <path d="M5 3v4" />
        <path d="M19 17v4" />
        <path d="M3 5h4" />
        <path d="M17 19h4" />
    </svg>
);

// ==================== SIDEBAR NAVIGATION ====================
const sidebarTabs: { id: SidebarTab; label: string; icon: React.ReactNode }[] = [
    { id: "account", label: "Account", icon: <UserIcon className="w-5 h-5" /> },
    { id: "billing", label: "Billing", icon: <CreditCardIcon className="w-5 h-5" /> },
    { id: "support", label: "Support", icon: <HeadphonesIcon className="w-5 h-5" /> },
];

// ==================== HELPER FUNCTIONS ====================
const getInitials = (value: string) => {
    return value
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part.at(0)?.toUpperCase())
        .join("")
        .slice(0, 2);
};

// ==================== ACCOUNT PANEL ====================
const AccountPanel = ({
    user,
    profile,
    onClose,
}: {
    user: User;
    profile: ProfileSummary;
    onClose: () => void;
}) => {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [isPending, startTransition] = useTransition();
    const [saveSuccess, setSaveSuccess] = useState(false);

    useEffect(() => {
        // Parse full_name into first and last name
        if (profile?.full_name) {
            const parts = profile.full_name.trim().split(" ");
            setFirstName(parts[0] || "");
            setLastName(parts.slice(1).join(" ") || "");
        } else if (user.user_metadata?.full_name) {
            const parts = String(user.user_metadata.full_name).trim().split(" ");
            setFirstName(parts[0] || "");
            setLastName(parts.slice(1).join(" ") || "");
        }

        // Set avatar URL
        setAvatarUrl(profile?.avatar_url || user.user_metadata?.avatar_url || null);
    }, [profile, user]);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatarFile(file);
            // Create preview
            const reader = new FileReader();
            reader.onload = (event) => {
                setAvatarUrl(event.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = () => {
        startTransition(async () => {
            try {
                const supabase = createClient();
                let uploadedAvatarUrl = avatarUrl;

                // Upload avatar if a new file was selected
                if (avatarFile) {
                    const result = await uploadImageToStorage({
                        file: avatarFile,
                        context: {
                            type: "user",
                            userId: user.id,
                            namespace: "avatars",
                        },
                        access: "public",
                    });
                    uploadedAvatarUrl = result.url;
                }

                const fullName = `${firstName} ${lastName}`.trim();

                // Update profile in database
                const { error } = await supabase
                    .from("profiles")
                    .update({
                        full_name: fullName,
                        avatar_url: uploadedAvatarUrl,
                    })
                    .eq("id", user.id);

                if (error) {
                    throw new Error(error.message);
                }

                // Also update user metadata
                await supabase.auth.updateUser({
                    data: {
                        full_name: fullName,
                        avatar_url: uploadedAvatarUrl,
                    },
                });

                setSaveSuccess(true);
                setTimeout(() => setSaveSuccess(false), 3000);
            } catch (error: any) {
                console.error("Failed to save profile:", error);
                alert(error.message || "Failed to save profile");
            }
        });
    };

    const displayName = firstName || lastName ? `${firstName} ${lastName}`.trim() : "User";
    const userInitials = getInitials(displayName);

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto">
                {/* Header */}
                <div className="mb-8">
                    <h2 className="text-xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-heading)' }}>Account Settings</h2>
                    <p className="text-zinc-400 text-sm">Manage your personal information and preferences</p>
                </div>

                {/* Avatar Section */}
                <div className="mb-8">
                    <Label className="text-zinc-500 text-[10px] font-medium uppercase tracking-wider mb-4 block">
                        Profile Photo
                    </Label>
                    <div className="flex items-center gap-6">
                        <div className="relative group">
                            <Avatar className="w-20 h-20 ring-2 ring-white/[0.08] group-hover:ring-[#BFFF00]/30 transition-all duration-300">
                                <AvatarImage alt={displayName} src={avatarUrl || ""} />
                                <AvatarFallback className="bg-[#18181B] text-lg font-bold text-white">
                                    {userInitials || "U"}
                                </AvatarFallback>
                            </Avatar>
                            <label
                                htmlFor="avatar-upload"
                                className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            >
                                <CameraIcon className="w-7 h-7 text-white" />
                            </label>
                            <input
                                type="file"
                                id="avatar-upload"
                                accept="image/*"
                                onChange={handleAvatarChange}
                                className="hidden"
                            />
                        </div>
                        <div>
                            <p className="text-sm text-zinc-300 mb-1">Upload a new photo</p>
                            <p className="text-xs text-zinc-500">JPG, PNG or WebP. Max 5MB.</p>
                        </div>
                    </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-5">
                    {/* First Name */}
                    <div className="space-y-2">
                        <Label htmlFor="firstName" className="text-zinc-500 text-[10px] font-medium uppercase tracking-wider">
                            First Name
                        </Label>
                        <Input
                            id="firstName"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            placeholder="Enter your first name"
                            className="h-11 bg-[#18181B] border-white/[0.08] text-white placeholder:text-zinc-600 focus:border-white focus:ring-1 focus:ring-white rounded-lg transition-all"
                            style={{ boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)' }}
                        />
                    </div>

                    {/* Last Name */}
                    <div className="space-y-2">
                        <Label htmlFor="lastName" className="text-zinc-500 text-[10px] font-medium uppercase tracking-wider">
                            Last Name
                        </Label>
                        <Input
                            id="lastName"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            placeholder="Enter your last name"
                            className="h-11 bg-[#18181B] border-white/[0.08] text-white placeholder:text-zinc-600 focus:border-white focus:ring-1 focus:ring-white rounded-lg transition-all"
                            style={{ boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)' }}
                        />
                    </div>

                    {/* Email (Read Only) */}
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-zinc-500 text-[10px] font-medium uppercase tracking-wider">
                            Email Address
                        </Label>
                        <div className="relative">
                            <Input
                                id="email"
                                value={user.email || ""}
                                disabled
                                className="h-11 bg-[#0F0F11] border-white/[0.04] text-zinc-500 rounded-lg pr-24 cursor-not-allowed"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-zinc-600 bg-[#18181B] px-2 py-1 rounded">
                                Cannot change
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Save Button */}
            <div className="pt-6 mt-6 border-t border-white/[0.06]">
                <Button
                    onClick={handleSave}
                    disabled={isPending}
                    className="w-full h-11 rounded-lg font-semibold text-sm transition-all duration-200"
                    style={{
                        backgroundColor: saveSuccess ? '#22c55e' : '#BFFF00',
                        color: '#000',
                        boxShadow: shadows.glowLime,
                    }}
                >
                    {isPending ? (
                        <span className="flex items-center gap-2">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full"
                            />
                            Saving...
                        </span>
                    ) : saveSuccess ? (
                        <span className="flex items-center gap-2">
                            <CheckIcon className="w-4 h-4" />
                            Changes Saved!
                        </span>
                    ) : (
                        "Save Changes"
                    )}
                </Button>
            </div>
        </div>
    );
};

// ==================== BILLING PANEL ====================
const BillingPanel = ({ profile }: { profile: ProfileSummary }) => {
    const planName = profile?.plan?.toLowerCase() || "hacker";
    const isPaidPlan = planName !== "hacker" && planName !== "free";

    return (
        <div className="flex flex-col h-full">
            <div className="mb-8">
                <h2 className="text-xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-heading)' }}>Billing & Plan</h2>
                <p className="text-zinc-400 text-sm">Manage your subscription and billing details</p>
            </div>

            {/* Current Plan Card */}
            <div
                className="relative overflow-hidden rounded-xl border border-white/[0.06] p-6 mb-6"
                style={{
                    backgroundColor: '#0F0F11',
                    boxShadow: shadows.level1,
                }}
            >
                {/* Subtle gradient warmth */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#BFFF00]/[0.03] via-transparent to-transparent pointer-events-none" />

                <div className="relative">
                    <div className="flex items-center gap-3 mb-4">
                        <div
                            className="w-11 h-11 rounded-xl flex items-center justify-center"
                            style={{ backgroundColor: '#BFFF00' }}
                        >
                            <SparklesIcon className="w-5 h-5 text-black" />
                        </div>
                        <div>
                            <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium">Current Plan</p>
                            <p className="text-lg font-bold text-white capitalize">{planName === "hacker" ? "Hacker (Free)" : planName}</p>
                        </div>
                    </div>

                    {!isPaidPlan && (
                        <div className="space-y-3 mt-6">
                            <p className="text-sm text-zinc-400">
                                You&apos;re currently on our free plan. Upgrade to unlock more features!
                            </p>
                            <Button
                                className="w-full h-11 rounded-lg font-semibold text-black"
                                style={{
                                    backgroundColor: '#BFFF00',
                                    boxShadow: shadows.glowLime,
                                }}
                            >
                                Upgrade Plan
                            </Button>
                        </div>
                    )}

                    {isPaidPlan && (
                        <div className="mt-6 pt-6 border-t border-white/[0.06]">
                            {planName === 'lifetime' ? (
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-zinc-400">Billing</span>
                                    <span className="text-amber-400 font-medium">Lifetime Access - No recurring charges</span>
                                </div>
                            ) : (
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-zinc-400">Next billing date</span>
                                    <span className="text-white font-medium">-</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Features List */}
            <div className="flex-1">
                <h3 className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider mb-4">
                    Plan Features
                </h3>
                <ul className="space-y-3">
                    {[
                        "Collect testimonials",
                        "Build custom forms",
                        "Create beautiful widgets",
                        isPaidPlan ? "Priority support" : "Community support",
                    ].map((feature, index) => (
                        <li key={index} className="flex items-center gap-3 text-zinc-300 text-sm">
                            <div className="w-5 h-5 rounded-full bg-[#BFFF00]/10 flex items-center justify-center">
                                <CheckIcon className="w-3 h-3 text-[#BFFF00]" />
                            </div>
                            {feature}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

// ==================== SUPPORT PANEL ====================
const SupportPanel = () => {
    return (
        <div className="flex flex-col h-full">
            <div className="mb-8">
                <h2 className="text-xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-heading)' }}>Help & Support</h2>
                <p className="text-zinc-400 text-sm">Need assistance? Reach out to our support team.</p>
            </div>

            <div
                className="flex-1 flex flex-col justify-center items-center text-center p-8 rounded-xl border border-white/[0.06]"
                style={{
                    backgroundColor: '#0F0F11',
                    boxShadow: shadows.level1,
                }}
            >
                <div
                    className="w-16 h-16 rounded-xl flex items-center justify-center mb-6"
                    style={{ backgroundColor: 'rgba(191, 255, 0, 0.1)' }}
                >
                    <MailIcon className="w-8 h-8 text-[#BFFF00]" />
                </div>

                <h3 className="text-lg font-bold text-white mb-2" style={{ fontFamily: 'var(--font-heading)' }}>Contact Support</h3>
                <p className="text-zinc-400 text-sm max-w-sm mb-6 leading-relaxed">
                    Have questions or need help with your account? Send us an email and we&apos;ll get back to you as soon as possible.
                </p>

                <a
                    href="mailto:support@creet.io"
                    className="inline-flex items-center gap-3 px-5 py-3 rounded-lg text-black font-semibold text-sm transition-all duration-200 hover:opacity-90"
                    style={{
                        backgroundColor: '#BFFF00',
                        boxShadow: shadows.glowLime,
                    }}
                >
                    <MailIcon className="w-4 h-4" />
                    support@creet.io
                </a>
            </div>
        </div>
    );
};

// ==================== MAIN COMPONENT ====================
const ProfileModal = ({ isOpen, onClose, user, profile }: ProfileModalProps) => {
    const [activeTab, setActiveTab] = useState<SidebarTab>("account");
    const router = useRouter();
    const supabase = createClient();

    const handleSignOut = useCallback(async () => {
        await supabase.auth.signOut();
        router.replace("/login");
        onClose();
    }, [supabase.auth, router, onClose]);

    const displayName = profile?.full_name?.trim() || user.user_metadata?.full_name || user.email?.split("@")[0] || "User";
    const userInitials = getInitials(displayName);
    const avatarUrl = profile?.avatar_url || user.user_metadata?.avatar_url || "";

    // Render the active panel content
    const renderContent = () => {
        switch (activeTab) {
            case "account":
                return <AccountPanel user={user} profile={profile} onClose={onClose} />;
            case "billing":
                return <BillingPanel profile={profile} />;
            case "support":
                return <SupportPanel />;
            default:
                return null;
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                        className="fixed inset-4 sm:inset-[5%] md:inset-[10%] lg:inset-[12%] z-50 flex flex-col md:flex-row overflow-hidden rounded-2xl"
                        style={{
                            backgroundColor: '#1C1C1F',
                            boxShadow: shadows.level3,
                        }}
                    >
                        {/* Subtle gradient warmth */}
                        <div className="absolute inset-0 bg-gradient-to-br from-[#BFFF00]/[0.02] via-transparent to-transparent pointer-events-none rounded-2xl" />

                        {/* Left Sidebar */}
                        <div className="relative flex-shrink-0 w-full md:w-64 border-b md:border-b-0 md:border-r border-white/[0.06] bg-[#0F0F11]/50 p-4 md:p-6 flex flex-col">
                            {/* Close Button (Mobile) */}
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 md:hidden w-9 h-9 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
                                aria-label="Close"
                            >
                                <CloseIcon className="w-5 h-5" />
                            </button>

                            {/* User Info */}
                            <div className="flex items-center gap-3 mb-8 pt-2 md:pt-0">
                                <Avatar className="w-12 h-12 ring-2 ring-white/[0.08]">
                                    <AvatarImage alt={displayName} src={avatarUrl} />
                                    <AvatarFallback className="bg-[#18181B] text-base font-bold text-white">
                                        {userInitials}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0 flex-1">
                                    <p className="font-semibold text-white text-sm truncate">{displayName}</p>
                                    <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                                </div>
                            </div>

                            {/* Navigation Tabs */}
                            <nav className="flex-1 space-y-1">
                                {sidebarTabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === tab.id
                                            ? "bg-white/[0.06] text-white"
                                            : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
                                            }`}
                                    >
                                        <span className={activeTab === tab.id ? "text-white" : "text-zinc-500"}>
                                            {tab.icon}
                                        </span>
                                        {tab.label}
                                        {activeTab === tab.id && (
                                            <motion.div
                                                layoutId="activeIndicator"
                                                className="ml-auto w-1.5 h-1.5 rounded-full bg-[#BFFF00]"
                                            />
                                        )}
                                    </button>
                                ))}
                            </nav>

                            {/* Sign Out Button */}
                            <div className="pt-4 mt-4 border-t border-white/[0.06]">
                                <button
                                    onClick={handleSignOut}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200"
                                >
                                    <LogOutIcon className="w-5 h-5" />
                                    Sign Out
                                </button>
                            </div>
                        </div>

                        {/* Main Content Area */}
                        <div className="relative flex-1 flex flex-col overflow-hidden">
                            {/* Close Button (Desktop) */}
                            <button
                                onClick={onClose}
                                className="hidden md:flex absolute top-5 right-5 w-9 h-9 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] items-center justify-center text-zinc-400 hover:text-white transition-colors z-10"
                                aria-label="Close"
                            >
                                <CloseIcon className="w-5 h-5" />
                            </button>

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto p-6 md:p-8">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={activeTab}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.2 }}
                                        className="h-full"
                                    >
                                        {renderContent()}
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default ProfileModal;
