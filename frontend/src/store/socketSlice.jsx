import { createSlice } from "@reduxjs/toolkit";

const socketSlice = createSlice({
  name: "socket",
  initialState: {
    onlineUserIds: [],
    liveLocations: {},
    activeRoomId: null,
  },
  reducers: {
    setOnlineUsers: (state, action) => {
      state.onlineUserIds = action.payload;
    },
    setActiveRoom: (state, action) => {
      state.activeRoomId = action.payload || null;
    },
    updateLiveLocation: (state, action) => {
      const payload = action.payload || {};
      const foodId = payload.foodId || state.activeRoomId;
      const { userId, lat, lng } = payload;
      if (!foodId || !userId) {
        return;
      }
      if (!state.liveLocations[foodId]) {
        state.liveLocations[foodId] = {};
      }
      state.liveLocations[foodId][userId] = {
        lat,
        lng,
        updatedAt: new Date().toISOString(),
      };
    },
    clearRoomLocations: (state, action) => {
      const foodId = action.payload;
      if (foodId && state.liveLocations[foodId]) {
        delete state.liveLocations[foodId];
      }
    },
  },
});

export const { setOnlineUsers, setActiveRoom, updateLiveLocation, clearRoomLocations } = socketSlice.actions;
export default socketSlice.reducer;