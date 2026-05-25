import { useEffect, useMemo, useState } from 'react';

import { apiFetch, apiRequest } from '../apiClient.js';
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

export default function ContentPage({ user = null }) {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [status, setStatus] = useState('loading');
  const [editingId, setEditingId] = useState(null);
  const [editingBody, setEditingBody] = useState('');
  const [adminMessage, setAdminMessage] = useState('');
  const isAdmin = Boolean(user?.is_admin);

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

  function startEditing(item) {
    setEditingId(item.id);
    setEditingBody(item.body);
    setAdminMessage('');
  }

  function cancelEditing() {
    setEditingId(null);
    setEditingBody('');
  }

  async function saveJoke(itemId) {
    setAdminMessage('');

    try {
      const data = await apiRequest(`/admin/content/${itemId}/`, {
        method: 'PATCH',
        body: JSON.stringify({ body: editingBody }),
      });

      const updatedItem = normalizeContentItem(data.item);
      setItems((currentItems) => currentItems.map((item) => (
        item.id === itemId ? updatedItem : item
      )));
      cancelEditing();
    } catch (error) {
      setAdminMessage(error.message);
    }
  }

  async function deleteJoke(itemId) {
    setAdminMessage('');

    try {
      await apiRequest(`/admin/content/${itemId}/`, { method: 'DELETE' });
      setItems((currentItems) => currentItems.filter((item) => item.id !== itemId));
      if (editingId === itemId) {
        cancelEditing();
      }
    } catch (error) {
      setAdminMessage(error.message);
    }
  }

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
      {adminMessage ? <p className="content-page__state">{adminMessage}</p> : null}

      <div className="content-page__grid">
        {items.map((item) => (
          <article className="content-card" key={item.id}>
            <div className="content-card__head">
              <div>
                <p className="content-card__meta">{item.category} / {item.type}</p>
                <h3 className="content-card__title">{item.title}</h3>
              </div>
              {isAdmin ? (
                <div className="content-card__admin-actions" aria-label="Управление шуткой">
                  <button title="Редактировать текст" type="button" onClick={() => startEditing(item)}>
                    ✎
                  </button>
                  <button className="content-card__delete" type="button" onClick={() => deleteJoke(item.id)}>
                    Удалить
                  </button>
                </div>
              ) : null}
            </div>
            {editingId === item.id ? (
              <div className="content-card__editor">
                <textarea value={editingBody} onChange={(event) => setEditingBody(event.target.value)} />
                <div className="content-card__editor-actions">
                  <button type="button" onClick={() => saveJoke(item.id)}>Сохранить</button>
                  <button type="button" onClick={cancelEditing}>Отмена</button>
                </div>
              </div>
            ) : (
              <p className="content-card__body">{item.body}</p>
            )}
            {editingId === item.id ? null : <CommentsPanel commentsCount={item.comments_count} contentId={item.id} />}
          </article>
        ))}
      </div>
    </section>
  );
}
