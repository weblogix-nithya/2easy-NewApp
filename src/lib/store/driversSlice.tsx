import { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";

// create a slice
export const driversSlice = createSlice({
  name: "drivers",
  initialState: {
    availableDrivers: [],
    availableDriverOptions: [],
    allDrivers: [],
    allDriverOptions: [],
    pageNo: 1,
    searchQuery: "",
  },
  reducers: {
    setAvailableDrivers: (state, action: PayloadAction<any>) => {
      state.availableDrivers = action.payload;
      state.availableDriverOptions = [];
      action.payload.map((driver: any) => {
        state.availableDriverOptions.push({
          value: parseInt(driver.id),
          label: driver.full_name,
        });
      });
    },
    setAllDrivers: (state, action: PayloadAction<any>) => {
      state.allDrivers = action.payload;
    },
    setPageNo: (state, action: PayloadAction<number>) => {
      state.pageNo = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
  },
});

export const { setAvailableDrivers, setAllDrivers, setPageNo, setSearchQuery } =
  driversSlice.actions;

export default driversSlice.reducer;
