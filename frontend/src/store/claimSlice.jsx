import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import api from "../api/axiosConfig";
import { getErrorMessage } from "./sliceUtils";

export const createClaim = createAsyncThunk(
    "claim/createClaim",
    async (foodId, { rejectWithValue }) => {
        try {
            const response = await api.get(`/claims/${foodId}`);
            toast.success(response.data.message || "Claim created successfully");
            return {
                claim: response.data.claim,
                volunteers: response.data.volunteers || [],
            };
        } catch (error) {
            return rejectWithValue(getErrorMessage(error, "Failed to create claim"));
        }
    }
);

export const getNgoClaimedFoods = createAsyncThunk(
    "claim/getNgoClaimedFoods",
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get("/claims/ngo/claimed-foods");
            return response.data.claims || [];
        } catch (error) {
            return rejectWithValue(getErrorMessage(error, "Failed to fetch claimed foods"));
        }
    }
);

export const getRestaurantClaims = createAsyncThunk(
    "claim/getRestaurantClaims",
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get("/claims/restaurant/claimed-foods");
            return response.data.claims || [];
        } catch (error) {
            return rejectWithValue(getErrorMessage(error, "Failed to fetch restaurant claims"));
        }
    }
);

export const getVolunteerAcceptedClaims = createAsyncThunk(
    "claim/getVolunteerAcceptedClaims",
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get("/claims/volunteer/accepted-claims");
            return response.data.claims || [];
        } catch (error) {
            return rejectWithValue(getErrorMessage(error, "Failed to fetch accepted claims"));
        }
    }
);

export const getPendingClaims = createAsyncThunk(
    "claim/getPendingClaims",
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get("/claims/pending");
            return response.data.claims || [];
        } catch (error) {
            return rejectWithValue(getErrorMessage(error, "Failed to fetch pending claims"));
        }
    }
);

export const acceptClaim = createAsyncThunk(
    "claim/acceptClaim",
    async (claimId, { rejectWithValue }) => {
        try {
            const response = await api.patch(`/claims/${claimId}/accept`);
            toast.success(response.data.message || "Claim accepted successfully");
            return { claimId, message: response.data.message };
        } catch (error) {
            return rejectWithValue(getErrorMessage(error, "Failed to accept claim"));
        }
    }
);

export const verifyPickup = createAsyncThunk(
    "claim/verifyPickup",
    async ({ claimId, pickupToken }, { rejectWithValue }) => {
        try {
            const response = await api.patch(`/claims/${claimId}/pickup`, { pickupToken });
            toast.success(response.data.message || "Pickup verified successfully");
            return { claimId, message: response.data.message };
        } catch (error) {
            return rejectWithValue(getErrorMessage(error, "Failed to verify pickup"));
        }
    }
);

export const verifyDelivery = createAsyncThunk(
    "claim/verifyDelivery",
    async ({ claimId, deliveryToken }, { rejectWithValue }) => {
        try {
            const response = await api.patch(`/claims/${claimId}/deliver`, { deliveryToken });
            toast.success(response.data.message || "Delivery verified successfully");
            return { claimId, message: response.data.message };
        } catch (error) {
            return rejectWithValue(getErrorMessage(error, "Failed to verify delivery"));
        }
    }
);

export const cancelClaim = createAsyncThunk(
    "claim/cancelClaim",
    async (claimId, { rejectWithValue }) => {
        try {
            const response = await api.patch(`/claims/${claimId}/cancel`);
            toast.success(response.data.message || "Claim cancelled successfully");
            return { claimId, message: response.data.message };
        } catch (error) {
            return rejectWithValue(getErrorMessage(error, "Failed to cancel claim"));
        }
    }
);

