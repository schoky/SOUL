import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import AuthLayout from '../../components/auth/AuthLayout';
import { getOAuthUrl, type OAuthProviderId } from '../../services/api/auth';
import { useAuthStore } from '../../stores/authStore';

function RegisterPage() {
  const navigate = useNavigate();

  const register = useAuthStore((state) => state.register);

  const [email, setEmail] = useState('');

  const [nickname, setNickname] = useState('');

  const [password, setPassword] = useState('');

  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

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

    if (password !== confirmPassword) {
      setError('Пароли не совпадают');

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
        setError('Не удалось выполнить регистрацию');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout>
      <section className='auth-panel'>
        <h1 className='auth-panel__title'>Регистрация</h1>

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
              autoComplete='email'
              required
            />
          </div>

          <div className='auth-panel__field'>
            <label className='auth-panel__label' htmlFor='nickname'>
              Никнейм
            </label>

            <input
              className='auth-panel__input'
              id='nickname'
              name='nickname'
              type='text'
              value={nickname}
              onChange={(event) => setNickname(event.target.value)}
              autoComplete='nickname'
              minLength={3}
              maxLength={20}
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
              autoComplete='new-password'
              minLength={8}
              required
            />
          </div>

          <div className='auth-panel__field'>
            <label className='auth-panel__label' htmlFor='confirm-password'>
              Повторите пароль
            </label>

            <input
              className='auth-panel__input'
              id='confirm-password'
              name='confirm-password'
              type='password'
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              autoComplete='new-password'
              required
            />
          </div>

          {error && <p className='auth-panel__error'>{error}</p>}

          <button className='auth-panel__submit' type='submit' disabled={isSubmitting}>
            {isSubmitting ? 'Регистрируем...' : 'Зарегистрироваться'}
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
          Уже есть аккаунт?{' '}
          <button
            className='auth-panel__footer-link'
            type='button'
            onClick={() => navigate('/login')}
          >
            Войти
          </button>
        </p>

        <Link className='auth-panel__home-link' to='/'>
          ← На главную
        </Link>
      </section>
    </AuthLayout>
  );
}

export default RegisterPage;
