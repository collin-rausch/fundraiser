import { useMemo } from 'react';

const SPARKLE_COUNT = 36;
const BOKEH_COUNT = 12;

function seededRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export default function DisplayBackground({ backgroundImage }) {
  const sparkles = useMemo(
    () =>
      Array.from({ length: SPARKLE_COUNT }, (_, i) => ({
        id: i,
        left: `${seededRandom(i * 7) * 100}%`,
        size: 2 + seededRandom(i * 3) * 4,
        delay: seededRandom(i * 11) * 30,
        duration: 22 + seededRandom(i * 5) * 26,
        drift: -8 + seededRandom(i * 19) * 16,
      })),
    []
  );

  const bokeh = useMemo(
    () =>
      Array.from({ length: BOKEH_COUNT }, (_, i) => ({
        id: i,
        left: `${seededRandom(i * 17) * 100}%`,
        top: `${seededRandom(i * 23) * 100}%`,
        size: 40 + seededRandom(i * 9) * 120,
        delay: seededRandom(i * 7) * 10,
        duration: 20 + seededRandom(i * 4) * 15,
      })),
    []
  );

  return (
    <div className="display-bg" aria-hidden="true">
      {backgroundImage && (
        <div
          className="display-bg-image"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
      )}
      <div className="display-bg-gradient" />
      <div className="display-bg-texture" />
      {bokeh.map((b) => (
        <span
          key={`b-${b.id}`}
          className="display-bokeh"
          style={{
            left: b.left,
            top: b.top,
            width: b.size,
            height: b.size,
            animationDelay: `${b.delay}s`,
            animationDuration: `${b.duration}s`,
          }}
        />
      ))}
      <div className="display-bg-haze" />
      <div className="display-bg-vignette" />
      <div className="display-bg-thermo-glow" />
      {sparkles.map((p) => (
        <span
          key={p.id}
          className="display-sparkle"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            '--sparkle-drift': `${p.drift}px`,
          }}
        />
      ))}
    </div>
  );
}
