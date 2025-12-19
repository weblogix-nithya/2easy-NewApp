import { configureStore } from "@reduxjs/toolkit";

import driversSlice from "./driversSlice";
import jobFilterSlice from "./jobFilterSlice";
import rightSideBarSlice from "./rightSideBarSlice";
import routesSlice from "./routesSlice";
import userSlice from "./userSlice";

export const store = configureStore({
  reducer: {
    rightSideBar: rightSideBarSlice,
    drivers: driversSlice,
    user: userSlice,
    routes: routesSlice,
    jobFilter: jobFilterSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
