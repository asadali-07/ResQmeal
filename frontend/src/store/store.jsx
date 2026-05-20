import { configureStore } from '@reduxjs/toolkit';
import userSlice from './userSlice';
import restaurantSlice from './restaurantSlice';
import ngoSlice from './ngoSlice';
import volunteerSlice from './volunteerSlice';
import foodSlice from './foodSlice';
import claimSlice from './claimSlice';
import messageSlice from './messageSlice';
import notificationSlice from './notificationSlice';
import socketSlice from './socketSlice';
import adminReducer from "./adminSlice";

export const store = configureStore({
    reducer: {
        userReducer: userSlice,
        restaurantReducer: restaurantSlice,
        ngoReducer: ngoSlice,
        volunteerReducer: volunteerSlice,
        foodReducer: foodSlice,
        claimReducer: claimSlice,
        messageReducer: messageSlice,
        notificationReducer: notificationSlice,
        socketReducer: socketSlice,
        adminReducer: adminReducer,
    },
});
