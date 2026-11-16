import { BrowserRouter, Route, Routes } from 'react-router-dom';

import AdminActiveGames from '../pages/Admin/AdminActiveGames';
import AdminCharacters from '../pages/Admin/AdminCharacters';
import AdminDashboard from '../pages/Admin/AdminDashboard';
import AdminEvents from '../pages/Admin/AdminEvents';
import AdminGames from '../pages/Admin/AdminGames';
import AdminLayout from '../pages/Admin/AdminLayout';
import AdminLogs from '../pages/Admin/AdminLogs';
import AdminNews from '../pages/Admin/AdminNews';
import AdminRooms from '../pages/Admin/AdminRooms';
import AdminUsers from '../pages/Admin/AdminUsers';
import CollectionPage from '../pages/Collection/CollectionPage';
import FriendsPage from '../pages/Friends/FriendsPage';
import GamePage from '../pages/Game/GamePage';
import LandingPage from '../pages/Landing/LandingPage';
import LeaderboardPage from '../pages/Leaderboard/LeaderboardPage';
import PrivacyPage from '../pages/Legal/PrivacyPage';
import TermsPage from '../pages/Legal/TermsPage';
import LobbyPage from '../pages/Lobby/LobbyPage';
import LoginPage from '../pages/Login/LoginPage';
import NewsArticlePage from '../pages/News/NewsArticlePage';
import NewsPage from '../pages/News/NewsPage';
import ProfilePage from '../pages/Profile/ProfilePage';
import RegisterPage from '../pages/Register/RegisterPage';
import RoomPage from '../pages/Room/RoomPage';
import RulesPage from '../pages/Rules/RulesPage';
import AdminRoute from './AdminRoute';
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<LandingPage />} />

        <Route path='/rules' element={<RulesPage />} />

        <Route path='/news' element={<NewsPage />} />

        <Route path='/news/:slug' element={<NewsArticlePage />} />

        <Route path='/privacy' element={<PrivacyPage />} />

        <Route path='/terms' element={<TermsPage />} />

        <Route element={<PublicRoute />}>
          <Route path='/login' element={<LoginPage />} />

          <Route path='/register' element={<RegisterPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path='/lobby' element={<LobbyPage />} />

          <Route path='/room/:roomId' element={<RoomPage />} />

          <Route path='/game/:roomId' element={<GamePage />} />

          <Route path='/collection' element={<CollectionPage />} />

          <Route path='/profile' element={<ProfilePage />} />

          <Route path='/leaderboard' element={<LeaderboardPage />} />

          <Route path='/friends' element={<FriendsPage />} />
        </Route>

        <Route element={<AdminRoute />}>
          <Route path='/admin' element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />

            <Route path='users' element={<AdminUsers />} />

            <Route path='characters' element={<AdminCharacters />} />

            <Route path='events' element={<AdminEvents />} />

            <Route path='rooms' element={<AdminRooms />} />

            <Route path='active-games' element={<AdminActiveGames />} />

            <Route path='games' element={<AdminGames />} />

            <Route path='logs' element={<AdminLogs />} />

            <Route path='news' element={<AdminNews />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
