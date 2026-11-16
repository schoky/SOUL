import { Link } from 'react-router-dom';

function MainFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className='main-footer'>
      <div className='main-footer__inner'>
        <div className='main-footer__left'>
          <span className='main-footer__copy'>© {year} SOUL</span>
        </div>

        <nav className='main-footer__nav' aria-label='Правовая информация'>
          <Link className='main-footer__link' to='/privacy'>
            Политика конфиденциальности
          </Link>

          <Link className='main-footer__link' to='/terms'>
            Пользовательское соглашение
          </Link>

          <a className='main-footer__link' href='mailto:dans4fonov@yandex.ru'>
            dans4fonov@yandex.ru
          </a>
        </nav>
      </div>
    </footer>
  );
}

export default MainFooter;
