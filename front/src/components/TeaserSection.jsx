const teasers = [
  {
    id: '1',
    label: 'Классика',
    text: '— Доктор, я всё забываю!\n— А это давно?\n— Что «давно»?',
  },
  {
    id: '2',
    label: 'Быстрая улыбка',
    text: 'Программист заходит в бар и заказывает 0.000000001 пива.',
  },
  {
    id: '3',
    label: 'Настроение',
    text: 'Если день не задался — пусть хотя бы цвет этой страницы поднимет настроение.',
  },
];

export default function TeaserSection() {
  return (
    <section className="teaser" aria-labelledby="teaser-title">
      <h2 id="teaser-title" className="teaser__title">
        Загляните в атмосферу
      </h2>
      <p className="teaser__lead">Примеры карточек — просто декор, без действий.</p>
      <div className="teaser__grid">
        {teasers.map((item, index) => (
          <article
            key={item.id}
            className={`teaser-card teaser-card--tone-${(index % 3) + 1}`}
          >
            <p className="teaser-card__label">{item.label}</p>
            <p className="teaser-card__text">{item.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
