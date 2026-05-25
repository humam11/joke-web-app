import { useEffect, useMemo, useState } from 'react';

import { apiFetch } from '../apiClient.js';
import CommentsPanel from './CommentsPanel.jsx';

function getCategoryKey(category) {
  if (!category) {
    return '';
  }

  if (typeof category === 'object') {
    return String(category.slug ?? category.name ?? category.id ?? '');
  }

  return String(category);
}

function getCategoryLabel(category) {
  if (!category) {
    return 'Без категории';
  }

  if (typeof category === 'object') {
    return String(category.name ?? category.slug ?? category.id ?? 'Без категории');
  }

  return String(category);
}

function normalizeContentItem(item) {
  if (!item || typeof item !== 'object') {
    return null;
  }

  return {
    ...item,
    category: getCategoryLabel(item.category),
    type: item.content_type ?? item.type ?? 'joke',
  };
}

function normalizeContentPayload(data) {
  const normalizeItems = (items) => items.map(normalizeContentItem).filter(Boolean);

  if (Array.isArray(data)) {
    return { items: normalizeItems(data), categories: [] };
  }

  if (!data || typeof data !== 'object') {
    return { items: [], categories: [] };
  }

  return {
    items: Array.isArray(data.items) ? normalizeItems(data.items) : [],
    categories: Array.isArray(data.categories) ? data.categories : [],
  };
}

export default function ContentPage() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    setStatus('loading');
    apiFetch(`/content/?category=${encodeURIComponent(activeCategory)}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Не удалось загрузить контент');
        }
        return response.json();
      })
      .then((data) => {
        const payload = normalizeContentPayload(data);
        setItems(payload.items);
        setCategories(payload.categories);
        setStatus('ready');
      })
      .catch(() => {
        setStatus('error');
      });
  }, [activeCategory]);

  const tabs = useMemo(() => [
    { key: 'all', label: 'Все' },
    ...categories
      .map((category) => ({
        key: getCategoryKey(category),
        label: getCategoryLabel(category),
      }))
      .filter((category) => category.key),
  ], [categories]);

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
            <button className={activeCategory === category.key ? 'is-active' : ''} key={category.key} type="button" onClick={() => setActiveCategory(category.key)}>
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {status === 'loading' ? <p className="content-page__state">Загрузка...</p> : null}
      {status === 'error' ? <p className="content-page__state">Контент временно недоступен</p> : null}

      <div className={activeCategory === 'all' ? 'content-page__grid content-page__grid--single' : 'content-page__grid'}>
        {items.map((item) => (
          <article className="content-card" key={item.id}>
            <p className="content-card__meta">{item.category} / {item.type}</p>
            <h3 className="content-card__title">{item.title}</h3>
            <p className="content-card__body">{item.body}</p>
            <CommentsPanel commentsCount={item.comments_count} contentId={item.id} />
          </article>
        ))}
      </div>
    </section>
  );
}
