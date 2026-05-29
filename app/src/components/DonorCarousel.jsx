import { useCallback, useEffect, useRef, useState } from 'react';
import { formatCurrency, formatDonationWhen } from '../lib/format';
import './DonorCarousel.css';

const ROTATE_MS = 5_500;
const FADE_MS = 450;

export default function DonorCarousel({ donations }) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [slideDir, setSlideDir] = useState(1);
  const timeoutRef = useRef(null);

  const advance = useCallback((dir = 1) => {
    setVisible(false);
    setSlideDir(dir);
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIndex((i) => {
        const next = i + dir;
        if (next < 0) return donations.length - 1;
        if (next >= donations.length) return 0;
        return next;
      });
      setVisible(true);
    }, FADE_MS);
  }, [donations.length]);

  useEffect(() => {
    if (donations.length <= 1) return undefined;
    const id = setInterval(() => advance(1), ROTATE_MS);
    return () => {
      clearInterval(id);
      clearTimeout(timeoutRef.current);
    };
  }, [donations.length, advance]);

  useEffect(() => {
    setIndex(0);
    setVisible(true);
  }, [donations.length]);

  if (donations.length === 0) return null;

  const d = donations[index];
  const name = d.note?.trim() || 'Anonymous';
  return (
    <div className="donor-carousel glass-card">
      <div className="donor-carousel-header">
        <h3 className="donor-carousel-title">Recent Donations</h3>
      </div>
      <div className="donor-carousel-track">
        <div className="donor-carousel-viewport">
          <div
            className={`donor-carousel-card ${visible ? 'is-visible' : ''} ${
              slideDir > 0 ? 'slide-from-right' : 'slide-from-left'
            }`}
            key={`${d.id}-${index}`}
          >
            <div className="donor-carousel-info">
              <span className="donor-carousel-name">{name}</span>
              <span className="donor-carousel-amount">{formatCurrency(d.amount)}</span>
              <span className="donor-carousel-when">{formatDonationWhen(d.date)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
