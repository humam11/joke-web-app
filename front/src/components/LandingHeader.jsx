export default function LandingHeader({ currentPath }) {
  return (
    <header className="landing-header" role="banner">
      <a className="landing-header__brand" href="/">
        <span className="landing-header__logo" aria-hidden="true">
          ☺
        </span>
        <div>
          <p className="landing-header__name">FunnyHub</p>
          <p className="landing-header__tagline">анекдоты и развлечения</p>
        </div>
      </a>
      <nav className="landing-header__nav" aria-label="Основная навигация">
        <a className={currentPath === '/' ? 'is-active' : ''} href="/">
          Главная
        </a>
        <a className={currentPath === '/auth' ? 'is-active' : ''} href="/auth">
          Аккаунт
        </a>
        <a className={currentPath === '/content' ? 'is-active' : ''} href="/content">
          Контент
        </a>
        <a className={currentPath === '/meme' ? 'is-active' : ''} href="/meme">
          Мемы
        </a>
      </nav>
      <p className="landing-header__badge">14+ · только хорошее настроение</p>
    </header>
  );
}
