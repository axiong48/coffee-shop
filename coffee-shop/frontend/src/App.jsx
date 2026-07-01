import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import MenuPage from "./pages/MenuPage";
import CartPage from "./pages/CartPage";
import OrderHistoryPage from "./pages/OrderHistoryPage";
import BaristaQueuePage from "./pages/BaristaQueuePage";
import OwnerMenuPage from "./pages/OwnerMenuPage";
import OwnerLocationsPage from "./pages/OwnerLocationsPage";
import OwnerAnalyticsPage from "./pages/OwnerAnalyticsPage";

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            <Route path="/menu" element={
              <ProtectedRoute roles={["customer"]}><MenuPage /></ProtectedRoute>
            } />
            <Route path="/cart" element={
              <ProtectedRoute roles={["customer"]}><CartPage /></ProtectedRoute>
            } />
            <Route path="/orders" element={
              <ProtectedRoute roles={["customer"]}><OrderHistoryPage /></ProtectedRoute>
            } />

            <Route path="/barista/queue" element={
              <ProtectedRoute roles={["barista", "owner"]}><BaristaQueuePage /></ProtectedRoute>
            } />

            <Route path="/owner/menu" element={
              <ProtectedRoute roles={["owner"]}><OwnerMenuPage /></ProtectedRoute>
            } />
            <Route path="/owner/locations" element={
              <ProtectedRoute roles={["owner"]}><OwnerLocationsPage /></ProtectedRoute>
            } />
            <Route path="/owner/analytics" element={
              <ProtectedRoute roles={["owner"]}><OwnerAnalyticsPage /></ProtectedRoute>
            } />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}
