import Header from '../components/Header';
import Hero from '../components/Hero';
import Features from '../components/Features';
import HowItWorks from '../components/HowItWorks';
import Testimonials from '../components/Testimonials';
import Chatbot from '../components/Chatbot';

const LandingPage = () => {
  return (
    <div style={{ backgroundColor: 'var(--bg-primary)' }}>
      <Header />
      <Hero />
      <Features />
      <HowItWorks />
      <Testimonials />
      <Chatbot />
    </div>
  );
};

export default LandingPage;
