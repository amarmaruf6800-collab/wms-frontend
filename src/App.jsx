import { Navigate, Route, Routes } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";

import AppLayout from "./components/layout/AppLayout";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Warehouses from "./pages/Warehouses";
import Locations from "./pages/Locations";
import Inventory from "./pages/Inventory";
import Receiving from "./pages/Receiving";
import SalesOrders from "./pages/SalesOrders";
import Picking from "./pages/Picking";
import Packing from "./pages/Packing";
import Shipping from "./pages/Shipping";
import Delivered from "./pages/Delivered";
import Returns from "./pages/Returns";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";

function App() {
  return (
    <AuthProvider>
      <Routes>

        {/* =====================================================
            PUBLIC ROUTE
        ===================================================== */}

        <Route
          path="/login"
          element={<Login />}
        />


        {/* =====================================================
            PROTECTED ROUTES
        ===================================================== */}

        <Route element={<ProtectedRoute />}>

          {/* Dashboard */}
          <Route
            path="/dashboard"
            element={
              <AppLayout>
                <Dashboard />
              </AppLayout>
            }
          />

          {/* Products */}
          <Route
            path="/products"
            element={
              <AppLayout>
                <Products />
              </AppLayout>
            }
          />

          {/* Warehouses */}
          <Route
            path="/warehouses"
            element={
              <AppLayout>
                <Warehouses />
              </AppLayout>
            }
          />

          <Route
            path="/locations"
            element={
              <AppLayout>
                <Locations />
              </AppLayout>
            }
          />

          {/* Inventory */}
          <Route
            path="/inventory"
            element={
              <AppLayout>
                <Inventory />
              </AppLayout>
            }
          />

          <Route
            path="/receiving"
            element={
              <AppLayout>
                <Receiving />
              </AppLayout>
            }
          />

          {/* Sales Orders */}
          <Route
            path="/sales-orders"
            element={
              <AppLayout>
                <SalesOrders />
              </AppLayout>
            }
          />

          {/* Picking */}
          <Route
            path="/picking"
            element={
              <AppLayout>
                <Picking />
              </AppLayout>
            }
          />
          {/* Packing */}
          <Route
            path="/packing"
            element={
              <AppLayout>
                <Packing />
              </AppLayout>
            }
          />
          {/* Shipping */}
          <Route
            path="/shipping"
            element={
              <AppLayout>
                <Shipping />
              </AppLayout>
            }
          />

          {/* Delivered */}
          <Route
            path="/delivered"
            element={
              <AppLayout>
                <Delivered />
              </AppLayout>
            }
          />

          {/* Returns */}
          <Route
            path="/returns"
            element={
              <AppLayout>
                <Returns />
              </AppLayout>
            }
          />

          {/* Reports */}
          <Route
            path="/reports"
            element={
              <AppLayout>
                <Reports />
              </AppLayout>
            }
          />
          {/* Settings */}
          <Route
            path="/settings"
            element={
              <AppLayout>
                <Settings />
              </AppLayout>
            }
          />

        </Route>


        {/* =====================================================
            DEFAULT ROUTE
        ===================================================== */}

        <Route
          path="/"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />

        {/* Unknown route */}
        <Route
          path="*"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />

      </Routes>
    </AuthProvider>
  );
}

export default App;