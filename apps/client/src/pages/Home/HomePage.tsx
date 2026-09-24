import {
	useAuthStore
} from '../../stores/authStore';

function HomePage() {
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
		<main className="app">
			<h1>
				SOUL
			</h1>
			
			<h2>
				Добро пожаловать,{' '}
				{user?.profile.nickname}
			</h2>
			
			<p>
				Email: {user?.email}
			</p>
			
			<p>
				Роль: {user?.role}
			</p>
			
			<button
				type="button"
				onClick={() => {
					void handleLogout();
				}}
			>
				Выйти
			</button>
		</main>
	);
}

export default HomePage;