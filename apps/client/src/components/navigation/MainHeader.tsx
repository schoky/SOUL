import {
	Link,
	NavLink
} from 'react-router-dom';

import {
	useAuthStore
} from '../../stores/authStore';

import SoulLogo
	from '../branding/SoulLogo';

function MainHeader() {
	const isAuthenticated =
		useAuthStore(
			(state) => state.isAuthenticated
		);
	
	const user =
		useAuthStore(
			(state) => state.user
		);
	
	const logout =
		useAuthStore(
			(state) => state.logout
		);
	
	async function handleLogout() {
		await logout();
	}
	
	return (
		<header className="main-header">
			<div className="main-header__inner">
				<Link
					className="main-header__logo-link"
					to="/"
				>
					<SoulLogo
						className="soul-logo--header"
					/>
				</Link>
				
				<nav
					className="main-header__nav"
					aria-label="Основная навигация"
				>
					<NavLink
						className="main-header__nav-link"
						to={
							isAuthenticated
								? '/lobby'
								: '/'
						}
					>
						Игра
					</NavLink>
					
					<button
						className="
              main-header__nav-link
              main-header__nav-link--disabled
            "
						type="button"
						disabled
					>
						Карты
					</button>
					
					<NavLink
						className="main-header__nav-link"
						to="/rules"
					>
						Правила
					</NavLink>
					
					<button
						className="
              main-header__nav-link
              main-header__nav-link--disabled
            "
						type="button"
						disabled
					>
						Новости
					</button>
				</nav>
				
				<div className="main-header__actions">
					{isAuthenticated ? (
						<>
              <span className="main-header__user">
                {user?.profile.nickname}
              </span>
							
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
							<Link
								className="main-header__auth-button"
								to="/login"
							>
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
			</div>
		</header>
	);
}

export default MainHeader;