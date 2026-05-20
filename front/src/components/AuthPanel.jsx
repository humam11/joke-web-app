import { useEffect, useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000/api';

export default function AuthPanel() {
  const [mode, setMode] = useState('login');
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function request(path, options = {}) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers ?? {}),
      },
      ...options,
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail ?? 'Ошибка авторизации');
    }

    return data;
  }

  async function submit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    try {
      const data = await request(`/auth/${mode}/`, {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setUser(data.user);
      setMessage(mode === 'login' ? 'Вход выполнен' : 'Аккаунт создан');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function signOut() {
    const data = await request('/auth/logout/', { method: 'POST', body: '{}' });
    setUser(data.user);
    setMessage('Вы вышли из аккаунта');
  }

  useEffect(() => {
    request('/auth/me/')
      .then((data) => setUser(data.user))
      .catch(() => setUser(null));
  }, []);

  return (
    <section className="auth-panel" aria-labelledby="auth-panel-title">
      <div>
        <p className="auth-panel__eyebrow">Личный кабинет</p>
        <h2 id="auth-panel-title" className="auth-panel__title">
          {user ? `Привет, ${user.username}` : 'Вход и регистрация'}
        </h2>
        <p className="auth-panel__text">
          {user ? 'Аккаунт готов для сохранения контента и будущих комментариев.' : 'Создайте аккаунт или войдите, чтобы привязать действия к профилю.'}
        </p>
      </div>

      {user ? (
        <button className="auth-panel__button" type="button" onClick={signOut}>
          Выйти
        </button>
      ) : (
        <form className="auth-panel__form" onSubmit={submit}>
          <div className="auth-panel__tabs" aria-label="Режим авторизации">
            <button className={mode === 'login' ? 'is-active' : ''} type="button" onClick={() => setMode('login')}>
              Вход
            </button>
            <button className={mode === 'register' ? 'is-active' : ''} type="button" onClick={() => setMode('register')}>
              Регистрация
            </button>
          </div>
          <input value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} placeholder="Логин" required />
          {mode === 'register' ? (
            <input value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="Email" type="email" />
          ) : null}
          <input value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="Пароль" type="password" required />
          <button className="auth-panel__button" type="submit" disabled={isSubmitting}>
            {mode === 'login' ? 'Войти' : 'Создать'}
          </button>
        </form>
      )}

      {message ? <p className="auth-panel__message">{message}</p> : null}
    </section>
  );
}
