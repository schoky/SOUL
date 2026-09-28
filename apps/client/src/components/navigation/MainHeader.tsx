import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";

import { useAuthStore } from "../../stores/authStore";

import SoulLogo from "../branding/SoulLogo";

function MainHeader() {
  const location = useLocation();

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const user = useAuthStore((state) => state.user);

  const logout = useAuthStore((state) => state.logout);

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const previous = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previous;
    };
  }, [isMenuOpen]);

  async function handleLogout() {
    setIsMenuOpen(false);

    await logout();
  }

  function closeMenu() {
    setIsMenuOpen(false);
  }

  return (
    <>
      <header className="main-header">
        <div className="main-header__inner">
          <Link className="main-header__logo-link" to="/" onClick={closeMenu}>
            <SoulLogo className="soul-logo--header" />
          </Link>

          <nav className="main-header__nav" aria-label="Основная навигация">
            <NavLink
              className="main-header__nav-link"
              to={isAuthenticated ? "/lobby" : "/"}
            >
              Игра
            </NavLink>

            <NavLink className="main-header__nav-link" to="/collection">
              Карты
            </NavLink>

            <NavLink className="main-header__nav-link" to="/rules">
              Правила
            </NavLink>

            <NavLink className="main-header__nav-link" to="/news">
              Новости
            </NavLink>
          </nav>

          <div className="main-header__actions">
            {isAuthenticated ? (
              <>
                <NavLink className="main-header__user" to="/profile">
                  {user?.profile.nickname}
                </NavLink>

                <button
                  className="main-header__auth-button"
                  type="button"
                  onClick={() => {
                    void handleLogout();
                  }}
                >
                  Выйти
                </button>
              </>
            ) : (
              <>
                <Link className="main-header__auth-button" to="/login">
                  Войти
                </Link>

                <Link
                  className="
										main-header__auth-button
										main-header__auth-button--primary
									"
                  to="/register"
                >
                  Регистрация
                </Link>
              </>
            )}
          </div>

          <button
            className={[
              "main-header__burger",
              isMenuOpen ? "main-header__burger--open" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            type="button"
            aria-label={isMenuOpen ? "Закрыть меню" : "Открыть меню"}
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      {isMenuOpen && (
        <div className="main-header__mobile-menu" role="dialog">
          <nav className="main-header__mobile-nav">
            <NavLink
              className="main-header__mobile-link"
              to={isAuthenticated ? "/lobby" : "/"}
              onClick={closeMenu}
            >
              Игра
            </NavLink>

            <NavLink
              className="main-header__mobile-link"
              to="/collection"
              onClick={closeMenu}
            >
              Карты
            </NavLink>

            <NavLink
              className="main-header__mobile-link"
              to="/rules"
              onClick={closeMenu}
            >
              Правила
            </NavLink>

            <NavLink
              className="main-header__mobile-link"
              to="/news"
              onClick={closeMenu}
            >
              Новости
            </NavLink>

            {isAuthenticated && (
              <>
                <NavLink
                  className="main-header__mobile-link"
                  to="/profile"
                  onClick={closeMenu}
                >
                  Профиль
                </NavLink>

                {user?.role === "ADMIN" && (
                  <NavLink
                    className="main-header__mobile-link"
                    to="/admin"
                    onClick={closeMenu}
                  >
                    Админ-панель
                  </NavLink>
                )}
              </>
            )}
          </nav>

          <div className="main-header__mobile-actions">
            {isAuthenticated ? (
              <>
                <div className="main-header__mobile-user">
                  <span>Ты играешь как</span>

                  <strong>{user?.profile.nickname}</strong>
                </div>

                <button
                  className="main-header__mobile-button"
                  type="button"
                  onClick={() => {
                    void handleLogout();
                  }}
                >
                  Выйти
                </button>
              </>
            ) : (
              <>
                <Link
                  className="main-header__mobile-button"
                  to="/login"
                  onClick={closeMenu}
                >
                  Войти
                </Link>

                <Link
                  className="
										main-header__mobile-button
										main-header__mobile-button--primary
									"
                  to="/register"
                  onClick={closeMenu}
                >
                  Регистрация
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default MainHeader;