const claimSlice = createSlice({
    name: "claim",
    initialState: {
        claim: null,
        pendingClaims: [],
        claimedFoods: [],
        restaurantClaims: [],
        acceptedClaims: [],
        volunteers: [],
        lastAction: null,
        loading: false,
        error: null,
    },
    reducers: {
        clearClaimError: (state) => {
            state.error = null;
        },
        clearClaimAction: (state) => {
            state.lastAction = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(createClaim.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createClaim.fulfilled, (state, action) => {
                state.loading = false;
                state.claim = action.payload.claim;
                state.volunteers = action.payload.volunteers;
            })
            .addCase(createClaim.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to create claim";
            })
            .addCase(getNgoClaimedFoods.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getNgoClaimedFoods.fulfilled, (state, action) => {
                state.loading = false;
                state.claimedFoods = action.payload || [];
            })
            .addCase(getNgoClaimedFoods.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to fetch claimed foods";
            })
            .addCase(getRestaurantClaims.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getRestaurantClaims.fulfilled, (state, action) => {
                state.loading = false;
                state.restaurantClaims = action.payload || [];
            })
            .addCase(getRestaurantClaims.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to fetch restaurant claims";
            })
            .addCase(getVolunteerAcceptedClaims.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getVolunteerAcceptedClaims.fulfilled, (state, action) => {
                state.loading = false;
                state.acceptedClaims = action.payload || [];
            })
            .addCase(getVolunteerAcceptedClaims.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to fetch accepted claims";
            })
            .addCase(getPendingClaims.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getPendingClaims.fulfilled, (state, action) => {
                state.loading = false;
                state.pendingClaims = action.payload || [];
            })
            .addCase(getPendingClaims.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to fetch pending claims";
            })
            .addCase(acceptClaim.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(acceptClaim.fulfilled, (state, action) => {
                state.loading = false;
                state.lastAction = action.payload.message;
                if (state.claim?._id === action.payload.claimId) {
                    state.claim.status = "accepted";
                }
                state.pendingClaims = state.pendingClaims.filter(
                    (claimItem) => claimItem._id !== action.payload.claimId
                );
            })
            .addCase(acceptClaim.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to accept claim";
            })
            .addCase(verifyPickup.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(verifyPickup.fulfilled, (state, action) => {
                state.loading = false;
                state.lastAction = action.payload.message;
                if (state.claim?._id === action.payload.claimId) {
                    state.claim.status = "picked_up";
                }
                state.acceptedClaims = state.acceptedClaims.map((claimItem) =>
                    claimItem._id === action.payload.claimId
                        ? { ...claimItem, status: "picked_up" }
                        : claimItem
                );
                state.restaurantClaims = state.restaurantClaims.map((claimItem) =>
                    claimItem._id === action.payload.claimId
                        ? { ...claimItem, status: "picked_up" }
                        : claimItem
                );
            })
            .addCase(verifyPickup.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to verify pickup";
            })
            .addCase(verifyDelivery.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(verifyDelivery.fulfilled, (state, action) => {
                state.loading = false;
                state.lastAction = action.payload.message;
                if (state.claim?._id === action.payload.claimId) {
                    state.claim.status = "delivered";
                }
                state.acceptedClaims = state.acceptedClaims.map((claimItem) =>
                    claimItem._id === action.payload.claimId
                        ? { ...claimItem, status: "delivered" }
                        : claimItem
                );
                state.restaurantClaims = state.restaurantClaims.map((claimItem) =>
                    claimItem._id === action.payload.claimId
                        ? { ...claimItem, status: "delivered" }
                        : claimItem
                );
            })
            .addCase(verifyDelivery.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to verify delivery";
            })
            .addCase(cancelClaim.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(cancelClaim.fulfilled, (state, action) => {
                state.loading = false;
                state.lastAction = action.payload.message;
                if (state.claim?._id === action.payload.claimId) {
                    state.claim = null;
                }
                state.restaurantClaims = state.restaurantClaims.filter(
                    (claimItem) => claimItem._id !== action.payload.claimId
                );
                state.acceptedClaims = state.acceptedClaims.map((claimItem) =>
                    claimItem._id === action.payload.claimId
                        ? { ...claimItem, status: "cancelled" }
                        : claimItem
                );
                state.volunteers = [];
            })
            .addCase(cancelClaim.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to cancel claim";
            });
    },
});

export const { clearClaimError, clearClaimAction } = claimSlice.actions;
export default claimSlice.reducer;
