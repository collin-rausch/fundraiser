import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import DisplayView from '../components/DisplayView';
import { formatCurrency, formatDate } from '../lib/format';
import {
  THEME_MODES,
  THEME_COLOR_ORDER,
  THEME_COLOR_LABELS,
  normalizeThemeConfig,
} from '../lib/themes';
import { getGoalData, saveAll } from '../lib/storage';
import './Admin.css';

const ADMIN_PASSWORD = process.env.REACT_APP_ADMIN_PASSWORD || '';

function todayISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function newDonationId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export default function Admin() {
  const [authenticated, setAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [toast, setToast] = useState('');
  const toastTimerRef = useRef(null);

  const [savedData, setSavedData] = useState(getGoalData);
  const [title, setTitle] = useState('');
  const [goal, setGoal] = useState('');
  const [donorTickerOn, setDonorTickerOn] = useState(true);
  const [theme, setTheme] = useState(normalizeThemeConfig({}));
  const [draftDonations, setDraftDonations] = useState([]);

  const [donationAmount, setDonationAmount] = useState('');
  const [donationDate, setDonationDate] = useState(todayISO());
  const [donationNote, setDonationNote] = useState('');

  const syncFromStorage = useCallback(() => {
    const next = getGoalData();
    setSavedData(next);
    setTitle(next.title);
    setGoal(String(next.goal));
    setDonorTickerOn(next.donorTickerOn);
    setTheme(normalizeThemeConfig(next.theme));
    setDraftDonations([...(next.donations || [])]);
  }, []);

  useEffect(() => {
    return () => clearTimeout(toastTimerRef.current);
  }, []);

  const showToast = (message) => {
    setToast(message);
    clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(''), 3000);
  };

  useEffect(() => {
    if (authenticated) syncFromStorage();
  }, [authenticated, syncFromStorage]);

  const previewData = useMemo(
    () => ({
      title: title.trim() || 'Campaign Goal',
      goal: Number(goal) || 0,
      donorTickerOn,
      donations: draftDonations,
      theme: normalizeThemeConfig(theme),
      lastUpdated: savedData.lastUpdated,
    }),
    [
      title,
      goal,
      donorTickerOn,
      draftDonations,
      theme,
      savedData.lastUpdated,
    ]
  );

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      setAuthenticated(true);
      setPasswordError('');
      syncFromStorage();
    } else {
      setPasswordError('Incorrect password');
    }
  };

  const handleAddDonation = () => {
    const amount = Number(donationAmount);
    if (!amount || amount <= 0) {
      showToast('Enter a valid donation amount');
      return;
    }
    setDraftDonations((list) => [
      {
        id: newDonationId(),
        amount,
        date: donationDate || todayISO(),
        note: donationNote.trim(),
      },
      ...list,
    ]);
    setDonationAmount('');
    setDonationNote('');
    setDonationDate(todayISO());
  };

  const handleRemoveDonation = (id) => {
    setDraftDonations((list) => list.filter((d) => d.id !== id));
  };

  const handleSaveAll = (e) => {
    e.preventDefault();
    saveAll({
      title: title.trim() || 'Campaign Goal',
      goal: Number(goal) || 0,
      donorTickerOn,
      theme: normalizeThemeConfig(theme),
      donations: draftDonations,
      lastUpdated: todayISO(),
    });
    syncFromStorage();
    showToast('All changes saved');
  };

  if (!authenticated) {
    return (
      <div className="admin-page">
        <div className="admin-card">
          <h1>Admin Access</h1>
          <form onSubmit={handlePasswordSubmit}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              autoComplete="current-password"
              autoFocus
            />
            {passwordError && (
              <p className="admin-error" role="alert">
                {passwordError}
              </p>
            )}
            <button type="submit" className="admin-btn admin-btn-primary">
              Enter
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      {toast && (
        <div className="admin-toast" role="status">
          {toast}
        </div>
      )}

      <form className="admin-layout" onSubmit={handleSaveAll}>
        <div className="admin-forms">
          <section className="admin-section">
            <h2>Configuration</h2>
            <label htmlFor="title">Campaign Title</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <label htmlFor="goal">Goal Amount ($)</label>
            <input
              id="goal"
              type="number"
              min="0"
              step="1"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
            />
          </section>

          <section className="admin-section">
            <h2>Display Theme</h2>
            <p className="admin-section-hint">Mode and accent color for the display.</p>

            <div className="admin-theme-mode" role="group" aria-label="Appearance mode">
              {Object.values(THEME_MODES).map((modeOption) => (
                <button
                  key={modeOption.id}
                  type="button"
                  className={`admin-theme-mode-btn ${
                    theme.mode === modeOption.id ? 'admin-theme-mode-btn-active' : ''
                  }`}
                  aria-pressed={theme.mode === modeOption.id}
                  onClick={() =>
                    setTheme(
                      normalizeThemeConfig({ ...theme, mode: modeOption.id })
                    )
                  }
                >
                  {modeOption.label}
                </button>
              ))}
            </div>

            <label htmlFor="themeColor">Color</label>
            <select
              id="themeColor"
              className="admin-select"
              value={theme.color}
              onChange={(e) =>
                setTheme(
                  normalizeThemeConfig({ ...theme, color: e.target.value })
                )
              }
            >
              {THEME_COLOR_ORDER.map((colorId) => (
                <option key={colorId} value={colorId}>
                  {THEME_COLOR_LABELS[colorId]}
                </option>
              ))}
            </select>
          </section>

          <section className="admin-section">
            <h2>Add Donation</h2>
            <div className="admin-donation-row">
              <div className="admin-field">
                <label htmlFor="donationAmount">Amount ($)</label>
                <input
                  id="donationAmount"
                  type="number"
                  min="1"
                  step="1"
                  value={donationAmount}
                  onChange={(e) => setDonationAmount(e.target.value)}
                  placeholder="500"
                />
              </div>
              <div className="admin-field">
                <label htmlFor="donationDate">Date</label>
                <input
                  id="donationDate"
                  type="date"
                  value={donationDate}
                  onChange={(e) => setDonationDate(e.target.value)}
                />
              </div>
            </div>

            <label htmlFor="donationNote">Donor name / note</label>
            <div className="admin-donor-row">
              <input
                id="donationNote"
                type="text"
                className="admin-donor-note-input"
                value={donationNote}
                onChange={(e) => setDonationNote(e.target.value)}
                placeholder="Donor name or note"
              />
              <div className="admin-donor-ticker">
                <span className="admin-toggle-label">Donor Ticker</span>
                <button
                  type="button"
                  className={`admin-toggle ${donorTickerOn ? 'admin-toggle-on' : ''}`}
                  onClick={() => setDonorTickerOn((v) => !v)}
                  aria-pressed={donorTickerOn}
                >
                  {donorTickerOn ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>

            <button
              type="button"
              className="admin-btn admin-btn-primary"
              onClick={handleAddDonation}
            >
              Add to Total
            </button>
          </section>

          <section className="admin-section">
            <h2>Donation History</h2>
            {draftDonations.length === 0 ? (
              <p className="admin-empty">No donations yet.</p>
            ) : (
              <ul className="admin-history">
                {draftDonations.map((d) => (
                  <li key={d.id} className="admin-history-item">
                    <div className="admin-history-main">
                      <span className="admin-history-amount">
                        {formatCurrency(d.amount)}
                      </span>
                      {d.note && (
                        <span className="admin-history-note">{d.note}</span>
                      )}
                      <span className="admin-history-date">{formatDate(d.date)}</span>
                    </div>
                    <button
                      type="button"
                      className="admin-history-remove"
                      onClick={() => handleRemoveDonation(d.id)}
                      aria-label={`Remove donation of ${formatCurrency(d.amount)}`}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <button type="submit" className="admin-btn admin-btn-save admin-btn-save-all">
            Save All Changes
          </button>
        </div>

        <aside className="admin-preview-column" aria-label="Live display preview">
          <div className="admin-preview-header">
            <h2>Live Preview</h2>
            <p className="admin-preview-hint">Updates as you edit</p>
          </div>
          <div className="admin-preview-frame">
            <DisplayView data={previewData} embedded animate={false} />
          </div>
        </aside>
      </form>
    </div>
  );
}
