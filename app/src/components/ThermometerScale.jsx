import { formatThermoScaleAmount } from '../lib/format';
import './ThermometerScale.css';

/** Map 0–100% raised to full height of thermometer (same row as SVG). */
function rowPosition(tickPct) {
  if (tickPct <= 0) return { className: 'thermo-scale-row-edge-bottom', style: {} };
  if (tickPct >= 100) return { className: 'thermo-scale-row-edge-top', style: {} };
  return {
    className: '',
    style: { bottom: `${tickPct}%` },
  };
}

function tickTooCloseToCurrent(tickPct, percent, raised, goal) {
  if (raised <= 0 || raised >= goal) return false;
  return Math.abs(tickPct - percent) < 5;
}

export default function ThermometerScale({ ticks, percent, raised, goal }) {
  const showCurrent = raised > 0 && raised < goal;

  const currentPos =
    percent <= 0
      ? 'thermo-scale-row-edge-bottom'
      : percent >= 100
        ? 'thermo-scale-row-edge-top'
        : '';

  return (
    <div className="thermo-scale-panel" aria-hidden="true">
      {ticks
        .filter(
          ({ percent: tickPct }) =>
            !showCurrent || !tickTooCloseToCurrent(tickPct, percent, raised, goal)
        )
        .map(({ amount, percent: tickPct }) => {
          const isMajor =
            amount === 0 || tickPct === 100 || Math.abs(tickPct - 50) < 0.01;
          const pos = rowPosition(tickPct);
          return (
            <div
              key={amount}
              className={`thermo-scale-row ${pos.className} ${
                isMajor ? 'thermo-scale-row-major' : ''
              }`}
              style={pos.style}
            >
              <span className="thermo-scale-label">{formatThermoScaleAmount(amount)}</span>
              <span className="thermo-scale-tick" />
            </div>
          );
        })}
      {showCurrent && (
        <div
          className={`thermo-scale-row thermo-scale-row-current ${currentPos}`}
          style={
            currentPos
              ? {}
              : { bottom: `${percent}%` }
          }
        >
          <span className="thermo-scale-label thermo-scale-label-current">
            {formatThermoScaleAmount(raised)}
          </span>
          <span className="thermo-scale-tick thermo-scale-tick-current" />
        </div>
      )}
    </div>
  );
}
