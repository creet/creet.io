import React from 'react';

interface AppBarProps {
  maxWidthClass?: string;
  paddingXClass?: string;
  logoUrl?: string;
  onBack?: () => void;  // Optional back button handler
  showBackButton?: boolean;  // Whether to show back button on the right
}

const AppBar = ({
  maxWidthClass = 'max-w-3xl',
  paddingXClass = 'px-6 sm:px-12',
  logoUrl,
  onBack,
  showBackButton = false,
}: AppBarProps) => {
  return (
    <div className={`w-full ${paddingXClass}`}>
      <div className={`mx-auto flex w-full items-center justify-between pt-16 sm:pt-8 ${maxWidthClass}`}>
        {/* Logo aligned to start (left) */}
        <div className="flex-shrink-0">
          {logoUrl && (
            <img
              src={logoUrl}
              alt="Brand Logo"
              className="h-8 sm:h-10 w-auto object-contain"
            />
          )}
        </div>

        {/* Back button on right side - EXACT same styling as BackButton component */}
        {showBackButton && onBack && (
          <button
            onClick={onBack}
            className="p-2 rounded-full text-gray-500 hover:text-white hover:bg-white/10 transition-all group"
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
        )}
      </div>
    </div>
  );
};

export default AppBar;
