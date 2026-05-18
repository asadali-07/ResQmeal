import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import api from "../api/axiosConfig";
import { getErrorMessage } from "./sliceUtils";

export const createVolunteer = createAsyncThunk(
  "volunteer/createVolunteer",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await api.post("/volunteers", payload);
      toast.success(response.data.message || "Volunteer created successfully");
      return response.data.volunteer;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to create volunteer"),
      );
    }
  },
);

export const getUserVolunteer = createAsyncThunk(
  "volunteer/getUserVolunteer",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/volunteers");
      return response.data.volunteer;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to fetch volunteer"),
      );
    }
  },
);

export const updateVolunteer = createAsyncThunk(
  "volunteer/updateVolunteer",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await api.patch("/volunteers", payload);
      toast.success(response.data.message || "Volunteer updated successfully");
      return response.data.updatedVolunteer;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to update volunteer"),
      );
    }
  },
);

export const getAllVolunteers = createAsyncThunk(
  "volunteer/getAllVolunteers",
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
  "volunteer/getVolunteerById",
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
  "volunteer/getAvailableVolunteers",
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
  "volunteer/deleteVolunteer",
  async (volunteerId, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/volunteers/${volunteerId}`);
      toast.success(response.data.message || "Volunteer deleted successfully");
      return volunteerId;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to delete volunteer"),
      );
    }
  },
);

export const getTopVolunteers=createAsyncThunk(
  "volunteer/getTopVolunteers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/volunteers/top");
      return response.data.volunteers || [];
    }
    catch(error){
      return rejectWithValue(getErrorMessage(error||"failed to get top volunteers"))
    }
  }  
);

const volunteerSlice = createSlice({
  name: "volunteer",
  initialState: {
    volunteer: null,
    selectedVolunteer: null,
    volunteers: [],
    topVolunteers: [],
    availableVolunteers: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearVolunteerError: (state) => {
      state.error = null;
    },
    clearSelectedVolunteer: (state) => {
      state.selectedVolunteer = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createVolunteer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createVolunteer.fulfilled, (state, action) => {
        state.loading = false;
        state.volunteer = action.payload;
      })
      .addCase(createVolunteer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to create volunteer";
      })
      .addCase(getUserVolunteer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserVolunteer.fulfilled, (state, action) => {
        state.loading = false;
        state.volunteer = action.payload;
      })
      .addCase(getUserVolunteer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch volunteer";
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
              state.error = action.payload || "Failed to fetch volunteer information";
            })
      .addCase(updateVolunteer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateVolunteer.fulfilled, (state, action) => {
        state.loading = false;
        state.volunteer = action.payload;
      })
      .addCase(updateVolunteer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to update volunteer";
      })
      .addCase(getAllVolunteers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllVolunteers.fulfilled, (state, action) => {
        state.loading = false;
        state.volunteers = action.payload || [];
      })
      .addCase(getAllVolunteers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch volunteers";
      })
      .addCase(getTopVolunteers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTopVolunteers.fulfilled, (state, action) => {
        state.loading = false;
        state.topVolunteers = action.payload || [];
      })
      .addCase(getTopVolunteers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch top volunteers";
      })
      .addCase(getAvailableVolunteers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAvailableVolunteers.fulfilled, (state, action) => {
        state.loading = false;
        state.availableVolunteers = action.payload || [];
      })
      .addCase(getAvailableVolunteers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch available volunteers";
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
        state.availableVolunteers = state.availableVolunteers.filter(
          (volunteer) => volunteer._id !== action.payload,
        );
        if (state.volunteer?._id === action.payload) {
          state.volunteer = null;
        }
      })
      .addCase(deleteVolunteer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to delete volunteer";
      });
  },
});

export const { clearVolunteerError, clearSelectedVolunteer } = volunteerSlice.actions;
export default volunteerSlice.reducer;
