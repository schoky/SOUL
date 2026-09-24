import {
	useState
} from 'react';

import type {
	FormEvent
} from 'react';

import {
	useNavigate
} from 'react-router-dom';

import {
	useAuthStore
} from '../../stores/authStore';

import AuthLayout
	from '../../components/auth/AuthLayout';

function RegisterPage() {
	const navigate =
		useNavigate();
	
	const register =
		useAuthStore(
			(state) => state.register
		);
	
	const [email, setEmail] =
		useState('');
	
	const [nickname, setNickname] =
		useState('');
	
	const [password, setPassword] =
		useState('');
	
	const [confirmPassword, setConfirmPassword] =
		useState('');
	
	const [error, setError] =
		useState<string | null>(null);
	
	const [isSubmitting, setIsSubmitting] =
		useState(false);
	
	async function handleSubmit(
		event: FormEvent<HTMLFormElement>
	) {
		event.preventDefault();
		
		setError(null);
		
		if (password !== confirmPassword) {
			setError(
				'Пароли не совпадают'
			);
			
			return;
		}
		
		setIsSubmitting(true);
		
		try {
			await register({
				email,
				nickname,
				password
			});
			
			navigate('/');
		} catch (error) {
			if (error instanceof Error) {
				setError(error.message);
			} else {
				setError(
					'Не удалось выполнить регистрацию'
				);
			}
		} finally {
			setIsSubmitting(false);
		}
	}
	
	return (
		<AuthLayout>
			<section className="auth-panel">
				<h1 className="auth-panel__title">
					Регистрация
				</h1>
				
				<form
					className="auth-panel__form"
					onSubmit={handleSubmit}
				>
					<div className="auth-panel__field">
						<label
							className="auth-panel__label"
							htmlFor="email"
						>
							Email
						</label>
						
						<input
							className="auth-panel__input"
							id="email"
							name="email"
							type="email"
							value={email}
							onChange={(event) =>
								setEmail(
									event.target.value
								)
							}
							autoComplete="email"
							required
						/>
					</div>
					
					<div className="auth-panel__field">
						<label
							className="auth-panel__label"
							htmlFor="nickname"
						>
							Никнейм
						</label>
						
						<input
							className="auth-panel__input"
							id="nickname"
							name="nickname"
							type="text"
							value={nickname}
							onChange={(event) =>
								setNickname(
									event.target.value
								)
							}
							autoComplete="nickname"
							minLength={3}
							maxLength={20}
							required
						/>
					</div>
					
					<div className="auth-panel__field">
						<label
							className="auth-panel__label"
							htmlFor="password"
						>
							Пароль
						</label>
						
						<input
							className="auth-panel__input"
							id="password"
							name="password"
							type="password"
							value={password}
							onChange={(event) =>
								setPassword(
									event.target.value
								)
							}
							autoComplete="new-password"
							minLength={8}
							required
						/>
					</div>
					
					<div className="auth-panel__field">
						<label
							className="auth-panel__label"
							htmlFor="confirm-password"
						>
							Повторите пароль
						</label>
						
						<input
							className="auth-panel__input"
							id="confirm-password"
							name="confirm-password"
							type="password"
							value={confirmPassword}
							onChange={(event) =>
								setConfirmPassword(
									event.target.value
								)
							}
							autoComplete="new-password"
							required
						/>
					</div>
					
					{error && (
						<p className="auth-panel__error">
							{error}
						</p>
					)}
					
					<button
						className="auth-panel__submit"
						type="submit"
						disabled={isSubmitting}
					>
						{isSubmitting
							? 'Регистрируем...'
							: 'Зарегистрироваться'}
					</button>
				</form>
				
				<p className="auth-panel__footer">
					Уже есть аккаунт?{' '}
					
					<button
						className="auth-panel__footer-link"
						type="button"
						onClick={() =>
							navigate('/login')
						}
					>
						Войти
					</button>
				</p>
			</section>
		</AuthLayout>
	);
}

export default RegisterPage;