/* ============================================================
   PersonAvatar — SVG Person with Birthday Label
   ============================================================ */

import React from 'react';
import type { Person } from '../types';

interface PersonAvatarProps {
  person: Person;
  size?: number;
  isNew?: boolean;
  matchColor?: string;
}

/** Aya göre renk üretir (HSL hue rotation) */
function getMonthColor(month: number): string {
  const hue = (month * 30 + 10) % 360;
  return `hsl(${hue}, 55%, 55%)`;
}

const PersonAvatar: React.FC<PersonAvatarProps> = ({
  person,
  size = 52,
  isNew = false,
  matchColor,
}) => {
  const color = matchColor || getMonthColor(person.month);
  const isMatch = person.isMatch;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        animation: isNew ? 'bounceIn 400ms ease-out forwards' : 'none',
        position: 'relative',
      }}
    >
      {/* Match glow ring */}
      {isMatch && (
        <div style={{
          position: 'absolute',
          top: -3,
          left: '50%',
          transform: 'translateX(-50%)',
          width: size + 6,
          height: size + 6,
          borderRadius: '50%',
          border: '2px solid #f43f5e',
          boxShadow: '0 0 12px rgba(244, 63, 94, 0.5)',
          animation: 'pulse 1.5s ease-in-out infinite',
        }} />
      )}

      <svg width={size} height={size} viewBox="0 0 48 48">
        {/* Body */}
        <ellipse
          cx="24" cy="38"
          rx="12" ry="8"
          fill={color}
          opacity={0.25}
        />
        {/* Head */}
        <circle
          cx="24" cy="16"
          r="10"
          fill={color}
          opacity={isMatch ? 1 : 0.7}
          stroke={isMatch ? '#f43f5e' : 'transparent'}
          strokeWidth={isMatch ? 2 : 0}
        />
        {/* Face — simple smile */}
        <circle cx="20" cy="14" r="1.2" fill="rgba(0,0,0,0.4)" />
        <circle cx="28" cy="14" r="1.2" fill="rgba(0,0,0,0.4)" />
        <path
          d="M20 19 Q24 22 28 19"
          fill="none"
          stroke="rgba(0,0,0,0.3)"
          strokeWidth="1"
          strokeLinecap="round"
        />
        {/* Person number */}
        <text
          x="24" y="40"
          textAnchor="middle"
          fontSize="7"
          fontWeight="600"
          fill="var(--color-text-muted)"
          fontFamily="Inter, sans-serif"
        >
          #{person.id + 1}
        </text>
      </svg>

      {/* Birthday label */}
      <div style={{
        fontSize: size < 44 ? 9 : 10,
        fontWeight: 600,
        color: isMatch ? '#f43f5e' : 'var(--color-text-secondary)',
        whiteSpace: 'nowrap',
        padding: '1px 4px',
        borderRadius: 4,
        background: isMatch ? 'rgba(244, 63, 94, 0.12)' : 'transparent',
        border: isMatch ? '1px solid rgba(244, 63, 94, 0.3)' : '1px solid transparent',
        transition: 'all 300ms ease',
      }}>
        {person.label}
      </div>
    </div>
  );
};

export default PersonAvatar;
