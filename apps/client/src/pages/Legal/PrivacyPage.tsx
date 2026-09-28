import { Link } from "react-router-dom";

import MainLayout from "../../components/layout/MainLayout";

function PrivacyPage() {
  return (
    <MainLayout>
      <main className="legal-page">
        <section className="legal-page__hero">
          <p className="legal-page__eyebrow">ДОКУМЕНТЫ</p>

          <h1 className="legal-page__title">Политика конфиденциальности</h1>

          <p className="legal-page__updated">
            Последнее обновление: 29 сентября 2026
          </p>
        </section>

        <section className="legal-page__content">
          <article className="legal-page__section">
            <h2 className="legal-page__section-title">
              1. Какие данные мы собираем
            </h2>

            <p>
              При регистрации и использовании SOUL мы собираем минимальный набор
              данных, необходимых для работы игры:
            </p>

            <ul className="legal-page__list">
              <li>
                <strong>Адрес электронной почты</strong> — для входа и
                восстановления доступа к аккаунту.
              </li>
              <li>
                <strong>Никнейм</strong> — публичное отображаемое имя в игре.
              </li>
              <li>
                <strong>Хеш пароля</strong> — сам пароль не хранится, только его
                необратимый криптографический хеш.
              </li>
              <li>
                <strong>Игровая статистика</strong> — результаты партий,
                количество Soul, использованные персонажи.
              </li>
              <li>
                <strong>Технические данные сессии</strong> — IP-адрес,
                user-agent браузера, время последнего входа.
              </li>
            </ul>

            <p>
              При входе через сторонние сервисы (Google, Discord) мы получаем от
              них только email, публичное имя и идентификатор пользователя.
              Пароли от этих сервисов мы не видим и не храним.
            </p>
          </article>

          <article className="legal-page__section">
            <h2 className="legal-page__section-title">
              2. Зачем мы собираем эти данные
            </h2>

            <ul className="legal-page__list">
              <li>Аутентификация и поддержание сессии.</li>
              <li>Отображение профиля другим игрокам в комнате.</li>
              <li>Ведение игровой статистики и истории партий.</li>
              <li>Защита от спама, брутфорса и мошенничества.</li>
              <li>Диагностика ошибок и улучшение работы игры.</li>
            </ul>
          </article>

          <article className="legal-page__section">
            <h2 className="legal-page__section-title">
              3. Как мы храним данные
            </h2>

            <p>
              Все данные хранятся на защищённом сервере. Доступ к базе данных
              ограничен. Пароли хранятся исключительно в виде хешей (алгоритм
              Argon2), из которых невозможно восстановить исходный пароль.
            </p>

            <p>
              Сессия пользователя поддерживается через защищённый httpOnly
              cookie. Данные сессии не доступны JavaScript на стороне клиента.
            </p>
          </article>

          <article className="legal-page__section">
            <h2 className="legal-page__section-title">
              4. Передача данных третьим лицам
            </h2>

            <p>
              Мы не продаём и не передаём персональные данные третьим лицам в
              рекламных или коммерческих целях.
            </p>

            <p>
              Единственное исключение — техническая необходимость авторизации
              через OAuth-провайдеров (Google, Discord). В этом случае обмен
              данными регулируется политикой соответствующего провайдера.
            </p>
          </article>

          <article className="legal-page__section">
            <h2 className="legal-page__section-title">5. Ваши права</h2>

            <ul className="legal-page__list">
              <li>
                <strong>Право на доступ</strong> — вы можете запросить копию
                своих данных.
              </li>
              <li>
                <strong>Право на удаление</strong> — вы можете запросить
                удаление аккаунта и всех связанных данных.
              </li>
              <li>
                <strong>Право на исправление</strong> — вы можете изменить
                никнейм и аватар в разделе «Профиль».
              </li>
            </ul>

            <p>
              Для реализации этих прав напишите на адрес
              <strong> support@soul-game.ru</strong>. Запросы обрабатываются в
              течение 14 рабочих дней.
            </p>
          </article>

          <article className="legal-page__section">
            <h2 className="legal-page__section-title">
              6. Cookie и локальное хранилище
            </h2>

            <p>
              Мы используем только технически необходимые cookie — для
              поддержания сессии и защиты от CSRF. Рекламных трекеров и
              сторонних аналитических cookie нет.
            </p>
          </article>

          <article className="legal-page__section">
            <h2 className="legal-page__section-title">7. Изменения политики</h2>

            <p>
              Мы можем обновлять эту политику. Существенные изменения будут
              отражены в дате «Последнее обновление» в начале документа.
              Продолжая использовать SOUL после изменений, вы соглашаетесь с
              новой редакцией.
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

export default PrivacyPage;
