import { createBrowserRouter } from "react-router-dom";
import { lazy, Suspense } from "react";
import OnboardingLayout from "../layouts/OnboardingLayout";
import Login from "../pages/auth/login/login";
import AuthPath from "../pages/auth/authPath";
import LoadingScreen from "../pages/dashboard/common/LoadingScreen";
import DashboardLayout from "../layouts/dashboardLayout";
import ProtectedRoute from "../components/ProtectedRoute";
import DeleteAccount from "@/pages/dashboard/screens/account/DeleteAccount";
import AccountSupport from "@/pages/dashboard/screens/account/Support";
import UserDashboard from "@/pages/dashboard/screens/dashboardScreen/UserDashboard";
import OrderRide from "@/pages/dashboard/screens/rides/OrderRides";
import RideOrders from "@/pages/dashboard/screens/rides/Rides";
import DriverDashboard from "@/pages/driver/screens/dashboardScreen/DriverDashboard";
import AdminDashboard from "@/pages/admin/screens/dashboardScreen/AdminDashboard";
import AdminUsers from "@/pages/admin/screens/users/AdminUsers";
import AdminRides from "@/pages/admin/screens/rides/AdminRides";
import DriverList from "@/pages/admin/screens/drivers/DriverList"; // Renamed
import AddDriver from "@/pages/admin/screens/drivers/AddDriver"; // New import
import AdminCreateOrders from "@/pages/admin/screens/orders/AdminCreateOrders";
import DriverRides from "@/pages/driver/screens/rides/DriverRides";
import { DriverAccountLayout, DriverProfile, DriverChangePassword, DriverVehicleInfo } from "@/pages/driver/screens/account/DriverAccount";
import Unauthorized from "@/pages/Unauthorized";
import AddDriverDetails from "@/pages/admin/screens/drivers/AddDriverDetails";
import VehicleList from "@/pages/admin/screens/vehicles/vehicleList";

const AccountLayout = lazy(() => import("@/pages/dashboard/screens/account/AccountLayout"));
const Profile = lazy(() => import("@/pages/dashboard/screens/account/Profile"));
const ChangePassword = lazy(() => import("@/pages/dashboard/screens/account/ChangePassword"));
const Passcode = lazy(() => import("@/pages/dashboard/screens/account/Passcode"));

export const routes = createBrowserRouter([
  // Admin routes with AdminLayout (Ant Design sidebar)
  {
    path: "/admin",
    element: (
      <Suspense fallback={<LoadingScreen />}>
        <ProtectedRoute requiredRole="admin">
          <DashboardLayout  />
        </ProtectedRoute>
      </Suspense>
    ),
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: "users", element: <AdminUsers /> },
      { path: "rides", element: <AdminRides /> },
      { path: "drivers", element: <DriverList /> }, // Updated route and component
      { path: "drivers/add", element: <AddDriver /> }, // New route for adding drivers
      { path:"/admin/drivers/:driverId/add-details", element: <AddDriverDetails /> },
      { path: "vehicles", element: <VehicleList /> },
      { path: "orders/create", element: <AdminCreateOrders /> },
    ],
  },
  
  // Main routes with DashboardLayout (your custom navigation)
  {
    path: "/",
    element: (
      <Suspense fallback={<LoadingScreen />}>
        <DashboardLayout />
      </Suspense>
    ),
    children: [
      // User routes
      {
        index: true,
        element: (
          <Suspense fallback={<LoadingScreen />}>
            <ProtectedRoute requiredRole="user">
              <UserDashboard />
            </ProtectedRoute>
          </Suspense>
        ),
      },
      {
        path: "dashboard",
        element: (
          <Suspense fallback={<LoadingScreen />}>
            <ProtectedRoute requiredRole="user">
              <UserDashboard />
            </ProtectedRoute>
          </Suspense>
        ),
      },
      {
        path: "rides",
        children: [
          {
            index: true,
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <ProtectedRoute requiredRole="user">
                  <RideOrders />
                </ProtectedRoute>
              </Suspense>
            ),
          },
          {
            path: "order-ride",
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <ProtectedRoute requiredRole="user">
                  <OrderRide />
                </ProtectedRoute>
              </Suspense>
            ),
          },
        ],
      },
      {
        path: "account",
        element: (
          <Suspense fallback={<LoadingScreen />}>
            <AccountLayout />
          </Suspense>
        ),
        children: [
          { index: true, element: <Profile /> },
          { path: 'change-password', element: <ChangePassword /> },
          { path: 'delete-account', element: <DeleteAccount /> },
          { path: 'support', element: <AccountSupport /> },
          { path: 'passcode', element: <Passcode /> },
        ],
      },
      
      // Driver routes
      {
        path: "driver-dashboard",
        element: (
          <Suspense fallback={<LoadingScreen />}>
            <ProtectedRoute requiredRole="rider">
              <DriverDashboard />
            </ProtectedRoute>
          </Suspense>
        ),
      },
      {
        path: "driver-dashboard/rides",
        element: (
          <Suspense fallback={<LoadingScreen />}>
            <ProtectedRoute requiredRole="rider">
              <DriverRides />
            </ProtectedRoute>
          </Suspense>
        ),
      },
      {
        path: "driver-dashboard/account",
        element: (
          <Suspense fallback={<LoadingScreen />}>
            <ProtectedRoute requiredRole="rider">
              <DriverAccountLayout />
            </ProtectedRoute>
          </Suspense>
        ),
        children: [
          { index: true, element: <DriverProfile /> },
          { path: 'change-password', element: <DriverChangePassword /> },
          { path: 'vehicle-info', element: <DriverVehicleInfo /> },
        ],
      },
    ],
  },

  // Auth routes (no authentication required)
  {
    path: "/login",
    element: <OnboardingLayout />,
    children: [
      { index: true, element: <Login />},
      { path: "forgot-password", element: <AuthPath /> },
    ],
  },
  {
    path: "/register",
    element: <OnboardingLayout />,
    children: [
      { index: true, element: <AuthPath />},
    ],
  },
  {
    path: "/unauthorized",
    element: <Unauthorized />,
  },
]);