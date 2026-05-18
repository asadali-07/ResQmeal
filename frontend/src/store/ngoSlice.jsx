import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import api from "../api/axiosConfig";
import { buildFormData, getErrorMessage } from "./sliceUtils";

export const createNgo = createAsyncThunk(
  "ngo/createNgo",
  async (payload, { rejectWithValue }) => {
    try {
      const {
        ngoPicture,
        address,
        registrationNumber,
        capacity,
        ngoName,
        ngoDescription,
      } = payload || {};

      let response;
      if (ngoPicture) {
        const formData = buildFormData(
          {
            address,
            registrationNumber,
            capacity,
            ngoName,
            ngoDescription,
            ngoPicture,
          },
          { jsonKeys: ["address"] },
        );

        response = await api.post("/ngos", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        response = await api.post("/ngos", {
          address,
          registrationNumber,
          capacity,
          ngoName,
          ngoDescription,
        });
      }

      toast.success(response.data.message || "Ngo created successfully");
      return response.data.newNgo;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to create ngo"));
    }
  },
);

export const getNgoById = createAsyncThunk(
  "ngo/getNgoById",
  async (ngoId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/ngos/${ngoId}`);
      return response.data.ngo;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to fetch ngo information"),
      );
    }
  },
);

export const getUserNgo = createAsyncThunk(
  "ngo/getUserNgo",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/ngos");
      return response.data.ngo;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to fetch ngo"));
    }
  },
);

export const updateNgo = createAsyncThunk(
  "ngo/updateNgo",
  async (payload, { rejectWithValue }) => {
    try {
      const {
        ngoPicture,
        address,
        registrationNumber,
        capacity,
        ngoName,
        ngoDescription,
      } = payload || {};

      let response;
      if (ngoPicture) {
        const formData = buildFormData(
          {
            address,
            registrationNumber,
            capacity,
            ngoName,
            ngoDescription,
            ngoPicture,
          },
          { jsonKeys: ["address"] },
        );

        response = await api.patch("/ngos", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        response = await api.patch("/ngos", {
          address,
          registrationNumber,
          capacity,
          ngoName,
          ngoDescription,
        });
      }

      toast.success(response.data.message || "Ngo updated successfully");
      return response.data.updatedNgo;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to update ngo"));
    }
  },
);

export const getAllNgos = createAsyncThunk(
  "ngo/getAllNgos",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/ngos/all");
      return response.data.ngos || [];
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to fetch ngos"));
    }
  },
);

export const deleteNgo = createAsyncThunk(
  "ngo/deleteNgo",
  async (ngoId, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/ngos/${ngoId}`);
      toast.success(response.data.message || "Ngo deleted successfully");
      return ngoId;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to delete ngo"));
    }
  },
);

export const getTopNgos=createAsyncThunk(
  "ngp/getTopNgos",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/ngos/top");
      return response.data.ngos || [];
    }
    catch(error){
      return rejectWithValue(getErrorMessage(error||"failed to get top ngos"))
    }
  }  
);

const ngoSlice = createSlice({
  name: "ngo",
  initialState: {
    ngo: null,
    selectedNgo: null,
    ngos: [],
    topNgos:[],
    loading: false,
    error: null,
  },
  reducers: {
    clearNgoError: (state) => {
      state.error = null;
    },
    clearSelectedNgo: (state) => {
      state.selectedNgo = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createNgo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createNgo.fulfilled, (state, action) => {
        state.loading = false;
        state.ngo = action.payload;
      })
      .addCase(createNgo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to create ngo";
      })
      .addCase(getUserNgo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserNgo.fulfilled, (state, action) => {
        state.loading = false;
        state.ngo = action.payload;
      })
      .addCase(getUserNgo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch ngo";
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
        state.error = action.payload || "Failed to fetch ngo information";
      })
      .addCase(updateNgo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateNgo.fulfilled, (state, action) => {
        state.loading = false;
        state.ngo = action.payload;
      })
      .addCase(updateNgo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to update ngo";
      })
      .addCase(getAllNgos.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllNgos.fulfilled, (state, action) => {
        state.loading = false;
        state.ngos = action.payload || [];
      })
      .addCase(getAllNgos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch ngos";
      })
      .addCase(getTopNgos.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTopNgos.fulfilled, (state, action) => {
        state.loading = false;
        state.topNgos = action.payload || [];
      })
      .addCase(getTopNgos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch top ngos";
      })
      .addCase(deleteNgo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteNgo.fulfilled, (state, action) => {
        state.loading = false;
        state.ngos = state.ngos.filter((ngo) => ngo._id !== action.payload);
        if (state.ngo?._id === action.payload) {
          state.ngo = null;
        }
      })
      .addCase(deleteNgo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to delete ngo";
      });
  },
});

export const { clearNgoError, clearSelectedNgo } = ngoSlice.actions;
export default ngoSlice.reducer;
