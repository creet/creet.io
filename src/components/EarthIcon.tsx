import React from "react";

type EarthIconProps = {
  size?: number;
  className?: string;
  title?: string;
};

const EarthIcon: React.FC<EarthIconProps> = ({ size = 160, className, title = "Earth" }) => {
  const s = size;
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 100 100"
      role="img"
      aria-label={title}
      className={className}
    >
      <defs>
        <radialGradient id="earth-ocean" cx="50%" cy="45%" r="60%">
          <stop offset="0%" stopColor="#1fb6ff" />
          <stop offset="60%" stopColor="#0077ff" />
          <stop offset="100%" stopColor="#003b99" />
        </radialGradient>
        <filter id="earth-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000" floodOpacity="0.35" />
        </filter>
      </defs>

      <g filter="url(#earth-shadow)">
        <circle cx="50" cy="50" r="45" fill="url(#earth-ocean)" />
        {/* simplified landmasses */}
        {/* Americas */}
        <path
          d="M28 30c-3.6 3.2-5 7.7-4.6 11 .3 2.2 1.8 3.7 3.6 4.9 2 .1 2.6 3 2.1 4.4-.7 1.8-2.9 3.2-4.5 4.3-1 .6-1 1.9.1 2.8 3 2.5 8.3 2.6 11.8.7 3-1.6 4.7-4.4 5-7.4.3-2.9-.6-5.8-2.5-8.1-2.1-2.5-3.3-5-3.3-8-.1-3.3-1.4-6.3-3.2-8.1-1.3-1.2-2.8-1.4-4-.5z"
          fill="#7fe7a7"
        />
        {/* Eurasia / Africa */}
        <path
          d="M61 27.5c4.3.9 8.7 3.3 11.3 6.9 3.2 4.4 3.5 10.3 2.1 14.7-.7 2.3-2.4 4.1-4.4 5.1-1.9 1-3.3 2.6-3.4 4.7-.1 2.4 1.7 4.6 3.9 5.6 2.2 1 5 .9 7.2.1 1.9-.7 3.5-2.5 4.1-4.4.8-4.2.4-9.4-1.8-13.3-2.2-3.8-5.5-6.6-9.6-8.3-2.6-1-4.7-2.7-5.8-4.7-.4-.9-1.3-1.8-3.6-1.9z"
          fill="#66d390"
        />
        {/* Antarctica */}
        <path d="M35 83c4 .8 8.6 1.2 13.5 1 4.9-.1 9.6-.7 13.5-1.7 1.6-.4 2.6 1.6 1.2 2.6-3.6 2.6-8.7 4.1-14.8 4.1-6 0-11-1.3-14.7-3.7-1.6-1.1-.8-3 .8-2.3z" fill="#7fe7a7" opacity=".9"/>
        {/* Islands */}
        <circle cx="73" cy="53" r="1.1" fill="#7fe7a7" />
        <circle cx="70" cy="57" r="0.8" fill="#7fe7a7" />
        <circle cx="67" cy="60" r="0.7" fill="#7fe7a7" />
        {/* glossy highlight */}
        <circle cx="50" cy="28" r="8" fill="#fff" opacity="0.2" />
      </g>
    </svg>
  );
};

export default EarthIcon;


