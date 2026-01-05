import React from 'react';

interface InfoCardProps {
    icon: React.ReactNode;
    iconColorClass: string; // e.g., "purple", "green", "blue", "orange", "emerald", "teal"
    title: string;
    description: string;
}

/**
 * A styled info card component shown at the bottom of edit panels.
 * Provides contextual information about the current page type.
 */
export const InfoCard: React.FC<InfoCardProps> = ({
    icon,
    iconColorClass,
    title,
    description
}) => {
    // Map color class to actual Tailwind classes
    const getColorClasses = (color: string) => {
        const colorMap: Record<string, { bg: string; gradient: string }> = {
            purple: { bg: 'bg-purple-500/10', gradient: 'rgba(168,85,247,0.05)' },
            green: { bg: 'bg-green-500/10', gradient: 'rgba(34,197,94,0.05)' },
            blue: { bg: 'bg-blue-500/10', gradient: 'rgba(59,130,246,0.05)' },
            orange: { bg: 'bg-orange-500/10', gradient: 'rgba(249,115,22,0.05)' },
            emerald: { bg: 'bg-emerald-500/10', gradient: 'rgba(16,185,129,0.05)' },
            teal: { bg: 'bg-teal-500/10', gradient: 'rgba(20,184,166,0.05)' },
            yellow: { bg: 'bg-yellow-500/10', gradient: 'rgba(234,179,8,0.05)' },
            amber: { bg: 'bg-amber-500/10', gradient: 'rgba(245,158,11,0.05)' },
        };
        return colorMap[color] || colorMap.purple;
    };

    const colors = getColorClasses(iconColorClass);

    return (
        <div className="relative overflow-hidden rounded-xl border border-gray-800/50 bg-gradient-to-br from-gray-900/40 to-gray-900/20 p-4">
            <div
                className="absolute inset-0"
                style={{
                    background: `radial-gradient(circle at top right, ${colors.gradient}, transparent 50%)`
                }}
            />
            <div className="relative flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                    <div className={`w-8 h-8 rounded-lg ${colors.bg} flex items-center justify-center`}>
                        {icon}
                    </div>
                </div>
                <div className="flex-1 pt-0.5">
                    <p className="text-sm font-medium text-gray-200 mb-1">
                        {title}
                    </p>
                    <p className="text-xs text-gray-500 leading-relaxed">
                        {description}
                    </p>
                </div>
            </div>
        </div>
    );
};
