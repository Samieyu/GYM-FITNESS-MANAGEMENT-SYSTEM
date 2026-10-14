import React, { useState, useEffect } from 'react';
import { 
  Dumbbell, 
  ShieldCheck, 
  QrCode, 
  Sparkles, 
  Check, 
  X, 
  Users, 
  UserCheck, 
  Calendar,
  Lock,
  Mail,
  ArrowRight,
  Server
} from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'home' | 'plans' | 'classes'>('home');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'member' | 'trainer' | 'reception' | 'admin'>('member');
  const [email, setEmail] = useState('member@gymfitness.local');
  const [password, setPassword] = useState('Member@123456');
  const [backendStatus, setBackendStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [authMessage, setAuthMessage] = useState<string | null>(null);

  // Check backend health
  useEffect(() => {
    fetch('/health')
      .then((res) => {
        if (res.ok) setBackendStatus('connected');
        else setBackendStatus('disconnected');
      })
      .catch(() => setBackendStatus('disconnected'));
  }, []);

  const handleRoleQuickSelect = (role: 'member' | 'trainer' | 'reception' | 'admin') => {
    setSelectedRole(role);
    setAuthMessage(null);
    if (role === 'admin') {
      setEmail('admin@gymfitness.local');
      setPassword('Admin@123456');
    } else if (role === 'reception') {
      setEmail('reception@gymfitness.local');
      setPassword('Reception@123456');
    } else if (role === 'trainer') {
      setEmail('trainer@gymfitness.local');
      setPassword('Trainer@123456');
    } else {
      setEmail('member@gymfitness.local');
      setPassword('Member@123456');
    }
  };

  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthMessage(`Logged in as ${selectedRole.toUpperCase()} (${email}). Full token session & dashboard routing is ready for Phase 2.`);
  };

  return (
    <div className="min-h-screen bg-charcoal-900 text-gray-100 flex flex-col justify-between selection:bg-orange-primary selection:text-white">
      {/* Sticky Top Header */}
      <header className="border-b border-charcoal-800 bg-charcoal-950/90 backdrop-blur sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div 
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => setActiveTab('home')}
        >
          <div className="p-2 bg-orange-primary rounded-lg text-white shadow-md shadow-orange-primary/30">
            <Dumbbell className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-xl tracking-tight text-white flex items-center gap-1.5">
              TITAN <span className="text-orange-primary">FITNESS</span>
            </h1>
            <p className="text-xs text-gray-400">Gym & Fitness Management System</p>
          </div>
        </div>

        {/* Navigation & Backend Health Badge */}
        <div className="flex items-center gap-6">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-charcoal-850 border border-charcoal-800 text-xs text-gray-400">
            <Server className={`w-3.5 h-3.5 ${backendStatus === 'connected' ? 'text-green-500' : 'text-amber-500'}`} />
            <span>API: {backendStatus === 'connected' ? 'Connected (Port 5000)' : 'Checking...'}</span>
          </div>

          <nav className="flex items-center gap-3">
            <button 
              onClick={() => setActiveTab('home')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition ${activeTab === 'home' ? 'text-orange-primary bg-charcoal-800' : 'text-gray-300 hover:text-white'}`}
            >
              Home
            </button>
            <button 
              onClick={() => setActiveTab('plans')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition ${activeTab === 'plans' ? 'text-orange-primary bg-charcoal-800' : 'text-gray-300 hover:text-white'}`}
            >
              Plans
            </button>
            <button 
              onClick={() => setActiveTab('classes')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition ${activeTab === 'classes' ? 'text-orange-primary bg-charcoal-800' : 'text-gray-300 hover:text-white'}`}
            >
              Classes
            </button>
            <button 
              onClick={() => setIsAuthModalOpen(true)}
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-orange-primary hover:bg-orange-hover text-white shadow-lg shadow-orange-primary/20 transition active:scale-95"
            >
              Sign In
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-6 py-12 flex-1 w-full flex flex-col justify-center">
        {/* TAB 1: HOME VIEW */}
        {activeTab === 'home' && (
          <div className="flex flex-col items-center text-center justify-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-primary/10 border border-orange-primary/30 text-orange-primary text-xs font-semibold mb-6">
              <Sparkles className="w-3.5 h-3.5" /> Next-Generation Gym Management Platform
            </div>
            
            <h2 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight max-w-3xl leading-tight">
              Empowering Your Gym with <span className="text-orange-primary">Precision & AI</span>
            </h2>
            
            <p className="mt-6 text-lg text-gray-400 max-w-2xl leading-relaxed">
              Integrated member management, 60-second rotating QR check-in, Chapa instant online payments, trainer workout builder, and Gemini AI coaching.
            </p>

            <div className="flex flex-wrap gap-4 mt-8 justify-center">
              <button 
                onClick={() => setIsAuthModalOpen(true)}
                className="px-6 py-3 rounded-lg bg-orange-primary hover:bg-orange-hover text-white font-semibold flex items-center gap-2 shadow-lg shadow-orange-primary/25 transition"
              >
                Launch Portal <ArrowRight className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setActiveTab('plans')}
                className="px-6 py-3 rounded-lg bg-charcoal-850 hover:bg-charcoal-800 text-gray-200 border border-charcoal-700 font-semibold transition"
              >
                View Membership Plans
              </button>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 w-full text-left">
              <div className="p-6 rounded-xl bg-charcoal-850 border border-charcoal-800 hover:border-orange-primary/50 transition">
                <div className="w-10 h-10 rounded-lg bg-charcoal-800 flex items-center justify-center text-orange-primary mb-4">
                  <QrCode className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-lg text-white mb-2">Dynamic QR Check-In</h3>
                <p className="text-sm text-gray-400">
                  Anti-passback 60s rotating QR tokens with receptionist verification and 2-hour repeat check-in prevention.
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
          </div>
        )}

        {/* TAB 2: PLANS VIEW */}
        {activeTab === 'plans' && (
          <div className="w-full">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
                Membership <span className="text-orange-primary">Plans</span>
              </h2>
              <p className="mt-4 text-gray-400">Select the tier tailored to your fitness objectives.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Bronze */}
              <div className="p-8 rounded-2xl bg-charcoal-850 border border-charcoal-800 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white">Standard Monthly</h3>
                  <p className="text-xs text-gray-400 mt-1">General gym & equipment access</p>
                  <div className="mt-6 mb-8">
                    <span className="text-4xl font-extrabold text-white">1,500</span>
                    <span className="text-sm text-gray-400"> ETB / Month</span>
                  </div>
                  <ul className="space-y-3 text-sm text-gray-300">
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-orange-primary" /> Full Gym Floor Access</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-orange-primary" /> Locker Room & Showers</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-orange-primary" /> 60s Dynamic QR Pass</li>
                  </ul>
                </div>
                <button 
                  onClick={() => setIsAuthModalOpen(true)}
                  className="mt-8 w-full py-3 rounded-lg bg-charcoal-800 hover:bg-charcoal-700 font-semibold text-white transition"
                >
                  Choose Monthly
                </button>
              </div>

              {/* Silver (Featured) */}
              <div className="p-8 rounded-2xl bg-charcoal-850 border-2 border-orange-primary relative flex flex-col justify-between shadow-2xl shadow-orange-primary/10">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-orange-primary text-white text-xs font-bold uppercase tracking-wider">
                  Most Popular
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Quarterly Fitness</h3>
                  <p className="text-xs text-gray-400 mt-1">3 Months unlimited gym + assessment</p>
                  <div className="mt-6 mb-8">
                    <span className="text-4xl font-extrabold text-white">4,000</span>
                    <span className="text-sm text-gray-400"> ETB / 3 Months</span>
                  </div>
                  <ul className="space-y-3 text-sm text-gray-300">
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-orange-primary" /> Unlimited Gym Access</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-orange-primary" /> 1 Free Trainer Assessment</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-orange-primary" /> Progress Graph Tracking</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-orange-primary" /> Group Class Bookings</li>
                  </ul>
                </div>
                <button 
                  onClick={() => setIsAuthModalOpen(true)}
                  className="mt-8 w-full py-3 rounded-lg bg-orange-primary hover:bg-orange-hover font-semibold text-white shadow-lg shadow-orange-primary/30 transition"
                >
                  Choose Quarterly
                </button>
              </div>

              {/* Gold VIP */}
              <div className="p-8 rounded-2xl bg-charcoal-850 border border-charcoal-800 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white">Annual VIP Elite</h3>
                  <p className="text-xs text-gray-400 mt-1">Full 12 Months VIP Access</p>
                  <div className="mt-6 mb-8">
                    <span className="text-4xl font-extrabold text-white">14,000</span>
                    <span className="text-sm text-gray-400"> ETB / Year</span>
                  </div>
                  <ul className="space-y-3 text-sm text-gray-300">
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-orange-primary" /> 24/7 Access & Sauna</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-orange-primary" /> Dedicated Personal Trainer</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-orange-primary" /> AI Custom Workout Plan</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-orange-primary" /> Priority Class Booking</li>
                  </ul>
                </div>
                <button 
                  onClick={() => setIsAuthModalOpen(true)}
                  className="mt-8 w-full py-3 rounded-lg bg-charcoal-800 hover:bg-charcoal-700 font-semibold text-white transition"
                >
                  Choose Annual VIP
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CLASSES VIEW */}
        {activeTab === 'classes' && (
          <div className="w-full">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
                Scheduled <span className="text-orange-primary">Classes</span>
              </h2>
              <p className="mt-4 text-gray-400">Instructor-led training sessions with capacity and waitlist management.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-xl bg-charcoal-850 border border-charcoal-800">
                <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-orange-primary" /> Mon & Wed • 07:00 AM</span>
                  <span className="px-2 py-0.5 rounded bg-green-950 text-green-400 border border-green-800">12 / 15 Booked</span>
                </div>
                <h3 className="text-lg font-bold text-white">HIIT Strength & Cardio</h3>
                <p className="text-sm text-gray-400 mt-2">Coach Alex Strong • Main Studio</p>
                <button 
                  onClick={() => setIsAuthModalOpen(true)}
                  className="mt-6 w-full py-2.5 rounded-lg bg-charcoal-800 hover:bg-orange-primary font-semibold text-white transition"
                >
                  Reserve Spot
                </button>
              </div>

              <div className="p-6 rounded-xl bg-charcoal-850 border border-charcoal-800">
                <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-orange-primary" /> Tue & Thu • 06:00 PM</span>
                  <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800">Full (3 on Waitlist)</span>
                </div>
                <h3 className="text-lg font-bold text-white">Powerlifting & Deadlift Clinic</h3>
                <p className="text-sm text-gray-400 mt-2">Coach Alex Strong • Heavy Iron Zone</p>
                <button 
                  onClick={() => setIsAuthModalOpen(true)}
                  className="mt-6 w-full py-2.5 rounded-lg bg-charcoal-800 hover:bg-orange-primary font-semibold text-white transition"
                >
                  Join Waitlist
                </button>
              </div>

              <div className="p-6 rounded-xl bg-charcoal-850 border border-charcoal-800">
                <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-orange-primary" /> Saturday • 09:00 AM</span>
                  <span className="px-2 py-0.5 rounded bg-green-950 text-green-400 border border-green-800">8 / 20 Booked</span>
                </div>
                <h3 className="text-lg font-bold text-white">Mobility & Functional Core</h3>
                <p className="text-sm text-gray-400 mt-2">Studio 2 • All Levels</p>
                <button 
                  onClick={() => setIsAuthModalOpen(true)}
                  className="mt-6 w-full py-2.5 rounded-lg bg-charcoal-800 hover:bg-orange-primary font-semibold text-white transition"
                >
                  Reserve Spot
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Interactive Sign-In / Role Modal */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-charcoal-850 border border-charcoal-700 w-full max-w-md rounded-2xl p-6 shadow-2xl relative">
            <button 
              onClick={() => setIsAuthModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-orange-primary/10 border border-orange-primary/30 rounded-lg text-orange-primary">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Portal Sign In</h3>
                <p className="text-xs text-gray-400">Select your role to load demo credentials</p>
              </div>
            </div>

            {/* Role Quick Selector */}
            <div className="grid grid-cols-4 gap-2 mb-6">
              <button 
                type="button"
                onClick={() => handleRoleQuickSelect('member')}
                className={`py-2 text-xs font-semibold rounded-lg border transition ${selectedRole === 'member' ? 'bg-orange-primary text-white border-orange-primary' : 'bg-charcoal-800 text-gray-300 border-charcoal-700 hover:bg-charcoal-700'}`}
              >
                Member
              </button>
              <button 
                type="button"
                onClick={() => handleRoleQuickSelect('trainer')}
                className={`py-2 text-xs font-semibold rounded-lg border transition ${selectedRole === 'trainer' ? 'bg-orange-primary text-white border-orange-primary' : 'bg-charcoal-800 text-gray-300 border-charcoal-700 hover:bg-charcoal-700'}`}
              >
                Trainer
              </button>
              <button 
                type="button"
                onClick={() => handleRoleQuickSelect('reception')}
                className={`py-2 text-xs font-semibold rounded-lg border transition ${selectedRole === 'reception' ? 'bg-orange-primary text-white border-orange-primary' : 'bg-charcoal-800 text-gray-300 border-charcoal-700 hover:bg-charcoal-700'}`}
              >
                Reception
              </button>
              <button 
                type="button"
                onClick={() => handleRoleQuickSelect('admin')}
                className={`py-2 text-xs font-semibold rounded-lg border transition ${selectedRole === 'admin' ? 'bg-orange-primary text-white border-orange-primary' : 'bg-charcoal-800 text-gray-300 border-charcoal-700 hover:bg-charcoal-700'}`}
              >
                Admin
              </button>
            </div>

            <form onSubmit={handleSignInSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-charcoal-900 border border-charcoal-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-orange-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input 
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-charcoal-900 border border-charcoal-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-orange-primary"
                  />
                </div>
              </div>

              {authMessage && (
                <div className="p-3 rounded-lg bg-green-950/60 border border-green-700/60 text-xs text-green-300">
                  {authMessage}
                </div>
              )}

              <button 
                type="submit"
                className="w-full py-2.5 rounded-lg bg-orange-primary hover:bg-orange-hover text-white font-semibold text-sm shadow-lg shadow-orange-primary/20 transition"
              >
                Sign In as {selectedRole.toUpperCase()}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-charcoal-800 py-6 px-6 text-center text-xs text-gray-500">
        &copy; {new Date().getFullYear()} Titan Fitness Systems. All rights reserved.
      </footer>
    </div>
  );
};

export default App;
