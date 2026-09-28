import { BrowserRouter, Route, Routes } from "react-router-dom";

import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";
import AdminRoute from "./AdminRoute";

import LandingPage from "../pages/Landing/LandingPage";
import LoginPage from "../pages/Login/LoginPage";
import RegisterPage from "../pages/Register/RegisterPage";
import LobbyPage from "../pages/Lobby/LobbyPage";
import RoomPage from "../pages/Room/RoomPage";
import GamePage from "../pages/Game/GamePage";
import CollectionPage from "../pages/Collection/CollectionPage";
import ProfilePage from "../pages/Profile/ProfilePage";
import RulesPage from "../pages/Rules/RulesPage";
import NewsPage from "../pages/News/NewsPage";
import NewsArticlePage from "../pages/News/NewsArticlePage";

import AdminLayout from "../pages/Admin/AdminLayout";
import AdminDashboard from "../pages/Admin/AdminDashboard";
import AdminUsers from "../pages/Admin/AdminUsers";
import AdminCharacters from "../pages/Admin/AdminCharacters";
import AdminEvents from "../pages/Admin/AdminEvents";
import AdminRooms from "../pages/Admin/AdminRooms";
import AdminGames from "../pages/Admin/AdminGames";
import AdminNews from "../pages/Admin/AdminNews";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />

        <Route path="/rules" element={<RulesPage />} />

        <Route path="/news" element={<NewsPage />} />

        <Route path="/news/:slug" element={<NewsArticlePage />} />

        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />

          <Route path="/register" element={<RegisterPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/lobby" element={<LobbyPage />} />

          <Route path="/room/:roomId" element={<RoomPage />} />

          <Route path="/game/:roomId" element={<GamePage />} />

          <Route path="/collection" element={<CollectionPage />} />

          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />

            <Route path="users" element={<AdminUsers />} />

            <Route path="characters" element={<AdminCharacters />} />

            <Route path="events" element={<AdminEvents />} />

            <Route path="rooms" element={<AdminRooms />} />

            <Route path="games" element={<AdminGames />} />

            <Route path="news" element={<AdminNews />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
