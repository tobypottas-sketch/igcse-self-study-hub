export const SCHOOL_TIME_ZONE = 'Asia/Shanghai';
const DAY = 86_400_000;
const schoolDate = new Intl.DateTimeFormat('en-CA', {
  timeZone: SCHOOL_TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit'
});

export function schoolDay(timestamp) {
  if (!Number.isFinite(timestamp)) return null;
  const parts = Object.fromEntries(schoolDate.formatToParts(timestamp).map(part => [part.type, part.value]));
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function midnight(day) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day ?? '')) throw new RangeError('Expected a school date');
  const timestamp = Date.parse(`${day}T00:00:00+08:00`);
  if (schoolDay(timestamp) !== day) throw new RangeError('Invalid school date');
  return timestamp;
}

export function timestampOf(value) {
  if (value instanceof Date) return value.getTime();
  if (typeof value === 'number') return value;
  return typeof value === 'string' && /(?:Z|[+-]\d{2}:?\d{2})$/i.test(value) ? Date.parse(value) : NaN;
}

export function reportingPeriod(kind, { now = new Date(), from, to } = {}) {
  const asOf = timestampOf(now);
  const today = midnight(schoolDay(asOf));
  let start = today;
  let end = today + DAY;
  switch (kind) {
    case 'today': break;
    case 'last7': start = asOf - 7 * DAY; end = asOf + 1; break;
    case 'last30': start = asOf - 30 * DAY; end = asOf + 1; break;
    case 'thisWeek': {
      const weekday = new Date(today + 8 * 3_600_000).getUTCDay();
      start -= ((weekday + 6) % 7) * DAY;
      end = start + 7 * DAY;
      break;
    }
    case 'custom': start = midnight(from); end = midnight(to) + DAY; break;
    default: throw new RangeError('Unknown reporting period');
  }
  if ((kind === 'custom' && from > to) || start >= end) throw new RangeError('Reversed reporting period');
  return { start, end, asOf };
}
