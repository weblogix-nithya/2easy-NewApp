import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { defaultJobFilter } from "@/components/jobs/Filters";
import { parseCookies } from "nookies";

// ─── Cookie rehydration helpers ───────────────────────────────────────────────
// Runs ONCE at module load time — reads current cookie values for initial state

function readCookieJSON(key: string, fallback: any = undefined) {
  try {
    const cookies = parseCookies();
    const raw = cookies[key];
    if (!raw || raw === "undefined" || raw === "null") return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

// Read all individual job filter cookies
function readJobFiltersFromCookies() {
  const keys = [
    "states", "suburbs", "address_business_name",
    "has_company_ids", "has_job_category_ids", "job_date_at",
    "job_status_id", "is_tailgate_required",
    "weight_from", "weight_to", "volume_from", "volume_to",
  ];
  const result: Record<string, any> = {};
  keys.forEach((key) => {
    result[key] = readCookieJSON(`jobFilters_${key}`, undefined);
  });
  return result;
}

// ─── jobFilterSlice ───────────────────────────────────────────────────────────
export const jobFilterSlice = createSlice({
  name: "jobFilter",
  initialState: {
    filters: readJobFiltersFromCookies(),
    displayName: readCookieJSON("displayName", undefined),
    jobMainFilters: readCookieJSON("jobMainFilters", defaultJobFilter),
    is_filter_ticked: readCookieJSON("is_filter_ticked", "0") || "0",
  },
  reducers: {
    setJobFilters: (state: any, action: PayloadAction<any>) => {
      state.filters[action.payload.key] = action.payload.value;
    },
    setDisplayName: (state: any, action: PayloadAction<any>) => {
      state.displayName = action.payload;
    },
    setJobMainFilters: (state, action: PayloadAction<any>) => {
      state.jobMainFilters = action.payload;
    },
    setIsFilterTicked: (state, action: PayloadAction<any>) => {
      state.is_filter_ticked = action.payload;
    },
  },
});

export const {
  setJobFilters,
  setDisplayName,
  setJobMainFilters,
  setIsFilterTicked,
} = jobFilterSlice.actions;

export const jobFilterReducer = jobFilterSlice.reducer;