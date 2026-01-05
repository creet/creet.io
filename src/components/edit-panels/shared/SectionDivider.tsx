import React from 'react';

interface SectionDividerProps {
    label: string;
}

/**
 * A styled divider component with a centered label.
 * Used to separate sections within edit panels.
 */
export const SectionDivider: React.FC<SectionDividerProps> = ({ label }) => (
    <div className="relative">
        <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-800" />
        </div>
        <div className="relative flex justify-center text-xs">
            <span className="bg-gray-950 px-3 text-gray-500 font-medium tracking-wide">
                {label}
            </span>
        </div>
    </div>
);
