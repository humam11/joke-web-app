import AuthPanel from './components/AuthPanel.jsx';
import ContentPage from './components/ContentPage.jsx';
import LandingHeader from './components/LandingHeader.jsx';
import LandingHero from './components/LandingHero.jsx';
import MemeEditor from './components/MemeEditor.jsx';
import RandomJoke from './components/RandomJoke.jsx';
import TeaserSection from './components/TeaserSection.jsx';
import LandingFooter from './components/LandingFooter.jsx';

function App() {
  const isContentPage = window.location.pathname === '/content';

  return (
    <div className="landing">
      <div className="landing__bg" aria-hidden="true" />
      <LandingHeader />
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
