export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCurrencyCompact(amount) {
  if (amount >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(amount % 1_000_000 === 0 ? 0 : 1)}M`;
  }
  if (amount >= 1_000) {
    return `$${amount / 1_000}K`;
  }
  return formatCurrency(amount);
}

/** Thermometer scale: whole K only; otherwise full dollars (no $1.5K-style labels). */
export function formatThermoScaleAmount(amount) {
  if (amount >= 1_000 && amount % 1_000 !== 0) {
    return formatCurrency(amount);
  }
  return formatCurrencyCompact(amount);
}

export function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso + 'T12:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDateLong(iso) {
  if (!iso) return '—';
  return new Date(iso + 'T12:00:00').toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDonationWhen(iso) {
  if (!iso) return '—';
  const d = new Date(iso + 'T12:00:00');
  const now = new Date();
  const isToday =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  if (isToday) return 'Today';
  return formatDate(iso);
}

export function clampPercent(raised, goal) {
  if (!goal || goal <= 0) return 0;
  return Math.min(100, Math.max(0, (raised / goal) * 100));
}
