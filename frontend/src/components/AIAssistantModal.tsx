import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  MessageSquare,
  BookOpen,
  TrendingUp,
  Send,
  Bot,
  User as UserIcon,
  Dumbbell,
  RefreshCw,
  Search,
  Building,
} from 'lucide-react';
import {
  askFitnessCoachApi,
  explainExerciseApi,
  fetchMyAiProgressSummaryApi,
  ExerciseExplanation,
} from '../api/ai';
import { formatEthiopianDate } from '../utils/ethiopianCalendar';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  userRole: string;
}

interface MessageItem {
  sender: 'user' | 'ai';
  text: string;
  time: string;
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  isOpen,
  onClose,
  userName,
  userRole,
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'exercise' | 'progress'>('chat');

  // Role persona config
  const isTrainer = userRole === 'trainer';
  const isAdmin = userRole === 'admin';

  const assistantTitle = isAdmin
    ? 'Titan Management Consultant AI'
    : isTrainer
    ? 'Trainer AI Coaching Co-Pilot'
    : 'Titan AI Fitness Coach';

  const assistantSubtitle = isAdmin
    ? 'Gym Operations, Member Retention & Revenue Strategy Advisor'
    : isTrainer
    ? 'Periodization, Biomechanics & Athlete Nutrition Assistant'
    : 'Personalized Workout Advice & Ethiopian Nutrition Companion';

  const welcomeMessage = isAdmin
    ? `Hello ${userName}! I'm Titan Management Consultant AI, your gym business and operations advisory co-pilot. Ask me anything about member retention tactics, off-peak pricing strategy, commercial equipment maintenance lifecycles, or staff scheduling optimization.`
    : isTrainer
    ? `Hello Coach ${userName}! I'm your Coaching Co-Pilot. I assist with exercise progression design, periodized hypertrophy/strength splits, client macronutrient targets during Ethiopian fasting (tsom), and injury regressions. What program are you building today?`
    : `Hello ${userName}! I'm Titan AI Fitness Coach, your sports science and training assistant. Ask me anything about workout routines, Ethiopian nutrition (teff, fasting diet/tsom), exercise biomechanics, or recovery!`;

  // Chat state
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Exercise Explanation state
  const [searchExercise, setSearchExercise] = useState('Barbell Back Squat');
  const [exerciseGuide, setExerciseGuide] = useState<ExerciseExplanation | null>(null);
  const [loadingGuide, setLoadingGuide] = useState(false);

