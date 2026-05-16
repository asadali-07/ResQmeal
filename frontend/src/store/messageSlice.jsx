import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import api from "../api/axiosConfig";
import { buildFormData, getErrorMessage } from "./sliceUtils";

const normalizeId = (value) => {
    if (!value) {
        return "";
    }

    if (typeof value === "object") {
        return value._id?.toString?.() || value.toString?.() || "";
    }

    return value.toString();
};

export const sendMessage = createAsyncThunk(
    "messages/sendMessage",
    async ({ userId, text, image }, { rejectWithValue }) => {
        try {
            const recipientUserId = normalizeId(userId);
            if (!recipientUserId) {
                return rejectWithValue("Message recipient is missing");
            }

            let response;

            if (image) {
                const formData = buildFormData({ text, imageUrl: image });
                response = await api.post(`/messages/send/${recipientUserId}`, formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
            } else {
                response = await api.post(`/messages/send/${recipientUserId}`, { text });
            }

            toast.success(response.data.message || "Message sent successfully");
            return response.data.messageData;
        } catch (error) {
            return rejectWithValue(
                error?.response?.data?.error ||
                    getErrorMessage(error, "Failed to send message")
            );
        }
    }
);

export const getMessages = createAsyncThunk(
    "messages/getMessages",
    async (userId, { rejectWithValue }) => {
        try {
            const recipientUserId = normalizeId(userId);
            if (!recipientUserId) {
                return rejectWithValue("Message recipient is missing");
            }

            const response = await api.get(`/messages/get/${recipientUserId}`);
            return response.data.messages || [];
        } catch (error) {
            return rejectWithValue(getErrorMessage(error, "Failed to fetch messages"));
        }
    }
);

export const getMessagedUsers = createAsyncThunk(
    "messages/getMessagedUsers",
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get("/messages/conversations");
            return response.data.users || [];
        } catch (error) {
            return rejectWithValue(getErrorMessage(error, "Failed to fetch conversations"));
        }
    }
);

export const updateMessage = createAsyncThunk(
    "messages/updateMessage",
    async ({ messageId, text }, { rejectWithValue }) => {
        try {
            const response = await api.patch(`/messages/update/${messageId}`, { text });
            toast.success(response.data.message || "Message updated successfully");
            return response.data.message;
        } catch (error) {
            return rejectWithValue(getErrorMessage(error, "Failed to update message"));
        }
    }
);

export const deleteMessage = createAsyncThunk(
    "messages/deleteMessage",
    async (messageId, { rejectWithValue }) => {
        try {
            const response = await api.delete(`/messages/delete/${messageId}`);
            toast.success(response.data.message || "Message deleted successfully");
            return messageId;
        } catch (error) {
            return rejectWithValue(getErrorMessage(error, "Failed to delete message"));
        }
    }
);

const messageSlice = createSlice({
    name: "messages",
    initialState: {
        messages: [],
        messagedUsers: [],
        loading: false,
        conversationsLoading: false,
        error: null,
    },
    reducers: {
        clearMessageError: (state) => {
            state.error = null;
        },
        clearMessages: (state) => {
            state.messages = [];
        },
        upsertMessagedUser: (state, action) => {
            const incoming = action.payload;
            if (!incoming?._id) {
                return;
            }

            const existingIndex = state.messagedUsers.findIndex(
                (user) => String(user._id) === String(incoming._id)
            );

            if (existingIndex >= 0) {
                state.messagedUsers[existingIndex] = {
                    ...state.messagedUsers[existingIndex],
                    ...incoming,
                };
                return;
            }

            state.messagedUsers.unshift(incoming);
        },
        addMessage: (state, action) => {
            const incoming = action.payload;
            if (!incoming) {
                return;
            }
            const exists = state.messages.some((message) => message._id === incoming._id);
            if (!exists) {
                state.messages.push(incoming);
            }
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(sendMessage.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(sendMessage.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload) {
                    state.messages = [...state.messages, action.payload];
                }
                const otherUserId = action.payload?.receiverId;
                if (otherUserId) {
                    const existingIndex = state.messagedUsers.findIndex(
                        (user) => String(user._id) === String(otherUserId)
                    );
                    if (existingIndex >= 0) {
                        const [conversation] = state.messagedUsers.splice(existingIndex, 1);
                        state.messagedUsers.unshift({
                            ...conversation,
                            latestMessageAt: action.payload.createdAt,
                        });
                    }
                }
            })
            .addCase(sendMessage.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to send message";
            })
            .addCase(getMessages.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getMessages.fulfilled, (state, action) => {
                state.loading = false;
                state.messages = action.payload || [];
            })
            .addCase(getMessages.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to fetch messages";
            })
            .addCase(getMessagedUsers.pending, (state) => {
                state.conversationsLoading = true;
                state.error = null;
            })
            .addCase(getMessagedUsers.fulfilled, (state, action) => {
                state.conversationsLoading = false;
                state.messagedUsers = action.payload || [];
            })
            .addCase(getMessagedUsers.rejected, (state, action) => {
                state.conversationsLoading = false;
                state.error = action.payload || "Failed to fetch conversations";
            })
            .addCase(updateMessage.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateMessage.fulfilled, (state, action) => {
                state.loading = false;
                state.messages = state.messages.map((message) =>
                    message._id === action.payload?._id ? action.payload : message
                );
            })
            .addCase(updateMessage.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to update message";
            })
            .addCase(deleteMessage.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteMessage.fulfilled, (state, action) => {
                state.loading = false;
                state.messages = state.messages.filter(
                    (message) => message._id !== action.payload
                );
            })
            .addCase(deleteMessage.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to delete message";
            });
    },
});

export const { clearMessageError, clearMessages, upsertMessagedUser, addMessage } = messageSlice.actions;
export default messageSlice.reducer;
