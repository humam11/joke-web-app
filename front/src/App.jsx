import { useEffect, useState } from 'react';

import ContentPage from './components/ContentPage.jsx';
import AuthPanel from './components/AuthPanel.jsx';
import LandingHeader from './components/LandingHeader.jsx';
import LandingHero from './components/LandingHero.jsx';
import MemeEditor from './components/MemeEditor.jsx';
import RandomJoke from './components/RandomJoke.jsx';
import TeaserSection from './components/TeaserSection.jsx';
import LandingFooter from './components/LandingFooter.jsx';

function getCurrentPage() {
  return window.location.hash === '#auth' ? 'auth' : 'home';
}

function App() {
  const [page, setPage] = useState(getCurrentPage);

  useEffect(() => {
    function handleHashChange() {
      setPage(getCurrentPage());
    }

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return (
    <div className="landing">
      <div className="landing__bg" aria-hidden="true" />
      <LandingHeader currentPage={page} />
      <main className="landing__main">
        {page === 'auth' ? (
          <div className="auth-page">
            <AuthPanel />
          </div>
        ) : (
          <>
            <LandingHero />
            <RandomJoke />
            <ContentPage />
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
