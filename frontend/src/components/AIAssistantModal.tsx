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

  // Chat state
  const [messages, setMessages] = useState<MessageItem[]>([
    {
      sender: 'ai',
      text: `Hello ${userName}! I'm Titan Coach AI, your sports science and training assistant. Ask me anything about workout routines, Ethiopian nutrition (teff, fasting diet/tsom), exercise biomechanics, or recovery!`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Exercise Explanation state
  const [searchExercise, setSearchExercise] = useState('Barbell Back Squat');
  const [exerciseGuide, setExerciseGuide] = useState<ExerciseExplanation | null>(null);
  const [loadingGuide, setLoadingGuide] = useState(false);

  // Progress Summary state
  const [progressSummary, setProgressSummary] = useState<string | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);

  const quickPrompts = [
    'What are the best Ethiopian post-workout foods during fasting season (tsom)?',
    'How do I properly execute progressive overload to break a bench plateau?',
    'How should I structure a 4-day hypertrophy split?',
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
      const answer = await askFitnessCoachApi(text.trim());
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
    } catch (err: any) {
      setProgressSummary(err.message || 'No progress records found yet.');
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
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-xl text-amber-400">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Titan AI Fitness & Coaching Suite
              </h2>
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <span className="text-amber-400/90 font-medium">
                  {formatEthiopianDate(new Date())} E.C. (ዓ.ም)
                </span>
                <span>•</span>
                <span>Gemini 1.5 Powered Sports Science Engine</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-2 border-b border-zinc-800 bg-zinc-900/50">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition ${
              activeTab === 'chat'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Fitness Q&A Coach
          </button>
          <button
            onClick={() => setActiveTab('exercise')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition ${
              activeTab === 'exercise'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
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
                  ? 'border-amber-500 text-amber-400'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              AI Progress Insights
            </button>
          )}
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* TAB 1: FITNESS CHAT */}
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
                      <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-2xl p-4 text-sm whitespace-pre-wrap leading-relaxed ${
                        m.sender === 'user'
                          ? 'bg-amber-500 text-black font-medium'
                          : 'bg-zinc-800/80 border border-zinc-700/60 text-zinc-200'
                      }`}
                    >
                      {m.text}
                      <span
                        className={`block text-[10px] mt-1.5 ${
                          m.sender === 'user' ? 'text-black/60' : 'text-zinc-500'
                        }`}
                      >
                        {m.time}
                      </span>
                    </div>
                    {m.sender === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-zinc-700 text-zinc-300 flex items-center justify-center shrink-0">
                        <UserIcon className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                ))}
                {isTyping && (
                  <div className="flex items-center gap-2 text-xs text-amber-400 italic py-1">
                    <Sparkles className="w-3.5 h-3.5 animate-spin" />
                    <span>Titan Coach AI is analyzing your training query...</span>
                  </div>
                )}
              </div>

              {/* Quick Prompt Chips */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                {quickPrompts.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(prompt)}
                    className="shrink-0 text-xs px-3 py-1.5 rounded-full bg-zinc-800/80 border border-zinc-700 text-zinc-300 hover:border-amber-500/50 hover:text-amber-300 transition"
                  >
                    💡 {prompt}
                  </button>
                ))}
              </div>

              {/* Chat Input */}
              <div className="mt-2 flex items-center gap-2 pt-2 border-t border-zinc-800">
                <input
                  type="text"
                  placeholder="Ask Titan Coach anything about fitness, lifting cues, or nutrition..."
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1 px-4 py-2.5 bg-zinc-800/60 border border-zinc-700/60 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputQuery.trim() || isTyping}
                  className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-semibold rounded-xl hover:from-amber-400 hover:to-yellow-500 transition disabled:opacity-40 flex items-center gap-1.5"
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
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="Search exercise (e.g. Bench Press, Deadlift)..."
                    value={searchExercise}
                    onChange={(e) => setSearchExercise(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleFetchExerciseGuide(searchExercise)}
                    className="w-full pl-9 pr-4 py-2 bg-zinc-800/60 border border-zinc-700/60 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <button
                  onClick={() => handleFetchExerciseGuide(searchExercise)}
                  className="px-4 py-2 bg-amber-500 text-black font-semibold text-sm rounded-xl hover:bg-amber-400 transition"
                >
                  Explain Biomechanics
                </button>
              </div>

              {/* Popular exercise chips */}
              <div className="flex items-center gap-2 flex-wrap text-xs text-zinc-400 pt-1">
                <span>Quick Select:</span>
                {popularExercises.map((ex) => (
                  <button
                    key={ex}
                    onClick={() => handleFetchExerciseGuide(ex)}
                    className={`px-2.5 py-1 rounded-lg border transition ${
                      searchExercise === ex
                        ? 'bg-amber-500/10 border-amber-500 text-amber-300'
                        : 'bg-zinc-800/40 border-zinc-700 text-zinc-300 hover:bg-zinc-800'
                    }`}
                  >
                    {ex}
                  </button>
                ))}
              </div>

              {/* Guide Display Card */}
              {loadingGuide ? (
                <div className="p-12 text-center text-zinc-400">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto text-amber-400 mb-2" />
                  <p className="text-sm">Synthesizing biomechanical execution breakdown...</p>
                </div>
              ) : exerciseGuide ? (
                <div className="bg-zinc-800/40 border border-zinc-700/60 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-700/40 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
                        <Dumbbell className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">{exerciseGuide.exerciseName}</h3>
                        <p className="text-xs text-zinc-400">
                          {exerciseGuide.dbDetails?.category || 'Strength'} • Target: {exerciseGuide.dbDetails?.muscle_group || 'Compound'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="prose prose-invert max-w-none text-sm text-zinc-200 whitespace-pre-wrap leading-relaxed">
                    {exerciseGuide.aiGuide}
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* TAB 3: AI PROGRESS INSIGHTS */}
          {activeTab === 'progress' && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent border border-amber-500/20 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-amber-400 font-bold">
                    <Sparkles className="w-5 h-5" />
                    <span>Personal AI Transformation Analysis</span>
                  </div>
                  <button
                    onClick={handleLoadProgressSummary}
                    className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition"
                    title="Refresh AI Analysis"
                  >
                    <RefreshCw className={`w-4 h-4 ${loadingSummary ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                {loadingSummary ? (
                  <div className="py-8 text-center text-zinc-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-amber-400 mb-2" />
                    <p className="text-xs">Analyzing weight records, BMI trajectory, and adherence...</p>
                  </div>
                ) : (
                  <p className="text-sm text-zinc-200 leading-relaxed whitespace-pre-wrap">
                    {progressSummary}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 bg-zinc-800/40 border border-zinc-700/50 rounded-xl">
                  <span className="font-bold text-white block mb-1">🎯 Adaptive Pacing</span>
                  <p className="text-zinc-400">AI monitors your weekly weight delta to confirm healthy fat loss (0.5–1 kg/week) or lean mass accrual.</p>
                </div>
                <div className="p-3.5 bg-zinc-800/40 border border-zinc-700/50 rounded-xl">
                  <span className="font-bold text-white block mb-1">⚖️ Biometric Correlation</span>
                  <p className="text-zinc-400">Cross-analyzes waist and chest circumferences to differentiate muscle hypertrophy from visceral fat.</p>
                </div>
                <div className="p-3.5 bg-zinc-800/40 border border-zinc-700/50 rounded-xl">
                  <span className="font-bold text-white block mb-1">🗓️ Ethiopian Calendar Sync</span>
                  <p className="text-zinc-400">Dates and seasonal fasting periods (tsom) are factored into recommended protein and training splits.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
