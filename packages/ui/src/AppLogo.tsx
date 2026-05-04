import React from 'react';

const AppLogo = ({ size = 200, color = "#4FD1C5", strokeWidth = 6, className = "" }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer Square Frame */}
      <rect
        x="10"
        y="10"
        width="80"
        height="80"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />

      {/* Inner Diamond */}
      <path
        d="M50 30 L70 50 L50 70 L30 50 Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />

      {/* Single Connecting Lines from Diamond Corners to Outer Edges */}
      <g stroke={color} strokeWidth={strokeWidth} strokeLinecap="round">
        {/* Top corner to left edge */}
        <line x1="50" y1="30" x2="10" y2="30" />
        
        {/* Right corner to top edge */}
        <line x1="70" y1="50" x2="70" y2="10" />
        
        {/* Bottom corner to right edge */}
        <line x1="50" y1="70" x2="90" y2="70" />
        
        {/* Left corner to bottom edge */}
        <line x1="30" y1="50" x2="30" y2="90" />
      </g>
    </svg>
  );
};

export default AppLogo;
