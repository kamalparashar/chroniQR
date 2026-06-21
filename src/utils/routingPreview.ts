export interface TimeRule {
  days: number[];
  start_time: string;
  end_time: string;
  destination_type: string;
  destination_config: Record<string, any>;
  // Shorthands for backward compatibility
  destination?: string;
}

export interface TimeBasedConfig {
  type: 'time_based';
  timezone: string;
  default_type: string;
  default_config: Record<string, any>;
  rules: TimeRule[];
  // Shorthands for backward compatibility
  default_url?: string;
}

export interface ResolvedPreview {
  matchedRuleIndex: number; // -1 means default/fallback
  destination_type: string;
  destination_config: Record<string, any>;
  currentTimeString: string;
  currentDayName: string;
}

/**
 * Evaluates the time-based routing configuration against the current wall time
 * using the configured timezone, returning which rule or fallback is currently active.
 */
export function resolveTimeBasedPreview(config: TimeBasedConfig, testDate: Date = new Date()): ResolvedPreview {
  const timezone = config.timezone || "UTC";

  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    });

    const parts = formatter.formatToParts(testDate);
    const dayMap: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    const dayNameMap: Record<string, string> = {
      Sun: "Sunday", Mon: "Monday", Tue: "Tuesday", Wed: "Wednesday",
      Thu: "Thursday", Fri: "Friday", Sat: "Saturday"
    };

    const weekdayStr = parts.find(p => p.type === "weekday")?.value || "UTC";
    const currentDay = dayMap[weekdayStr] ?? 0;
    const hour = parseInt(parts.find(p => p.type === "hour")?.value || "0", 10);
    const minute = parseInt(parts.find(p => p.type === "minute")?.value || "0", 10);
    const currentMins = hour * 60 + minute;

    const currentTimeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    const currentDayName = dayNameMap[weekdayStr] || weekdayStr;

    const rules = config.rules || [];
    for (let i = 0; i < rules.length; i++) {
      const rule = rules[i];
      if (!rule.days.includes(currentDay)) continue;

      const [sh, sm] = (rule.start_time || "00:00").split(":").map(Number);
      const [eh, em] = (rule.end_time || "00:00").split(":").map(Number);
      const start = sh * 60 + sm;
      const end = eh * 60 + em;

      const inWindow = start <= end
        ? currentMins >= start && currentMins <= end   // normal window
        : currentMins >= start || currentMins <= end;  // midnight-spanning window

      if (inWindow) {
        // Map legacy flat destination if exists
        const destType = rule.destination_type || "url";
        const destConfig = rule.destination_config || (rule.destination ? { url: rule.destination } : {});

        return {
          matchedRuleIndex: i,
          destination_type: destType,
          destination_config: destConfig,
          currentTimeString,
          currentDayName
        };
      }
    }

    // Default Fallback
    const fallbackType = config.default_type || "url";
    const fallbackConfig = config.default_config || (config.default_url ? { url: config.default_url } : {});

    return {
      matchedRuleIndex: -1,
      destination_type: fallbackType,
      destination_config: fallbackConfig,
      currentTimeString,
      currentDayName
    };
  } catch (error) {
    console.error("Failed to parse time-based config or format time zone:", error);
    // Safe fallback in case of invalid timezone formatting
    return {
      matchedRuleIndex: -1,
      destination_type: config.default_type || "url",
      destination_config: config.default_config || (config.default_url ? { url: config.default_url } : {}),
      currentTimeString: "--:--",
      currentDayName: "Unknown"
    };
  }
}
