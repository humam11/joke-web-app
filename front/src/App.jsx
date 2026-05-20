import { useEffect, useState } from 'react';

import AuthPanel from './components/AuthPanel.jsx';
import ContentPage from './components/ContentPage.jsx';
import LandingHeader from './components/LandingHeader.jsx';
import LandingHero from './components/LandingHero.jsx';
import MemeEditor from './components/MemeEditor.jsx';
import RandomJoke from './components/RandomJoke.jsx';
import TeaserSection from './components/TeaserSection.jsx';
import LandingFooter from './components/LandingFooter.jsx';

function App() {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    function handlePopState() {
      setPath(window.location.pathname);
    }

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  function navigate(nextPath) {
    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, '', nextPath);
    }

    setPath(nextPath);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const isContentPage = path === '/content';

  return (
    <div className="landing">
      <div className="landing__bg" aria-hidden="true" />
      <LandingHeader currentPath={path} onNavigate={navigate} />
      <main className="landing__main">
        {isContentPage ? (
          <ContentPage />
        ) : (
          <>
            <LandingHero />
            <AuthPanel />
            <RandomJoke />
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
