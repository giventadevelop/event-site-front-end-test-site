/**
 * Optional focus-group content (announcements, schedule, gallery privacy)
 * stored as a trailing HTML comment in focus_group.description so no DB migration is required.
 */

export type FocusGroupExtras = {
  announcements?: string;
  meetingSchedule?: string;
  /** When true, member names/avatars are visible to everyone. Default false = members only. */
  showMemberGalleryPublic?: boolean;
};

const START = '<!--KCNJ_FG_EXTRAS:';
const END = ':KCNJ_FG_EXTRAS-->';

export function parseFocusGroupDescription(raw?: string | null): {
  description: string;
  extras: FocusGroupExtras;
} {
  const text = raw ?? '';
  const startIdx = text.indexOf(START);
  const endIdx = text.indexOf(END);
  if (startIdx === -1 || endIdx === -1 || endIdx <= startIdx) {
    return { description: text.trim(), extras: {} };
  }
  const jsonPart = text.slice(startIdx + START.length, endIdx).trim();
  let extras: FocusGroupExtras = {};
  try {
    extras = JSON.parse(jsonPart) as FocusGroupExtras;
  } catch {
    extras = {};
  }
  const description = `${text.slice(0, startIdx)}${text.slice(endIdx + END.length)}`.trim();
  return { description, extras };
}

export function composeFocusGroupDescription(
  description: string,
  extras: FocusGroupExtras
): string {
  const cleanDescription = (description ?? '').trim();
  const payload: FocusGroupExtras = {};
  if (extras.announcements?.trim()) payload.announcements = extras.announcements.trim();
  if (extras.meetingSchedule?.trim()) payload.meetingSchedule = extras.meetingSchedule.trim();
  if (extras.showMemberGalleryPublic === true) payload.showMemberGalleryPublic = true;

  if (Object.keys(payload).length === 0) {
    return cleanDescription;
  }
  return `${cleanDescription}\n\n${START}${JSON.stringify(payload)}${END}`.trim();
}
