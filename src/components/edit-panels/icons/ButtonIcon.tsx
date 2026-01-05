import React from 'react';

export const ButtonIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        <rect x="3" y="8" width="18" height="8" rx="2" ry="2" />
        <line x1="12" y1="12" x2="12" y2="12" />
    </svg>
);
