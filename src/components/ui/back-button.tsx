import React from 'react';

interface BackButtonProps {
    onClick: () => void;
    className?: string;
}

const BackButton: React.FC<BackButtonProps> = ({ onClick, className = '' }) => {
    return (
        <button
            onClick={onClick}
            className={`absolute top-4 left-4 sm:left-6 p-2 rounded-full text-gray-500 hover:text-white hover:bg-white/10 transition-all group z-20 ${className}`}
            aria-label="Go back"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                stroke="currentColor"
                fill="none"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="group-hover:-translate-x-0.5 transition-transform"
            >
                <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
        </button>
    );
};

export default BackButton;
