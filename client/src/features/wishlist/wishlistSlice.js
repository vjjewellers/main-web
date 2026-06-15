import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import api from "../../services/api";

const GUEST_WISHLIST_KEY = "vjj_guest_wishlist";

const getGuestWishlist = () => {
  try {
    const stored = localStorage.getItem(GUEST_WISHLIST_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveGuestWishlist = (items) => {
  localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(items || []));
};

const normalizeWishlistItems = (payload) => {
  if (Array.isArray(payload)) return payload;

  if (Array.isArray(payload?.wishlist)) return payload.wishlist;

  if (Array.isArray(payload?.items)) return payload.items;

  if (Array.isArray(payload?.user?.wishlist)) return payload.user.wishlist;

  return [];
};

const getWishlistItemId = (item) => {
  return item?._id || item?.id || item?.product?._id || item?.productId || item;
};

const initialState = {
  items: getGuestWishlist(),
  loading: false,
  error: null,
};

export const fetchWishlist = createAsyncThunk(
  "wishlist/fetchWishlist",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/wishlist");
      return normalizeWishlistItems(data);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Unable to fetch wishlist",
      );
    }
  },
);

export const addWishlistItem = createAsyncThunk(
  "wishlist/addWishlistItem",
  async (productId, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();

      if (!auth.user) {
        return {
          guest: true,
          productId,
        };
      }

      const { data } = await api.post(`/wishlist/${productId}`);

      return normalizeWishlistItems(data);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Unable to add to wishlist",
      );
    }
  },
);

export const removeWishlistItem = createAsyncThunk(
  "wishlist/removeWishlistItem",
  async (productId, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();

      if (!auth.user) {
        return {
          guest: true,
          productId,
        };
      }

      const { data } = await api.delete(`/wishlist/${productId}`);

      return normalizeWishlistItems(data);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Unable to remove from wishlist",
      );
    }
  },
);

export const mergeGuestWishlist = createAsyncThunk(
  "wishlist/mergeGuestWishlist",
  async (_, { getState, dispatch, rejectWithValue }) => {
    try {
      const { auth } = getState();

      if (!auth.user) {
        return getGuestWishlist();
      }

      const guestItems = getGuestWishlist();

      if (guestItems.length) {
        for (const item of guestItems) {
          const productId = getWishlistItemId(item);

          if (productId) {
            try {
              await api.post(`/wishlist/${productId}`);
            } catch {
              // ignore duplicate/already-added item errors
            }
          }
        }

        localStorage.removeItem(GUEST_WISHLIST_KEY);
      }

      const result = await dispatch(fetchWishlist()).unwrap();
      return result;
    } catch (error) {
      return rejectWithValue(error.message || "Unable to sync wishlist");
    }
  },
);

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    clearWishlistState: (state) => {
      state.items = [];
      state.loading = false;
      state.error = null;
      saveGuestWishlist([]);
    },

    resetWishlistToGuest: (state) => {
      state.items = getGuestWishlist();
      state.loading = false;
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
        state.items = normalizeWishlistItems(action.payload);
        state.error = null;
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Unable to fetch wishlist";
      })

      .addCase(addWishlistItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addWishlistItem.fulfilled, (state, action) => {
        state.loading = false;

        if (action.payload?.guest) {
          const productId = action.payload.productId;

          const exists = state.items.some(
            (item) => String(getWishlistItemId(item)) === String(productId),
          );

          if (!exists) {
            state.items.push(productId);
          }

          saveGuestWishlist(state.items);
        } else {
          state.items = normalizeWishlistItems(action.payload);
        }

        state.error = null;
      })
      .addCase(addWishlistItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Unable to add to wishlist";
      })

      .addCase(removeWishlistItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeWishlistItem.fulfilled, (state, action) => {
        state.loading = false;

        if (action.payload?.guest) {
          const productId = action.payload.productId;

          state.items = state.items.filter(
            (item) => String(getWishlistItemId(item)) !== String(productId),
          );

          saveGuestWishlist(state.items);
        } else {
          state.items = normalizeWishlistItems(action.payload);
        }

        state.error = null;
      })
      .addCase(removeWishlistItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Unable to remove from wishlist";
      })

      .addCase(mergeGuestWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(mergeGuestWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = normalizeWishlistItems(action.payload);
        state.error = null;
      })
      .addCase(mergeGuestWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Unable to sync wishlist";
      });
  },
});

export const { clearWishlistState, resetWishlistToGuest } =
  wishlistSlice.actions;

export const selectWishlistItems = (state) =>
  state.wishlist.items || state.wishlist.wishlist || [];

export const selectWishlistCount = (state) =>
  selectWishlistItems(state).length || 0;

export const selectIsWishlisted = (state, productId) => {
  const items = selectWishlistItems(state);

  return items.some((item) => {
    const id = getWishlistItemId(item);
    return String(id) === String(productId);
  });
};

export default wishlistSlice.reducer;
