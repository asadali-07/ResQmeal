import { createSlice } from "@reduxjs/toolkit";

const notificationSlice = createSlice({
  name: "notification",
  initialState: {
    items: [],
  },
  reducers: {
    pushNotification: (state, action) => {
      state.items.unshift({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        createdAt: new Date().toISOString(),
        ...action.payload,
      });
    },
    clearNotifications: (state) => {
      state.items = [];
    },
  },
});

export const { pushNotification, clearNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;
