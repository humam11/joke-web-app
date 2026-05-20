import { useEffect, useMemo, useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000/api';

export default function ContentPage() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    setStatus('loading');
    fetch(`${API_BASE_URL}/content/?category=${activeCategory}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Не удалось загрузить контент');
        }
        return response.json();
      })
      .then((data) => {
        setItems(data.items);
        setCategories(data.categories);
        setStatus('ready');
      })
      .catch(() => {
        setStatus('error');
      });
  }, [activeCategory]);

  const tabs = useMemo(() => ['all', ...categories], [categories]);

  return (
    <section className="content-page" aria-labelledby="content-page-title">
      <div className="content-page__head">
        <div>
          <p className="content-page__eyebrow">Лента FunnyHub</p>
          <h2 id="content-page-title" className="content-page__title">
            Страница с контентом
          </h2>
        </div>
        <div className="content-page__tabs" aria-label="Фильтр категорий">
          {tabs.map((category) => (
            <button className={activeCategory === category ? 'is-active' : ''} key={category} type="button" onClick={() => setActiveCategory(category)}>
              {category === 'all' ? 'Все' : category}
            </button>
          ))}
        </div>
      </div>

      {status === 'loading' ? <p className="content-page__state">Загрузка...</p> : null}
      {status === 'error' ? <p className="content-page__state">Контент временно недоступен</p> : null}

      <div className="content-page__grid">
        {items.map((item) => (
          <article className="content-card" key={item.id}>
            <p className="content-card__meta">{item.category} · {item.type}</p>
            <h3 className="content-card__title">{item.title}</h3>
            <p className="content-card__body">{item.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
