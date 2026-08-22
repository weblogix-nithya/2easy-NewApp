const isBrowser = () => typeof window !== "undefined";

// Prefixed so it can never collide with any other localStorage key this
// app (or Bulk Allocation, if it's ever migrated separately) might use.
const PREFIX = "preAllocation:";

function readJSON(key: string, fallback: any) {
    if (!isBrowser()) return fallback;
    try {
        const raw = window.localStorage.getItem(PREFIX + key);
        if (!raw || raw === "undefined" || raw === "null") return fallback;
        return JSON.parse(raw);
    } catch {
        return fallback;
    }
}

function writeJSON(key: string, value: any) {
    if (!isBrowser()) return;
    try {
        window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch {
        // ignore — e.g. storage full/disabled; filter just won't persist
    }
}

function remove(key: string) {
    if (!isBrowser()) return;
    try {
        window.localStorage.removeItem(PREFIX + key);
    } catch {
        // ignore
    }
}

const KEYS = {
    selectedValues: "allJobFilters", // per-field selections — drives the visible tag row
    mainFilter: "jobMainFilters", // merged GraphQL-ready filter object — drives the query
    displayName: "displayName",
    isTicked: "is_filter_ticked",
} as const;

export function readPersistedFilterState(defaultMainFilter: any) {
    return {
        filters: readJSON(KEYS.selectedValues, {}),
        displayName: readJSON(KEYS.displayName, undefined),
        jobMainFilters: readJSON(KEYS.mainFilter, defaultMainFilter),
        is_filter_ticked: readJSON(KEYS.isTicked, "0") || "0",
    };
}

export function writeSelectedValues(values: any) {
    writeJSON(KEYS.selectedValues, values);
}

export function writeMainFilter(mainFilter: any) {
    writeJSON(KEYS.mainFilter, mainFilter);
}

export function writeDisplayName(displayName: any) {
    writeJSON(KEYS.displayName, displayName);
}

export function writeIsTicked(checked: boolean) {
    writeJSON(KEYS.isTicked, checked ? "1" : "0");
}

export function clearPersistedFilterState() {
    remove(KEYS.mainFilter);
    remove(KEYS.displayName);
    remove(KEYS.selectedValues);
}

// One-time best-effort cleanup of the old Pre-Allocation-only cookies
// (from before this moved to localStorage). Purely hygiene — cookies and
// localStorage are separate storage systems, so leftover cookies can't
// interfere with the new state either way, and this touches only
// Pre-Allocation's own cookie names, never anything Bulk Allocation uses.
export function cleanupLegacyFilterCookies() {
    if (!isBrowser()) return;
    try {
        const { destroyCookie } = require("nookies");
        const legacyNames = ["allJobFilters", "jobMainFilters", "displayName", "is_filter_ticked"];
        const pathsToTry = ["/", "*", undefined];
        legacyNames.forEach((name) => {
            pathsToTry.forEach((path) => {
                try {
                    destroyCookie(null, name, path ? { path } : {});
                } catch {
                    // ignore — best effort only
                }
            });
        });
    } catch {
        // ignore — nookies not available, nothing to clean up
    }
}