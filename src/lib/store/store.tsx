import { configureStore } from "@reduxjs/toolkit";

import driversSlice from "./driversSlice";
import { jobFilterReducer } from "./jobFilterSlice";
import { preJobFilterReducer } from "./preJobFilterSlice";
import rightSideBarSlice from "./rightSideBarSlice";
import routesSlice from "./routesSlice";
import userSlice from "./userSlice";

export const store = configureStore({
  reducer: {
    rightSideBar: rightSideBarSlice,
    drivers: driversSlice,
    user: userSlice,
    routes: routesSlice,
    jobFilter: jobFilterReducer,
    preJobFilter: preJobFilterReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;