import { useEffect, useState } from 'react';

import { apiFetch } from '../apiClient.js';

function getJokeText(joke) {
  if (!joke) {
    return '';
  }

  if (joke.text) {
    return joke.text;
  }

  return [joke.setup, joke.delivery].filter(Boolean).join('\n');
}

export default function RandomJoke() {
  const [joke, setJoke] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  async function loadJoke() {
    setIsLoading(true);
    setMessage('');

    try {
      const response = await apiFetch('/jokes/random/');

      if (!response.ok) {
        throw new Error('Не удалось загрузить шутку');
      }

      const data = await response.json();
      setJoke(data);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function saveJoke() {
    if (!joke) {
      return;
    }

    setIsSaving(true);
    setMessage('');

    try {
      const response = await apiFetch('/jokes/saved/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(joke),
      });

      if (!response.ok) {
        throw new Error('Не удалось сохранить шутку');
      }

      setMessage('Шутка сохранена в базе');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsSaving(false);
    }
  }

  useEffect(() => {
    loadJoke();
  }, []);

  return (
    <section className="random-joke" aria-labelledby="random-joke-title">
      <div className="random-joke__content">
        <p className="random-joke__eyebrow">JokeAPI + Django DB</p>
        <h2 id="random-joke-title" className="random-joke__title">
          Случайная шутка
        </h2>
        <p className="random-joke__text">
          {isLoading ? 'Загружаем...' : getJokeText(joke) || 'Нажмите кнопку, чтобы получить шутку.'}
        </p>
        {joke?.category ? <p className="random-joke__meta">{joke.category}</p> : null}
        {message ? <p className="random-joke__message">{message}</p> : null}
      </div>
      <div className="random-joke__actions">
        <button className="random-joke__button" type="button" onClick={loadJoke} disabled={isLoading}>
          Еще шутку
        </button>
        <button className="random-joke__button random-joke__button--secondary" type="button" onClick={saveJoke} disabled={!joke || isSaving}>
          Сохранить
        </button>
      </div>
    </section>
  );
}
