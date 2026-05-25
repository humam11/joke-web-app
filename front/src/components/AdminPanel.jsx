import { useEffect, useMemo, useState } from 'react';

import { apiRequest } from '../apiClient.js';

function getUserStatus(user) {
  return user.is_active ? 'Активен' : 'Забанен';
}

export default function AdminPanel({ currentUser = null }) {
  const [viewer, setViewer] = useState(currentUser);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [jokeForm, setJokeForm] = useState({ category: '', title: '', body: '' });
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAdmin = Boolean(viewer?.is_admin);

  useEffect(() => {
    setViewer(currentUser);
  }, [currentUser]);

  useEffect(() => {
    let isMounted = true;

    async function loadAdminData() {
      setStatus('loading');
      setMessage('');

      try {
        const me = await apiRequest('/auth/me/');
        if (!isMounted) {
          return;
        }

        setViewer(me.user);

        if (!me.user?.is_admin) {
          setStatus('forbidden');
          return;
        }

        const [usersPayload, categoriesPayload] = await Promise.all([
          apiRequest('/admin/users/'),
          apiRequest('/categories/'),
        ]);

        if (!isMounted) {
          return;
        }

        setUsers(usersPayload.users ?? []);
        setCategories(categoriesPayload);
        setJokeForm((form) => ({
          ...form,
          category: form.category || String(categoriesPayload[0]?.id ?? ''),
        }));
        setStatus('ready');
      } catch (error) {
        if (isMounted) {
          setStatus('error');
          setMessage(error.message);
        }
      }
    }

    loadAdminData();

    return () => {
      isMounted = false;
    };
  }, []);

  const regularUsers = useMemo(
    () => users.filter((user) => !user.is_admin),
    [users],
  );

  async function toggleBan(user) {
    setMessage('');

    try {
      const action = user.is_active ? 'ban' : 'unban';
      const data = await apiRequest(`/admin/users/${user.id}/${action}/`, {
        method: 'POST',
        body: JSON.stringify({}),
      });

      setUsers((currentUsers) => currentUsers.map((item) => (
        item.id === data.user.id ? data.user : item
      )));
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function submitJoke(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    try {
      await apiRequest('/admin/jokes/', {
        method: 'POST',
        body: JSON.stringify({
          category: jokeForm.category,
          title: jokeForm.title,
          body: jokeForm.body,
        }),
      });
      setJokeForm((form) => ({ ...form, title: '', body: '' }));
      setMessage('Шутка добавлена и появится на странице с шутками.');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (status === 'loading') {
    return <p className="admin-panel__state">Загрузка админ-панели...</p>;
  }

  if (status === 'forbidden' || !isAdmin) {
    return (
      <section className="admin-panel" aria-labelledby="admin-panel-title">
        <p className="admin-panel__eyebrow">Администрирование</p>
        <h2 id="admin-panel-title" className="admin-panel__title">Доступ закрыт</h2>
        <p className="admin-panel__text">Эта страница доступна только администратору.</p>
      </section>
    );
  }

  if (status === 'error') {
    return (
      <section className="admin-panel" aria-labelledby="admin-panel-title">
        <p className="admin-panel__eyebrow">Администрирование</p>
        <h2 id="admin-panel-title" className="admin-panel__title">Не удалось загрузить панель</h2>
        <p className="admin-panel__text">{message || 'Попробуйте обновить страницу.'}</p>
      </section>
    );
  }

  return (
    <section className="admin-panel" aria-labelledby="admin-panel-title">
      <div className="admin-panel__head">
        <div>
          <p className="admin-panel__eyebrow">Администрирование</p>
          <h2 id="admin-panel-title" className="admin-panel__title">Панель администратора</h2>
        </div>
        <p className="admin-panel__viewer">Вы вошли как {viewer.username}</p>
      </div>

      <div className="admin-panel__grid">
        <section className="admin-section" aria-labelledby="admin-users-title">
          <h3 id="admin-users-title" className="admin-section__title">Пользователи</h3>
          <div className="admin-users">
            {regularUsers.length ? regularUsers.map((user) => (
              <div className="admin-user" key={user.id}>
                <div>
                  <p className="admin-user__name">{user.username}</p>
                  <p className="admin-user__meta">{user.email || 'email не указан'} / {getUserStatus(user)}</p>
                </div>
                <button
                  className={user.is_active ? 'admin-panel__button admin-panel__button--danger' : 'admin-panel__button'}
                  type="button"
                  onClick={() => toggleBan(user)}
                >
                  {user.is_active ? 'Забанить' : 'Разбанить'}
                </button>
              </div>
            )) : (
              <p className="admin-panel__text">Пока нет обычных пользователей.</p>
            )}
          </div>
        </section>

        <section className="admin-section" aria-labelledby="admin-jokes-title">
          <h3 id="admin-jokes-title" className="admin-section__title">Добавить шутку</h3>
          <form className="admin-joke-form" onSubmit={submitJoke}>
            <label>
              Категория
              <select
                value={jokeForm.category}
                onChange={(event) => setJokeForm({ ...jokeForm, category: event.target.value })}
                required
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Заголовок шутки
              <input
                value={jokeForm.title}
                onChange={(event) => setJokeForm({ ...jokeForm, title: event.target.value })}
                placeholder="Введите заголовок"
                required
              />
            </label>
            <label>
              Текст шутки
              <textarea
                value={jokeForm.body}
                onChange={(event) => setJokeForm({ ...jokeForm, body: event.target.value })}
                placeholder="Введите текст шутки"
                required
              />
            </label>
            <button className="admin-panel__button" type="submit" disabled={isSubmitting}>
              Добавить шутку
            </button>
          </form>
        </section>
      </div>

      {message ? <p className="admin-panel__message">{message}</p> : null}
    </section>
  );
}
