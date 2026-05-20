import ContentPage from './components/ContentPage.jsx';
import LandingHeader from './components/LandingHeader.jsx';
import LandingHero from './components/LandingHero.jsx';
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
        <RandomJoke />
        <ContentPage />
        <TeaserSection />
      </main>
      <LandingFooter />
    </div>
  );
}

export default App;
