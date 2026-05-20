export default function LandingHeader() {
  return (
    <header className="landing-header" role="banner">
      <div className="landing-header__brand">
        <span className="landing-header__logo" aria-hidden="true">
          ☺
        </span>
        <div>
          <p className="landing-header__name">FunnyHub</p>
          <p className="landing-header__tagline">анекдоты и развлечения</p>
        </div>
      </div>
      <p className="landing-header__badge">14+ · только хорошее настроение</p>
    </header>
  );
}
