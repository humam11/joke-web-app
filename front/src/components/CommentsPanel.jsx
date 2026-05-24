import { useEffect, useState } from 'react';

import { apiRequest } from '../apiClient.js';

export default function CommentsPanel({ contentId, commentsCount = 0 }) {
  const [comments, setComments] = useState([]);
  const [user, setUser] = useState(null);
  const [body, setBody] = useState('');
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let isMounted = true;
    setStatus('loading');

    Promise.all([
      apiRequest(`/content/${contentId}/comments/`),
      apiRequest('/auth/me/').catch(() => ({ user: null })),
    ])
      .then(([commentsData, authData]) => {
        if (!isMounted) {
          return;
        }

        setComments(Array.isArray(commentsData.comments) ? commentsData.comments : []);
        setUser(authData.user ?? null);
        setStatus('ready');
      })
      .catch(() => {
        if (isMounted) {
          setStatus('error');
        }
      });

    return () => {
      isMounted = false;
    };
  }, [contentId]);

  async function submitComment(event) {
    event.preventDefault();

    if (!user) {
      setMessage('Войдите в аккаунт, чтобы оставить комментарий');
      return;
    }

    if (!body.trim()) {
      setMessage('Введите комментарий');
      return;
    }

    setStatus('submitting');
    setMessage('');

    try {
      const comment = await apiRequest(`/content/${contentId}/comments/`, {
        method: 'POST',
        body: JSON.stringify({ body }),
      });

      setComments((currentComments) => [...currentComments, comment]);
      setBody('');
      setStatus('ready');
      setMessage('Комментарий добавлен');
    } catch (error) {
      setStatus('ready');
      setMessage(error.message);
    }
  }

  return (
    <div className="comments-panel">
      <div className="comments-panel__head">
        <h4 className="comments-panel__title">Комментарии</h4>
        <span className="comments-panel__count">{comments.length || commentsCount}</span>
      </div>

      {status === 'loading' ? <p className="comments-panel__state">Загрузка комментариев...</p> : null}
      {status === 'error' ? <p className="comments-panel__state">Комментарии временно недоступны</p> : null}

      {comments.length ? (
        <ul className="comments-panel__list">
          {comments.map((comment) => (
            <li className="comments-panel__item" key={comment.id}>
              <p className="comments-panel__meta">{comment.author_name}</p>
              <p className="comments-panel__body">{comment.body}</p>
            </li>
          ))}
        </ul>
      ) : status === 'ready' ? (
        <p className="comments-panel__state">Пока нет комментариев</p>
      ) : null}

      {user ? (
        <form className="comments-panel__form" onSubmit={submitComment}>
          <p className="comments-panel__user">Вы комментируете как {user.username}</p>
          <textarea value={body} onChange={(event) => setBody(event.target.value)} placeholder="Написать комментарий" maxLength="1000" required />
          <button type="submit" disabled={status === 'submitting'}>
            {status === 'submitting' ? 'Отправка...' : 'Добавить'}
          </button>
        </form>
      ) : (
        <p className="comments-panel__state">
          <a href="#auth">Войдите в аккаунт</a>, чтобы оставить комментарий.
        </p>
      )}

      {message ? <p className="comments-panel__message">{message}</p> : null}
    </div>
  );
}
