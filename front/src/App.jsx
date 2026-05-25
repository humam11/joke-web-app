import { useEffect, useState } from 'react';

import ContentPage from './components/ContentPage.jsx';
import AdminPanel from './components/AdminPanel.jsx';
import AuthPanel from './components/AuthPanel.jsx';
import LandingHeader from './components/LandingHeader.jsx';
import LandingHero from './components/LandingHero.jsx';
import MemeEditor from './components/MemeEditor.jsx';
import RandomJoke from './components/RandomJoke.jsx';
import TeaserSection from './components/TeaserSection.jsx';
import LandingFooter from './components/LandingFooter.jsx';
import { apiRequest } from './apiClient.js';

function getCurrentPage() {
  if (window.location.hash === '#auth') {
    return 'auth';
  }

  if (window.location.hash === '#admin') {
    return 'admin';
  }

  return 'home';
}

function App() {
  const [page, setPage] = useState(getCurrentPage);
  const [user, setUser] = useState(null);

  useEffect(() => {
    function handleHashChange() {
      setPage(getCurrentPage());
    }

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    apiRequest('/auth/me/')
      .then((data) => setUser(data.user))
      .catch(() => setUser(null));
  }, []);

  return (
    <div className="landing">
      <div className="landing__bg" aria-hidden="true" />
      <LandingHeader currentPage={page} user={user} />
      <main className="landing__main">
        {page === 'auth' ? (
          <div className="auth-page">
            <AuthPanel onUserChange={setUser} user={user} />
          </div>
        ) : page === 'admin' ? (
          <AdminPanel currentUser={user} />
        ) : (
          <>
            <LandingHero />
            <RandomJoke />
            <ContentPage user={user} />
            <MemeEditor />
            <TeaserSection />
          </>
        )}
      </main>
      <LandingFooter />
    </div>
  );
}

export default App;
