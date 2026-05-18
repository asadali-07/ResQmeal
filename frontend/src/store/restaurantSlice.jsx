import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import api from "../api/axiosConfig";
import { buildFormData, getErrorMessage } from "./sliceUtils";

export const createRestaurant = createAsyncThunk(
  "restaurant/createRestaurant",
  async (payload, { rejectWithValue }) => {
    try {
      const {
        restaurantPicture,
        address,
        foodLicenseNumber,
        openingTime,
        closingTime,
        restaurantName,
        restaurantDescription,
      } = payload || {};

      let response;
      if (restaurantPicture) {
        const formData = buildFormData(
          {
            address,
            foodLicenseNumber,
            openingTime,
            closingTime,
            restaurantName,
            restaurantDescription,
            restaurantPicture,
          },
          { jsonKeys: ["address"] },
        );

        response = await api.post("/restaurants", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        response = await api.post("/restaurants", {
          address,
          foodLicenseNumber,
          openingTime,
          closingTime,
          restaurantName,
          restaurantDescription,
        });
      }

      toast.success(response.data.message || "Restaurant created successfully");
      return response.data.restaurant;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to create restaurant"),
      );
    }
  },
);

export const getUserRestaurant = createAsyncThunk(
  "restaurant/getUserRestaurant",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/restaurants");
      return response.data.restaurant;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to fetch restaurant"),
      );
    }
  },
);

export const getRestaurantById = createAsyncThunk(
  "restaurant/getRestaurantById",
  async (restaurantId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/restaurants/${restaurantId}`);
      return response.data.restaurant;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to fetch restaurant information"),
      );
    }
  },
);

export const updateRestaurant = createAsyncThunk(
  "restaurant/updateRestaurant",
  async (payload, { rejectWithValue }) => {
    try {
      const {
        restaurantPicture,
        address,
        foodLicenseNumber,
        openingTime,
        closingTime,
        restaurantName,
        restaurantDescription,
      } = payload || {};

      let response;
      if (restaurantPicture) {
        const formData = buildFormData(
          {
            address,
            foodLicenseNumber,
            openingTime,
            closingTime,
            restaurantName,
            restaurantDescription,
            restaurantPicture,
          },
          { jsonKeys: ["address"] },
        );

        response = await api.patch("/restaurants", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        response = await api.patch("/restaurants", {
          address,
          foodLicenseNumber,
          openingTime,
          closingTime,
          restaurantName,
          restaurantDescription,
        });
      }

      toast.success(response.data.message || "Restaurant updated successfully");
      return response.data.restaurant;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to update restaurant"),
      );
    }
  },
);

export const getAllRestaurants = createAsyncThunk(
  "restaurant/getAllRestaurants",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/restaurants/all");
      return response.data.restaurants || [];
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to fetch restaurants"),
      );
    }
  },
);

export const deleteRestaurant = createAsyncThunk(
  "restaurant/deleteRestaurant",
  async (restaurantId, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/restaurants/${restaurantId}`);
      toast.success(response.data.message || "Restaurant deleted successfully");
      return restaurantId;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to delete restaurant"),
      );
    }
  },
);

export const getTopRestaurants = createAsyncThunk(
  "restaurant/getTopRestaurants",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/restaurants/top");
      return response.data.restaurants || [];
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error || "failed to get top restaurants"),
      );
    }
  },
);

const restaurantSlice = createSlice({
  name: "restaurant",
  initialState: {
    restaurant: null,
    selectedRestaurant: null,
    restaurants: [],
    topRestaurants: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearRestaurantError: (state) => {
      state.error = null;
    },
    clearSelectedRestaurant: (state) => {
      state.selectedRestaurant = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createRestaurant.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createRestaurant.fulfilled, (state, action) => {
        state.loading = false;
        state.restaurant = action.payload;
      })
      .addCase(createRestaurant.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to create restaurant";
      })
      .addCase(getUserRestaurant.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserRestaurant.fulfilled, (state, action) => {
        state.loading = false;
        state.restaurant = action.payload;
      })
      .addCase(getUserRestaurant.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch restaurant";
      })
      .addCase(getRestaurantById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getRestaurantById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedRestaurant = action.payload;
      })
      .addCase(getRestaurantById.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || "Failed to fetch restaurant information";
      })
      .addCase(updateRestaurant.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateRestaurant.fulfilled, (state, action) => {
        state.loading = false;
        state.restaurant = action.payload;
      })
      .addCase(updateRestaurant.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to update restaurant";
      })
      .addCase(getAllRestaurants.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllRestaurants.fulfilled, (state, action) => {
        state.loading = false;
        state.restaurants = action.payload || [];
      })
      .addCase(getAllRestaurants.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch restaurants";
      })
      .addCase(getTopRestaurants.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTopRestaurants.fulfilled, (state, action) => {
        state.loading = false;
        state.topRestaurants = action.payload || [];
      })
      .addCase(getTopRestaurants.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch top restaurants";
      })
      .addCase(deleteRestaurant.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteRestaurant.fulfilled, (state, action) => {
        state.loading = false;
        state.restaurants = state.restaurants.filter(
          (restaurant) => restaurant._id !== action.payload,
        );
        if (state.restaurant?._id === action.payload) {
          state.restaurant = null;
        }
      })
      .addCase(deleteRestaurant.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to delete restaurant";
      });
  },
});

export const { clearRestaurantError, clearSelectedRestaurant } =
  restaurantSlice.actions;
export default restaurantSlice.reducer;
