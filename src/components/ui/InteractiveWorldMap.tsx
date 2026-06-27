"use client";
import React from "react";

interface InteractiveWorldMapProps {
  activeRegion: string;
  hoveredRegion: string | null;
}

const regionOverlays: Record<string, { cx: number; cy: number; rx: number; ry: number; label: string }> = {
  "south-west-america": { cx: 175, cy: 230, rx: 72, ry: 60, label: "South West America" },
  "north-east-america": { cx: 255, cy: 165, rx: 68, ry: 55, label: "North East America" },
  "uk": { cx: 468, cy: 138, rx: 28, ry: 28, label: "UK" },
  "africa": { cx: 510, cy: 295, rx: 68, ry: 80, label: "Africa" },
  "india": { cx: 650, cy: 265, rx: 48, ry: 55, label: "India" },
};

export default function InteractiveWorldMap({ activeRegion, hoveredRegion }: InteractiveWorldMapProps) {
  const highlighted = hoveredRegion || activeRegion;

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden" style={{ background: "#A8D5E8" }}>
      {/* Modern Google Maps-style SVG world map */}
      <svg
        viewBox="0 0 1000 500"
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: "block" }}
      >
        <defs>
          {/* Ocean gradient */}
          <linearGradient id="oceanGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#B8DCF0" />
            <stop offset="100%" stopColor="#8EC8E8" />
          </linearGradient>

          {/* Land gradient */}
          <linearGradient id="landGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#E8F0D8" />
            <stop offset="100%" stopColor="#D4E6B8" />
          </linearGradient>

          {/* Highlight gradient */}
          <radialGradient id="highlightGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#E8406A" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#E8406A" stopOpacity="0.08" />
          </radialGradient>

          <filter id="regionGlow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="10" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="dotGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="labelShadow" x="-20%" y="-40%" width="140%" height="180%">
            <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="rgba(0,0,0,0.5)" />
          </filter>

          <filter id="mapShadow">
            <feDropShadow dx="1" dy="2" stdDeviation="3" floodColor="rgba(0,0,0,0.15)" />
          </filter>
        </defs>

        {/* Ocean background */}
        <rect width="1000" height="500" fill="url(#oceanGrad)" />

        {/* Latitude/Longitude grid lines — subtle */}
        <g stroke="#9AC8E0" strokeWidth="0.4" opacity="0.6">
          {/* Horizontal latitude lines */}
          {[50, 100, 150, 200, 250, 300, 350, 400, 450].map(y => (
            <line key={`h${y}`} x1="0" y1={y} x2="1000" y2={y} />
          ))}
          {/* Vertical longitude lines */}
          {[100, 200, 300, 400, 500, 600, 700, 800, 900].map(x => (
            <line key={`v${x}`} x1={x} y1="0" x2={x} y2="500" />
          ))}
        </g>

        {/* Equator line */}
        <line x1="0" y1="250" x2="1000" y2="250" stroke="#7BBAD4" strokeWidth="0.8" strokeDasharray="6,4" opacity="0.7" />

        {/* ===== CONTINENTS ===== */}
        {/* All continent paths use simplified but recognizable shapes */}

        {/* North America */}
        <path
          d="M 60 60 L 120 50 L 200 55 L 280 70 L 320 90 L 340 120 L 330 160 L 310 200 L 290 240 L 270 270 L 240 280 L 210 275 L 180 260 L 150 240 L 130 210 L 110 180 L 90 150 L 70 120 Z"
          fill="url(#landGrad)"
          stroke="#C8D8A8"
          strokeWidth="1"
          filter="url(#mapShadow)"
        />

        {/* Central America */}
        <path
          d="M 210 275 L 240 280 L 250 300 L 235 315 L 220 310 L 205 295 Z"
          fill="url(#landGrad)"
          stroke="#C8D8A8"
          strokeWidth="0.8"
        />

        {/* South America */}
        <path
          d="M 220 310 L 260 305 L 300 315 L 330 340 L 340 380 L 330 420 L 300 450 L 265 460 L 235 450 L 210 420 L 200 385 L 205 350 L 215 325 Z"
          fill="url(#landGrad)"
          stroke="#C8D8A8"
          strokeWidth="1"
          filter="url(#mapShadow)"
        />

        {/* Greenland */}
        <path
          d="M 310 30 L 360 20 L 400 30 L 410 55 L 390 70 L 350 75 L 315 60 Z"
          fill="#E0ECC8"
          stroke="#C8D8A8"
          strokeWidth="0.8"
        />

        {/* Europe */}
        <path
          d="M 430 80 L 480 70 L 520 75 L 540 90 L 535 115 L 515 130 L 490 140 L 460 145 L 440 135 L 425 115 L 425 95 Z"
          fill="url(#landGrad)"
          stroke="#C8D8A8"
          strokeWidth="1"
          filter="url(#mapShadow)"
        />

        {/* Scandinavia */}
        <path
          d="M 460 50 L 490 45 L 510 55 L 505 75 L 480 80 L 460 70 Z"
          fill="url(#landGrad)"
          stroke="#C8D8A8"
          strokeWidth="0.8"
        />

        {/* UK */}
        <path
          d="M 448 110 L 462 105 L 470 115 L 465 130 L 452 132 L 445 122 Z"
          fill="url(#landGrad)"
          stroke="#C8D8A8"
          strokeWidth="0.8"
        />

        {/* Africa */}
        <path
          d="M 450 155 L 510 150 L 560 160 L 590 185 L 600 220 L 595 265 L 580 310 L 555 355 L 525 385 L 500 390 L 475 380 L 455 350 L 440 310 L 435 265 L 438 220 L 445 185 Z"
          fill="url(#landGrad)"
          stroke="#C8D8A8"
          strokeWidth="1"
          filter="url(#mapShadow)"
        />

        {/* Madagascar */}
        <path
          d="M 600 310 L 615 305 L 620 330 L 610 355 L 598 350 L 595 330 Z"
          fill="url(#landGrad)"
          stroke="#C8D8A8"
          strokeWidth="0.6"
        />

        {/* Middle East */}
        <path
          d="M 560 145 L 610 140 L 640 155 L 645 180 L 625 195 L 595 195 L 565 185 L 555 165 Z"
          fill="url(#landGrad)"
          stroke="#C8D8A8"
          strokeWidth="0.8"
        />

        {/* Russia / Central Asia */}
        <path
          d="M 530 40 L 650 30 L 780 35 L 850 50 L 870 75 L 840 100 L 780 110 L 700 115 L 630 110 L 570 105 L 540 90 L 525 65 Z"
          fill="url(#landGrad)"
          stroke="#C8D8A8"
          strokeWidth="1"
          filter="url(#mapShadow)"
        />

        {/* India */}
        <path
          d="M 620 175 L 670 170 L 695 190 L 700 225 L 690 265 L 670 290 L 648 295 L 628 280 L 615 250 L 610 215 L 615 190 Z"
          fill="url(#landGrad)"
          stroke="#C8D8A8"
          strokeWidth="1"
          filter="url(#mapShadow)"
        />

        {/* Sri Lanka */}
        <path
          d="M 668 300 L 678 298 L 680 312 L 670 315 L 664 308 Z"
          fill="url(#landGrad)"
          stroke="#C8D8A8"
          strokeWidth="0.5"
        />

        {/* Southeast Asia */}
        <path
          d="M 710 160 L 760 155 L 790 165 L 800 185 L 785 205 L 755 215 L 725 210 L 705 195 L 705 175 Z"
          fill="url(#landGrad)"
          stroke="#C8D8A8"
          strokeWidth="0.8"
        />

        {/* China / East Asia */}
        <path
          d="M 700 100 L 780 95 L 840 105 L 870 125 L 865 155 L 840 170 L 800 175 L 755 170 L 715 160 L 700 140 L 695 120 Z"
          fill="url(#landGrad)"
          stroke="#C8D8A8"
          strokeWidth="1"
        />

        {/* Japan */}
        <path
          d="M 860 115 L 880 110 L 895 125 L 885 145 L 865 148 L 855 135 Z"
          fill="url(#landGrad)"
          stroke="#C8D8A8"
          strokeWidth="0.7"
        />

        {/* Australia */}
        <path
          d="M 750 330 L 820 320 L 880 330 L 910 360 L 905 400 L 875 425 L 830 430 L 785 420 L 755 395 L 740 360 Z"
          fill="url(#landGrad)"
          stroke="#C8D8A8"
          strokeWidth="1"
          filter="url(#mapShadow)"
        />

        {/* New Zealand */}
        <path
          d="M 930 390 L 945 385 L 950 405 L 938 415 L 928 405 Z"
          fill="url(#landGrad)"
          stroke="#C8D8A8"
          strokeWidth="0.6"
        />

        {/* Antarctica hint */}
        <path
          d="M 100 490 L 300 480 L 500 478 L 700 480 L 900 490 L 1000 500 L 0 500 Z"
          fill="#E8F4F8"
          stroke="#D0E8F0"
          strokeWidth="0.8"
        />

        {/* ===== COUNTRY BORDERS (subtle) ===== */}
        {/* US/Canada border */}
        <line x1="100" y1="140" x2="290" y2="140" stroke="#B8C8A0" strokeWidth="0.5" strokeDasharray="3,3" opacity="0.7" />

        {/* ===== WATER FEATURES ===== */}
        {/* Caspian Sea */}
        <ellipse cx="600" cy="140" rx="12" ry="20" fill="#A8D5E8" stroke="#9AC8E0" strokeWidth="0.5" />

        {/* ===== REGION HIGHLIGHTS ===== */}
        {Object.entries(regionOverlays).map(([id, region]) => {
          const isActive = highlighted === id;
          return (
            <g key={id}>
              {/* Outer pulse ring */}
              {isActive && (
                <ellipse
                  cx={region.cx}
                  cy={region.cy}
                  rx={region.rx + 22}
                  ry={region.ry + 22}
                  fill="none"
                  stroke="#E8406A"
                  strokeWidth="1.5"
                  opacity="0.4"
                  style={{ animation: "regionPulse 2s ease-in-out infinite" }}
                />
              )}

              {/* Secondary pulse ring */}
              {isActive && (
                <ellipse
                  cx={region.cx}
                  cy={region.cy}
                  rx={region.rx + 10}
                  ry={region.ry + 10}
                  fill="none"
                  stroke="#E8406A"
                  strokeWidth="1"
                  opacity="0.3"
                  style={{ animation: "regionPulse 2s ease-in-out 0.5s infinite" }}
                />
              )}

              {/* Main highlight fill */}
              <ellipse
                cx={region.cx}
                cy={region.cy}
                rx={region.rx}
                ry={region.ry}
                fill={isActive ? "rgba(232,64,106,0.30)" : "rgba(232,64,106,0.05)"}
                stroke={isActive ? "#E8406A" : "rgba(232,64,106,0.20)"}
                strokeWidth={isActive ? "2" : "0.8"}
                filter={isActive ? "url(#regionGlow)" : undefined}
                style={{ transition: "fill 0.35s ease, stroke 0.35s ease, stroke-width 0.35s ease" }}
              />

              {/* Pin marker */}
              {isActive && (
                <circle
                  cx={region.cx}
                  cy={region.cy}
                  r={12}
                  fill="none"
                  stroke="#E8406A"
                  strokeWidth="1.5"
                  opacity="0.5"
                />
              )}
              <circle
                cx={region.cx}
                cy={region.cy}
                r={isActive ? 6 : 4}
                fill={isActive ? "#E8406A" : "rgba(232,64,106,0.5)"}
                filter={isActive ? "url(#dotGlow)" : undefined}
                style={{ transition: "r 0.3s ease, fill 0.3s ease" }}
              />
              <circle
                cx={region.cx}
                cy={region.cy}
                r={isActive ? 2.5 : 1.5}
                fill="#ffffff"
                style={{ transition: "r 0.3s ease" }}
              />

              {/* Modern label */}
              {isActive && (
                <g filter="url(#labelShadow)">
                  <rect
                    x={region.cx - 62}
                    y={region.cy - region.ry - 36}
                    width={124}
                    height={24}
                    rx={12}
                    fill="rgba(20,20,35,0.88)"
                    stroke="#E8406A"
                    strokeWidth="1"
                  />
                  {/* Connector line */}
                  <line
                    x1={region.cx}
                    y1={region.cy - region.ry - 12}
                    x2={region.cx}
                    y2={region.cy - region.ry - 2}
                    stroke="#E8406A"
                    strokeWidth="1"
                    opacity="0.7"
                  />
                  <text
                    x={region.cx}
                    y={region.cy - region.ry - 19}
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="11"
                    fontWeight="600"
                    fontFamily="system-ui, -apple-system, sans-serif"
                    letterSpacing="0.4"
                    style={{ animation: "labelFadeIn 0.3s ease forwards" }}
                  >
                    {region.label}
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* Scale bar */}
        <g opacity="0.6">
          <rect x="820" y="470" width="80" height="3" fill="#5A8AAA" rx="1.5" />
          <text x="820" y="466" fill="#5A8AAA" fontSize="8" fontFamily="system-ui, sans-serif">0</text>
          <text x="895" y="466" fill="#5A8AAA" fontSize="8" fontFamily="system-ui, sans-serif">5000km</text>
        </g>

        {/* Compass rose */}
        <g transform="translate(940, 60)" opacity="0.55">
          <circle cx="0" cy="0" r="16" fill="rgba(255,255,255,0.5)" stroke="#7BBAD4" strokeWidth="0.8" />
          <polygon points="0,-14 3,-4 0,-7 -3,-4" fill="#5A8AAA" />
          <polygon points="0,14 3,4 0,7 -3,4" fill="#9AC8E0" />
          <polygon points="-14,0 -4,-3 -7,0 -4,3" fill="#9AC8E0" />
          <polygon points="14,0 4,-3 7,0 4,3" fill="#9AC8E0" />
          <text x="0" y="-17" textAnchor="middle" fill="#5A8AAA" fontSize="8" fontWeight="700" fontFamily="system-ui, sans-serif">N</text>
        </g>
      </svg>

      {/* CSS animations */}
      <style>{`
        @keyframes regionPulse {
          0%   { opacity: 0.5; transform: scale(1); }
          50%  { opacity: 0.08; transform: scale(1.12); }
          100% { opacity: 0.5; transform: scale(1); }
        }
        @keyframes labelFadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
