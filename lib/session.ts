import { Profile } from "./types";

export interface ProfileVersion {
  at: string;
  profile: Profile;
  changed?: { field: keyof Profile; from: string; to: string };
  topMatchIds: string[];
}

export interface SavedSession {
  id: string;
  displayName?: string;
  createdAt: string;
  history: ProfileVersion[];
  shortlist: { programId: string; matchAtSave: number; savedAt: string }[];
  completedTaskIds: string[];
}

const KEY = "vilion:session:v1";
const MAX_HISTORY = 20;

/** Never throws: private browsing and disabled storage are expected conditions. */
export function readSession(): SavedSession | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const value = JSON.parse(raw) as Partial<SavedSession>;
    if (!value || typeof value.id !== "string") return null;
    return {
      id: value.id,
      displayName:
        typeof value.displayName === "string" ? value.displayName : undefined,
      createdAt:
        typeof value.createdAt === "string"
          ? value.createdAt
          : new Date().toISOString(),
      history: Array.isArray(value.history) ? value.history : [],
      shortlist: Array.isArray(value.shortlist) ? value.shortlist : [],
      completedTaskIds: Array.isArray(value.completedTaskIds)
        ? value.completedTaskIds
        : [],
    };
  } catch {
    return null;
  }
}

export function writeSession(session: SavedSession): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(session));
  } catch {
    /* The plan stays usable for this visit; nothing is persisted. */
  }
}

export function clearSession(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* Nothing to clear. */
  }
}

function newId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `s-${Date.now()}`;
  }
}

export function startSession(
  profile: Profile,
  topMatchIds: string[],
  shortlist: SavedSession["shortlist"],
  completedTaskIds: string[],
  displayName?: string,
): SavedSession {
  const session: SavedSession = {
    id: newId(),
    displayName,
    createdAt: new Date().toISOString(),
    history: [{ at: new Date().toISOString(), profile, topMatchIds }],
    shortlist,
    completedTaskIds,
  };
  writeSession(session);
  return session;
}

/** Appends a version only when something actually changed. */
export function recordVersion(
  session: SavedSession,
  profile: Profile,
  topMatchIds: string[],
  changed?: ProfileVersion["changed"],
): SavedSession {
  const last = session.history.at(-1);
  if (last && JSON.stringify(last.profile) === JSON.stringify(profile))
    return session;
  const next: SavedSession = {
    ...session,
    history: [
      ...session.history,
      { at: new Date().toISOString(), profile, topMatchIds, changed },
    ].slice(-MAX_HISTORY),
  };
  writeSession(next);
  return next;
}

export function describeVersion(v: ProfileVersion, previous?: ProfileVersion) {
  if (!v.changed) return "Starting point saved.";
  const moved = previous
    ? v.topMatchIds.filter((id) => !previous.topMatchIds.includes(id)).length
    : 0;
  return `${v.changed.field}: ${v.changed.from} → ${v.changed.to}${
    moved ? `, ${moved} recommendation${moved === 1 ? "" : "s"} changed` : ""
  }`;
}
