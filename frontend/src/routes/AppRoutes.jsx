import { Route, Routes } from "react-router-dom";
import Account from "../pages/Account";
import FoodManager from "../pages/FoodManager";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Messages from "../pages/Messages";
import NgoClaims from "../pages/NgoClaims";
import NgoEntry from "../pages/NgoEntry";
import NgoRoutePreview from "../pages/NgoRoutePreview";
import NgoTracking from "../pages/NgoTracking";
import NotFound from "../pages/NotFound";
import Register from "../pages/Register";
import RestaurantEntry from "../pages/RestaurantEntry";
import RestaurantInfo from "../pages/RestaurantInfo";
import RestaurantClaims from "../pages/RestaurantClaims";
import RestaurantTracking from "../pages/RestaurantTracking";
import RestaurantLocation from "../pages/RestaurantLocation";
import VolunteerEntry from "../pages/VolunteerEntry";
import VolunteerRoutePreview from "../pages/VolunteerRoutePreview";
import NgoInfo from "../pages/NgoInfo";
import VolunteerInfo from "../pages/VolunteerInfo";
import LeaderBoard from "../pages/LeaderBoard";

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/account" element={<Account />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/restaurant" element={<RestaurantEntry />} />
            <Route path="/restaurant-info/:restaurantId" element={<RestaurantInfo />} />
            <Route path="/ngo-info/:ngoId" element={<NgoInfo />} />
            <Route path="/volunteer-info/:volunteerId" element={<VolunteerInfo />} />
            <Route path="/restaurant/food" element={<FoodManager />} />
            <Route path="/restaurant/claims" element={<RestaurantClaims />} />
            <Route path="/restaurant/location" element={<RestaurantLocation />} />
            <Route path="/restaurant/track/:foodId" element={<RestaurantTracking />} />
            <Route path="/ngo" element={<NgoEntry />} />
            <Route path="/ngo/claims" element={<NgoClaims />} />
            <Route path="/ngo/route/:foodId" element={<NgoRoutePreview />} />
            <Route path="/ngo/track/:foodId" element={<NgoTracking />} />
            <Route path="/volunteer" element={<VolunteerEntry />} />
            <Route path="/volunteer/route/:foodId" element={<VolunteerRoutePreview />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/leaderboard" element={<LeaderBoard />} />
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
};

export default AppRoutes;
