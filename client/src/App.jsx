import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Routes, Route } from "react-router-dom";

import { fetchWishlist } from "./features/wishlist/wishlistSlice";

import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import UserDashboard from "./pages/UserDashboard";
import Wishlist from "./pages/wishlist";
import Billing from "./pages/admin/Billing";
import InvoiceDetails from "./pages/admin/InvoiceDetails";
import Invoices from "./pages/admin/Invoices";
import StoreSettings from "./pages/admin/StoreSettings";

import AdminLayout from "./components/admin/AdminLayout";
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import CartDrawer from "./components/common/CartDrawer";
import FloatingWhatsApp from "./components/common/FloatingWhatsApp";
import MetalRateTicker from "./components/home/MetalRateTicker";

import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageProducts from "./pages/admin/ManageProducts";
import ManageOrders from "./pages/admin/ManageOrders";
import ManageUsers from "./pages/admin/ManageUsers";
import ChangePassword from "./pages/admin/ChangePassword";
import AdminHelp from "./pages/admin/AdminHelp";
import MarketRates from "./pages/admin/MarketRates";

function PublicWebsiteLayout() {
  return (
    <>
      <Navbar />
      <MetalRateTicker />
      <CartDrawer />
      <FloatingWhatsApp />

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:slug" element={<ProductDetails />} />

          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<UserDashboard />} />

          {/* Existing ecommerce routes retained temporarily */}
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-success/:id" element={<OrderSuccess />} />
        </Routes>
      </main>

      <Footer />
    </>
  );
}

export default function App() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user) {
      dispatch(fetchWishlist());
    }
  }, [user, dispatch]);

  return (
    <div className="min-h-screen bg-vjj-ivory text-vjj-espresso">
      <Routes>
        {/* Customer-facing website */}
        <Route path="/*" element={<PublicWebsiteLayout />} />

        {/* Protected admin dashboard */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="billing" element={<Billing />} />
          <Route path="invoices" element={<Invoices />} />
          <Route path="invoices/:invoiceId" element={<InvoiceDetails />} />
          <Route path="market-rates" element={<MarketRates />} />
          <Route path="products" element={<ManageProducts />} />
          <Route path="orders" element={<ManageOrders />} />
          <Route path="users" element={<ManageUsers />} />
          <Route path="store-settings" element={<StoreSettings />} />
          <Route path="change-password" element={<ChangePassword />} />
          <Route path="help" element={<AdminHelp />} />
        </Route>
      </Routes>
    </div>
  );
}
