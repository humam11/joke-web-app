export default function LandingHero() {
  return (
    <section className="landing-hero" aria-labelledby="landing-hero-title">
      <div className="landing-hero__burst" aria-hidden="true" />
      <h1 id="landing-hero-title" className="landing-hero__title">
        Смейтесь
        <span className="landing-hero__title-accent"> громче</span>
      </h1>
      <p className="landing-hero__subtitle">
        Короткие истории, шутки и лёгкий контент — всё в одном ярком месте. Заходите
        за порцией юмора без лишней суеты.
      </p>
      <ul className="landing-hero__chips" aria-label="Темы контента">
        <li>анекдоты</li>
        <li>истории</li>
        <li>категории</li>
        <li>новинки</li>
      </ul>
    </section>
  );
}
