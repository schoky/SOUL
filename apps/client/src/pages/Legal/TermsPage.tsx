import { Link } from "react-router-dom";

import MainLayout from "../../components/layout/MainLayout";

function TermsPage() {
  return (
    <MainLayout>
      <main className="legal-page">
        <section className="legal-page__hero">
          <p className="legal-page__eyebrow">ДОКУМЕНТЫ</p>

          <h1 className="legal-page__title">Пользовательское соглашение</h1>

          <p className="legal-page__updated">
            Последнее обновление: 29 сентября 2026
          </p>
        </section>

        <section className="legal-page__content">
          <article className="legal-page__section">
            <h2 className="legal-page__section-title">1. Общие положения</h2>

            <p>
              SOUL — браузерная многопользовательская карточная игра. Используя
              сервис, вы соглашаетесь с настоящими условиями. Если вы не
              согласны — пожалуйста, не пользуйтесь игрой.
            </p>

            <p>
              Игра предоставляется «как есть». Мы не гарантируем бесперебойную
              работу, но прилагаем для этого разумные усилия.
            </p>
          </article>

          <article className="legal-page__section">
            <h2 className="legal-page__section-title">2. Возраст и аккаунт</h2>

            <ul className="legal-page__list">
              <li>
                Игра предназначена для пользователей
                <strong> от 14 лет</strong>.
              </li>
              <li>
                Запрещено создавать аккаунты лицам, ранее заблокированным за
                нарушение правил.
              </li>
              <li>
                Один человек — один аккаунт. Мультиаккаунтинг для получения
                преимуществ запрещён.
              </li>
            </ul>
          </article>

          <article className="legal-page__section">
            <h2 className="legal-page__section-title">3. Правила поведения</h2>

            <p>При использовании SOUL запрещается:</p>

            <ul className="legal-page__list">
              <li>
                Использовать оскорбительные, расистские, сексистские или иные
                неприемлемые никнеймы и аватары.
              </li>
              <li>
                Оскорблять других игроков в чате и любой другой коммуникации.
              </li>
              <li>
                Использовать ботов, скрипты или эксплойты для получения игрового
                преимущества.
              </li>
              <li>
                Пытаться взломать сервис, получить доступ к чужим аккаунтам или
                нарушить работу сервера.
              </li>
              <li>Спамить, распространять рекламу и вредоносные ссылки.</li>
            </ul>
          </article>

          <article className="legal-page__section">
            <h2 className="legal-page__section-title">4. Игровой контент</h2>

            <p>
              Все игровые элементы (карточки персонажей, события, механики,
              визуальный стиль) являются частью SOUL. Их копирование,
              распространение или использование за пределами игры без разрешения
              запрещено.
            </p>

            <p>
              Игровой баланс может меняться в любой момент: мы оставляем за
              собой право изменять характеристики персонажей, требования событий
              и другие параметры без предварительного уведомления.
            </p>
          </article>

          <article className="legal-page__section">
            <h2 className="legal-page__section-title">5. Ответственность</h2>

            <p>Мы не несём ответственности за:</p>

            <ul className="legal-page__list">
              <li>Потерю игрового прогресса в результате технических сбоев.</li>
              <li>
                Действия других игроков, включая оскорбления, спам и попытки
                мошенничества.
              </li>
              <li>
                Временную недоступность сервиса в связи с обновлением или
                профилактикой.
              </li>
            </ul>
          </article>

          <article className="legal-page__section">
            <h2 className="legal-page__section-title">
              6. Блокировка аккаунта
            </h2>

            <p>
              Мы оставляем за собой право заблокировать аккаунт за нарушение
              настоящих правил без предварительного уведомления. При серьёзных
              нарушениях — с сохранением данных для возможного обращения в
              правоохранительные органы.
            </p>

            <p>
              Если вы считаете блокировку несправедливой — напишите на{" "}
              <strong>dans4fonov@yandex.ru</strong>.
            </p>
          </article>

          <article className="legal-page__section">
            <h2 className="legal-page__section-title">7. Изменение условий</h2>

            <p>
              Мы можем обновлять это соглашение. Продолжая пользоваться SOUL
              после публикации изменений, вы автоматически принимаете новую
              редакцию. Дата последнего обновления указана в начале документа.
            </p>
          </article>
        </section>

        <section className="legal-page__footer">
          <Link className="legal-page__back" to="/">
            ← На главную
          </Link>
        </section>
      </main>
    </MainLayout>
  );
}

export default TermsPage;
