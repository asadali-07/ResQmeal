import { connectSocket, disconnectSocket, socket } from "../socket/socket";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axiosConfig";
import { toast } from "react-toastify";
import { addMessage } from "./messageSlice";
import { pushNotification } from "./notificationSlice";
import { setOnlineUsers, updateLiveLocation } from "./socketSlice";

export const getErrorMessage = (error, defaultMessage) => {
    if (error.response?.data?.message) {
        return error.response.data.message;
    }
    if (error.message) {
        return error.message;
    }
    return defaultMessage;
};

function registerSocketListeners(dispatch, role) {
    socket.off("getOnlineUsers");
    socket.off("newMessage");
    socket.off("notification");
    socket.off("receive-location");

    socket.on("getOnlineUsers", (onlineUsers) => {
        dispatch(setOnlineUsers(onlineUsers || []));
    });

    socket.on("newMessage", (message) => {
        dispatch(addMessage(message));
    });

    socket.on("notification", (data) => {
        const normalized = normalizeNotification(data, role);
        showNotificationToast(normalized);
        dispatch(pushNotification(normalized));
    });

    socket.on("receive-location", (data) => {
        dispatch(updateLiveLocation(data));
    });
}

const normalizeNotification = (data, role) => {
    const type = data?.type || "notification";
    const foodName = data?.foodName || "food";
    const restaurantName = data?.restaurantName || "restaurant";
    const titleFallback = "Update";
    let title = titleFallback;
    let message = data?.message || titleFallback;
    let tone = "info";

    switch (type) {
        case "NEW_PICKUP":
            title = "New pickup request";
            tone = "info";
            if (role === "volunteer") {
                message = `Pickup ${foodName} from ${restaurantName}.`;
            }
            break;
        case "CLAIM_CREATED":
            title = "Food claimed";
            tone = "info";
            if (role === "restaurant") {
                message = `An NGO claimed ${foodName}.`;
            } else if (role === "ngo") {
                message = `You claimed ${foodName}.`;
            }
            break;
        case "CLAIM_ACCEPTED":
            title = "Claim accepted";
            tone = "success";
            if (role === "ngo") {
                message = "A volunteer accepted your claim.";
            } else if (role === "restaurant") {
                message = `A volunteer accepted pickup for ${foodName}.`;
            }
            break;
        case "PICKUP_VERIFIED":
            title = "Pickup verified";
            tone = "success";
            if (role === "ngo") {
                message = "Pickup verified by the volunteer.";
            } else if (role === "restaurant") {
                message = `Pickup verified for ${foodName}.`;
            }
            break;
        case "DELIVERY_VERIFIED":
            title = "Delivery verified";
            tone = "success";
            if (role === "ngo") {
                message = "Delivery verified. Please prepare for handoff.";
            }
            break;
        case "CLAIM_CANCELLED":
            title = "Claim cancelled";
            tone = "warning";
            if (role === "volunteer") {
                message = "The NGO cancelled the claim.";
            } else if (role === "restaurant") {
                message = `Claim cancelled for ${foodName}.`;
            } else if (role === "ngo") {
                message = "You cancelled the claim.";
            }
            break;
        default:
            break;
    }

    return {
        ...data,
        type,
        title,
        message,
        tone,
    };
};

const showNotificationToast = (payload) => {
    if (payload.tone === "success") {
        toast.success(payload.message || "Update");
        return;
    }
    if (payload.tone === "warning") {
        toast.warn(payload.message || "Update");
        return;
    }
    toast.info(payload.message || "Update");
};

export const registerUser = createAsyncThunk(
    "user/registerUser",
    async ({ name, email, password, phone, role }, { rejectWithValue, dispatch }) => {
        try {
            const response = await api.post("/auth/register", {
                name,
                email,
                password,
                phone,
                role
            });

            toast.success(response.data.message || "Registered successfully");
            const userPayload = response.data.user;
            if (userPayload?._id) {
                connectSocket(userPayload._id);
                registerSocketListeners(dispatch, userPayload?.role);
                return userPayload;
            }

            const meResult = await dispatch(getUserInfo());
            if (meResult?.meta?.requestStatus === "fulfilled") {
                return meResult.payload;
            }

            return userPayload;
        } catch (error) {
            return rejectWithValue(getErrorMessage(error, "Registration failed"));
        }
    }
);

