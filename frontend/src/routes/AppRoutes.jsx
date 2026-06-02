import { Route, Routes } from "react-router-dom";
import { lazy, Suspense } from "react";
import Loader from "../components/Loader";
import Home from "../pages/Home";
const Account = lazy(() => import("../pages/Account"));
const FoodManager = lazy(() => import("../pages/FoodManager"));
const Login = lazy(() => import("../pages/Login"));
const Messages = lazy(() => import("../pages/Messages"));
const NgoClaims = lazy(() => import("../pages/NgoClaims"));
const NgoEntry = lazy(() => import("../pages/NgoEntry"));
const NgoRoutePreview = lazy(() => import("../pages/NgoRoutePreview"));
const NgoTracking = lazy(() => import("../pages/NgoTracking"));
const NotFound = lazy(() => import("../pages/NotFound"));
const Register = lazy(() => import("../pages/Register"));
const RestaurantEntry = lazy(() => import("../pages/RestaurantEntry"));
const RestaurantInfo = lazy(() => import("../pages/RestaurantInfo"));
const RestaurantClaims = lazy(() => import("../pages/RestaurantClaims"));
const RestaurantTracking = lazy(() => import("../pages/RestaurantTracking"));
const RestaurantLocation = lazy(() => import("../pages/RestaurantLocation"));
const VolunteerEntry = lazy(() => import("../pages/VolunteerEntry"));
const VolunteerRoutePreview = lazy(
  () => import("../pages/VolunteerRoutePreview"),
);
const NgoInfo = lazy(() => import("../pages/NgoInfo"));
const VolunteerInfo = lazy(() => import("../pages/VolunteerInfo"));
const LeaderBoard = lazy(() => import("../pages/LeaderBoard"));
const AdminDashboard = lazy(() => import("../pages/AdminDashboard"));
const ForgetPassword = lazy(() => import("../pages/ForgetPassword"));
const SetNewPassword = lazy(() => import("../pages/SetNewPassword"));

const AppRoutes = () => {
  return (
    <Suspense fallback={<Loader text="Loading page..." />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/account" element={<Account />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/restaurant" element={<RestaurantEntry />} />
        <Route
          path="/restaurant-info/:restaurantId"
          element={<RestaurantInfo />}
        />
        <Route path="/ngo-info/:ngoId" element={<NgoInfo />} />
        <Route
          path="/volunteer-info/:volunteerId"
          element={<VolunteerInfo />}
        />
        <Route path="/restaurant/food" element={<FoodManager />} />
        <Route path="/restaurant/claims" element={<RestaurantClaims />} />
        <Route path="/restaurant/location" element={<RestaurantLocation />} />
        <Route
          path="/restaurant/track/:foodId"
          element={<RestaurantTracking />}
        />
        <Route path="/ngo" element={<NgoEntry />} />
        <Route path="/ngo/claims" element={<NgoClaims />} />
        <Route path="/ngo/route/:foodId" element={<NgoRoutePreview />} />
        <Route path="/ngo/track/:foodId" element={<NgoTracking />} />
        <Route path="/volunteer" element={<VolunteerEntry />} />
        <Route
          path="/volunteer/route/:foodId"
          element={<VolunteerRoutePreview />}
        />
        <Route path="/messages" element={<Messages />} />
        <Route path="/leaderboard" element={<LeaderBoard />} />
        <Route path="/dashboard" element={<AdminDashboard />} />
        <Route path="/forgot-password" element={<ForgetPassword />} />  
        <Route path="/reset-password/:token" element={<SetNewPassword />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
