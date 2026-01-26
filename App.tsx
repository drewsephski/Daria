import React from 'react';
import { motion } from 'framer-motion';
import { Heart, ArrowDown, ExternalLink } from 'lucide-react';
import ReasonCard from './components/ReasonCard';
import ComplimentGenerator from './components/ComplimentGenerator';
import ApplicationForm from './components/ApplicationForm';
import AboutMe from './components/AboutMe';
import Button from './components/Button';
import { REASONS } from './constants';

const App: React.FC = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-pink-50 overflow-x-hidden selection:bg-pink-200 selection:text-pink-900">
      
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-pink-100 h-16 flex items-center justify-between px-6 md:px-12">
        <div className="flex items-center gap-2">
            <div className="bg-pink-500 p-1.5 rounded-lg">
                <Heart className="w-4 h-4 text-white fill-current" />
            </div>
            <span className="font-bold text-xl text-gray-800 tracking-tight font-display">Daria.</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-bold text-gray-600">
            <button onClick={() => scrollToSection('about')} className="hover:text-pink-500 transition-colors">The Lore</button>
            <button onClick={() => scrollToSection('reasons')} className="hover:text-pink-500 transition-colors">Why You're Cool</button>
            <button onClick={() => scrollToSection('affirmations')} className="hover:text-pink-500 transition-colors">Affirmations</button>
            <button onClick={() => scrollToSection('contact')} className="hover:text-pink-500 transition-colors">Inquiries</button>
        </div>
        <Button variant="primary" className="md:hidden !px-3 !py-2 text-xs" onClick={() => scrollToSection('contact')}>
            Apply
        </Button>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center relative pt-16">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 right-[10%] w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" />
            <div className="absolute bottom-20 left-[10%] w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" style={{ animationDelay: '1.5s' }} />
        </div>

        <div className="container mx-auto px-6 text-center relative z-10">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                <div className="inline-block bg-pink-100 text-pink-600 px-4 py-1.5 rounded-full text-sm font-bold mb-6 border border-pink-200 shadow-sm">
                    ⚠️ Warning: Excessive Charm Detected
                </div>
                <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-6 font-display leading-tight">
                    Welcome to the <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">Daria Fan Club</span>
                </h1>
                <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
                    A digital shrine dedicated to the person who has mastered the art of being effortlessly cool, moderately funny, and exceptionally pink.
                </p>
                
                <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                    <Button onClick={() => scrollToSection('about')}>
                        See the Evidence
                        {/* Animated content: Arrow moves down on hover */}
                        <ArrowDown className="w-4 h-4 ml-1 group-hover:translate-y-1 transition-transform duration-300" />
                    </Button>
                    <Button variant="secondary" onClick={() => scrollToSection('contact')}>
                        Schedule Appointment
                    </Button>
                </div>
            </motion.div>
        </div>
      </section>

      {/* About Section */}
      <AboutMe />

      {/* Reasons Grid */}
      <section id="reasons" className="py-24 px-6 bg-pink-50/50 relative">
         <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-display">Scientific Proof of Awesomeness</h2>
                <p className="text-gray-500 max-w-xl mx-auto">
                    Data collected from extensive research (mostly me observing you being cool).
                </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {REASONS.map((reason, index) => (
                    <ReasonCard key={index} {...reason} index={index} />
                ))}
            </div>
         </div>
      </section>

      {/* Interactive Section */}
      <section id="affirmations" className="py-24 px-6">
          <div className="container mx-auto max-w-4xl">
              <ComplimentGenerator />
          </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 px-6 bg-gradient-to-b from-white to-pink-50">
          <div className="container mx-auto max-w-4xl">
              <div className="flex flex-col md:flex-row items-center gap-12">
                  <div className="flex-1 text-center md:text-left">
                      <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 font-display">
                          Ready to hang out?
                      </h2>
                      <p className="text-gray-600 mb-8 text-lg">
                          Due to high demand (mostly from me), slots are filling up fast. Submit your request for a tailored experience involving snacks and questionable jokes.
                      </p>
                      <div className="bg-pink-100 p-6 rounded-2xl border border-pink-200 inline-block">
                          <p className="text-pink-800 font-bold text-sm mb-1 uppercase tracking-wider">Current Status</p>
                          <div className="flex items-center gap-2 text-gray-800 font-bold text-xl">
                              <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                              </span>
                              Accepting Applications
                          </div>
                      </div>
                  </div>
                  <div className="flex-1 w-full">
                      <ApplicationForm />
                  </div>
              </div>
          </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-12 border-t border-pink-100 text-center">
          <div className="container mx-auto px-6">
              <p className="flex items-center justify-center gap-2 text-gray-500 font-medium mb-4">
                  Made with <Heart className="w-4 h-4 text-red-500 fill-current animate-pulse" /> and too much coffee
              </p>
              <p className="text-xs text-gray-400">
                  © {new Date().getFullYear()} The Daria Appreciation Society. All rights reserved. <br/>
                  No refunds on bad puns.
              </p>
          </div>
      </footer>
    </div>
  );
};

export default App;