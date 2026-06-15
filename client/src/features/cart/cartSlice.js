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

const getImageUrl = (product) => {
  if (!product) return "";

  if (typeof product.image === "string") return product.image;

  if (Array.isArray(product.images)) {
    return (
      product.images.find((image) => image.isPrimary)?.url ||
      product.images[0]?.url ||
      ""
    );
  }

  return "";
};

const normalizeCartItem = (item) => {
  const product = item.product || item.productId || item;

  const productId =
    typeof item.productId === "string"
      ? item.productId
      : item.productId?._id || product?._id || item._id;

  return {
    productId,
    _id: item._id || productId,
    name: item.name || product?.name || "",
    slug: item.slug || product?.slug || "",
    image: item.image || getImageUrl(product),
    price: Number(item.price || product?.price || 0),
    quantity: Number(item.quantity || 1),
    selectedSize: item.selectedSize || "",
    selectedMaterial: item.selectedMaterial || product?.material || "",
    stock: Number(item.stock || product?.stock || 999),
    product: product?._id ? product : undefined,
  };
};

const getServerCartItems = (data) => {
  let items = [];

  if (Array.isArray(data)) {
    items = data;
  } else if (Array.isArray(data?.items)) {
    items = data.items;
  } else if (Array.isArray(data?.cart)) {
    items = data.cart;
  } else if (Array.isArray(data?.cart?.items)) {
    items = data.cart.items;
  } else if (Array.isArray(data?.cartItems)) {
    items = data.cartItems;
  } else if (Array.isArray(data?.cart?.cartItems)) {
    items = data.cart.cartItems;
  } else if (Array.isArray(data?.user?.cart)) {
    items = data.user.cart;
  }

  return items.map(normalizeCartItem).filter((item) => item.productId);
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
      const incomingItem = normalizeCartItem(action.payload);

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
        state.items.unshift(incomingItem);
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
          return {
            ...item,
            quantity: Math.min(safeQuantity, item.stock || 999),
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
    const pending = (state) => {
      state.loading = true;
      state.error = null;
    };

    const fulfilled = (state, action) => {
      state.loading = false;
      state.items = action.payload;
    };

    const rejected = (state, action) => {
      state.loading = false;
      state.error = action.payload;
    };

    builder
      .addCase(fetchCart.pending, pending)
      .addCase(fetchCart.fulfilled, fulfilled)
      .addCase(fetchCart.rejected, rejected)

      .addCase(addCartItem.pending, pending)
      .addCase(addCartItem.fulfilled, fulfilled)
      .addCase(addCartItem.rejected, rejected)

      .addCase(updateCartItem.pending, pending)
      .addCase(updateCartItem.fulfilled, fulfilled)
      .addCase(updateCartItem.rejected, rejected)

      .addCase(removeCartItem.pending, pending)
      .addCase(removeCartItem.fulfilled, fulfilled)
      .addCase(removeCartItem.rejected, rejected)

      .addCase(clearServerCart.pending, pending)
      .addCase(clearServerCart.fulfilled, fulfilled)
      .addCase(clearServerCart.rejected, rejected)

      .addCase(mergeGuestCart.pending, pending)
      .addCase(mergeGuestCart.fulfilled, fulfilled)
      .addCase(mergeGuestCart.rejected, rejected);
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
    const price = Number(item.price || item.product?.price || 0);
    const quantity = Number(item.quantity || 1);

    return total + price * quantity;
  }, 0);

export default cartSlice.reducer;
