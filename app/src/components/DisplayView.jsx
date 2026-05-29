import { useEffect, useRef } from 'react';
import DisplayBackground from './DisplayBackground';
import DonorCarousel from './DonorCarousel';
import Thermometer from './Thermometer';
import ThermometerGoalCap from './ThermometerGoalCap';
import ThermometerScale from './ThermometerScale';
import { useCountUp } from '../hooks/useCountUp';
import {
  formatCurrency,
  formatDateLong,
  clampPercent,
} from '../lib/format';
import { getRaisedTotal, getScaleTicks } from '../lib/storage';
import { resolveTheme } from '../lib/themes';
import '../routes/Display.css';

const STAGE_W = 1920;
const STAGE_H = 1080;
/** Per-side inset inside the 1920×1080 stage (content scales to fit) */
const STAGE_PAD_X = 64;
const STAGE_PAD_Y = 88;
/** Extra screen-space margin on full-screen display (not admin preview) */
const VIEWPORT_INSET_X = 32;
const VIEWPORT_INSET_Y = 56;

/**
 * Renders the signage display from props.
 * @param {object} data — goal_meter_data shape
 * @param {boolean} [embedded] — scale to parent container (admin preview)
 * @param {boolean} [animate] — count-up animations (off in preview)
 */
export default function DisplayView({ data, embedded = false, animate = true }) {
  const scaleRef = useRef(null);
  const mainWrapRef = useRef(null);
  const mainRef = useRef(null);
  const containerRef = useRef(null);

  const raised = getRaisedTotal(data);
  const animatedRaised = useCountUp(raised);
  const percent = clampPercent(raised, data.goal);
  const animatedPercent = useCountUp(Math.round(percent));
  const displayRaised = animate ? animatedRaised : raised;
  const displayPercent = animate ? animatedPercent : Math.round(percent);
  const toGo = Math.max(0, data.goal - raised);
  const isComplete = percent >= 100;
  const scaleTicks = getScaleTicks(data.goal);
  const donations = data.donations || [];
  const showDonors = data.donorTickerOn && donations.length > 0;
  const donorCount = donations.length;

  const theme = resolveTheme(data.theme);
  const viewportStyle = theme.cssVars;

  useEffect(() => {
    const updateScale = () => {
      const stage = scaleRef.current;
      const main = mainRef.current;
      if (!stage) return;

      let vw;
      let vh;
      if (embedded && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        vw = rect.width;
        vh = rect.height;
      } else {
        const vv = window.visualViewport;
        vw = vv?.width ?? window.innerWidth;
        vh = vv?.height ?? window.innerHeight;
      }

      if (vw <= 0 || vh <= 0) return;

      const insetX = embedded ? 0 : VIEWPORT_INSET_X;
      const insetY = embedded ? 0 : VIEWPORT_INSET_Y;
      const stageScale = Math.min(
        (vw - insetX * 2) / STAGE_W,
        (vh - insetY * 2) / STAGE_H
      );

      stage.style.position = 'absolute';
      stage.style.left = '50%';
      stage.style.top = '50%';
      stage.style.transform = `translate(-50%, -50%) scale(${stageScale})`;

      const wrap = mainWrapRef.current;
      if (!main || !wrap) return;
      main.style.transform = 'none';
      main.style.width = '';
      main.style.height = '';
      wrap.style.width = '';
      wrap.style.height = '';

      const availW = STAGE_W - STAGE_PAD_X * 2;
      const availH = STAGE_H - STAGE_PAD_Y * 2;
      const { offsetWidth: cw, offsetHeight: ch } = main;
      if (cw > 0 && ch > 0) {
        const contentScale = Math.min(availW / cw, availH / ch);
        wrap.style.width = `${cw * contentScale}px`;
        wrap.style.height = `${ch * contentScale}px`;
        main.style.width = `${cw}px`;
        main.style.height = `${ch}px`;
        main.style.transformOrigin = 'top left';
        main.style.transform = `scale(${contentScale})`;
      }
    };

    updateScale();
    const raf = requestAnimationFrame(updateScale);

    const onResize = () => updateScale();
    const ro = new ResizeObserver(onResize);

    if (embedded && containerRef.current) {
      ro.observe(containerRef.current);
    } else {
      window.addEventListener('resize', onResize);
      window.visualViewport?.addEventListener('resize', onResize);
      window.visualViewport?.addEventListener('scroll', onResize);
      if (mainRef.current) ro.observe(mainRef.current);
      if (mainWrapRef.current) ro.observe(mainWrapRef.current);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      window.visualViewport?.removeEventListener('resize', onResize);
      window.visualViewport?.removeEventListener('scroll', onResize);
      ro.disconnect();
    };
  }, [
    embedded,
    showDonors,
    data.title,
    data.goal,
    donations.length,
    data.theme?.mode,
    data.theme?.color,
  ]);

  const viewportClass = embedded
    ? `display-viewport display-viewport-embedded display-viewport--${theme.mode}`
    : `display-viewport display-viewport--${theme.mode}`;

  return (
    <div ref={containerRef} className={embedded ? 'display-embed-host' : undefined}>
      <div className={viewportClass} style={viewportStyle}>
        <DisplayBackground backgroundImage={theme.backgroundImageDataUrl} />

        {theme.logoDataUrl && (
          <img src={theme.logoDataUrl} alt="" className="display-logo" />
        )}

        <div className="display-stage" ref={scaleRef}>
          <div className="display-main-wrap" ref={mainWrapRef}>
            <div className="display-main" ref={mainRef}>
              <header className="display-header display-header-top">
              <h1 className="display-title">{data.title}</h1>
              </header>

              <div className="display-layout">
              <section className="thermo-column" aria-label="Goal thermometer">
                <ThermometerGoalCap celebrate={isComplete} />
                <div className="thermo-body-row">
                  <ThermometerScale
                    ticks={scaleTicks}
                    percent={percent}
                    raised={raised}
                    goal={data.goal}
                  />
                  <Thermometer percent={percent} />
                </div>
              </section>

              <section className="info-column" aria-label="Campaign details">
                <div className="glass-card glass-card-main">
                  <div className="stats-hero-row">
                    <div className="stats-hero-primary">
                      <p className="stats-label">Total Raised</p>
                      <p className="stats-raised">{formatCurrency(displayRaised)}</p>
                    </div>
                    <div className="stats-hero-percent">
                      <span className="stats-percent-num">{displayPercent}%</span>
                      <span className="stats-percent-of">of goal reached</span>
                    </div>
                  </div>

                  <div className="stats-progress-wrap">
                    <div className="stats-progress-track">
                      <div
                        className="stats-progress-fill"
                        style={{ width: `${percent}%` }}
                      />
                      <div
                        className="stats-progress-glow"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>

                  <div className="stats-grid">
                    <div className="stats-grid-item">
                      <span className="stats-grid-icon stats-grid-icon-white" aria-hidden="true">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <circle cx="12" cy="12" r="9" />
                          <circle cx="12" cy="12" r="5" />
                          <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
                          <path d="M4 4 L11.5 11.5" />
                          <path d="M4 4 L7.5 4 L4 7.5" fill="currentColor" stroke="none" />
                        </svg>
                      </span>
                      <span className="stats-grid-label">Goal</span>
                      <span className="stats-grid-value">{formatCurrency(data.goal)}</span>
                    </div>
                    <div className="stats-grid-item">
                      <span className="stats-grid-icon stats-grid-icon-white" aria-hidden="true">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <circle cx="12" cy="12" r="9" />
                          <path
                            d="M12 12V3a9 9 0 0 1 9 9H12Z"
                            fill="currentColor"
                            stroke="none"
                          />
                        </svg>
                      </span>
                      <span className="stats-grid-label">Remaining</span>
                      <span className="stats-grid-value">{formatCurrency(toGo)}</span>
                    </div>
                    <div className="stats-grid-item">
                      <span className="stats-grid-icon stats-grid-icon-white" aria-hidden="true">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                          <circle cx="9" cy="7" r="4" />
                          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                      </span>
                      <span className="stats-grid-label">Donors</span>
                      <span className="stats-grid-value">{donorCount}</span>
                    </div>
                  </div>

                  <p className="stats-updated">
                    Last updated {formatDateLong(data.lastUpdated)}
                  </p>
                </div>

                {showDonors && <DonorCarousel donations={donations} />}
              </section>
            </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
