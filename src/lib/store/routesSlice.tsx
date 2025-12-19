import { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";

type Route = {
  title?: string;
  name: string;
  layout: string;
  isAdmin?: boolean;
  isCompany?: boolean;
  path: string;
  isPrivate?: boolean;
};

type state = {
  routes: {
    title?: string;
    name: string;
    layout: string;
    isAdmin?: boolean;
    isCompany?: boolean;
    path: string;
    isPrivate?: boolean;
  }[];
};

const INITIAL_STATE: state = {
  routes: [],
};

// create a slice
export const routesSlice = createSlice({
  name: "routesSlice",
  initialState: INITIAL_STATE,
  reducers: {
    setRoutes: (state, action: PayloadAction<Route[]>) => {
      state.routes = action.payload;
    },
  },
});

export const { setRoutes } = routesSlice.actions;

export default routesSlice.reducer;
