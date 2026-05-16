import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import api from "../api/axiosConfig";
import { buildFormData, getErrorMessage } from "./sliceUtils";

export const createFood = createAsyncThunk(
    "food/createFood",
    async (payload, { rejectWithValue }) => {
        try {
            const {
                name,
                description,
                quantity,
                expiryTime,
                pickupTime,
                foodImage,
            } = payload || {};

            const formData = buildFormData({
                name,
                description,
                quantity,
                expiryTime,
                pickupTime,
                foodImage,
            });

            const response = await api.post("/food", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            toast.success(response.data.message || "Food created successfully");
            return response.data.food;
        } catch (error) {
            return rejectWithValue(getErrorMessage(error, "Failed to create food"));
        }
    }
);

export const updateFood = createAsyncThunk(
    "food/updateFood",
    async ({ foodId, ...payload }, { rejectWithValue }) => {
        try {
            const { foodImage, ...data } = payload || {};
            let response;

            if (foodImage) {
                const formData = buildFormData({ ...data, foodImage });
                response = await api.patch(`/food/${foodId}`, formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
            } else {
                response = await api.patch(`/food/${foodId}`, data);
            }

            toast.success(response.data.message || "Food updated successfully");
            return response.data.food;
        } catch (error) {
            return rejectWithValue(getErrorMessage(error, "Failed to update food"));
        }
    }
);

export const getAvailableFood = createAsyncThunk(
    "food/getAvailableFood",
    async ({ longitude, latitude }, { rejectWithValue }) => {
        try {
            const response = await api.get("/food/available", {
                params: { longitude, latitude },
            });
            return response.data.foods || [];
        } catch (error) {
            return rejectWithValue(getErrorMessage(error, "Failed to fetch available food"));
        }
    }
);

export const getFoodById = createAsyncThunk(
    "food/getFoodById",
    async (foodId, { rejectWithValue }) => {
        try {
            const response = await api.get(`/food/${foodId}`);
            return response.data.food;
        } catch (error) {
            return rejectWithValue(getErrorMessage(error, "Failed to fetch food"));
        }
    }
);

export const deleteFood = createAsyncThunk(
    "food/deleteFood",
    async (foodId, { rejectWithValue }) => {
        try {
            const response = await api.delete(`/food/${foodId}`);
            toast.success(response.data.message || "Food deleted successfully");
            return foodId;
        } catch (error) {
            return rejectWithValue(getErrorMessage(error, "Failed to delete food"));
        }
    }
);

export const getFoodListings = createAsyncThunk(
    "food/getFoodListings",
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get("/food/listings");
            return response.data.foods || [];
        } catch (error) {
            return rejectWithValue(getErrorMessage(error, "Failed to fetch food listings"));
        }
    }
);

const foodSlice = createSlice({
    name: "food",
    initialState: {
        food: null,
        availableFoods: [],
        foods: [],
        loading: false,
        error: null,
    },
    reducers: {
        clearFoodError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(createFood.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createFood.fulfilled, (state, action) => {
                state.loading = false;
                state.food = action.payload;
            })
            .addCase(createFood.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to create food";
            })
            .addCase(updateFood.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateFood.fulfilled, (state, action) => {
                state.loading = false;
                state.food = action.payload;
                state.availableFoods = state.availableFoods.map((food) =>
                    food._id === action.payload?._id ? action.payload : food
                );
                state.foods = state.foods.map((food) =>
                    food._id === action.payload?._id ? action.payload : food
                );
            })
            .addCase(updateFood.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to update food";
            })
            .addCase(getAvailableFood.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getAvailableFood.fulfilled, (state, action) => {
                state.loading = false;
                state.availableFoods = action.payload || [];
            })
            .addCase(getAvailableFood.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to fetch available food";
            })
            .addCase(getFoodById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getFoodById.fulfilled, (state, action) => {
                state.loading = false;
                state.food = action.payload;
            })
            .addCase(getFoodById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to fetch food";
            })
            .addCase(deleteFood.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteFood.fulfilled, (state, action) => {
                state.loading = false;
                state.availableFoods = state.availableFoods.filter(
                    (food) => food._id !== action.payload
                );
                state.foods = state.foods.filter((food) => food._id !== action.payload);
                if (state.food?._id === action.payload) {
                    state.food = null;
                }
            })
            .addCase(deleteFood.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to delete food";
            })
            .addCase(getFoodListings.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getFoodListings.fulfilled, (state, action) => {
                state.loading = false;
                state.foods = action.payload || [];
            })
            .addCase(getFoodListings.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to fetch food listings";
            });
    },
});

export const { clearFoodError } = foodSlice.actions;
export default foodSlice.reducer;
