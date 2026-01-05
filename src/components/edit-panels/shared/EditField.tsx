import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface EditFieldProps {
    id: string;
    label: string;
    icon: React.ReactNode;
    iconColorClass: string; // e.g., "purple", "blue", "green", "orange", "teal", "cyan", etc.
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    type?: 'input' | 'textarea';
    rows?: number;
    inputRef?: React.RefObject<HTMLInputElement | HTMLTextAreaElement | null>;
    helperText?: string;
}

/**
 * A unified form field component with icon, label, and styled input/textarea.
 * Handles both single-line inputs and multi-line textareas.
 */
export const EditField: React.FC<EditFieldProps> = ({
    id,
    label,
    icon,
    iconColorClass,
    value,
    onChange,
    placeholder,
    type = 'input',
    rows = 3,
    inputRef,
    helperText,
}) => {
    // Map color class to Tailwind classes for icon background and focus states
    const getColorClasses = (color: string) => {
        const colorMap: Record<string, { iconBg: string; iconText: string; focusBorder: string; focusRing: string }> = {
            purple: { iconBg: 'bg-purple-500/10', iconText: 'text-purple-400', focusBorder: 'focus:border-purple-500/50', focusRing: 'focus:ring-purple-500/20' },
            violet: { iconBg: 'bg-violet-500/10', iconText: 'text-violet-400', focusBorder: 'focus:border-violet-500/50', focusRing: 'focus:ring-violet-500/20' },
            blue: { iconBg: 'bg-blue-500/10', iconText: 'text-blue-400', focusBorder: 'focus:border-blue-500/50', focusRing: 'focus:ring-blue-500/20' },
            green: { iconBg: 'bg-green-500/10', iconText: 'text-green-400', focusBorder: 'focus:border-green-500/50', focusRing: 'focus:ring-green-500/20' },
            emerald: { iconBg: 'bg-emerald-500/10', iconText: 'text-emerald-400', focusBorder: 'focus:border-emerald-500/50', focusRing: 'focus:ring-emerald-500/20' },
            teal: { iconBg: 'bg-teal-500/10', iconText: 'text-teal-400', focusBorder: 'focus:border-teal-500/50', focusRing: 'focus:ring-teal-500/20' },
            cyan: { iconBg: 'bg-cyan-500/10', iconText: 'text-cyan-400', focusBorder: 'focus:border-cyan-500/50', focusRing: 'focus:ring-cyan-500/20' },
            sky: { iconBg: 'bg-sky-500/10', iconText: 'text-sky-400', focusBorder: 'focus:border-sky-500/50', focusRing: 'focus:ring-sky-500/20' },
            indigo: { iconBg: 'bg-indigo-500/10', iconText: 'text-indigo-400', focusBorder: 'focus:border-indigo-500/50', focusRing: 'focus:ring-indigo-500/20' },
            fuchsia: { iconBg: 'bg-fuchsia-500/10', iconText: 'text-fuchsia-400', focusBorder: 'focus:border-fuchsia-500/50', focusRing: 'focus:ring-fuchsia-500/20' },
            orange: { iconBg: 'bg-orange-500/10', iconText: 'text-orange-400', focusBorder: 'focus:border-orange-500/50', focusRing: 'focus:ring-orange-500/20' },
            amber: { iconBg: 'bg-amber-500/10', iconText: 'text-amber-400', focusBorder: 'focus:border-amber-500/50', focusRing: 'focus:ring-amber-500/20' },
            yellow: { iconBg: 'bg-yellow-500/10', iconText: 'text-yellow-400', focusBorder: 'focus:border-yellow-500/50', focusRing: 'focus:ring-yellow-500/20' },
            rose: { iconBg: 'bg-rose-500/10', iconText: 'text-rose-400', focusBorder: 'focus:border-rose-500/50', focusRing: 'focus:ring-rose-500/20' },
            pink: { iconBg: 'bg-pink-500/10', iconText: 'text-pink-400', focusBorder: 'focus:border-pink-500/50', focusRing: 'focus:ring-pink-500/20' },
        };
        return colorMap[color] || colorMap.purple;
    };

    const colors = getColorClasses(iconColorClass);

    const baseInputClasses = `bg-gray-900/50 border-gray-800 text-white placeholder:text-gray-600 focus:bg-gray-900 ${colors.focusBorder} focus:ring-2 ${colors.focusRing} transition-all duration-200`;

    return (
        <div className="group">
            <label
                htmlFor={id}
                className="flex items-center gap-2 text-sm font-semibold text-white mb-3"
            >
                <div className={`flex items-center justify-center w-6 h-6 rounded-md ${colors.iconBg} ${colors.iconText} transition-colors group-hover:opacity-80`}>
                    {icon}
                </div>
                {label}
            </label>

            {type === 'input' ? (
                <Input
                    ref={inputRef as React.RefObject<HTMLInputElement>}
                    id={id}
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className={`${baseInputClasses} h-11`}
                />
            ) : (
                <Textarea
                    ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                    id={id}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className={`${baseInputClasses} min-h-[90px] resize-none leading-relaxed`}
                    rows={rows}
                />
            )}

            {helperText && (
                <p className="text-xs text-gray-500 mt-2 ml-1">
                    {helperText}
                </p>
            )}
        </div>
    );
};
