import { Link } from "react-router-dom";

import { useAuthStore } from "../../stores/authStore";

import MainLayout from "../../components/layout/MainLayout";

import SoulLogo from "../../components/branding/SoulLogo";

function LandingPage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <MainLayout>
      <section className="landing-page">
        <div className="landing-page__hero">
          <div className="landing-page__hero-content">
            <SoulLogo className="soul-logo--hero" />

            <p className="landing-page__subtitle">Твой ход. Твои правила.</p>

            <p className="landing-page__description">
              Браузерная карточная игра с характером, риском и онлайн-битвами.
            </p>

            <div className="landing-page__actions">
              <Link
                className="
                  landing-page__button
                  landing-page__button--primary
                "
                to={isAuthenticated ? "/lobby" : "/login"}
              >
                Играть
              </Link>

              <Link
                className="
                  landing-page__button
                  landing-page__button--secondary
                "
                to="/rules"
              >
                Узнать больше
              </Link>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}

export default LandingPage;
