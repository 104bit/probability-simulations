/* ============================================================
   DoorSVG — Animated SVG Door Component
   ============================================================ */

import React from 'react';
import type { DoorState } from '../types';

interface DoorSVGProps {
  index: number;
  state: DoorState;
  hasPrize?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  /** Show content behind door (prize or goat) */
  showContent?: boolean;
  /** X-ray mode: see through closed doors */
  xray?: boolean;
  size?: number;
}

const DoorSVG: React.FC<DoorSVGProps> = ({
  index,
  state,
  hasPrize = false,
  onClick,
  disabled = false,
  showContent = false,
  xray = false,
  size = 140,
}) => {
  const isOpen = state === 'revealed' || state === 'won' || state === 'lost';
  const isSelected = state === 'selected';
  const isWon = state === 'won';
  const isLost = state === 'lost';
  const isRevealed = state === 'revealed';

  const height = size * 1.4;
  const doorWidth = size * 0.7;
  const doorHeight = height * 0.72;
  const doorX = (size - doorWidth) / 2;
  const doorY = height * 0.12;

  // Glow color based on state
  const getGlowColor = () => {
    if (isWon) return 'rgba(34, 197, 94, 0.5)';
    if (isLost) return 'rgba(239, 68, 68, 0.4)';
    if (isSelected) return 'rgba(99, 102, 241, 0.5)';
    if (isRevealed) return 'rgba(251, 146, 60, 0.3)';
    if (xray && !isOpen) return 'rgba(34, 211, 238, 0.3)';
    return 'transparent';
  };

  const getBorderColor = () => {
    if (isWon) return '#22c55e';
    if (isLost) return '#ef4444';
    if (isSelected) return '#6366f1';
    if (isRevealed) return '#fb923c';
    if (xray && !isOpen) return '#22d3ee';
    return '#334155';
  };

  // X-ray: always show content, door becomes translucent
  const shouldShowContent = isOpen || showContent || xray;

  return (
    <div
      onClick={!disabled && onClick ? onClick : undefined}
      style={{
        cursor: disabled ? 'default' : onClick ? 'pointer' : 'default',
        transition: 'transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1)',
        transform: isSelected && !isOpen ? 'scale(1.05)' : 'scale(1)',
        filter: disabled && state === 'closed' ? 'brightness(0.6)' : 'none',
      }}
    >
      <svg
        width={size}
        height={height}
        viewBox={`0 0 ${size} ${height}`}
        style={{ overflow: 'visible' }}
      >
        {/* Glow effect */}
        <defs>
          <filter id={`glow-${index}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id={`door-gradient-${index}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#b45309" />
            <stop offset="50%" stopColor="#92400e" />
            <stop offset="100%" stopColor="#78350f" />
          </linearGradient>
          <linearGradient id={`door-open-gradient-${index}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#78350f" />
            <stop offset="100%" stopColor="#451a03" stopOpacity="0.6" />
          </linearGradient>
          <radialGradient id={`content-bg-${index}`} cx="50%" cy="40%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </radialGradient>
        </defs>

        {/* Door Frame */}
        <rect
          x={doorX - 6}
          y={doorY - 6}
          width={doorWidth + 12}
          height={doorHeight + 12}
          rx={4}
          fill="#1e293b"
          stroke={getBorderColor()}
          strokeWidth={isSelected || isOpen ? 2.5 : 1}
          style={{
            transition: 'stroke 400ms ease, stroke-width 300ms ease',
            filter: isSelected || isOpen ? `drop-shadow(0 0 8px ${getGlowColor()})` : 'none',
          }}
        />

        {/* Behind door — content area */}
        <rect
          x={doorX}
          y={doorY}
          width={doorWidth}
          height={doorHeight}
          fill={`url(#content-bg-${index})`}
        />

        {/* Prize / Goat content behind door */}
        {shouldShowContent && (
          <g opacity={xray && !isOpen ? 0.85 : 1}>
            <text
              x={size / 2}
              y={doorY + doorHeight * 0.45}
              textAnchor="middle"
              fontSize={size * 0.3}
              style={{
                animation: isOpen && !xray ? 'bounceIn 500ms ease-out forwards' : 'none',
              }}
            >
              {hasPrize ? '🚗' : '🐐'}
            </text>
            <text
              x={size / 2}
              y={doorY + doorHeight * 0.72}
              textAnchor="middle"
              fontSize={size * 0.085}
              fill={hasPrize ? '#22c55e' : '#94a3b8'}
              fontWeight={600}
              fontFamily="Inter, sans-serif"
            >
              {hasPrize ? 'ARABA!' : 'Keçi'}
            </text>
          </g>
        )}

        {/* Door panel — 3D rotation when open */}
        <g
          style={{
            transformOrigin: `${doorX}px ${doorY + doorHeight / 2}px`,
            transition: 'transform 600ms cubic-bezier(0.4, 0, 0.2, 1)',
            transform: isOpen ? 'perspective(400px) rotateY(-75deg)' : 'perspective(400px) rotateY(0deg)',
          }}
        >
          {/* Main door surface */}
          <rect
            x={doorX}
            y={doorY}
            width={doorWidth}
            height={doorHeight}
            rx={2}
            fill={isOpen ? `url(#door-open-gradient-${index})` : `url(#door-gradient-${index})`}
            opacity={xray && !isOpen ? 0.18 : isOpen ? 0.7 : 1}
            style={{ transition: 'opacity 400ms ease' }}
          />

          {/* X-ray scan lines overlay */}
          {xray && !isOpen && (
            <>
              {Array.from({ length: 8 }, (_, i) => (
                <line
                  key={i}
                  x1={doorX}
                  y1={doorY + (doorHeight / 8) * i}
                  x2={doorX + doorWidth}
                  y2={doorY + (doorHeight / 8) * i}
                  stroke="rgba(34, 211, 238, 0.12)"
                  strokeWidth={0.5}
                />
              ))}
            </>
          )}

          {/* Door panels (decorative inset rectangles) */}
          {!isOpen && (
            <g opacity={xray ? 0.15 : 1} style={{ transition: 'opacity 400ms ease' }}>
              <rect
                x={doorX + doorWidth * 0.12}
                y={doorY + doorHeight * 0.06}
                width={doorWidth * 0.76}
                height={doorHeight * 0.35}
                rx={2}
                fill="none"
                stroke="rgba(0,0,0,0.3)"
                strokeWidth={1.5}
              />
              <rect
                x={doorX + doorWidth * 0.12}
                y={doorY + doorHeight * 0.48}
                width={doorWidth * 0.76}
                height={doorHeight * 0.44}
                rx={2}
                fill="none"
                stroke="rgba(0,0,0,0.3)"
                strokeWidth={1.5}
              />

              {/* Door knob */}
              <circle
                cx={doorX + doorWidth * 0.82}
                cy={doorY + doorHeight * 0.52}
                r={doorWidth * 0.05}
                fill="#fbbf24"
                stroke="#f59e0b"
                strokeWidth={1}
              />
              <circle
                cx={doorX + doorWidth * 0.82}
                cy={doorY + doorHeight * 0.52}
                r={doorWidth * 0.02}
                fill="#d97706"
              />
            </g>
          )}
        </g>

        {/* Door number label */}
        <text
          x={size / 2}
          y={height - 8}
          textAnchor="middle"
          fontSize={size * 0.12}
          fontWeight={700}
          fontFamily="Inter, sans-serif"
          fill={isSelected ? '#6366f1' : isWon ? '#22c55e' : isLost ? '#ef4444' : '#94a3b8'}
          style={{ transition: 'fill 300ms ease' }}
        >
          Kapı {index + 1}
        </text>

        {/* Selected indicator */}
        {isSelected && !isOpen && (
          <g>
            <text
              x={size / 2}
              y={doorY - 12}
              textAnchor="middle"
              fontSize={size * 0.09}
              fontWeight={600}
              fontFamily="Inter, sans-serif"
              fill="#818cf8"
            >
              ▼ Seçiminiz
            </text>
          </g>
        )}

        {/* Host revealed indicator */}
        {isRevealed && (
          <text
            x={size / 2}
            y={doorY - 12}
            textAnchor="middle"
            fontSize={size * 0.085}
            fontWeight={600}
            fontFamily="Inter, sans-serif"
            fill="#fb923c"
          >
            Sunucu Açtı
          </text>
        )}

        {/* Won / Lost badge */}
        {(isWon || isLost) && (
          <g style={{ animation: 'bounceIn 500ms ease-out forwards' }}>
            <rect
              x={size / 2 - size * 0.28}
              y={doorY - 20}
              width={size * 0.56}
              height={18}
              rx={9}
              fill={isWon ? '#22c55e' : '#ef4444'}
              opacity={0.9}
            />
            <text
              x={size / 2}
              y={doorY - 8}
              textAnchor="middle"
              fontSize={size * 0.075}
              fontWeight={700}
              fontFamily="Inter, sans-serif"
              fill="white"
            >
              {isWon ? '✓ KAZANDINIZ' : '✗ KAYBETTİNİZ'}
            </text>
          </g>
        )}

        {/* Hover highlight for clickable doors */}
        {!disabled && onClick && state === 'closed' && (
          <rect
            x={doorX - 6}
            y={doorY - 6}
            width={doorWidth + 12}
            height={doorHeight + 12}
            rx={4}
            fill="transparent"
            stroke="transparent"
            strokeWidth={2}
            className="door-hover-target"
            style={{ transition: 'stroke 200ms ease' }}
          />
        )}
      </svg>

      <style>{`
        .door-hover-target:hover {
          stroke: rgba(99, 102, 241, 0.4) !important;
        }
      `}</style>
    </div>
  );
};

export default DoorSVG;
