import { useEffect, useRef, useState } from 'react';
import { getDonorMessages } from '../lib/donorMessages';

const ROTATE_MS = 7_000;
const FADE_MS = 600;

export default function DonorActivity({ donations, enabled }) {
  const [donationIndex, setDonationIndex] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const indicesRef = useRef({ d: 0, m: 0 });

  useEffect(() => {
    if (!enabled || donations.length === 0) return undefined;

    indicesRef.current = { d: 0, m: 0 };
    setDonationIndex(0);
    setMessageIndex(0);
    setVisible(true);

    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        const { d, m } = indicesRef.current;
        const msgs = getDonorMessages(donations[d]);
        let nextM = m + 1;
        let nextD = d;
        if (nextM >= msgs.length) {
          nextM = 0;
          nextD = (d + 1) % donations.length;
        }
        indicesRef.current = { d: nextD, m: nextM };
        setDonationIndex(nextD);
        setMessageIndex(nextM);
        setVisible(true);
      }, FADE_MS);
    }, ROTATE_MS);

    return () => clearInterval(interval);
  }, [enabled, donations]);

  const donation = donations[donationIndex];
  const messages = donation ? getDonorMessages(donation) : [];
  const message = messages[messageIndex] || '';

  if (!enabled || !donation || !message) return null;

  return (
    <aside className="donor-activity" aria-live="polite">
      <div className="donor-activity-inner">
        <span className="donor-activity-pulse" />
        <p className={`donor-activity-text ${visible ? 'is-visible' : ''}`}>
          {message}
        </p>
      </div>
    </aside>
  );
}
