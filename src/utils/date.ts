/**
 * Date and time formatting helpers for PokerCircle
 * Formats dates according to Asia/Jerusalem timezone
 */

export function formatEventDateTime(isoString: string): {
  dateStr: string;
  timeStr: string;
  isToday: boolean;
  isTomorrow: boolean;
} {
  const d = new Date(isoString);
  const now = new Date();

  // Jerusalem timezone formatter
  const jerusalemDate = new Intl.DateTimeFormat('he-IL', {
    timeZone: 'Asia/Jerusalem',
    weekday: 'short',
    day: 'numeric',
    month: 'numeric',
    year: 'numeric'
  }).format(d);

  const timeStr = new Intl.DateTimeFormat('he-IL', {
    timeZone: 'Asia/Jerusalem',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(d);

  // Check if same calendar day in Israel
  const dDay = new Intl.DateTimeFormat('he-IL', { timeZone: 'Asia/Jerusalem', day: 'numeric', month: 'numeric' }).format(d);
  const nowDay = new Intl.DateTimeFormat('he-IL', { timeZone: 'Asia/Jerusalem', day: 'numeric', month: 'numeric' }).format(now);
  
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const tomorrowDay = new Intl.DateTimeFormat('he-IL', { timeZone: 'Asia/Jerusalem', day: 'numeric', month: 'numeric' }).format(tomorrow);

  const isToday = dDay === nowDay;
  const isTomorrow = dDay === tomorrowDay;

  let dateStr = jerusalemDate;
  if (isToday) {
    dateStr = 'היום';
  } else if (isTomorrow) {
    dateStr = 'מחר';
  }

  return { dateStr, timeStr, isToday, isTomorrow };
}

export function formatFullJerusalemDate(isoString: string): string {
  const d = new Date(isoString);
  return new Intl.DateTimeFormat('he-IL', {
    timeZone: 'Asia/Jerusalem',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(d);
}
