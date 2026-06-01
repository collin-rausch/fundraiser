import { useId } from 'react';
import './ThermometerGoalCap.css';

/** Full banner + stars */
const VB = { x: 0, y: -12, w: 340, h: 140 };

/** Annular-sector geometry — radial sides from a center below the arch */
const CX = 170;
/** 65° span — radii ×1.3 width vs prior 204/138 */
const SPAN = 65;
const ANGLE_L = 270 - SPAN / 2;
const ANGLE_R = 270 + SPAN / 2;

const CY = 256;
const R_OUTER = 265;
const R_INNER = 179;
/** Midline of gold band */
const R_TEXT = (R_OUTER + R_INNER) / 2;
const R_STARS = R_OUTER + 20;

function polar(r, deg) {
  const rad = (deg * Math.PI) / 180;
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) };
}

/** Circular annular sector: straight radial sides, concentric top/bottom arcs */
function sectorPath(rOuter, rInner) {
  const oL = polar(rOuter, ANGLE_L);
  const oR = polar(rOuter, ANGLE_R);
  const iR = polar(rInner, ANGLE_R);
  const iL = polar(rInner, ANGLE_L);
  const span = ANGLE_R - ANGLE_L;
  const large = span > 180 ? 1 : 0;
  return [
    `M ${oL.x.toFixed(2)} ${oL.y.toFixed(2)}`,
    `A ${rOuter} ${rOuter} 0 ${large} 1 ${oR.x.toFixed(2)} ${oR.y.toFixed(2)}`,
    `L ${iR.x.toFixed(2)} ${iR.y.toFixed(2)}`,
    `A ${rInner} ${rInner} 0 ${large} 0 ${iL.x.toFixed(2)} ${iL.y.toFixed(2)}`,
    'Z',
  ].join(' ');
}

function arcPath(r) {
  const a = polar(r, ANGLE_L);
  const b = polar(r, ANGLE_R);
  const span = ANGLE_R - ANGLE_L;
  const large = span > 180 ? 1 : 0;
  return `M ${a.x.toFixed(2)} ${a.y.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${b.x.toFixed(2)} ${b.y.toFixed(2)}`;
}

const BANNER_PATH = sectorPath(R_OUTER, R_INNER);
const STARS_PATH = arcPath(R_STARS);
const TEXT_PATH = arcPath(R_TEXT);

const STAR_SLOTS = [
  { offset: '10%', size: 20, className: 'thermo-star-svg-1' },
  { offset: '28%', size: 24, className: 'thermo-star-svg-2' },
  { offset: '50%', size: 30, className: 'thermo-star-svg-3' },
  { offset: '72%', size: 24, className: 'thermo-star-svg-4' },
  { offset: '90%', size: 20, className: 'thermo-star-svg-5' },
];

export default function ThermometerGoalCap({ celebrate }) {
  const uid = useId().replace(/:/g, '');
  const viewBox = `${VB.x} ${VB.y} ${VB.w} ${VB.h}`;

  return (
    <div className={`thermo-goal-cap ${celebrate ? 'thermo-goal-cap-celebrate' : ''}`}>
      <div className="thermo-goal-plaque">
        <svg
          className="thermo-goal-plaque-shape"
          viewBox={viewBox}
          preserveAspectRatio="xMidYMid meet"
          overflow="visible"
          role="img"
          aria-label="Goal"
        >
          <defs>
            <linearGradient id={`${uid}-gold`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fff0b3" />
              <stop offset="35%" stopColor="#e8c468" />
              <stop offset="70%" stopColor="#d4a853" />
              <stop offset="100%" stopColor="#8a6420" />
            </linearGradient>
            <linearGradient
              id={`${uid}-banner-sweep`}
              gradientUnits="userSpaceOnUse"
              x1="-120"
              y1="0"
              x2="120"
              y2="0"
            >
              <stop offset="0%" stopColor="rgba(255,255,255,0)" />
              <stop offset="42%" stopColor="rgba(255,255,255,0)" />
              <stop offset="50%" stopColor="rgba(255,245,200,0.65)" />
              <stop offset="58%" stopColor="rgba(255,255,255,0)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
              <animate
                attributeName="x1"
                values="-120;460"
                dur="8s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="x2"
                values="120;700"
                dur="8s"
                repeatCount="indefinite"
              />
            </linearGradient>
            <path id={`${uid}-stars`} d={STARS_PATH} fill="none" />
            <path id={`${uid}-text`} d={TEXT_PATH} fill="none" />
            <clipPath id={`${uid}-banner-clip`}>
              <path d={BANNER_PATH} />
            </clipPath>
          </defs>

          <path
            className="thermo-goal-banner"
            d={BANNER_PATH}
            fill={`url(#${uid}-gold)`}
            stroke="#1a1510"
            strokeWidth="2.5"
            strokeLinejoin="miter"
          />
          <path
            className="thermo-goal-banner-rim"
            d={BANNER_PATH}
            fill="none"
            stroke="#fde68a"
            strokeWidth="1.5"
            strokeLinejoin="miter"
          />
          <path
            className="thermo-goal-banner-sweep"
            d={BANNER_PATH}
            fill={`url(#${uid}-banner-sweep)`}
            clipPath={`url(#${uid}-banner-clip)`}
          />

          {STAR_SLOTS.map(({ offset, size, className }) => (
            <text
              key={className}
              className={`thermo-star-svg ${className}`}
              fontSize={size}
              dominantBaseline="middle"
            >
              <textPath href={`#${uid}-stars`} startOffset={offset} textAnchor="middle">
                ★
              </textPath>
            </text>
          ))}

          <g clipPath={`url(#${uid}-banner-clip)`}>
            <text className="thermo-goal-text-path" dominantBaseline="central">
              <textPath
                href={`#${uid}-text`}
                startOffset="50%"
                textAnchor="middle"
                side="left"
                lengthAdjust="spacingAndGlyphs"
                textLength="234"
              >
                GOAL!
              </textPath>
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
}
