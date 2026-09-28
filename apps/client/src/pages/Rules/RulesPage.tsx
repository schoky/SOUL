import { Link } from "react-router-dom";

import MainLayout from "../../components/layout/MainLayout";

type RuleCardProps = {
  number: string;
  title: string;
  children: React.ReactNode;
};

function RuleCard({ number, title, children }: RuleCardProps) {
  return (
    <article className="rules-page__card">
      <div className="rules-page__card-number">{number}</div>

      <div className="rules-page__card-content">
        <h2 className="rules-page__card-title">{title}</h2>

        <div className="rules-page__card-text">{children}</div>
      </div>
    </article>
  );
}

type AbilityEntry = {
  character: string;
  ability: string;
  description: string;
};

const ABILITIES: AbilityEntry[] = [
  {
    character: "Киллер",
    ability: "Хладнокровие",
    description: "Первый провал по Туллеру за игру не отнимает Soul.",
  },
  {
    character: "Рыночный акула",
    ability: "Выгодная сделка",
    description:
      "При успешном событии с Перекупом получает +1 Soul сверх награды.",
  },
  {
    character: "Трудяга",
    ability: "На износ",
    description:
      "При успешном событии с Фармилой получает +1 Soul сверх награды.",
  },
  {
    character: "Снайпер",
    ability: "Точный выстрел",
    description: "При выигранном риске получает +1 Soul сверх награды.",
  },
  {
    character: "Курьер",
    ability: "Вёрткость",
    description: "При провале по Фармиле не пропускает следующий ход.",
  },
  {
    character: "Механик",
    ability: "Запас прочности",
    description:
      "Если играется в связке из двух карт, не становится истощённым.",
  },
  {
    character: "Контрабандист",
    ability: "Одиночка",
    description:
      "При игре одной картой получает +1 Soul сверх награды при успехе.",
  },
  {
    character: "Решала",
    ability: "Связи",
    description: "При игре в связке получает +1 Soul сверх награды при успехе.",
  },
  {
    character: "Медик",
    ability: "Аптечка",
    description:
      "При успешном событии с Туллером получает +1 Soul сверх награды.",
  },
  {
    character: "Информатор",
    ability: "Чутьё",
    description:
      "Первый провал риска при выполненных требованиях не отнимает Soul.",
  },
];

