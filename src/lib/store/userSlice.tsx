import { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";

// create a slice
export const userSlice = createSlice({
  name: "user",
  initialState: {
    isAdmin: false,
    isCustomer: false,
    isDriver: false,
    isCompany: false,
    isCompanyAdmin: false,
    companyId: null,
    customerId: null,
    driverId: null,
    userId: null,
    user: null,
    userName: null,
    state: "Queensland",
    resetApprove: null,
  },
  reducers: {
    setIsAdmin: (state, action: PayloadAction<boolean>) => {
      state.isAdmin = action.payload;
    },
    setCustomerId: (state, action: PayloadAction<any>) => {
      state.customerId = action.payload;
      state.isCustomer = true;
    },
    setDriverId: (state, action: PayloadAction<any>) => {
      state.driverId = action.payload;
      state.isDriver = true;
    },
    setCompanyId: (state, action: PayloadAction<any>) => {
      state.companyId = action.payload != "null" ? action.payload : null;
      state.isCompany = true;
    },
    setUserId: (state, action: PayloadAction<any>) => {
      state.userId = action.payload;
    },
    setUser: (state, action: PayloadAction<any>) => {
      state.user = action.payload;
    },
    setIsCompanyAdmin: (state, action: PayloadAction<boolean>) => {
      state.isCompanyAdmin = action.payload;
    },
    setState: (state, action: PayloadAction<any>) => {
      state.state = action.payload;
    },
    setUserName: (state, action: PayloadAction<string>) => {
      state.userName = action.payload;
    },
    setResetApprove: (state, action: PayloadAction<boolean | null>) => {
      // ✅ new reducer
      state.resetApprove = action.payload;
    },
    logoutUser: (state) => {
      state.isAdmin = false;
      state.isCustomer = false;
      state.isDriver = false;
      state.isCompany = false;
      state.isCompanyAdmin = false;
      state.companyId = null;
      state.customerId = null;
      state.driverId = null;
      state.userId = null;
      state.user = null;
      state.resetApprove = null;
    },
  },
});

export const {
  setIsAdmin,
  setCustomerId,
  setCompanyId,
  setIsCompanyAdmin,
  setUserId,
  setDriverId,
  setUser,
  setState,
  logoutUser,
  setUserName,
  setResetApprove,
} = userSlice.actions;

export default userSlice.reducer;
