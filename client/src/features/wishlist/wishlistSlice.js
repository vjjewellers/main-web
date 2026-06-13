import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../services/api";

const guestWishlistFromStorage = () => {
  try {
    return JSON.parse(localStorage.getItem("vjj_guest_wishlist")) || [];
  } catch {
    return [];
  }
};

const saveGuestWishlist = (items) => {
  localStorage.setItem("vjj_guest_wishlist", JSON.stringify(items));
};

export const fetchWishlist = createAsyncThunk(
  "wishlist/fetchWishlist",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/wishlist");
      return data.wishlist || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Unable to fetch wishlist",
      );
    }
  },
);

export const addWishlistItem = createAsyncThunk(
  "wishlist/addWishlistItem",
  async (productId, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/wishlist/${productId}`);
      return data.wishlist || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Unable to add wishlist item",
      );
    }
  },
);

export const removeWishlistItem = createAsyncThunk(
  "wishlist/removeWishlistItem",
  async (productId, { rejectWithValue }) => {
    try {
      const { data } = await api.delete(`/wishlist/${productId}`);
      return data.wishlist || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Unable to remove wishlist item",
      );
    }
  },
);

export const mergeGuestWishlist = createAsyncThunk(
  "wishlist/mergeGuestWishlist",
  async (_, { rejectWithValue }) => {
    try {
      const guestItems =
        JSON.parse(localStorage.getItem("vjj_guest_wishlist")) || [];

      if (guestItems.length > 0) {
        for (const item of guestItems) {
          if (item._id) {
            await api.post(`/wishlist/${item._id}`);
          }
        }

        localStorage.removeItem("vjj_guest_wishlist");
      }

      const { data } = await api.get("/wishlist");

      return data.wishlist || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Unable to merge wishlist",
      );
    }
  },
);

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState: {
    items: guestWishlistFromStorage(),
    loading: false,
    error: null,
  },
  reducers: {
    addGuestWishlistItem: (state, action) => {
      const product = action.payload;

      const exists = state.items.some((item) => item._id === product._id);

      if (!exists) {
        state.items.unshift(product);
        saveGuestWishlist(state.items);
      }
    },

    removeGuestWishlistItem: (state, action) => {
      const productId = action.payload;

      state.items = state.items.filter((item) => item._id !== productId);
      saveGuestWishlist(state.items);
    },

    clearGuestWishlist: (state) => {
      state.items = [];
      saveGuestWishlist([]);
    },

    clearWishlistError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(addWishlistItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addWishlistItem.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(addWishlistItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(removeWishlistItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeWishlistItem.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(removeWishlistItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(mergeGuestWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(mergeGuestWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(mergeGuestWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  addGuestWishlistItem,
  removeGuestWishlistItem,
  clearGuestWishlist,
  clearWishlistError,
} = wishlistSlice.actions;

export const selectWishlistCount = (state) => state.wishlist.items.length;

export const selectIsWishlisted = (productId) => (state) =>
  state.wishlist.items.some((item) => item._id === productId);

export default wishlistSlice.reducer;