  // Progress Summary state
  const [progressSummary, setProgressSummary] = useState<string | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);

  // Quick prompts based on user role
  const quickPrompts = isAdmin
    ? [
        'How can we increase member renewal and retention rates in Addis Ababa?',
        'What strategies optimize off-peak gym utilization without discounting core plans?',
        'Provide preventative maintenance best practices for commercial treadmills and cable machines.',
        'How should we adjust pricing tiers between 1-month and 6-month memberships for maximum cash flow?',
      ]
    : isTrainer
    ? [
        'Design a 4-week hypertrophy progression for an intermediate trainee.',
        'What are safe deadlift regression exercises for a client with mild lumbar discomfort?',
        'How should an athlete adjust macros during Ethiopian fasting (tsom) to preserve lean muscle?',
        'Suggest effective mobility drills to improve deep squat ankle dorsiflexion.',
      ]
    : [
        'What are the best Ethiopian post-workout foods during fasting season (tsom)?',
        'How do I properly execute progressive overload to break a bench plateau?',
        'How should I structure a 4-day workout split?',
        'What are optimal hydration targets for training in Addis Ababa?',
      ];

  const popularExercises = [
    'Barbell Back Squat',
    'Barbell Bench Press',
    'Conventional Deadlift',
    'Overhead Shoulder Press',
    'Pull-Up',
    'Plank Hold',
  ];

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          sender: 'ai',
          text: welcomeMessage,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  }, [isOpen, welcomeMessage, messages.length]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputQuery;
    if (!text.trim() || isTyping) return;

    const userMsg: MessageItem = {
      sender: 'user',
      text: text.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsTyping(true);

    try {
      // Pass role context to enhance prompt
      const contextPrefix = isAdmin
        ? `[Admin Facility Context: You are advising gym management]: `
        : isTrainer
        ? `[Coach Context: You are assisting a certified trainer]: `
        : ``;
      const answer = await askFitnessCoachApi(`${contextPrefix}${text.trim()}`);
      const aiMsg: MessageItem = {
        sender: 'ai',
        text: answer,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      const errorMsg: MessageItem = {
        sender: 'ai',
        text: `Error: ${err.message || 'Could not fetch response. Please try again.'}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleFetchExerciseGuide = async (name: string) => {
    setLoadingGuide(true);
    setSearchExercise(name);
    try {
      const guide = await explainExerciseApi(name);
      setExerciseGuide(guide);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingGuide(false);
    }
  };

  const handleLoadProgressSummary = async () => {
    setLoadingSummary(true);
    try {
      const summary = await fetchMyAiProgressSummaryApi();
      setProgressSummary(summary);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSummary(false);
    }
  };

  useEffect(() => {
    if (isOpen && activeTab === 'exercise' && !exerciseGuide) {
      handleFetchExerciseGuide('Barbell Back Squat');
    }
    if (isOpen && activeTab === 'progress' && !progressSummary) {
      handleLoadProgressSummary();
    }
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#0E1116] border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0B0D10]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#B4F82C]/10 border border-[#B4F82C]/30 rounded-xl text-[#B4F82C]">
              {isAdmin ? <Building className="w-6 h-6" /> : isTrainer ? <Dumbbell className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                {assistantTitle}
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="text-[#B4F82C] font-medium">
                  {formatEthiopianDate(new Date())} E.C. (ዓ.ም)
                </span>
                <span>•</span>
                <span>{assistantSubtitle}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-2 border-b border-slate-800 bg-[#0B0D10]/50">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition ${
              activeTab === 'chat'
                ? 'border-[#B4F82C] text-[#B4F82C]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            {isAdmin ? 'Facility Management Advisory' : isTrainer ? 'Coaching Co-Pilot Chat' : 'Fitness & Nutrition Q&A'}
          </button>
          <button
            onClick={() => setActiveTab('exercise')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition ${
              activeTab === 'exercise'
                ? 'border-[#B4F82C] text-[#B4F82C]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Exercise Form & Biomechanics
          </button>
          {userRole === 'member' && (
            <button
              onClick={() => setActiveTab('progress')}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition ${
                activeTab === 'progress'
                  ? 'border-[#B4F82C] text-[#B4F82C]'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              AI Progress Insights
            </button>
          )}
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* TAB 1: FITNESS / CONSULTING CHAT */}
          {activeTab === 'chat' && (
            <div className="flex flex-col h-[520px]">
              {/* Message History */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-2 mb-4">
                {messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`flex gap-3 ${
                      m.sender === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {m.sender === 'ai' && (
                      <div className="w-8 h-8 rounded-full bg-[#B4F82C]/10 border border-[#B4F82C]/30 text-[#B4F82C] flex items-center justify-center shrink-0">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-2xl p-4 text-sm whitespace-pre-wrap leading-relaxed ${
                        m.sender === 'user'
                          ? 'bg-[#B4F82C] text-slate-950 font-medium'
                          : 'bg-slate-800/80 border border-slate-700/60 text-slate-200'
                      }`}
                    >
                      {m.text}
                      <span
                        className={`block text-[10px] mt-1.5 ${
                          m.sender === 'user' ? 'text-slate-950/70' : 'text-slate-500'
                        }`}
                      >
                        {m.time}
                      </span>
                    </div>
                    {m.sender === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-slate-700 text-slate-300 flex items-center justify-center shrink-0">
                        <UserIcon className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                ))}
                {isTyping && (
                  <div className="flex items-center gap-2 text-xs text-[#B4F82C] italic py-1">
                    <Sparkles className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing your request with sports science intelligence...</span>
                  </div>
                )}
              </div>

              {/* Quick Prompt Chips */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                {quickPrompts.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(prompt)}
                    className="shrink-0 text-xs px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300 hover:border-[#B4F82C]/50 hover:text-[#B4F82C] transition"
                  >
                    💡 {prompt}
                  </button>
                ))}
              </div>

              {/* Chat Input */}
              <div className="mt-2 flex items-center gap-2 pt-2 border-t border-slate-800">
                <input
                  type="text"
                  placeholder={isAdmin ? "Ask about gym revenue, member retention, equipment lifecycles..." : isTrainer ? "Ask about workout splits, exercise progressions, recovery..." : "Ask anything about workouts, Ethiopian nutrition, or lifting form..."}
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1 px-4 py-2.5 bg-slate-800/60 border border-slate-700/60 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#B4F82C]"
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputQuery.trim() || isTyping}
                  className="px-4 py-2.5 bg-[#B4F82C] text-slate-950 font-bold rounded-xl hover:bg-[#a3e524] transition disabled:opacity-40 flex items-center gap-1.5 shadow-md shadow-[#B4F82C]/20"
                >
                  <Send className="w-4 h-4" />
                  <span>Send</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: EXERCISE FORM EXPLANATIONS */}
          {activeTab === 'exercise' && (
            <div className="space-y-4">
              {/* Exercise Search & Quick Buttons */}
              <div className="flex flex-wrap gap-2 items-center">
                <div className="relative flex-1 min-w-[240px]">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search exercise (e.g. Bench Press, Deadlift)..."
                    value={searchExercise}
                    onChange={(e) => setSearchExercise(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleFetchExerciseGuide(searchExercise)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-800/60 border border-slate-700/60 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#B4F82C]"
                  />
                </div>
                <button
                  onClick={() => handleFetchExerciseGuide(searchExercise)}
                  className="px-4 py-2 bg-[#B4F82C] text-slate-950 font-bold text-sm rounded-xl hover:bg-[#a3e524] transition shadow-md shadow-[#B4F82C]/20"
                >
                  Explain Biomechanics
                </button>
              </div>

              {/* Popular exercise chips */}
              <div className="flex items-center gap-2 flex-wrap text-xs text-slate-400 pt-1">
                <span>Quick Select:</span>
                {popularExercises.map((ex) => (
                  <button
                    key={ex}
                    onClick={() => handleFetchExerciseGuide(ex)}
                    className={`px-2.5 py-1 rounded-lg border transition ${
                      searchExercise === ex
                        ? 'bg-[#B4F82C]/10 border-[#B4F82C] text-[#B4F82C]'
                        : 'bg-slate-800/40 border-slate-700 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {ex}
                  </button>
                ))}
              </div>

              {/* Guide Display Card */}
              {loadingGuide ? (
                <div className="p-12 text-center text-slate-400">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#B4F82C] mb-2" />
                  <p className="text-sm">Synthesizing biomechanical execution breakdown...</p>
                </div>
              ) : exerciseGuide ? (
                <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-700/40 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-[#B4F82C]/10 border border-[#B4F82C]/20 rounded-xl text-[#B4F82C]">
                        <Dumbbell className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">{exerciseGuide.exerciseName}</h3>
                        <p className="text-xs text-slate-400">
                          {exerciseGuide.dbDetails?.category || 'Strength'} • Target: {exerciseGuide.dbDetails?.muscle_group || 'Compound'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="prose prose-invert max-w-none text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
                    {exerciseGuide.aiGuide}
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* TAB 3: AI PROGRESS INSIGHTS (Member Only) */}
          {activeTab === 'progress' && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-[#B4F82C]/10 via-[#B4F82C]/5 to-transparent border border-[#B4F82C]/20 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-[#B4F82C] font-bold">
                    <Sparkles className="w-5 h-5" />
                    <span>Personal AI Transformation Analysis</span>
                  </div>
                  <button
                    onClick={handleLoadProgressSummary}
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                    title="Refresh AI Analysis"
                  >
                    <RefreshCw className={`w-4 h-4 ${loadingSummary ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                {loadingSummary ? (
                  <div className="py-8 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#B4F82C] mb-2" />
                    <p className="text-xs">Analyzing weight records, BMI trajectory, and adherence...</p>
                  </div>
                ) : (
                  <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                    {progressSummary}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 bg-slate-800/40 border border-slate-700/50 rounded-xl">
                  <span className="font-bold text-white block mb-1">🎯 Adaptive Pacing</span>
                  <p className="text-slate-400">AI monitors your weekly weight delta to confirm healthy fat loss (0.5–1 kg/week) or lean mass accrual.</p>
                </div>
                <div className="p-3.5 bg-slate-800/40 border border-slate-700/50 rounded-xl">
                  <span className="font-bold text-white block mb-1">⚖️ Biometric Correlation</span>
                  <p className="text-slate-400">Cross-analyzes waist and chest circumferences to differentiate muscle hypertrophy from visceral fat.</p>
                </div>
                <div className="p-3.5 bg-slate-800/40 border border-slate-700/50 rounded-xl">
                  <span className="font-bold text-white block mb-1">🗓️ Ethiopian Calendar Sync</span>
                  <p className="text-slate-400">Dates and seasonal fasting periods (tsom) are factored into recommended protein and training splits.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
