import React from 'react';

export default function PublicFormLoading() {
    return (
        <div className="w-full h-screen bg-gray-950 flex flex-col items-center justify-center relative overflow-hidden">
            {/* Background Glow Effect (similar to WelcomeCard) */}
            <div className="absolute -inset-24 bg-[#BFFF00]/10 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)] blur-3xl opacity-60 pointer-events-none" />

            {/* Animated loading indicator */}
            <div className="relative z-10 flex flex-col items-center gap-8">
                {/* Pulse circles with premium styling */}
                <div className="relative">
                    {/* Outer ring */}
                    <div className="w-16 h-16 rounded-full border-2 border-white/10" />
                    {/* Spinning gradient ring */}
                    <div className="absolute inset-0 w-16 h-16 border-2 border-transparent border-t-[#BFFF00] rounded-full animate-spin" />
                    {/* Inner glow */}
                    <div className="absolute inset-0 bg-[#BFFF00]/20 blur-xl rounded-full animate-pulse" />
                </div>

                {/* Loading text */}
                <div className="text-center space-y-2">
                    <div className="h-6 w-32 bg-white/10 rounded animate-pulse mx-auto" />
                    <div className="h-4 w-48 bg-white/5 rounded animate-pulse mx-auto" />
                </div>
            </div>

            {/* Subtle background pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff05_1px,transparent_1px)] [background-size:32px_32px] pointer-events-none opacity-50" />
        </div>
    );
}
