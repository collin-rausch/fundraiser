import { DEFAULT_THEME, normalizeThemeConfig } from './themes';

const STORAGE_KEY = 'goal_meter_data';

const DEFAULTS = {
  title: 'Campaign Goal',
  goal: 100000,
  lastUpdated: null,
  donorTickerOn: true,
  donations: [],
  theme: { ...DEFAULT_THEME },
};

function newId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function normalizeDonation(d) {
  return {
    id: d.id || newId(),
    amount: Number(d.amount) || 0,
    date: d.date || null,
    note: (d.note || '').trim(),
  };
}

function migrate(parsed) {
  const donations = Array.isArray(parsed.donations)
    ? parsed.donations.map(normalizeDonation)
    : [];

  if (donations.length === 0 && Number(parsed.raised) > 0) {
    donations.push(
      normalizeDonation({
        id: newId(),
        amount: Number(parsed.raised),
        date: parsed.lastUpdated || null,
        note: 'Previous total',
      })
    );
  }

  return {
    title: parsed.title ?? DEFAULTS.title,
    goal: Number(parsed.goal) || DEFAULTS.goal,
    lastUpdated: parsed.lastUpdated ?? DEFAULTS.lastUpdated,
    donorTickerOn: parsed.donorTickerOn ?? DEFAULTS.donorTickerOn,
    donations,
    theme: normalizeThemeConfig(parsed.theme),
  };
}

export function getRaisedTotal(data) {
  return (data.donations || []).reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
}

export function getGoalData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULTS, donations: [] };
    return migrate(JSON.parse(raw));
  } catch {
    return { ...DEFAULTS, donations: [] };
  }
}

export function setGoalData(data) {
  const payload = {
    title: data.title ?? DEFAULTS.title,
    goal: Number(data.goal) || DEFAULTS.goal,
    lastUpdated: data.lastUpdated ?? null,
    donorTickerOn: Boolean(data.donorTickerOn),
    donations: (data.donations || []).map(normalizeDonation),
    theme: normalizeThemeConfig(data.theme),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  return payload;
}

export function addDonation({ amount, date, note }) {
  const data = getGoalData();
  const donation = normalizeDonation({ amount, date, note });
  data.donations = [donation, ...data.donations];
  data.lastUpdated = date || data.lastUpdated;
  return setGoalData(data);
}

export function removeDonation(id) {
  const data = getGoalData();
  data.donations = data.donations.filter((d) => d.id !== id);
  if (data.donations.length > 0) {
    data.lastUpdated = data.donations[0].date;
  }
  return setGoalData(data);
}

export function saveConfiguration({ title, goal, donorTickerOn }) {
  const data = getGoalData();
  return setGoalData({
    ...data,
    title: title?.trim() || DEFAULTS.title,
    goal: Number(goal) || DEFAULTS.goal,
    donorTickerOn: Boolean(donorTickerOn),
  });
}

export function saveThemeConfiguration(theme) {
  const data = getGoalData();
  return setGoalData({
    ...data,
    theme: normalizeThemeConfig(theme),
  });
}

/** Persist configuration, theme, and full donation list in one write. */
export function saveAll({
  title,
  goal,
  donorTickerOn,
  theme,
  donations,
  lastUpdated,
}) {
  return setGoalData({
    title,
    goal,
    donorTickerOn,
    theme,
    donations,
    lastUpdated,
  });
}

function niceStep(goal) {
  const targetCount = 14;
  const raw = goal / targetCount;
  if (raw <= 0) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const normalized = raw / magnitude;
  let step;
  if (normalized <= 1.5) step = magnitude;
  else if (normalized <= 3.5) step = 2 * magnitude;
  else if (normalized <= 7.5) step = 5 * magnitude;
  else step = 10 * magnitude;

  // Avoid $500 steps that produce *.5K labels (e.g. $2.5K) on typical campaign goals.
  const coarser = 10 * magnitude;
  if (goal >= 2000 && step < 1000 && coarser <= goal && goal / coarser <= 20) {
    step = coarser;
  }
  return step;
}

function isWholeKTick(amount) {
  return amount < 1000 || amount % 1000 === 0;
}

/** Dollar tick marks for thermometer scale (0 → goal). */
export function getScaleTicks(goal) {
  if (!goal || goal <= 0) return [{ amount: 0, percent: 0 }];

  const step = niceStep(goal);
  const ticks = [];
  for (let amount = 0; amount <= goal; amount += step) {
    if (isWholeKTick(amount)) {
      ticks.push({ amount, percent: (amount / goal) * 100 });
    }
  }
  if (ticks[ticks.length - 1]?.amount !== goal && isWholeKTick(goal)) {
    ticks.push({ amount: goal, percent: 100 });
  }
  return ticks;
}
