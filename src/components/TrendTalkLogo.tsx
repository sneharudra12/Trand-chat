import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export const TrendTalkLogo: React.FC<LogoProps> = ({ className = '', size = 48 }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg 
        viewBox="0 0 100 100" 
        className="w-full h-full select-none"
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Glassmorphism Background Gradient */}
          <linearGradient id="glassBg" x1="0" y1="0" x2="100" y2="100">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
            <stop offset="40%" stopColor="#FFFFFF" stopOpacity="0.65" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.30" />
          </linearGradient>

          {/* Frosty Border Gradient */}
          <linearGradient id="glassBorder" x1="0" y1="0" x2="100" y2="100">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.20" />
          </linearGradient>

          {/* Vibrant Red Glossy Brand Gradient */}
          <linearGradient id="brandRed" x1="0" y1="0" x2="100" y2="100">
            <stop offset="0%" stopColor="#FF6B6B" />
            <stop offset="60%" stopColor="#FF3B30" />
            <stop offset="100%" stopColor="#D61F17" />
          </linearGradient>

          {/* Clean ambient glass drop shadow filter */}
          <filter id="glassGlow" x="-25%" y="-25%" width="150%" height="150%">
            <feDropShadow dx="0" dy="7" stdDeviation="5" floodColor="#FF3B30" floodOpacity="0.14" />
            <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#000000" floodOpacity="0.04" />
          </filter>
        </defs>

        {/* 1. Glossy Glass Speech Bubble Container */}
        <path
          d="M 28 16 
             H 72 
             A 14 14 0 0 1 86 30 
             V 54 
             A 14 14 0 0 1 72 68 
             H 54 
             L 45 77 
             A 2 2 0 0 1 41.5 75.5 
             L 41.5 68 
             H 28 
             A 14 14 0 0 1 14 54 
             V 30 
             A 14 14 0 0 1 28 16 Z"
          fill="url(#glassBg)"
          stroke="url(#glassBorder)"
          strokeWidth="1.75"
          filter="url(#glassGlow)"
        />

        {/* 2. Sleek Red brand 'T' & upward trend line */}
        <g id="logo-t-graphic" transform="translate(1, -1)">
          {/* Stem of ‘T’ */}
          <path
            d="M 48 35
               V 54
               A 4 4 0 0 0 52 58
               A 4 4 0 0 0 56 54
               V 35"
            fill="url(#brandRed)"
          />

          {/* Left segment of ‘T’ arm with 3 dots */}
          <path
            d="M 28 35
               H 48
               V 43
               H 28
               A 4 4 0 0 1 24 39
               A 4 4 0 0 1 28 35 Z"
            fill="url(#brandRed)"
          />

          {/* Rising curve originating from center of T and shooting up and to the right */}
          <path
            d="M 47.9 35
               C 56 35, 62 31, 68 25
               L 73 20"
            stroke="url(#brandRed)"
            strokeWidth="8"
            strokeLinecap="round"
          />

          {/* Sharp Upward pointing Arrowhead */}
          <path
            d="M 64.5 15.5
               H 75.5
               V 26.5"
            stroke="url(#brandRed)"
            strokeWidth="7.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* 3 pristine custom circular dots inside left arm of T */}
          <circle cx="29" cy="39" r="1.5" fill="white" />
          <circle cx="35" cy="39" r="1.5" fill="white" />
          <circle cx="41" cy="39" r="1.5" fill="white" />
        </g>
      </svg>
    </div>
  );
};
