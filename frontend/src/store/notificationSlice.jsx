import { createSlice } from "@reduxjs/toolkit";

// Load notifications from localStorage
const loadNotifications = () => {
  try {
    const data = localStorage.getItem("notifications");
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to load notifications:", error);
    return [];
  }
};

// Save notifications to localStorage
const saveNotifications = (items) => {
  try {
    localStorage.setItem("notifications", JSON.stringify(items));
  } catch (error) {
    console.error("Failed to save notifications:", error);
  }
};

const notificationSlice = createSlice({
  name: "notification",
  initialState: {
    items: loadNotifications(),
  },
  reducers: {
    pushNotification: (state, action) => {
      const newNotification = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        createdAt: new Date().toISOString(),
        ...action.payload,
      };

      state.items.unshift(newNotification);

      // Persist to localStorage
      saveNotifications(state.items);
    },
    clearNotifications: (state) => {
      state.items = [];
      saveNotifications([]);
    },
  },
});

export const { pushNotification, clearNotifications } =
  notificationSlice.actions;

export default notificationSlice.reducer;
