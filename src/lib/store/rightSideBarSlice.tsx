import { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";

// create a slice
export const rightSideBarSlice = createSlice({
  name: "isShowRightSideBar",
  initialState: {
    isShow: false,
    data: null,
    job: null,
    route: null,
    driver: null,
  },
  reducers: {
    setIsShowRightSideBar: (state, action: PayloadAction<boolean>) => {
      state.isShow = action.payload;
    },
    setRightSideBarData: (state, action: PayloadAction<any>) => {
      state.data = action.payload;
    },
    setRightSideBarJob: (state, action: PayloadAction<any>) => {
      state.job = action.payload;
    },
    setRightSideBarRoute: (state, action: PayloadAction<any>) => {
      state.route = action.payload;
    },
    setRightSideBarDriver: (state, action: PayloadAction<any>) => {
      state.driver = action.payload;
    },
  },
});

export const {
  setIsShowRightSideBar,
  setRightSideBarData,
  setRightSideBarJob,
  setRightSideBarRoute,
  setRightSideBarDriver,
} = rightSideBarSlice.actions;

export default rightSideBarSlice.reducer;
