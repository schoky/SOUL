import { useEffect } from "react";

import { useAuthStore } from "../stores/authStore";

import AppRouter from "../router/AppRouter";

import Toaster from "../components/ui/Toaster";

function App() {
  const isLoading = useAuthStore((state) => state.isLoading);

  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    void checkAuth();
  }, [checkAuth]);

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
