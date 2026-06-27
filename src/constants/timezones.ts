// ── All IANA timezones from browser ──────────────────────────────────────────
export const ALL_TIMEZONES: string[] = (() => {
  try {
    return (Intl as Record<string, unknown> & { supportedValuesOf: (key: string) => string[] }).supportedValuesOf('timeZone');
  } catch {
    // Fallback for older browsers
    return [
      'UTC', 'Africa/Cairo', 'America/Chicago', 'America/Los_Angeles', 'America/New_York',
      'America/Sao_Paulo', 'Asia/Dubai', 'Asia/Kolkata', 'Asia/Singapore', 'Asia/Tokyo',
      'Australia/Sydney', 'Europe/Berlin', 'Europe/London', 'Europe/Paris',
    ];
  }
})();

// ── GMT offset string for a timezone ─────────────────────────────────────────
export const getGmtOffset = (tz: string): string => {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      timeZoneName: 'longOffset',
    });
    const parts = formatter.formatToParts(new Date());
    const offsetPart = parts.find(p => p.type === 'timeZoneName');
    return offsetPart ? offsetPart.value : '';
  } catch {
    return '';
  }
};

// ── Pre-computed timezone options with offsets ────────────────────────────────
export const TZ_OPTIONS = ALL_TIMEZONES.map(tz => ({
  name: tz,
  offset: getGmtOffset(tz),
}));

// ── Browser-detected timezone ────────────────────────────────────────────────
export const DETECTED_TZ = Intl.DateTimeFormat().resolvedOptions().timeZone;
