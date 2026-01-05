import React from 'react';
import { Switch } from '@/components/ui/switch';

interface ToggleCardProps {
    id: string;
    icon: React.ReactNode;
    iconColorClass: string; // e.g., "purple", "sky", "lime", etc.
    title: string;
    description: string;
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    switchColorClass?: string; // Optional custom switch color class
}

/**
 * A styled toggle card with icon, title, description and switch.
 * Used for enabling/disabling features like video testimonials, social sharing, etc.
 */
export const ToggleCard: React.FC<ToggleCardProps> = ({
    id,
    icon,
    iconColorClass,
    title,
    description,
    checked,
    onCheckedChange,
    switchColorClass = 'data-[state=checked]:bg-green-500',
}) => {
    // Map color class to Tailwind classes
    const getColorClasses = (color: string) => {
        const colorMap: Record<string, { iconBg: string; iconText: string }> = {
            purple: { iconBg: 'bg-purple-500/10', iconText: 'text-purple-400' },
            blue: { iconBg: 'bg-blue-500/10', iconText: 'text-blue-400' },
            green: { iconBg: 'bg-green-500/10', iconText: 'text-green-400' },
            lime: { iconBg: 'bg-lime-500/10', iconText: 'text-lime-400' },
            sky: { iconBg: 'bg-sky-500/10', iconText: 'text-sky-400' },
            amber: { iconBg: 'bg-amber-500/10', iconText: 'text-amber-400' },
            teal: { iconBg: 'bg-teal-500/10', iconText: 'text-teal-400' },
            emerald: { iconBg: 'bg-emerald-500/10', iconText: 'text-emerald-400' },
        };
        return colorMap[color] || colorMap.purple;
    };

    const colors = getColorClasses(iconColorClass);

    return (
        <div className="flex items-center justify-between p-4 rounded-xl bg-gray-900/30 border border-gray-800/50 hover:border-gray-700/50 transition-all duration-200">
            <label className="flex items-center gap-3 cursor-pointer">
                <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${colors.iconBg} ${colors.iconText}`}>
                    {icon}
                </div>
                <div>
                    <span className="text-sm font-medium text-white block">{title}</span>
                    <span className="text-xs text-gray-500">{description}</span>
                </div>
            </label>
            <Switch
                id={id}
                checked={checked}
                onCheckedChange={onCheckedChange}
                className={`${switchColorClass} data-[state=unchecked]:bg-gray-700 border border-gray-600`}
            />
        </div>
    );
};
