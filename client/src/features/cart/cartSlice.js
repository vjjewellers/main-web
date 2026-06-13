import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../services/api";

const guestCartFromStorage = () => {
  try {
    return JSON.parse(localStorage.getItem("vjj_guest_cart")) || [];
  } catch {
    return [];
  }
};

const saveGuestCart = (items) => {
  localStorage.setItem("vjj_guest_cart", JSON.stringify(items));
};

const getServerCartItems = (data) => {
  if (Array.isArray(data?.cart?.items)) return data.cart.items;
  if (Array.isArray(data?.items)) return data.items;
  return [];
};

export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/cart");
      return getServerCartItems(data);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Unable to fetch cart",
      );
    }
  },
);

export const addCartItem = createAsyncThunk(
  "cart/addCartItem",
  async (
    { productId, quantity = 1, selectedSize = "", selectedMaterial = "" },
    { rejectWithValue },
  ) => {
    try {
      const { data } = await api.post("/cart/add", {
        productId,
        quantity,
        selectedSize,
        selectedMaterial,
      });

      return getServerCartItems(data);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Unable to add item to cart",
      );
    }
  },
);

export const updateCartItem = createAsyncThunk(
  "cart/updateCartItem",
  async (
    { productId, quantity = 1, selectedSize = "", selectedMaterial = "" },
    { rejectWithValue },
  ) => {
    try {
      const { data } = await api.patch(`/cart/${productId}`, {
        quantity,
        selectedSize,
        selectedMaterial,
      });

      return getServerCartItems(data);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Unable to update cart item",
      );
    }
  },
);

export const removeCartItem = createAsyncThunk(
  "cart/removeCartItem",
  async (productId, { rejectWithValue }) => {
    try {
      const { data } = await api.delete(`/cart/${productId}`);
      return getServerCartItems(data);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Unable to remove cart item",
      );
    }
  },
);

export const clearServerCart = createAsyncThunk(
  "cart/clearServerCart",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.delete("/cart/clear");
      return getServerCartItems(data);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Unable to clear cart",
      );
    }
  },
);

export const mergeGuestCart = createAsyncThunk(
  "cart/mergeGuestCart",
  async (_, { rejectWithValue }) => {
    try {
      const guestItems =
        JSON.parse(localStorage.getItem("vjj_guest_cart")) || [];

      if (guestItems.length > 0) {
        for (const item of guestItems) {
          await api.post("/cart/add", {
            productId: item.productId,
            quantity: item.quantity || 1,
            selectedSize: item.selectedSize || "",
            selectedMaterial: item.selectedMaterial || "",
          });
        }

        localStorage.removeItem("vjj_guest_cart");
      }

      const { data } = await api.get("/cart");

      return getServerCartItems(data);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Unable to merge guest cart",
      );
    }
  },
);

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: guestCartFromStorage(),
    loading: false,
    error: null,
    isCartOpen: false,
  },
  reducers: {
    openCart: (state) => {
      state.isCartOpen = true;
    },

    closeCart: (state) => {
      state.isCartOpen = false;
    },

    toggleCart: (state) => {
      state.isCartOpen = !state.isCartOpen;
    },

    addGuestCartItem: (state, action) => {
      const incomingItem = action.payload;

      const existingItem = state.items.find(
        (item) =>
          item.productId === incomingItem.productId &&
          (item.selectedSize || "") === (incomingItem.selectedSize || "") &&
          (item.selectedMaterial || "") ===
            (incomingItem.selectedMaterial || ""),
      );

      if (existingItem) {
        const stock = existingItem.stock || incomingItem.stock || 999;
        existingItem.quantity = Math.min(
          Number(existingItem.quantity || 1) +
            Number(incomingItem.quantity || 1),
          stock,
        );
      } else {
        state.items.unshift({
          ...incomingItem,
          quantity: Number(incomingItem.quantity || 1),
        });
      }

      saveGuestCart(state.items);
    },

    updateGuestCartQuantity: (state, action) => {
      const {
        productId,
        quantity,
        selectedSize = "",
        selectedMaterial = "",
      } = action.payload;

      const safeQuantity = Math.max(1, Number(quantity || 1));

      state.items = state.items.map((item) => {
        const sameProduct = item.productId === productId;
        const sameSize = (item.selectedSize || "") === selectedSize;
        const sameMaterial =
          (item.selectedMaterial || "") === selectedMaterial ||
          !selectedMaterial;

        if (sameProduct && sameSize && sameMaterial) {
          const stock = item.stock || 999;

          return {
            ...item,
            quantity: Math.min(safeQuantity, stock),
          };
        }

        return item;
      });

      saveGuestCart(state.items);
    },

    removeGuestCartItem: (state, action) => {
      const payload = action.payload;

      if (typeof payload === "object" && payload !== null) {
        const { productId, selectedSize = "", selectedMaterial = "" } = payload;

        state.items = state.items.filter((item) => {
          const sameProduct = item.productId === productId;
          const sameSize = (item.selectedSize || "") === selectedSize;
          const sameMaterial =
            (item.selectedMaterial || "") === selectedMaterial ||
            !selectedMaterial;

          return !(sameProduct && sameSize && sameMaterial);
        });
      } else {
        state.items = state.items.filter((item) => item.productId !== payload);
      }

      saveGuestCart(state.items);
    },

    clearGuestCart: (state) => {
      state.items = [];
      saveGuestCart([]);
    },

    clearCartError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(addCartItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addCartItem.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(addCartItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(updateCartItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(removeCartItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeCartItem.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(removeCartItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(clearServerCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(clearServerCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(clearServerCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(mergeGuestCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(mergeGuestCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(mergeGuestCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  openCart,
  closeCart,
  toggleCart,
  addGuestCartItem,
  updateGuestCartQuantity,
  removeGuestCartItem,
  clearGuestCart,
  clearCartError,
} = cartSlice.actions;

export const selectCartItems = (state) => state.cart.items;

export const selectCartCount = (state) =>
  state.cart.items.reduce(
    (total, item) => total + Number(item.quantity || 0),
    0,
  );

export const selectCartSubtotal = (state) =>
  state.cart.items.reduce((total, item) => {
    const product = item.product || item;
    const price = Number(product.price || 0);
    const quantity = Number(item.quantity || 1);

    return total + price * quantity;
  }, 0);

export default cartSlice.reducer;
