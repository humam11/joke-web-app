import AuthPanel from './components/AuthPanel.jsx';
import ContentPage from './components/ContentPage.jsx';
import LandingHeader from './components/LandingHeader.jsx';
import LandingHero from './components/LandingHero.jsx';
import MemeEditor from './components/MemeEditor.jsx';
import RandomJoke from './components/RandomJoke.jsx';
import TeaserSection from './components/TeaserSection.jsx';
import LandingFooter from './components/LandingFooter.jsx';

function App() {
  const path = window.location.pathname;

  function renderPage() {
    if (path === '/auth') {
      return <AuthPanel />;
    }

    if (path === '/content') {
      return <ContentPage />;
    }

    if (path === '/meme') {
      return <MemeEditor />;
    }

    return (
      <>
        <LandingHero />
        <RandomJoke />
        <TeaserSection />
      </>
    );
  }

  return (
    <div className="landing">
      <div className="landing__bg" aria-hidden="true" />
      <LandingHeader currentPath={path} />
      <main className="landing__main">{renderPage()}</main>
      <LandingFooter />
    </div>
  );
}

export default App;
