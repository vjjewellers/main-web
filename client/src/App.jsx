import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Login from "./pages/Login";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import UserDashboard from "./pages/UserDashboard";
import Cart from "./pages/Cart";

import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageProducts from "./pages/admin/ManageProducts";
import ManageOrders from "./pages/admin/ManageOrders";
import ManageUsers from "./pages/admin/ManageUsers";

import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import CartDrawer from "./components/common/CartDrawer";

export default function App() {
  return (
    <div className="min-h-screen bg-vjj-ivory text-vjj-espresso">
      <Routes>
        <Route
          path="/*"
          element={
            <>
              <Navbar />
              <CartDrawer />

              <main>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/products/:slug" element={<ProductDetails />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/order-success/:id" element={<OrderSuccess />} />
                  <Route path="/dashboard" element={<UserDashboard />} />
                  <Route path="/cart" element={<Cart />} />
                </Routes>
              </main>

              <Footer />
            </>
          }
        />

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<ManageProducts />} />
          <Route path="orders" element={<ManageOrders />} />
          <Route path="users" element={<ManageUsers />} />
        </Route>
      </Routes>
    </div>
  );
}
