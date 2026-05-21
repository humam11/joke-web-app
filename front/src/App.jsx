import ContentPage from './components/ContentPage.jsx';
import AuthPanel from './components/AuthPanel.jsx';
import LandingHeader from './components/LandingHeader.jsx';
import LandingHero from './components/LandingHero.jsx';
import MemeEditor from './components/MemeEditor.jsx';
import RandomJoke from './components/RandomJoke.jsx';
import TeaserSection from './components/TeaserSection.jsx';
import LandingFooter from './components/LandingFooter.jsx';

function App() {
  return (
    <div className="landing">
      <div className="landing__bg" aria-hidden="true" />
      <LandingHeader />
      <main className="landing__main">
        <LandingHero />
        <AuthPanel />
        <RandomJoke />
        <ContentPage />
        <MemeEditor />
        <TeaserSection />
      </main>
      <LandingFooter />
    </div>
  );
}

export default App;
