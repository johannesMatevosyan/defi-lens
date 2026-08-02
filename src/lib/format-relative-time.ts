// src/lib/format-relative-time.ts
export function formatRelativeTime(unixTimestampSeconds: string | number): string {
    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
    const nowSeconds = Date.now() / 1000;
    const diffSeconds = Number(unixTimestampSeconds) - nowSeconds;

    const diffMinutes = Math.round(diffSeconds / 60);
    if (Math.abs(diffMinutes) < 60) return rtf.format(diffMinutes, 'minute');

    const diffHours = Math.round(diffMinutes / 60);
    if (Math.abs(diffHours) < 24) return rtf.format(diffHours, 'hour');

    const diffDays = Math.round(diffHours / 24);
    return rtf.format(diffDays, 'day');
}
