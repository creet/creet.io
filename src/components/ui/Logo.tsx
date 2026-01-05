import React from 'react';

interface LogoProps {
    className?: string;
    size?: number;
    strokeWidth?: number;
    color?: string;
    'aria-hidden'?: boolean;
}

/**
 * Creet Shield Check Logo
 * A reusable SVG logo component for the application
 */
const Logo: React.FC<LogoProps> = ({
    className = '',
    size = 24,
    strokeWidth = 2,
    color = '#bfff00',
    'aria-hidden': ariaHidden = true
}) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            aria-hidden={ariaHidden}
        >
            <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
            <path d="m9 12 2 2 4-4" />
        </svg>
    );
};

export default Logo;
