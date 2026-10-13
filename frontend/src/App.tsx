import React from 'react';
import { Dumbbell, ShieldCheck, QrCode, Sparkles } from 'lucide-react';

export const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-charcoal-900 text-gray-100 flex flex-col justify-between">
      <header className="border-b border-charcoal-800 bg-charcoal-950/80 backdrop-blur sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-primary rounded-lg text-white">
            <Dumbbell className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-xl tracking-tight text-white">
              TITAN <span className="text-orange-primary">FITNESS</span>
            </h1>
            <p className="text-xs text-gray-400">Gym & Fitness Management System</p>
          </div>
        </div>

        <nav className="flex items-center gap-4">
          <button className="text-sm font-medium text-gray-300 hover:text-white transition">
            Plans
          </button>
          <button className="text-sm font-medium text-gray-300 hover:text-white transition">
            Classes
          </button>
          <button className="px-4 py-2 text-sm font-semibold rounded-lg bg-orange-primary hover:bg-orange-hover text-white shadow-lg shadow-orange-primary/20 transition">
            Sign In
          </button>
        </nav>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-16 flex-1 flex flex-col items-center text-center justify-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-primary/10 border border-orange-primary/30 text-orange-primary text-xs font-semibold mb-6">
          <Sparkles className="w-3.5 h-3.5" /> Next-Generation Gym Management Platform
        </div>
        <h2 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight max-w-3xl leading-tight">
          Empowering Your Gym with <span className="text-orange-primary">Precision & AI</span>
        </h2>
        <p className="mt-6 text-lg text-gray-400 max-w-2xl leading-relaxed">
          Integrated member management, 60-second rotating QR check-in, Chapa instant online payments, trainer workout builder, and AI-assisted coaching.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 w-full text-left">
          <div className="p-6 rounded-xl bg-charcoal-850 border border-charcoal-800 hover:border-orange-primary/50 transition">
            <div className="w-10 h-10 rounded-lg bg-charcoal-800 flex items-center justify-center text-orange-primary mb-4">
              <QrCode className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-lg text-white mb-2">Dynamic QR Check-In</h3>
            <p className="text-sm text-gray-400">
              Anti-passback 60s rotating QR tokens with receptionist verification and 2-hour repeat prevention.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-charcoal-850 border border-charcoal-800 hover:border-orange-primary/50 transition">
            <div className="w-10 h-10 rounded-lg bg-charcoal-800 flex items-center justify-center text-orange-primary mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-lg text-white mb-2">Automated Expiry & Chapa</h3>
            <p className="text-sm text-gray-400">
              Verified webhook payment confirmation, daily automated expiry jobs, and 7-day/1-day email reminders.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-charcoal-850 border border-charcoal-800 hover:border-orange-primary/50 transition">
            <div className="w-10 h-10 rounded-lg bg-charcoal-800 flex items-center justify-center text-orange-primary mb-4">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-lg text-white mb-2">Gemini AI Coaching</h3>
            <p className="text-sm text-gray-400">
              Trainer-approved workout drafts, fitness Q&A, and strict schema validation with medical safety notices.
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t border-charcoal-800 py-6 px-6 text-center text-xs text-gray-500">
        &copy; {new Date().getFullYear()} Titan Fitness Systems. All rights reserved.
      </footer>
    </div>
  );
};

export default App;
