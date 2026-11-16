import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import AuthLayout from '../../components/auth/AuthLayout';
import { getOAuthUrl, type OAuthProviderId } from '../../services/api/auth';
import { useAuthStore } from '../../stores/authStore';

function LoginPage() {
  const navigate = useNavigate();

  const login = useAuthStore((state) => state.login);

  const [email, setEmail] = useState('');

  const [password, setPassword] = useState('');

  const [error, setError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Если сервер вернул нас с ошибкой OAuth
   * (неверный state, отказ провайдера и т.п.),
   * она приходит в query-параметре oauthError.
   */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const oauthError = params.get('oauthError');

    if (!oauthError) {
      return;
    }

    setError(oauthError);

    params.delete('oauthError');

    const query = params.toString();

    window.history.replaceState(null, '', window.location.pathname + (query ? `?${query}` : ''));
  }, []);

  function handleOAuth(provider: OAuthProviderId) {
    setError(null);

    window.location.href = getOAuthUrl(provider);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);
    setIsSubmitting(true);

    try {
      await login({
        email,
        password
      });

      navigate('/');
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Не удалось выполнить вход');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout>
      <section className='auth-panel'>
        <h1 className='auth-panel__title'>Вход в игру</h1>

        <form className='auth-panel__form' onSubmit={handleSubmit}>
          <div className='auth-panel__field'>
            <label className='auth-panel__label' htmlFor='email'>
              Email
            </label>

            <input
              className='auth-panel__input'
              id='email'
              name='email'
              type='email'
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder='Введите email'
              autoComplete='email'
              required
            />
          </div>

          <div className='auth-panel__field'>
            <label className='auth-panel__label' htmlFor='password'>
              Пароль
            </label>

            <input
              className='auth-panel__input'
              id='password'
              name='password'
              type='password'
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder='Введите пароль'
              autoComplete='current-password'
              required
            />
          </div>

          <div className='auth-panel__actions'>
            <label className='auth-panel__checkbox'>
              <input type='checkbox' />

              <span>Запомнить меня</span>
            </label>

            <button className='auth-panel__link' type='button'>
              Забыли пароль?
            </button>
          </div>

          {error && <p className='auth-panel__error'>{error}</p>}

          <button className='auth-panel__submit' type='submit' disabled={isSubmitting}>
            {isSubmitting ? 'Входим...' : 'Войти'}
          </button>
        </form>

        <div className='auth-panel__divider'>
          <span>Или войдите через</span>
        </div>

        <div className='auth-panel__socials'>
          <button
            className='auth-panel__social'
            type='button'
            aria-label='Войти через Discord'
            onClick={() => handleOAuth('discord')}
          >
            <span
              className='auth-panel__social-icon auth-panel__social-icon--discord'
              aria-hidden='true'
            />

            <span>Discord</span>
          </button>

          <button
            className='auth-panel__social'
            type='button'
            aria-label='Войти через Google'
            onClick={() => handleOAuth('google')}
          >
            <span
              className='auth-panel__social-icon auth-panel__social-icon--google'
              aria-hidden='true'
            />

            <span>Google</span>
          </button>

          <button
            className='auth-panel__social'
            type='button'
            aria-label='Войти через Twitch'
            onClick={() => handleOAuth('twitch')}
          >
            <span
              className='auth-panel__social-icon auth-panel__social-icon--twitch'
              aria-hidden='true'
            />

            <span>Twitch</span>
          </button>
        </div>

        <p className='auth-panel__footer'>
          Нет аккаунта?{' '}
          <button
            className='auth-panel__footer-link'
            type='button'
            onClick={() => navigate('/register')}
          >
            Зарегистрироваться
          </button>
        </p>

        <Link className='auth-panel__home-link' to='/'>
          ← На главную
        </Link>
      </section>
    </AuthLayout>
  );
}

export default LoginPage;
