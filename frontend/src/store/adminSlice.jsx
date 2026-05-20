import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import api from "../api/axiosConfig";
import { getErrorMessage } from "./sliceUtils";

/* =========================
   NGO APIs
========================= */

export const getAllNgos = createAsyncThunk(
  "admin/getAllNgos",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/ngos/all");
      return response.data.ngos || [];
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to fetch NGOs"),
      );
    }
  },
);

export const getNgoById = createAsyncThunk(
  "admin/getNgoById",
  async (ngoId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/ngos/${ngoId}`);
      return response.data.ngo;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to fetch NGO details"),
      );
    }
  },
);

export const deleteNgo = createAsyncThunk(
  "admin/deleteNgo",
  async (ngoId, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/ngos/${ngoId}`);
      toast.success(response.data.message || "NGO deleted successfully");
      return ngoId;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to delete NGO"),
      );
    }
  },
);

/* =========================
   Restaurant APIs
========================= */

export const getAllRestaurants = createAsyncThunk(
  "admin/getAllRestaurants",
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

export const getRestaurantById = createAsyncThunk(
  "admin/getRestaurantById",
  async (restaurantId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/restaurants/${restaurantId}`);
      return response.data.restaurant;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to fetch restaurant details"),
      );
    }
  },
);

export const deleteRestaurant = createAsyncThunk(
  "admin/deleteRestaurant",
  async (restaurantId, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/restaurants/${restaurantId}`);
      toast.success(
        response.data.message || "Restaurant deleted successfully",
      );
      return restaurantId;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to delete restaurant"),
      );
    }
  },
);

/* =========================
   Volunteer APIs
========================= */

export const getAllVolunteers = createAsyncThunk(
  "admin/getAllVolunteers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/volunteers/all");
      return response.data.volunteers || [];
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to fetch volunteers"),
      );
    }
  },
);

export const getVolunteerById = createAsyncThunk(
  "admin/getVolunteerById",
  async (volunteerId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/volunteers/${volunteerId}`);
      return response.data.volunteer;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to fetch volunteer details"),
      );
    }
  },
);

export const getAvailableVolunteers = createAsyncThunk(
  "admin/getAvailableVolunteers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/volunteers/available");
      return response.data.volunteers || [];
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to fetch available volunteers"),
      );
    }
  },
);

export const deleteVolunteer = createAsyncThunk(
  "admin/deleteVolunteer",
  async (volunteerId, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/volunteers/${volunteerId}`);
      toast.success(
        response.data.message || "Volunteer deleted successfully",
      );
      return volunteerId;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to delete volunteer"),
      );
    }
  },
);

/* =========================
   Slice
========================= */

const adminSlice = createSlice({
  name: "admin",

  initialState: {
    ngos: [],
    restaurants: [],
    volunteers: [],
    availableVolunteers: [],

    selectedNgo: null,
    selectedRestaurant: null,
    selectedVolunteer: null,

    loading: false,
    error: null,
  },

  reducers: {
    clearAdminError: (state) => {
      state.error = null;
    },

    clearSelectedNgo: (state) => {
      state.selectedNgo = null;
    },

    clearSelectedRestaurant: (state) => {
      state.selectedRestaurant = null;
    },

    clearSelectedVolunteer: (state) => {
      state.selectedVolunteer = null;
    },
  },

  extraReducers: (builder) => {
    builder

      /* =========================
         NGO Cases
      ========================= */

      .addCase(getAllNgos.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllNgos.fulfilled, (state, action) => {
        state.loading = false;
        state.ngos = action.payload;
      })
      .addCase(getAllNgos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch NGOs";
      })

      .addCase(getNgoById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getNgoById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedNgo = action.payload;
      })
      .addCase(getNgoById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch NGO";
      })

      .addCase(deleteNgo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteNgo.fulfilled, (state, action) => {
        state.loading = false;

        state.ngos = state.ngos.filter(
          (ngo) => ngo._id !== action.payload,
        );

        if (state.selectedNgo?._id === action.payload) {
          state.selectedNgo = null;
        }
      })
      .addCase(deleteNgo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to delete NGO";
      })

      /* =========================
         Restaurant Cases
      ========================= */

      .addCase(getAllRestaurants.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllRestaurants.fulfilled, (state, action) => {
        state.loading = false;
        state.restaurants = action.payload;
      })
      .addCase(getAllRestaurants.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch restaurants";
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
          action.payload || "Failed to fetch restaurant";
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

        if (state.selectedRestaurant?._id === action.payload) {
          state.selectedRestaurant = null;
        }
      })
      .addCase(deleteRestaurant.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || "Failed to delete restaurant";
      })

      /* =========================
         Volunteer Cases
      ========================= */

      .addCase(getAllVolunteers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllVolunteers.fulfilled, (state, action) => {
        state.loading = false;
        state.volunteers = action.payload;
      })
      .addCase(getAllVolunteers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch volunteers";
      })

      .addCase(getVolunteerById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getVolunteerById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedVolunteer = action.payload;
      })
      .addCase(getVolunteerById.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || "Failed to fetch volunteer";
      })

      .addCase(getAvailableVolunteers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAvailableVolunteers.fulfilled, (state, action) => {
        state.loading = false;
        state.availableVolunteers = action.payload;
      })
      .addCase(getAvailableVolunteers.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload ||
          "Failed to fetch available volunteers";
      })

      .addCase(deleteVolunteer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteVolunteer.fulfilled, (state, action) => {
        state.loading = false;

        state.volunteers = state.volunteers.filter(
          (volunteer) => volunteer._id !== action.payload,
        );

        state.availableVolunteers =
          state.availableVolunteers.filter(
            (volunteer) => volunteer._id !== action.payload,
          );

        if (state.selectedVolunteer?._id === action.payload) {
          state.selectedVolunteer = null;
        }
      })
      .addCase(deleteVolunteer.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || "Failed to delete volunteer";
      });
  },
});

export const {
  clearAdminError,
  clearSelectedNgo,
  clearSelectedRestaurant,
  clearSelectedVolunteer,
} = adminSlice.actions;

export default adminSlice.reducer;