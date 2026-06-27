/**
 * Malayalam liturgy text helpers.
 *
 * Strapi imports from Panjangom PDFs sometimes store ML-TT / legacy font keystrokes
 * (ASCII-like text) instead of Unicode Malayalam (U+0D00–U+0D7F). Those strings
 * cannot be fixed in CSS — they must be re-imported as proper Unicode in Strapi.
 *
 * What the frontend CAN do:
 *  - Detect those legacy-font strings reliably.
 *  - Prefer the English value when one exists.
 *  - When no readable value exists, return an empty string + an `unreadable`
 *    flag so the UI shows a clean placeholder instead of garbled glyphs.
 */

/** True when the string contains Malayalam Unicode script. */
export function hasMalayalamScript(text: string): boolean {
  return /[\u0D00-\u0D7F]/.test(text);
}

/**
 * Symbols that show up when ML-TT / ISFOC legacy Malayalam fonts are read as
 * plain text. None of these appear in normal English headings or place names,
 * so their presence in a "Malayalam" field is a strong legacy-encoding signal.
 */
const LEGACY_FONT_SYMBOLS = /[∏∂¿Ω≥≤«»¬†‡¶§µ°±÷×€£¥•◊√∆∑∫πΩæœ˝ˆ˜¡¢]/;

/**
 * Heuristic for legacy font encoding stored in Strapi (not UTF-8 corruption).
 * Example: "...o_ms∏-cp-∂m-fn-\p-tijw H∂mw Rmb-¿. (\ndw 1)"
 */
export function isLegacyEncodedMalayalamPlaceholder(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  // Real Unicode Malayalam is never "legacy encoded".
  if (hasMalayalamScript(t)) return false;
  return (
    // Backslash followed by letters: "\p-tijw", "\ndw", "t\m≥"
    /\\[a-z]/i.test(t) ||
    // Any standalone backslash (legitimate headings/places never contain one)
    /\\/.test(t) ||
    // Legacy-font symbol glyphs
    LEGACY_FONT_SYMBOLS.test(t) ||
    // Common ML-TT keystroke fragments
    /_ms|_fn|_em|_kn|\\p-|\\ndw/i.test(t)
  );
}

export interface ResolvedDisplayText {
  /** Text safe to render (Unicode Malayalam, English fallback, or ''). */
  text: string;
  /** True when English was shown because the Malayalam was legacy/unreadable. */
  usedEnglishFallback: boolean;
  /** True when neither readable Malayalam nor English exists for this field. */
  unreadable: boolean;
}

/**
 * Pick text to show for Malayalam UI: use Unicode ML when valid, else English.
 * Never returns legacy-font gibberish — falls back to '' (unreadable) instead,
 * so callers can render a clean placeholder.
 */
export function resolveMalayalamDisplayText(ml: string, en: string): ResolvedDisplayText {
  const mlTrim = (ml ?? '').trim();
  const enTrim = (en ?? '').trim();

  // No Malayalam value: use English if present.
  if (!mlTrim) {
    return { text: enTrim, usedEnglishFallback: Boolean(enTrim), unreadable: !enTrim };
  }

  // Proper Unicode Malayalam: use it.
  if (hasMalayalamScript(mlTrim)) {
    return { text: mlTrim, usedEnglishFallback: false, unreadable: false };
  }

  // Malayalam field holds legacy-font gibberish: prefer English, never show glyphs.
  if (isLegacyEncodedMalayalamPlaceholder(mlTrim)) {
    if (enTrim) {
      return { text: enTrim, usedEnglishFallback: true, unreadable: false };
    }
    return { text: '', usedEnglishFallback: false, unreadable: true };
  }

  // ASCII but readable (e.g. real English text stored in the ML field): show it.
  return { text: mlTrim, usedEnglishFallback: false, unreadable: false };
}

/** Any Malayalam field on a liturgy day lacks Unicode script. */
export function liturgyDayNeedsMalayalamReimport(day: {
  dayHeadingMalylm: string;
  seasonNameMalylm: string;
  readings?: Array<{
    liturgyHeadingMalylm: string;
    contentPlaceMalylm: string;
  }>;
}): boolean {
  const fields = [
    day.dayHeadingMalylm,
    day.seasonNameMalylm,
    ...(day.readings ?? []).flatMap((r) => [r.liturgyHeadingMalylm, r.contentPlaceMalylm]),
  ];
  return fields.some(
    (f) => f.trim().length > 0 && !hasMalayalamScript(f) && isLegacyEncodedMalayalamPlaceholder(f),
  );
}
