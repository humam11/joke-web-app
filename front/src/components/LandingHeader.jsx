export default function LandingHeader({ currentPage = 'home', user = null }) {
  const isAdmin = Boolean(user?.is_admin);

  return (
    <header className="landing-header" role="banner">
      <a className="landing-header__brand" href="#">
        <span className="landing-header__logo" aria-hidden="true">
          :)
        </span>
        <div>
          <p className="landing-header__name">FunnyHub</p>
          <p className="landing-header__tagline">анекдоты и развлечения</p>
        </div>
      </a>
      <nav className="landing-header__nav" aria-label="Main">
        <a className={currentPage === 'home' ? 'is-active' : ''} href="#">
          Главная
        </a>
        <a className={currentPage === 'auth' ? 'is-active' : ''} href="#auth">
          Вход
        </a>
        {isAdmin ? (
          <a className={currentPage === 'admin' ? 'is-active' : ''} href="#admin">
            Админ-панель
          </a>
        ) : null}
      </nav>
    </header>
  );
}
