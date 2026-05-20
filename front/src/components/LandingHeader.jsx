export default function LandingHeader({ currentPath, onNavigate }) {
  return (
    <header className="landing-header" role="banner">
      <button className="landing-header__brand" type="button" onClick={() => onNavigate('/')}>
        <span className="landing-header__logo" aria-hidden="true">
          ☺
        </span>
        <div>
          <p className="landing-header__name">FunnyHub</p>
          <p className="landing-header__tagline">анекдоты и развлечения</p>
        </div>
      </button>
      <nav className="landing-header__nav" aria-label="Основная навигация">
        <button className={currentPath === '/' ? 'is-active' : ''} type="button" onClick={() => onNavigate('/')}>
          Главная
        </button>
        <button className={currentPath === '/content' ? 'is-active' : ''} type="button" onClick={() => onNavigate('/content')}>
          Контент
        </button>
      </nav>
      <p className="landing-header__badge">14+ · только хорошее настроение</p>
    </header>
  );
}
