import { BrowserRouter, Route, Routes } from "react-router-dom";

import ProtectedRoute from "./ProtectedRoute";

import PublicRoute from "./PublicRoute";

import LandingPage from "../pages/Landing/LandingPage";

import LoginPage from "../pages/Login/LoginPage";

import RegisterPage from "../pages/Register/RegisterPage";

import LobbyPage from "../pages/Lobby/LobbyPage";

import RoomPage from "../pages/Room/RoomPage";

import RulesPage from "../pages/Rules/RulesPage";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />

        <Route path="/rules" element={<RulesPage />} />

        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />

          <Route path="/register" element={<RegisterPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/lobby" element={<LobbyPage />} />

          <Route path="/room/:roomId" element={<RoomPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
