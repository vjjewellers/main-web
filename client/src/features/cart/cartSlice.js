import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../services/api";

const savedLocalCart = localStorage.getItem("vjj_guest_cart");

export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/cart");
      return data.cart;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Cart failed");
    }
  },
);

export const addCartItem = createAsyncThunk(
  "cart/addCartItem",
  async (item, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/cart/add", item);
      return data.cart;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Unable to add item",
      );
    }
  },
);

export const updateCartItem = createAsyncThunk(
  "cart/updateCartItem",
  async (item, { rejectWithValue }) => {
    try {
      const { data } = await api.patch("/cart/update", item);
      return data.cart;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Unable to update cart",
      );
    }
  },
);

export const removeCartItem = createAsyncThunk(
  "cart/removeCartItem",
  async (productId, { rejectWithValue }) => {
    try {
      const { data } = await api.delete(`/cart/remove/${productId}`);
      return data.cart;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Unable to remove item",
      );
    }
  },
);

export const clearServerCart = createAsyncThunk(
  "cart/clearServerCart",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.delete("/cart/clear");
      return data.cart;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Unable to clear cart",
      );
    }
  },
);

const initialState = {
  items: savedLocalCart ? JSON.parse(savedLocalCart) : [],
  isCartOpen: false,
  loading: false,
  error: null,
};

const saveGuestCart = (items) => {
  localStorage.setItem("vjj_guest_cart", JSON.stringify(items));
};

const cartSlice = createSlice({
  name: "cart",

  initialState,

  reducers: {
    openCart: (state) => {
      state.isCartOpen = true;
    },

    closeCart: (state) => {
      state.isCartOpen = false;
    },

    addGuestCartItem: (state, action) => {
      const item = action.payload;

      const existing = state.items.find(
        (cartItem) =>
          cartItem.productId === item.productId &&
          cartItem.selectedSize === item.selectedSize &&
          cartItem.selectedMaterial === item.selectedMaterial,
      );

      if (existing) {
        existing.quantity += item.quantity || 1;
      } else {
        state.items.push({
          ...item,
          quantity: item.quantity || 1,
        });
      }

      saveGuestCart(state.items);
    },
    updateGuestCartQuantity: (state, action) => {
      const { productId, quantity } = action.payload;

      const safeQuantity = Math.max(1, Number(quantity || 1));

      state.items = state.items.map((item) =>
        item.productId === productId
          ? {
              ...item,
              quantity: safeQuantity,
            }
          : item,
      );

      localStorage.setItem("vjj_guest_cart", JSON.stringify(state.items));
    },

    removeGuestCartItem: (state, action) => {
      state.items = state.items.filter(
        (item) => item.productId !== action.payload,
      );

      saveGuestCart(state.items);
    },

    clearGuestCart: (state) => {
      state.items = [];
      localStorage.removeItem("vjj_guest_cart");
    },

    clearCartError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload || [];
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(addCartItem.pending, (state) => {
        state.loading = true;
      })
      .addCase(addCartItem.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload || [];
        state.isCartOpen = true;
      })
      .addCase(addCartItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.items = action.payload || [];
      })

      .addCase(removeCartItem.fulfilled, (state, action) => {
        state.items = action.payload || [];
      })

      .addCase(clearServerCart.fulfilled, (state, action) => {
        state.items = action.payload || [];
      });
  },
});

export const {
  openCart,
  closeCart,
  addGuestCartItem,
  removeGuestCartItem,
  clearGuestCart,
  updateGuestCartQuantity,
  clearCartError,
} = cartSlice.actions;

export const selectCartItems = (state) => state.cart.items;

export const selectCartCount = (state) =>
  state.cart.items.reduce((total, item) => {
    return total + Number(item.quantity || 0);
  }, 0);

export const selectCartSubtotal = (state) =>
  state.cart.items.reduce((total, item) => {
    const product = item.product || item;
    return total + Number(product.price || 0) * Number(item.quantity || 0);
  }, 0);

export default cartSlice.reducer;
