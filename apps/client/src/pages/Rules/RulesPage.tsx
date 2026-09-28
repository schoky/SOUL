import {
	Link
} from 'react-router-dom';

import MainLayout
	from '../../components/layout/MainLayout';

type RuleCardProps = {
	number: string;
	title: string;
	children: React.ReactNode;
};

function RuleCard({
	                  number,
	                  title,
	                  children
                  }: RuleCardProps) {
	return (
		<article className="rules-page__card">
			<div className="rules-page__card-number">
				{number}
			</div>
			
			<div className="rules-page__card-content">
				<h2 className="rules-page__card-title">
					{title}
				</h2>
				
				<div className="rules-page__card-text">
					{children}
				</div>
			</div>
		</article>
	);
}

function RulesPage() {
	return (
		<MainLayout>
			<main className="rules-page">
				<section className="rules-page__hero">
					<p className="rules-page__eyebrow">
						ПРАВИЛА ИГРЫ
					</p>
					
					<h1 className="rules-page__title">
						Как играть в SOUL
					</h1>
					
					<p className="rules-page__description">
						Собирай правильные связки персонажей,
						выполняй события, рискуй ради большей
						награды и первым набери 15 Soul.
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
					<RuleCard
						number="01"
						title="Персонажи"
					>
						<p>
							В начале игры каждый игрок получает
							<strong> 2 персонажей</strong>.
						</p>
						
						<p>
							У каждого персонажа есть три характеристики:
						</p>
						
						<div className="rules-page__stats">
              <span className="rules-page__stat">
                Фармила
              </span>
							
							<span className="rules-page__stat">
                Перекуп
              </span>
							
							<span className="rules-page__stat">
                Туллер
              </span>
						</div>
					</RuleCard>
					
					<RuleCard
						number="02"
						title="События"
					>
						<p>
							Каждый ход открывается
							<strong> карта события</strong>.
						</p>
						
						<p>
							На карте указаны требования
							по характеристикам.
						</p>
						
						<p>
							Ты выбираешь одного персонажа
							или их связку. Если требования
							выполнены, событие проходит успешно
							и ты получаешь награду.
						</p>
					</RuleCard>
					
					<RuleCard
						number="03"
						title="Soul"
					>
						<p>
							Каждый игрок начинает с
							<strong> 3 Soul</strong>.
						</p>
						
						<p>
							Soul — главный ресурс игры.
							Он может увеличиваться за успешные
							события и уменьшаться из-за неудач.
						</p>
						
						<div className="rules-page__goal">
              <span className="rules-page__goal-value">
                15
              </span>
							
							<span className="rules-page__goal-label">
                Soul для финального раунда
              </span>
						</div>
					</RuleCard>
					
					<RuleCard
						number="04"
						title="Риск"
					>
						<p>
							Если требования события выполнены,
							можно сыграть безопасно или
							<strong> пойти на риск</strong>.
						</p>
						
						<p>
							При успешном риске ты получаешь
							увеличенную награду.
						</p>
						
						<p>
							Но результат риска определяется
							<strong> 50/50</strong>. Неудача
							запускает негативный эффект события.
						</p>
					</RuleCard>
					
					<RuleCard
						number="05"
						title="Неудача"
					>
						<p>
							Если требования события не выполнены,
							исход определяется его главной
							характеристикой.
						</p>
						
						<div className="rules-page__effects">
							<div className="rules-page__effect">
                <span className="rules-page__effect-name">
                  Туллер
                </span>
								
								<span className="rules-page__effect-value">
                  Закафан
                </span>
								
								<span className="rules-page__effect-description">
                  −1 Soul
                </span>
							</div>
							
							<div className="rules-page__effect">
                <span className="rules-page__effect-name">
                  Перекуп
                </span>
								
								<span className="rules-page__effect-value">
                  В пролёте
                </span>
								
								<span className="rules-page__effect-description">
                  50/50 · −2 Soul при проигрыше
                </span>
							</div>
							
							<div className="rules-page__effect">
                <span className="rules-page__effect-name">
                  Фармила
                </span>
								
								<span className="rules-page__effect-value">
                  Выгорание
                </span>
								
								<span className="rules-page__effect-description">
                  Пропуск следующего хода
                </span>
							</div>
						</div>
					</RuleCard>
					
					<RuleCard
						number="06"
						title="Победа"
					>
						<p>
							Когда игрок достигает
							<strong> 15 Soul</strong>, начинается
							финальный раунд.
						</p>
						
						<p>
							Все остальные игроки получают
							ещё по одному ходу.
						</p>
						
						<p>
							После завершения финального раунда
							побеждает игрок с наибольшим количеством
							Soul.
						</p>
						
						<p>
							При равном результате преимущество
							получает игрок, который первым запустил
							финальный раунд.
						</p>
					</RuleCard>
				</section>
				
				<section className="rules-page__footer">
					<p>
						Готов проверить себя?
					</p>
					
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