export const loginUser = createAsyncThunk(
    "user/loginUser",
    async ({ email, password }, { rejectWithValue, dispatch }) => {
        try {
            const response = await api.post("/auth/login", { email, password });

            if (!response?.data?.user) {
                return rejectWithValue("Invalid credentials");
            }

            toast.success(response.data.message || "Logged in successfully");
            const userPayload = response.data.user;

            if (userPayload?._id) {
                connectSocket(userPayload._id);
                registerSocketListeners(dispatch, userPayload?.role);
                return userPayload;
            }

            const meResult = await dispatch(getUserInfo());
            if (meResult?.meta?.requestStatus === "fulfilled") {
                return meResult.payload;
            }

            return userPayload;
        } catch (error) {
            return rejectWithValue(getErrorMessage(error, "Login failed"));
        }
    }
);

export const logoutUser = createAsyncThunk(
    "user/logoutUser",
    async (_, { rejectWithValue, dispatch }) => {
        try {
            await api.get("/auth/logout");
            disconnectSocket();
            toast.success("Logged out successfully");
        } catch (error) {
            return rejectWithValue(getErrorMessage(error, "Logout failed"));
        }
    }
);

export const updateProfile = createAsyncThunk(
    "user/updateProfile",
    async ({ name, phone, profileImage }, { rejectWithValue }) => {
        try {
            const formData = new FormData();
            if (name) formData.append("name", name);
            if (phone) formData.append("phone", phone);
            if (profileImage) formData.append("profileImage", profileImage);

            const response = await api.patch("/auth/update-profile", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            toast.success(response.data.message || "Profile updated successfully");
            return response.data.user;
        } catch (error) {
            return rejectWithValue(getErrorMessage(error, "Profile update failed"));
        }
    }
);

export const sendOtp = createAsyncThunk(
    "user/sendOtp",
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get("/auth/send-otp");
            toast.success(response.data.message || "OTP sent successfully");
            return response.data.message;
        } catch (error) {
            return rejectWithValue(getErrorMessage(error, "Failed to send OTP"));
        }
    }
);

export const verifyOtp = createAsyncThunk(
    "user/verifyOtp",
    async (otp, { rejectWithValue, dispatch }) => {
        try {
            const response = await api.post("/auth/verify-otp", { otp });
            toast.success(response.data.message || "Email verified successfully");
            await dispatch(getUserInfo());
            return response.data.message;
        } catch (error) {
            return rejectWithValue(getErrorMessage(error, "Failed to verify OTP"));
        }
    }
);

export const getUserInfo = createAsyncThunk(
    "user/getUserInfo",
    async (_, { rejectWithValue, dispatch }) => {
        try {
            const response = await api.get("/auth/me");
            if (response.data.user?._id) {
                connectSocket(response.data.user._id);
                registerSocketListeners(dispatch, response.data.user?.role);
            }
            return response.data.user;
        } catch (error) {
            return rejectWithValue(getErrorMessage(error, "Failed to fetch user info"));
        }
    }
);


const userSlice = createSlice({
    name: 'user',
    initialState: {
        userInfo: null,
        loading: false,
        verifying: false,
        isAuthenticated: false,
        error: null,
    },
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(registerUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.loading = false;
                state.userInfo = action.payload;
                state.isAuthenticated = true;
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Registration failed";
            })
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.userInfo = action.payload;
                state.isAuthenticated = true;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Login failed";
            })
            .addCase(logoutUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(logoutUser.fulfilled, (state) => {
                state.loading = false;
                state.userInfo = null;
                state.isAuthenticated = false;
            })
            .addCase(logoutUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Logout failed";
            })
            .addCase(updateProfile.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.userInfo = action.payload;
            })
            .addCase(updateProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Profile update failed";
            })
            .addCase(sendOtp.pending, (state) => {
                state.verifying = true;
                state.error = null;
            })
            .addCase(sendOtp.fulfilled, (state) => {
                state.verifying = false;
            })
            .addCase(sendOtp.rejected, (state, action) => {
                state.verifying = false;
                state.error = action.payload || "Failed to send OTP";
            })
            .addCase(verifyOtp.pending, (state) => {
                state.verifying = true;
                state.error = null;
            })
            .addCase(verifyOtp.fulfilled, (state) => {
                state.verifying = false;
                if (state.userInfo) {
                    state.userInfo.isVerified = true;
                }
            })
            .addCase(verifyOtp.rejected, (state, action) => {
                state.verifying = false;
                state.error = action.payload || "Failed to verify OTP";
            })
            .addCase(getUserInfo.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getUserInfo.fulfilled, (state, action) => {
                state.loading = false;
                state.userInfo = action.payload;
                state.isAuthenticated = true;
            })
            .addCase(getUserInfo.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to fetch user info";
            })
    }
});


export const { clearError } = userSlice.actions;
export default userSlice.reducer;
