import { formatCurrency } from './format';

function isToday(iso) {
  if (!iso) return false;
  const d = new Date(iso + 'T12:00:00');
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

function donorName(note) {
  const n = (note || '').trim();
  return n || 'A generous supporter';
}

export function getDonorMessages(donation) {
  const name = donorName(donation.note);
  const amount = formatCurrency(donation.amount);
  const today = isToday(donation.date);

  const messages = [
    `${name} donated ${amount}`,
    `Thank you, ${name}, for your contribution`,
    `${name} gave ${amount}${today ? ' today' : ''}`,
  ];

  if (donation.note) {
    messages.push(`Thank you ${donation.note.split(' ')[0]} for your gift of ${amount}`);
  }

  return messages;
}
