import { useEffect } from "react";

import { useAuthStore } from "../stores/authStore";
import { useFriendsStore } from "../stores/friendsStore";

import { useFriendNotifications } from "../hooks/useFriendNotifications";

import AppRouter from "../router/AppRouter";

import Toaster from "../components/ui/Toaster";

function App() {
  const isLoading = useAuthStore((state) => state.isLoading);

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    void checkAuth();
  }, [checkAuth]);

  // Подписываемся на realtime-события друзей и приглашений
  // один раз при монтировании приложения.
  useEffect(() => {
    const unsubscribe = useFriendsStore.getState().subscribeToRealtime();

    return () => {
      unsubscribe();
    };
  }, []);

  // Когда пользователь авторизован — подгружаем друзей,
  // заявки и приглашения. При выходе — очищаем стор.
  useEffect(() => {
    if (isAuthenticated) {
      void useFriendsStore.getState().load();
    } else {
      useFriendsStore.getState().clear();
    }
  }, [isAuthenticated]);

  // Показываем всплывашки на realtime-события друзей.
  useFriendNotifications();

  if (isLoading) {
    return (
      <main className="app">
        <h1>SOUL</h1>

        <p>Проверяем авторизацию...</p>
      </main>
    );
  }

  return (
    <>
      <AppRouter />

      <Toaster />
    </>
  );
}

export default App;
