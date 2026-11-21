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
  Play,
  ExternalLink,
  Video,
} from 'lucide-react';
import {
  askFitnessCoachApi,
  explainExerciseApi,
  fetchMyAiProgressSummaryApi,
  ExerciseExplanation,
  YouTubeVideo,
} from '../api/ai';
import { formatEthiopianDate } from '../utils/ethiopianCalendar';

/**
 * Strips unusable markdown characters (###, *, **) from AI generated text,
 * transforming them into clean headings, bullet points, and high-readability text.
 */
export const cleanMarkdownText = (raw: string): string => {
  if (!raw) return '';
  return raw
    // Strip header hashes (### Heading -> Heading)
    .replace(/^#{1,6}\s*(.+)$/gm, '$1')
    // Convert markdown bullets (* Item or - Item) into clean round bullets (• Item)
    .replace(/^[\*\-]\s+/gm, '• ')
    // Strip bold/italic markdown asterisks (**text** -> text)
    .replace(/\*\*(.*?)\*\*/g, '$1')
    // Strip single asterisks (*text* -> text)
    .replace(/\*([^\*]+)\*/g, '$1')
    // Strip leftover asterisks
    .replace(/\*/g, '')
    // Strip code backticks (`code` -> code)
    .replace(/`{1,3}/g, '')
    // Normalize excessive newlines
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

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
  videos?: YouTubeVideo[];
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  isOpen,
  onClose,
  userName,
  userRole,
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'exercise' | 'progress'>('chat');
  const [activePlayingVideoId, setActivePlayingVideoId] = useState<string | null>(null);

  // Role persona config
  const isTrainer = userRole === 'trainer';
  const isAdmin = userRole === 'admin';

  const assistantTitle = isAdmin
    ? 'POWERZONE Management Consultant AI'
    : isTrainer
    ? 'Trainer AI Coaching Co-Pilot'
    : 'POWERZONE AI Fitness Coach';

  const assistantSubtitle = isAdmin
    ? 'Gym Operations, Member Retention & Revenue Strategy Advisor'
    : isTrainer
    ? 'Periodization, Biomechanics & Athlete Nutrition Assistant'
    : 'Personalized Workout Advice & Ethiopian Nutrition Companion';

  const welcomeMessage = isAdmin
    ? `Hello ${userName}! I'm POWERZONE Management Consultant AI, your gym business and operations advisory co-pilot. Ask me anything about member retention tactics, off-peak pricing strategy, commercial equipment maintenance lifecycles, or staff scheduling optimization.`
    : isTrainer
    ? `Hello Coach ${userName}! I'm your Coaching Co-Pilot. I assist with exercise progression design, periodized hypertrophy/strength splits, client macronutrient targets during Ethiopian fasting (tsom), and injury regressions. What program are you building today?`
    : `Hello ${userName}! I'm POWERZONE AI Fitness Coach, your sports science and training assistant. Ask me anything about workout routines, Ethiopian nutrition (teff, fasting diet/tsom), exercise biomechanics, or ask for video tutorials for any exercise!`;

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
        '🎥 Show me a video for Romanian Deadlift form',
        '🎥 Barbell back squat depth video tutorial',
        'Design a 4-week hypertrophy progression for an intermediate trainee.',
        'What are safe deadlift regression exercises for a client with mild lumbar discomfort?',
        'How should an athlete adjust macros during Ethiopian fasting (tsom) to preserve lean muscle?',
      ]
    : [
        '🎥 Show me a video for bench press',
        '🎥 Squat form video tutorial',
        '🎥 Deadlift technique video',
        '🎥 Pull-up form demonstration video',
        'What are the best Ethiopian post-workout foods during fasting season (tsom)?',
        'How do I properly execute progressive overload to break a bench plateau?',
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
      const contextPrefix = isAdmin
        ? `[Admin Facility Context: You are advising gym management]: `
        : isTrainer
        ? `[Coach Context: You are assisting a certified trainer]: `
        : ``;
      const response = await askFitnessCoachApi(`${contextPrefix}${text.trim()}`);
      const aiMsg: MessageItem = {
        sender: 'ai',
        text: cleanMarkdownText(response.answer),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        videos: response.videos && response.videos.length > 0 ? response.videos : undefined,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div 
        className="bg-surface border border-border rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto text-text transition-colors"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ai-modal-title"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-primary text-charcoal-950 shadow-md shadow-primary/25 p-1.5 flex items-center justify-center shrink-0">
              <img
                src="/powerzone-logo.png"
                alt="POWERZONE Lion Logo"
                className="w-full h-full object-contain select-none"
                loading="eager"
              />
            </div>
            <div>
              <h2 id="ai-modal-title" className="text-xl font-bold text-text flex items-center gap-2">
                {assistantTitle}
              </h2>
              <div className="flex items-center gap-2 text-xs text-text-muted">
                <span className="text-primary font-semibold">
                  {formatEthiopianDate(new Date())} E.C. (ዓ.ም)
                </span>
                <span>•</span>
                <span>{assistantSubtitle}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-text-muted hover:text-text rounded-lg hover:bg-background transition"
            aria-label="Close AI assistant"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-2 border-b border-border bg-surface">
          <button
            type="button"
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition ${
              activeTab === 'chat'
                ? 'border-primary text-primary'
                : 'border-transparent text-text-muted hover:text-text'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            {isAdmin ? 'Facility Management Advisory' : isTrainer ? 'Coaching Co-Pilot Chat' : 'Fitness & Nutrition Q&A'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('exercise')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition ${
              activeTab === 'exercise'
                ? 'border-primary text-primary'
                : 'border-transparent text-text-muted hover:text-text'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Exercise Form & Biomechanics
          </button>
          {userRole === 'member' && (
            <button
              type="button"
              onClick={() => setActiveTab('progress')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition ${
                activeTab === 'progress'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-muted hover:text-text'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              AI Progress Insights
            </button>
          )}
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
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
                      <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}
                    <div
                      className={`max-w-[85%] rounded-2xl p-4 text-sm whitespace-pre-wrap leading-relaxed shadow-sm ${
                        m.sender === 'user'
                          ? 'bg-primary text-primary-foreground font-medium'
                          : 'bg-background border border-border text-text'
                      }`}
                    >
                      {cleanMarkdownText(m.text)}

                      {/* Video Demonstrations if present */}
                      {m.videos && m.videos.length > 0 && (
                        <div className="mt-3.5 pt-3 border-t border-border/70 not-prose">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-primary mb-2.5">
                            <Video className="w-3.5 h-3.5" />
                            <span>Verified Video Tutorials ({m.videos.length})</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                            {m.videos.map((vid) => (
                              <div
                                key={vid.id}
                                className="bg-surface border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-all flex flex-col group shadow-sm text-left"
                              >
                                {activePlayingVideoId === vid.id ? (
                                  <div className="relative aspect-video w-full bg-black">
                                    <iframe
                                      src={`https://www.youtube-nocookie.com/embed/${vid.id}?autoplay=1&rel=0`}
                                      title={vid.title}
                                      className="w-full h-full border-0"
                                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                      allowFullScreen
                                    />
                                    <button
                                      type="button"
                                      onClick={() => setActivePlayingVideoId(null)}
                                      className="absolute top-1.5 right-1.5 bg-black/80 hover:bg-black text-white text-[10px] px-2 py-0.5 rounded font-bold shadow"
                                    >
                                      ✕ Close
                                    </button>
                                  </div>
                                ) : (
                                  <div
                                    onClick={() => setActivePlayingVideoId(vid.id)}
                                    className="relative aspect-video w-full bg-black/20 cursor-pointer overflow-hidden group/thumb"
                                  >
                                    <img
                                      src={vid.thumbnail}
                                      alt={vid.title}
                                      className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-300"
                                      loading="lazy"
                                    />
                                    <div className="absolute inset-0 bg-black/35 group-hover/thumb:bg-black/15 transition-colors flex items-center justify-center">
                                      <div className="w-9 h-9 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg group-hover/thumb:scale-110 transition-transform">
                                        <Play className="w-4 h-4 fill-white ml-0.5" />
                                      </div>
                                    </div>
                                    <span className="absolute bottom-1.5 right-1.5 bg-black/80 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                                      YouTube
                                    </span>
                                  </div>
                                )}
                                <div className="p-2.5 flex-1 flex flex-col justify-between">
                                  <div>
                                    <h4
                                      className="text-xs font-bold text-text line-clamp-2 leading-snug group-hover:text-primary transition-colors"
                                      title={vid.title}
                                    >
                                      {vid.title}
                                    </h4>
                                    <p className="text-[11px] text-text-muted mt-0.5">{vid.author}</p>
                                  </div>
                                  <div className="mt-2.5 pt-2 border-t border-border/40 flex items-center justify-between gap-1">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setActivePlayingVideoId(activePlayingVideoId === vid.id ? null : vid.id)
                                      }
                                      className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1"
                                    >
                                      <Play className="w-3 h-3 fill-current" />
                                      <span>{activePlayingVideoId === vid.id ? 'Close' : 'Watch Here'}</span>
                                    </button>
                                    <a
                                      href={vid.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-[10px] text-text-muted hover:text-text flex items-center gap-0.5"
                                    >
                                      <span>YouTube</span>
                                      <ExternalLink className="w-2.5 h-2.5" />
                                    </a>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <span
                        className={`block text-[10px] mt-1.5 ${
                          m.sender === 'user' ? 'text-primary-foreground/75' : 'text-text-muted'
                        }`}
                      >
                        {m.time}
                      </span>
                    </div>
                    {m.sender === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-surface border border-border text-text flex items-center justify-center shrink-0 font-bold text-xs">
                        <UserIcon className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                ))}
                {isTyping && (
                  <div className="flex items-center gap-2 text-xs text-primary italic py-1">
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
                    type="button"
                    onClick={() => handleSendMessage(prompt)}
                    className="shrink-0 text-xs px-3.5 py-1.5 rounded-full bg-background border border-border text-text-muted hover:border-primary/50 hover:text-primary transition"
                  >
                    💡 {prompt}
                  </button>
                ))}
              </div>

              {/* Chat Input */}
              <div className="mt-2 flex items-center gap-2 pt-2 border-t border-border">
                <input
                  type="text"
                  placeholder={isAdmin ? "Ask about gym revenue, member retention, equipment lifecycles..." : isTrainer ? "Ask about workout splits, exercise progressions, recovery..." : "Ask anything about workouts, Ethiopian nutrition, or lifting form..."}
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1 px-4 py-2.5 bg-background border border-border rounded-xl text-sm text-text placeholder-text-muted focus:outline-none focus:border-primary"
                />
                <button
                  type="button"
                  onClick={() => handleSendMessage()}
                  disabled={!inputQuery.trim() || isTyping}
                  className="px-5 py-2.5 bg-primary text-primary-foreground font-extrabold text-xs rounded-xl hover:bg-primary-hover transition disabled:opacity-40 flex items-center gap-1.5 shadow-sm active:scale-95"
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
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    type="text"
                    placeholder="Search exercise (e.g. Bench Press, Deadlift)..."
                    value={searchExercise}
                    onChange={(e) => setSearchExercise(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleFetchExerciseGuide(searchExercise)}
                    className="w-full pl-9 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm text-text placeholder-text-muted focus:outline-none focus:border-primary"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleFetchExerciseGuide(searchExercise)}
                  className="px-5 py-2.5 bg-primary text-primary-foreground font-extrabold text-xs rounded-xl hover:bg-primary-hover transition shadow-sm active:scale-95"
                >
                  Explain Biomechanics
                </button>
              </div>

              {/* Popular exercise chips */}
              <div className="flex items-center gap-2 flex-wrap text-xs text-text-muted pt-1">
                <span>Quick Select:</span>
                {popularExercises.map((ex) => (
                  <button
                    key={ex}
                    type="button"
                    onClick={() => handleFetchExerciseGuide(ex)}
                    className={`px-3 py-1 rounded-lg border text-xs font-semibold transition ${
                      searchExercise === ex
                        ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                        : 'bg-background border-border text-text-muted hover:text-text'
                    }`}
                  >
                    {ex}
                  </button>
                ))}
              </div>

              {/* Guide Display Card */}
              {loadingGuide ? (
                <div className="p-12 text-center text-text-muted">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto text-primary mb-2" />
                  <p className="text-sm">Synthesizing biomechanical execution breakdown...</p>
                </div>
              ) : exerciseGuide ? (
                <div className="bg-background border border-border rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-primary/10 border border-primary/20 rounded-xl text-primary">
                        <Dumbbell className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-text">{exerciseGuide.exerciseName}</h3>
                        <p className="text-xs text-text-muted">
                          {exerciseGuide.dbDetails?.category || 'Strength'} • Target: {exerciseGuide.dbDetails?.muscle_group || 'Compound'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="prose max-w-none text-sm text-text whitespace-pre-wrap leading-relaxed">
                    {cleanMarkdownText(exerciseGuide.aiGuide)}
                  </div>

                  {/* Verified Video Demonstrations */}
                  {exerciseGuide.videos && exerciseGuide.videos.length > 0 && (
                    <div className="border-t border-border pt-4 space-y-3 not-prose">
                      <div className="flex items-center gap-2 text-sm font-bold text-primary">
                        <Video className="w-4 h-4" />
                        <span>Recommended YouTube Form Tutorials ({exerciseGuide.videos.length})</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {exerciseGuide.videos.map((vid) => (
                          <div
                            key={vid.id}
                            className="bg-surface border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-all flex flex-col shadow-sm"
                          >
                            {activePlayingVideoId === vid.id ? (
                              <div className="relative aspect-video w-full bg-black">
                                <iframe
                                  src={`https://www.youtube-nocookie.com/embed/${vid.id}?autoplay=1&rel=0`}
                                  title={vid.title}
                                  className="w-full h-full border-0"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                />
                                <button
                                  type="button"
                                  onClick={() => setActivePlayingVideoId(null)}
                                  className="absolute top-1.5 right-1.5 bg-black/80 hover:bg-black text-white text-[10px] px-2 py-0.5 rounded font-bold shadow"
                                >
                                  ✕ Close
                                </button>
                              </div>
                            ) : (
                              <div
                                onClick={() => setActivePlayingVideoId(vid.id)}
                                className="relative aspect-video w-full bg-black/20 cursor-pointer overflow-hidden group/thumb"
                              >
                                <img
                                  src={vid.thumbnail}
                                  alt={vid.title}
                                  className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-300"
                                  loading="lazy"
                                />
                                <div className="absolute inset-0 bg-black/35 group-hover/thumb:bg-black/15 transition-colors flex items-center justify-center">
                                  <div className="w-10 h-10 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg group-hover/thumb:scale-110 transition-transform">
                                    <Play className="w-4 h-4 fill-white ml-0.5" />
                                  </div>
                                </div>
                                <span className="absolute bottom-1.5 right-1.5 bg-black/80 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                                  YouTube
                                </span>
                              </div>
                            )}
                            <div className="p-3 flex-1 flex flex-col justify-between">
                              <div>
                                <h4 className="text-xs font-bold text-text line-clamp-2 leading-snug">{vid.title}</h4>
                                <p className="text-[11px] text-text-muted mt-0.5">{vid.author}</p>
                              </div>
                              <div className="mt-3 pt-2 border-t border-border/40 flex items-center justify-between">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setActivePlayingVideoId(activePlayingVideoId === vid.id ? null : vid.id)
                                  }
                                  className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                                >
                                  <Play className="w-3.5 h-3.5 fill-current" />
                                  <span>{activePlayingVideoId === vid.id ? 'Close Player' : 'Play Video'}</span>
                                </button>
                                <a
                                  href={vid.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-text-muted hover:text-text flex items-center gap-1"
                                >
                                  <span>Watch on YouTube</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          )}

          {/* TAB 3: AI PROGRESS INSIGHTS (Member Only) */}
          {activeTab === 'progress' && (
            <div className="space-y-4">
              <div className="bg-primary/10 border border-primary/20 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-primary font-bold">
                    <Sparkles className="w-5 h-5" />
                    <span>Personal AI Transformation Analysis</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleLoadProgressSummary}
                    className="p-1.5 text-text-muted hover:text-text rounded-lg hover:bg-background transition"
                    title="Refresh AI Analysis"
                  >
                    <RefreshCw className={`w-4 h-4 ${loadingSummary ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                {loadingSummary ? (
                  <div className="py-8 text-center text-text-muted">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-primary mb-2" />
                    <p className="text-xs">Analyzing weight records, BMI trajectory, and adherence...</p>
                  </div>
                ) : (
                  <p className="text-sm text-text leading-relaxed whitespace-pre-wrap">
                    {cleanMarkdownText(progressSummary || '')}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-4 bg-background border border-border rounded-xl">
                  <span className="font-bold text-text block mb-1">🎯 Adaptive Pacing</span>
                  <p className="text-text-muted">AI monitors your weekly weight delta to confirm healthy fat loss (0.5–1 kg/week) or lean mass accrual.</p>
                </div>
                <div className="p-4 bg-background border border-border rounded-xl">
                  <span className="font-bold text-text block mb-1">⚖️ Biometric Correlation</span>
                  <p className="text-text-muted">Cross-analyzes waist and chest circumferences to differentiate muscle hypertrophy from visceral fat.</p>
                </div>
                <div className="p-4 bg-background border border-border rounded-xl">
                  <span className="font-bold text-text block mb-1">🗓️ Ethiopian Calendar Sync</span>
                  <p className="text-text-muted">Dates and seasonal fasting periods (tsom) are factored into recommended protein and training splits.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
