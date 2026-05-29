import { useId } from 'react';
import {
  THERMO_OUTLINE,
  THERMO_VIEWBOX,
  THERMO_CX,
  meniscusRadiusAtY,
} from './thermoPath';
import './Thermometer.css';

export default function Thermometer({ percent }) {
  const uid = useId().replace(/:/g, '');
  const { w: VB_W, h: VB_H } = THERMO_VIEWBOX;
  const fillY = VB_H - (VB_H * percent) / 100;
  const mx = meniscusRadiusAtY(fillY, VB_H);
  const showMeniscus = percent > 0;

  const shapeClip = `${uid}-shape`;
  const levelClip = `${uid}-level`;

  return (
    <div className="thermo-vessel">
      <svg
        className="thermo-svg"
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        preserveAspectRatio="xMidYMin meet"
        role="img"
        aria-label={`Fundraising thermometer at ${Math.round(percent)} percent`}
      >
        <defs>
          <clipPath id={shapeClip} clipPathUnits="userSpaceOnUse">
            <path d={THERMO_OUTLINE} />
          </clipPath>

          <clipPath id={levelClip} clipPathUnits="userSpaceOnUse">
            <rect x="0" y={fillY} width={VB_W} height={VB_H - fillY} />
          </clipPath>

          {/* Brighter toward bottom so low % fills (bulb) stay vivid */}
          <linearGradient id={`${uid}-liquid`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f87171" />
            <stop offset="35%" stopColor="#ef4444" />
            <stop offset="70%" stopColor="#ff5555" />
            <stop offset="100%" stopColor="#ff7b7b" />
          </linearGradient>

          <linearGradient id={`${uid}-glass`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(255,255,255,0.1)" />
            <stop offset="12%" stopColor="rgba(255,255,255,0.22)" />
            <stop offset="50%" stopColor="rgba(40,40,50,0.35)" />
            <stop offset="88%" stopColor="rgba(0,0,0,0.28)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.14)" />
          </linearGradient>

          <radialGradient id={`${uid}-bulb-glow`} cx="50%" cy="88%" r="50%">
            <stop offset="0%" stopColor="rgba(255,80,80,0.55)" />
            <stop offset="55%" stopColor="rgba(239,68,68,0.25)" />
            <stop offset="100%" stopColor="rgba(239,68,68,0)" />
          </radialGradient>

          <filter
            id={`${uid}-liquid-glow`}
            x="-40%"
            y="-20%"
            width="180%"
            height="140%"
            colorInterpolationFilters="sRGB"
          >
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="0 0 0 0 0.95
                      0 0 0 0 0.15
                      0 0 0 0 0.15
                      0 0 0 0.85 0"
              result="glowColor"
            />
            <feMerge>
              <feMergeNode in="glowColor" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id={`${uid}-meniscus`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <linearGradient id={`${uid}-shine`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0)" />
            <stop offset="42%" stopColor="rgba(255,255,255,0.02)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0.38)" />
            <stop offset="58%" stopColor="rgba(255,255,255,0.02)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
        </defs>

        {/* Ambient glow (SVG only — no div shapes) */}
        <ellipse
          cx={THERMO_CX}
          cy={VB_H - 44}
          rx="42"
          ry="42"
          fill={`url(#${uid}-bulb-glow)`}
          className="thermo-ambient-glow thermo-breathe-glow"
        />

        {/* Empty glass body */}
        <path className="thermo-glass-body" d={THERMO_OUTLINE} fill={`url(#${uid}-glass)`} />

        {/*
          Liquid: same silhouette path, clipped to (1) thermometer shape
          and (2) fill level — follows bulb width naturally, one continuous volume.
        */}
        <g clipPath={`url(#${shapeClip})`}>
          <g
            className="thermo-liquid-breathe"
            clipPath={`url(#${levelClip})`}
            filter={`url(#${uid}-liquid-glow)`}
          >
            <path
              className="thermo-liquid-path"
              d={THERMO_OUTLINE}
              fill={`url(#${uid}-liquid)`}
            />
          </g>

          <rect
            className="thermo-shine-sweep"
            x="26"
            y="0"
            width="48"
            height="72"
            fill={`url(#${uid}-shine)`}
          />

          {showMeniscus && (
            <g filter={`url(#${uid}-meniscus)`}>
              <ellipse
                className="thermo-meniscus"
                cx={THERMO_CX}
                cy={fillY}
                rx={mx}
                ry={Math.max(4, 5 * Math.min(1, percent / 8))}
                fill="#ffc9c9"
              />
              <ellipse
                cx={THERMO_CX}
                cy={fillY - 0.4}
                rx={Math.max(4, mx - 2)}
                ry={1.4}
                fill="#fff5f5"
                opacity="0.95"
              />
            </g>
          )}
        </g>

        {/* Glass rim & highlights */}
        <path className="thermo-wall-shadow" d={THERMO_OUTLINE} />
        <path className="thermo-outline" d={THERMO_OUTLINE} />
        <path className="thermo-highlight" d="M 35 24 L 35 398" />
        <path className="thermo-highlight-faint" d="M 65 40 L 65 280" />
        <ellipse className="thermo-glint" cx="30" cy="468" rx="9" ry="8" />
      </svg>
    </div>
  );
}
