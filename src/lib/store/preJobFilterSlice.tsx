import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { preDefaultJobFilter } from "@/components/preJobAllocation/Filters";
import { readPersistedFilterState } from "@/components/preJobAllocation/jobFilterCookies";

export const preJobFilterSlice = createSlice({
    name: "preJobFilter",
    initialState: readPersistedFilterState(preDefaultJobFilter),
    reducers: {
        setPreJobFilters: (state: any, action: PayloadAction<any>) => {
            state.filters[action.payload.key] = action.payload.value;
        },
        setPreDisplayName: (state: any, action: PayloadAction<any>) => {
            state.displayName = action.payload;
        },
        setPreJobMainFilters: (state, action: PayloadAction<any>) => {
            state.jobMainFilters = action.payload;
        },
        setIsPreFilterTicked: (state, action: PayloadAction<any>) => {
            state.is_filter_ticked = action.payload;
        },
    },
});

export const {
    setPreJobFilters,
    setPreDisplayName,
    setPreJobMainFilters,
    setIsPreFilterTicked,
} = preJobFilterSlice.actions;

export const preJobFilterReducer = preJobFilterSlice.reducer;