function RulesPage() {
  return (
    <MainLayout>
      <main className="rules-page">
        <section className="rules-page__hero">
          <p className="rules-page__eyebrow">ПРАВИЛА ИГРЫ</p>

          <h1 className="rules-page__title">Как играть в SOUL</h1>

          <p className="rules-page__description">
            Собирай правильные связки персонажей, выполняй события, рискуй ради
            большей награды и первым набери 15 Soul.
          </p>

          <Link
            className="
							rules-page__home-button
							rules-page__home-button--primary
						"
            to="/"
          >
            ← На главную
          </Link>
        </section>

        <section className="rules-page__grid">
          <RuleCard number="01" title="Персонажи">
            <p>
              В начале игры каждый игрок получает
              <strong> 2 персонажа</strong>.
            </p>

            <p>У каждого персонажа есть три характеристики:</p>

            <div className="rules-page__stats">
              <span className="rules-page__stat">Фармила</span>

              <span className="rules-page__stat">Перекуп</span>

              <span className="rules-page__stat">Туллер</span>
            </div>

            <p>
              За ход можно использовать
              <strong> одного персонажа</strong> или
              <strong> связку из двух</strong>. Их характеристики складываются.
            </p>
          </RuleCard>

          <RuleCard number="02" title="События">
            <p>
              Каждый ход открывается
              <strong> карта события</strong>.
            </p>

            <p>На карте указаны требования по характеристикам.</p>

            <p>
              Ты выбираешь одного персонажа или их связку. Если требования
              выполнены, событие проходит успешно и ты получаешь награду.
            </p>

            <p>
              События бывают простые, средние и сложные. Чем выше требования —
              тем больше награда.
            </p>
          </RuleCard>

          <RuleCard number="03" title="Soul">
            <p>
              Каждый игрок начинает с<strong> 3 Soul</strong>.
            </p>

            <p>
              Soul — главный ресурс игры. Он может увеличиваться за успешные
              события и уменьшаться из-за неудач.
            </p>

            <p>
              Количество Soul
              <strong> никогда не опускается ниже 0</strong>.
            </p>

            <div className="rules-page__goal">
              <span className="rules-page__goal-value">15</span>

              <span className="rules-page__goal-label">
                Soul для финального раунда
              </span>
            </div>
          </RuleCard>

          <RuleCard number="04" title="Риск">
            <p>
              Риск — это возможность получить
              <strong> увеличенную награду</strong>
              вместо обычной.
            </p>

            <p>
              Если требования события
              <strong> выполнены</strong> — шанс риска составляет{" "}
              <strong>50%</strong>.
            </p>

            <p>
              Если требования
              <strong> не выполнены</strong> — риск тоже доступен, но шанс
              падает до
              <strong> 25%</strong>.
            </p>

            <p>
              При неудаче срабатывает эффект провала по основной характеристике
              события.
            </p>
          </RuleCard>

          <RuleCard number="05" title="Неудача">
            <p>
              Если требования события не выполнены, исход определяется его
              главной характеристикой.
            </p>

            <div className="rules-page__effects">
              <div className="rules-page__effect">
                <span className="rules-page__effect-name">Туллер</span>

                <span className="rules-page__effect-value">Закафан</span>

                <span className="rules-page__effect-description">−1 Soul</span>
              </div>

              <div className="rules-page__effect">
                <span className="rules-page__effect-name">Перекуп</span>

                <span className="rules-page__effect-value">В пролёте</span>

                <span className="rules-page__effect-description">
                  50/50 · −2 Soul при проигрыше
                </span>
              </div>

              <div className="rules-page__effect">
                <span className="rules-page__effect-name">Фармила</span>

                <span className="rules-page__effect-value">Выгорание</span>

                <span className="rules-page__effect-description">
                  Пропуск следующего хода
                </span>
              </div>
            </div>
          </RuleCard>

          <RuleCard number="06" title="Истощение">
            <p>
              После использования персонаж становится{" "}
              <strong>истощённым</strong> и не может играться до следующего
              полноценного хода.
            </p>

            <p>
              В начале твоего следующего хода все персонажи восстанавливаются.
            </p>

            <p>
              <strong>Исключение:</strong> если ты пропустил ход из-за
              «Выгорания» — карты остаются истощёнными до того момента, когда ты
              реально сходишь.
            </p>
          </RuleCard>

          <RuleCard number="07" title="Победа">
            <p>
              Когда игрок достигает
              <strong> 15 Soul</strong>, начинается финальный раунд.
            </p>

            <p>Все остальные игроки получают ещё по одному ходу.</p>

            <p>
              После завершения финального раунда побеждает игрок с наибольшим
              количеством Soul.
            </p>
          </RuleCard>

          <RuleCard number="08" title="Ничья">
            <p>
              Если после финального раунда несколько игроков имеют одинаковое
              количество Soul — побеждает тот, кто{" "}
              <strong>первым достиг 15 Soul</strong>и запустил финальный раунд.
            </p>

            <p>
              То есть инициатор финала получает преимущество при равном
              результате.
            </p>
          </RuleCard>
        </section>

        <section className="rules-page__abilities">
          <p className="rules-page__eyebrow">СПРАВОЧНИК</p>

          <h2 className="rules-page__abilities-title">
            Способности персонажей
          </h2>

          <p className="rules-page__abilities-description">
            У каждого персонажа есть своя уникальная способность. Она
            срабатывает автоматически, когда выполняются её условия — ничего
            активировать не нужно.
          </p>

          <div className="rules-page__abilities-list">
            {ABILITIES.map((entry) => (
              <article className="rules-page__ability" key={entry.character}>
                <div className="rules-page__ability-header">
                  <strong className="rules-page__ability-character">
                    {entry.character}
                  </strong>

                  <span className="rules-page__ability-name">
                    {entry.ability}
                  </span>
                </div>

                <p className="rules-page__ability-description">
                  {entry.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="rules-page__footer">
          <p>Готов проверить себя?</p>

          <Link
            className="
							rules-page__home-button
							rules-page__home-button--secondary
						"
            to="/lobby"
          >
            Перейти в лобби
          </Link>
        </section>
      </main>
    </MainLayout>
  );
}

export default RulesPage;
