export default function LandingHeader({ currentPath, onNavigate }) {
  function handleNavigation(event, path) {
    event.preventDefault();
    onNavigate(path);
  }

  return (
    <header className="landing-header" role="banner">
      <a className="landing-header__brand" href="/" onClick={(event) => handleNavigation(event, '/')}>
        <span className="landing-header__logo" aria-hidden="true">
          ☺
        </span>
        <div>
          <p className="landing-header__name">FunnyHub</p>
          <p className="landing-header__tagline">анекдоты и развлечения</p>
        </div>
      </a>
      <nav className="landing-header__nav" aria-label="Основная навигация">
        <a className={currentPath === '/' ? 'is-active' : ''} href="/" onClick={(event) => handleNavigation(event, '/')}>
          Главная
        </a>
        <a className={currentPath === '/content' ? 'is-active' : ''} href="/content" onClick={(event) => handleNavigation(event, '/content')}>
          Контент
        </a>
      </nav>
      <p className="landing-header__badge">14+ · только хорошее настроение</p>
    </header>
  );
}
