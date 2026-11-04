import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  Check,
  QrCode,
  ShieldCheck,
  Calendar,
  MapPin,
  CreditCard,
  Clock,
  Dumbbell,
  Zap,
  ChevronDown,
  ChevronUp,
  Smartphone,
  Phone,
  Mail,
  HeartPulse,
} from 'lucide-react';
import { Plan } from '../../api/plans';
import { FitnessClass } from '../../api/classes';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { formatEthiopianDateTime } from '../../utils/ethiopianCalendar';

const DEFAULT_PLAN_IMAGE = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80';
const HERO_BG_IMAGE = 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=1600&auto=format&fit=crop&q=80';

// Certified SWEATBOX Trainers showcase
const TRAINERS = [
  {
    id: 'trn-1',
    name: 'Coach Dawit Haile',
    role: 'Head of Strength & Conditioning',
    specialization: 'Olympic Weightlifting & Hypertrophy',
    experience: '8+ Years Experience',
    image: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=500&auto=format&fit=crop&q=80',
    bio: 'Former Ethiopian national athlete specializing in biomechanics, progressive overload, and explosive power conditioning.',
  },
  {
    id: 'trn-2',
    name: 'Coach Selamawit Bekele',
    role: 'Lead Functional & HIIT Coach',
    specialization: 'Cardiovascular Conditioning & Mobility',
    experience: '6+ Years Experience',
    image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=500&auto=format&fit=crop&q=80',
    bio: 'Certified CrossFit L2 coach dedicated to high-energy calorie burn, athletic stamina, and functional core resilience.',
  },
  {
    id: 'trn-3',
    name: 'Coach Yohannes Tadesse',
    role: 'Physique & Body Recomposition Coach',
    specialization: 'Nutrition Formulation & Hypertrophy',
    experience: '7+ Years Experience',
    image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=500&auto=format&fit=crop&q=80',
    bio: 'Specialist in evidence-based body transformation, Ethiopian dietary integration, and injury-preventative posture.',
  },
];

// Interactive FAQ items
const FAQS = [
  {
    q: 'How does the 60-Second Dynamic QR Check-In pass work?',
    a: 'Once your membership is active, your member dashboard generates an encrypted, rotating TOTP QR pass that refreshes every 60 seconds. Simply hold your phone screen to the front desk scanner. Anti-passback security prevents screenshot sharing and enforces a 2-hour repeat entry cooldown.',
  },
  {
    q: 'What payment methods are supported for membership subscriptions?',
    a: 'We accept authentic Ethiopian digital payment gateways via Chapa: Telebirr (instant STK push prompt), CBE Birr, and Visa/Mastercard bank cards. Front desk reception also accepts cash payments with immediate digital activation.',
  },
  {
    q: 'Does SWEATBOX support Ethiopian Calendar (E.C.) dates?',
    a: 'Yes! Every timestamp, membership expiry notification, class schedule, and billing receipt is automatically formatted in the certified Ethiopian Calendar alongside standard Gregorian dates for full local convenience.',
  },
  {
    q: 'Can I book group fitness classes before arriving?',
    a: 'Members with active plans can reserve spots in HIIT, Olympic Lifting, Boxing, and Mobility classes directly from their dashboard. If a class reaches maximum capacity, an automated waitlist will notify you the moment a spot opens.',
  },
  {
    q: 'What is SWEATBOX AI Coaching and how does it help my training?',
    a: 'Our integrated Gemini AI Fitness Coach analyzes your personal goals, calculates target progressive overload, reviews workout splits, and suggests high-protein Ethiopian meal plans (shuro, lentils, teff, lean beef) tailored to your daily schedule.',
  },
];

interface PublicHomePageProps {
  plans: Plan[];
  classesList: FitnessClass[];
  onJoinNow: () => void;
  onViewPlans: () => void;
  onViewClasses: () => void;
  onSelectPlan: (plan: Plan) => void;
  onBookClass: (cls: FitnessClass) => void;
  onOpenDevGallery?: () => void;
}

export const PublicHomePage: React.FC<PublicHomePageProps> = ({
  plans,
  classesList,
  onJoinNow,
  onViewPlans,
  onViewClasses,
  onSelectPlan,
  onBookClass,
  onOpenDevGallery,
}) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setOpenFaqIndex(openFaqIndex === idx ? null : idx);
  };

  return (
    <div className="w-full space-y-20 sm:space-y-28">
      {/* 1. HERO SECTION */}
      <section className="relative -mt-8 pt-16 pb-20 sm:pt-24 sm:pb-32 px-4 sm:px-6 -mx-4 sm:-mx-6 overflow-hidden rounded-b-3xl border-b border-border bg-charcoal-900">
        {/* Background Image with Athletic Gradient & Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src={HERO_BG_IMAGE}
            alt="SWEATBOX Athletic Training Floor"
            loading="lazy"
            className="w-full h-full object-cover object-center opacity-25 filter grayscale contrast-125 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/15 border border-primary/30 text-primary text-xs font-bold tracking-wide uppercase mb-6 animate-fadeIn">
            <Sparkles className="w-4 h-4" /> Addis Ababa's Premier Athletic Gym
          </div>

          {/* Value proposition headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-text uppercase tracking-tight leading-none max-w-3xl">
            FORGE <span className="text-primary">UNRIVALED</span> PERFORMANCE
          </h1>

          <p className="mt-6 text-base sm:text-xl text-text-muted max-w-2xl leading-relaxed font-sans">
            Elevate your training with 60-second dynamic QR check-ins, instant Telebirr & CBE payments, certified coach-built routines, and intelligent AI transformation guidance.
          </p>

          {/* Mobile-first touch CTAs (>= 44px) */}
          <div className="flex flex-col sm:flex-row items-center gap-4 mt-8 w-full sm:w-auto">
            <Button
              variant="primary"
              size="lg"
              onClick={onJoinNow}
              className="w-full sm:w-auto min-w-[200px] justify-center shadow-xl shadow-primary/25"
            >
              <span>Join SWEATBOX</span>
              <ArrowRight className="w-5 h-5 ml-1" />
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={onViewPlans}
              className="w-full sm:w-auto min-w-[200px] justify-center"
            >
              Explore Plans & Pricing
            </Button>
          </div>

          {/* Quick value trust badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12 pt-8 border-t border-border/60 w-full max-w-2xl text-left">
            <div className="flex items-center gap-2 text-xs text-text-muted">
              <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
              <span>Chapa & Telebirr Verified</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-text-muted">
              <QrCode className="w-4 h-4 text-primary shrink-0" />
              <span>Instant QR Pass</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-text-muted">
              <Dumbbell className="w-4 h-4 text-primary shrink-0" />
              <span>Elite Training Floor</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-text-muted">
              <Sparkles className="w-4 h-4 text-primary shrink-0" />
              <span>Gemini AI Coach</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THREE-STEP ATHLETIC ONBOARDING FLOW */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <Badge variant="primary" className="mb-3">
            Simple 3-Step Process
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-text">
            How SWEATBOX Works
          </h2>
          <p className="text-text-muted text-sm sm:text-base mt-2">
            No paperwork or plastic badge delays. From signup to lifting in under 2 minutes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {/* Step 1 */}
          <Card className="p-6 sm:p-8 flex flex-col justify-between border-border hover:border-primary/50 transition relative group">
            <div className="absolute top-6 right-6 font-black text-4xl text-border group-hover:text-primary/20 transition">
              01
            </div>
            <div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-6">
                <CreditCard className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-text uppercase mb-2">
                Choose Plan & Pay
              </h3>
              <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                Pick a 1, 3, 6, or 12-month tier. Pay seamlessly with Telebirr, CBE Birr, or card with transparent ETB pricing and instant confirmation.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-border/50 text-xs text-primary font-semibold flex items-center gap-1.5">
              <Check className="w-4 h-4" /> Instant Chapa Webhook Activation
            </div>
          </Card>

          {/* Step 2 */}
          <Card className="p-6 sm:p-8 flex flex-col justify-between border-border hover:border-primary/50 transition relative group">
            <div className="absolute top-6 right-6 font-black text-4xl text-border group-hover:text-primary/20 transition">
              02
            </div>
            <div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-6">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-text uppercase mb-2">
                Instant 60s Dynamic QR
              </h3>
              <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                Your phone is your digital gym key. A rotating, anti-passback TOTP QR pass refreshes every minute for rapid front-desk check-in.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-border/50 text-xs text-primary font-semibold flex items-center gap-1.5">
              <Check className="w-4 h-4" /> Touchless Rapid Scanner Entry
            </div>
          </Card>

          {/* Step 3 */}
          <Card className="p-6 sm:p-8 flex flex-col justify-between border-border hover:border-primary/50 transition relative group">
            <div className="absolute top-6 right-6 font-black text-4xl text-border group-hover:text-primary/20 transition">
              03
            </div>
            <div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-6">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-text uppercase mb-2">
                Train & Transform
              </h3>
              <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                Access free weights, machines, group conditioning classes, certified trainers, and personalized Gemini AI progress analytics.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-border/50 text-xs text-primary font-semibold flex items-center gap-1.5">
              <Check className="w-4 h-4" /> Full Workout & Recovery Suite
            </div>
          </Card>
        </div>
      </section>

      {/* 3. FEATURED MEMBERSHIP PLANS PREVIEW */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-10 gap-4">
          <div>
            <Badge variant="primary" className="mb-2">
              Transparent Membership Tiers
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-text">
              Featured Pricing Plans
            </h2>
            <p className="text-xs sm:text-sm text-text-muted mt-1">
              All prices in Ethiopian Birr (ETB). No hidden registration fees or lock-in contracts.
            </p>
          </div>
          <Button variant="ghost" onClick={onViewPlans} className="text-primary font-bold text-sm">
            <span>Explore all plans</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {plans.length > 0 ? (
            plans.slice(0, 3).map((plan, idx) => {
              const isPopular = idx === 1 || plan.durationMonths === 3;
              return (
                <Card
                  key={plan.id}
                  className={`p-6 sm:p-8 flex flex-col justify-between transition group relative ${
                    isPopular ? 'border-2 border-primary shadow-2xl shadow-primary/10' : 'border-border'
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-slate-950 text-xs font-black uppercase tracking-wider shadow-lg shadow-primary/30">
                      Most Popular
                    </div>
                  )}

                  <div>
                    {/* Image */}
                    <div className="w-full h-40 rounded-xl overflow-hidden mb-5 bg-charcoal-900 border border-border">
                      <img
                        src={plan.imageUrl || DEFAULT_PLAN_IMAGE}
                        alt={plan.name}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = DEFAULT_PLAN_IMAGE;
                        }}
                      />
                    </div>

                    <h3 className="text-xl font-black text-text uppercase">{plan.name}</h3>
                    <p className="text-xs text-text-muted mt-1.5 line-clamp-2">
                      {plan.description || 'Full facility access with modern Olympic equipment.'}
                    </p>

                    {/* Price in ETB */}
                    <div className="mt-5 pb-5 border-b border-border">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl sm:text-4xl font-black text-text">
                          {plan.price.toLocaleString()}
                        </span>
                        <span className="text-sm font-bold text-primary">ETB</span>
                        <span className="text-xs text-text-muted ml-1">
                          / {plan.durationMonths} {plan.durationMonths === 1 ? 'Month' : 'Months'}
                        </span>
                      </div>
                    </div>

                    {/* Feature bullets */}
                    <ul className="mt-5 space-y-2.5 text-xs sm:text-sm text-text-muted">
                      <li className="flex items-center gap-2 text-text">
                        <Check className="w-4 h-4 text-primary shrink-0" /> Full Gym Floor Access
                      </li>
                      <li className="flex items-center gap-2 text-text">
                        <Check className="w-4 h-4 text-primary shrink-0" /> 60s Dynamic QR Mobile Pass
                      </li>
                      <li className="flex items-center gap-2 text-text">
                        <Check className="w-4 h-4 text-primary shrink-0" /> Locker Rooms & Hot Showers
                      </li>
                      {plan.durationMonths >= 3 && (
                        <li className="flex items-center gap-2 text-text">
                          <Check className="w-4 h-4 text-primary shrink-0" /> Group Fitness & HIIT Classes
                        </li>
                      )}
                      {plan.durationMonths >= 6 && (
                        <li className="flex items-center gap-2 text-text">
                          <Check className="w-4 h-4 text-primary shrink-0" /> AI Coach Formulation Engine
                        </li>
                      )}
                      {plan.durationMonths >= 12 && (
                        <li className="flex items-center gap-2 text-text">
                          <Check className="w-4 h-4 text-primary shrink-0" /> Dedicated Certified Coach
                        </li>
                      )}
                    </ul>
                  </div>

                  <div className="mt-8">
                    <Button
                      variant={isPopular ? 'primary' : 'secondary'}
                      className="w-full justify-center text-sm font-bold"
                      onClick={() => onSelectPlan(plan)}
                    >
                      <CreditCard className="w-4 h-4 mr-1.5" /> Select {plan.name}
                    </Button>
                  </div>
                </Card>
              );
            })
          ) : (
            <div className="col-span-3 text-center py-12 text-text-muted">
              Loading active membership packages...
            </div>
          )}
        </div>
      </section>

      {/* 4. CLASS TIMETABLE & SCHEDULE PREVIEW */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-10 gap-4">
          <div>
            <Badge variant="primary" className="mb-2">
              Group Training Schedule
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-text">
              Upcoming Classes
            </h2>
            <p className="text-xs sm:text-sm text-text-muted mt-1">
              High-intensity group sessions guided by certified trainers. Live capacity indicators.
            </p>
          </div>
          <Button variant="ghost" onClick={onViewClasses} className="text-primary font-bold text-sm">
            <span>Full Class Timetable</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {classesList.length > 0 ? (
            classesList.slice(0, 3).map((cls) => {
              const isFull = cls.booked_count >= cls.capacity;
              const pct = Math.min(100, Math.round((cls.booked_count / cls.capacity) * 100));

              return (
                <Card
                  key={cls.id}
                  className="p-6 flex flex-col justify-between hover:border-primary/50 transition group border-border"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs mb-3">
                      <span className="flex items-center gap-1 font-mono text-primary font-semibold">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatEthiopianDateTime(cls.start_time)}
                      </span>
                      <Badge variant={isFull ? 'warning' : 'success'} size="sm">
                        {isFull ? `Full (${cls.waitlist_count} Waitlist)` : `${cls.booked_count}/${cls.capacity} Booked`}
                      </Badge>
                    </div>

                    <h3 className="text-lg font-bold text-text group-hover:text-primary transition uppercase">
                      {cls.title}
                    </h3>
                    <p className="text-xs text-text-muted mt-1 line-clamp-2">
                      {cls.description || 'Full conditioning, mobility guidance, and strength drills.'}
                    </p>

                    <div className="mt-4 space-y-1.5 text-xs text-text-muted">
                      <p className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-primary shrink-0" /> {cls.location}
                      </p>
                      <p>
                        Instructor:{' '}
                        <span className="text-text font-medium">{cls.trainer_name || 'SWEATBOX Coach'}</span>
                        {cls.trainer_specialization && (
                          <span className="text-text-muted"> ({cls.trainer_specialization})</span>
                        )}
                      </p>
                    </div>

                    {/* Capacity visual bar */}
                    <div className="mt-4">
                      <div className="w-full bg-charcoal-900 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            isFull ? 'bg-amber-500' : 'bg-primary'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <Button
                    variant={isFull ? 'secondary' : 'primary'}
                    size="sm"
                    className="mt-6 w-full justify-center"
                    onClick={() => onBookClass(cls)}
                  >
                    {isFull ? 'Join Waitlist' : 'Reserve Spot'}
                  </Button>
                </Card>
              );
            })
          ) : (
            <div className="col-span-3 text-center py-12 text-text-muted">
              Loading scheduled fitness sessions...
            </div>
          )}
        </div>
      </section>

      {/* 5. CERTIFIED TRAINERS SHOWCASE */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <Badge variant="primary" className="mb-3">
            Elite Coaching Team
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-text">
            Meet the SWEATBOX Trainers
          </h2>
          <p className="text-text-muted text-sm sm:text-base mt-2">
            Certified coaches dedicated to safe biomechanics, athletic hypertrophy, and personalized accountability.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {TRAINERS.map((trainer) => (
            <Card
              key={trainer.id}
              className="overflow-hidden border-border hover:border-primary/50 transition group flex flex-col justify-between"
            >
              <div>
                <div className="w-full h-64 overflow-hidden bg-charcoal-900 relative">
                  <img
                    src={trainer.image}
                    alt={trainer.name}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500 filter contrast-105"
                  />
                  <div className="absolute top-3 right-3">
                    <Badge variant="primary" size="sm" className="shadow-md">
                      {trainer.experience}
                    </Badge>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-lg font-black text-text uppercase">{trainer.name}</h3>
                  <p className="text-xs font-semibold text-primary mt-0.5">{trainer.role}</p>
                  <p className="text-[11px] text-text-muted mt-1 font-mono uppercase">
                    {trainer.specialization}
                  </p>
                  <p className="text-xs text-text-muted mt-3 leading-relaxed">
                    {trainer.bio}
                  </p>
                </div>
              </div>

              <div className="p-6 pt-0">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-center text-xs"
                  onClick={onJoinNow}
                >
                  Train With {trainer.name.split(' ')[1]}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* 6. MOBILE APP & QR PASS DOWNLOAD SHOWCASE */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-charcoal-850 via-charcoal-900 to-charcoal-950 border border-border shadow-2xl relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-6">
              <Badge variant="primary">Next-Gen Member Experience</Badge>
              <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-text leading-tight">
                Your Gym Pass in Your Pocket. Zero Friction.
              </h2>
              <p className="text-sm sm:text-base text-text-muted leading-relaxed">
                Experience SWEATBOX on any mobile browser or smartphone. Instant 60-second dynamic QR check-ins, routine tracking with set logging, class reservation reminders, and direct Telebirr membership renewal.
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-surface border border-border">
                  <Smartphone className="w-5 h-5 text-primary" />
                  <div className="text-left text-xs">
                    <span className="text-text-muted block text-[10px]">PWA Ready</span>
                    <strong className="text-text">Add to Home Screen</strong>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-surface border border-border">
                  <HeartPulse className="w-5 h-5 text-primary" />
                  <div className="text-left text-xs">
                    <span className="text-text-muted block text-[10px]">Real-time Tracking</span>
                    <strong className="text-text">Workout Cues & Sets</strong>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Button variant="primary" size="lg" onClick={onJoinNow} className="shadow-xl shadow-primary/20">
                  <QrCode className="w-5 h-5 mr-2" /> Get Your Mobile Pass
                </Button>
              </div>
            </div>

            {/* Visual simulated mobile QR phone */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-64 sm:w-72 p-5 rounded-3xl bg-charcoal-950 border-4 border-charcoal-800 shadow-2xl relative">
                {/* Simulated notch */}
                <div className="w-24 h-4 bg-charcoal-800 rounded-full mx-auto mb-4" />

                <div className="text-center space-y-3">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                    <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
                    <span>ROTATING 60s TOTP</span>
                  </div>

                  <h4 className="text-xs font-bold text-text uppercase">SWEATBOX PASS</h4>

                  {/* QR code box */}
                  <div className="w-44 h-44 mx-auto p-3 rounded-2xl bg-white flex items-center justify-center shadow-lg">
                    <QrCode className="w-36 h-36 text-slate-950" />
                  </div>

                  <div className="text-[11px] text-text-muted font-mono">
                    Refreshes in <span className="text-primary font-bold">42s</span>
                  </div>

                  <div className="pt-2 border-t border-border/60 text-left text-[11px] text-text-muted flex justify-between">
                    <span>Member: Athlete</span>
                    <span className="text-emerald-400 font-bold">ACTIVE</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. INTERACTIVE FAQ ACCORDION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <Badge variant="primary" className="mb-3">
            Got Questions?
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-text">
            Frequently Asked Questions
          </h2>
          <p className="text-text-muted text-sm sm:text-base mt-2">
            Everything you need to know about SWEATBOX memberships, payments, and facilities.
          </p>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <Card
                key={idx}
                className="overflow-hidden border-border transition"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <span className="text-base font-bold text-text">{faq.q}</span>
                  <div className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center text-primary shrink-0 transition">
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 text-xs sm:text-sm text-text-muted leading-relaxed border-t border-border/50 pt-4 animate-fadeIn">
                    {faq.a}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </section>

      {/* 8. GLOBAL ATHLETIC FOOTER */}
      <footer className="pt-16 pb-12 border-t border-border bg-charcoal-950 -mx-4 sm:-mx-6 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-slate-950 font-black">
                <Dumbbell className="w-4 h-4" />
              </div>
              <span className="text-xl font-black text-text tracking-wider uppercase">SWEATBOX</span>
            </div>
            <p className="text-xs text-text-muted leading-relaxed">
              Addis Ababa's high-performance athletic club. Precision fitness engineering, dynamic QR authentication, and AI-powered transformation.
            </p>
            <div className="text-xs text-text-muted">
              © {new Date().getFullYear()} SWEATBOX Club. All rights reserved.
            </div>
          </div>

          {/* Operating Hours */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-text">Operating Hours</h4>
            <ul className="space-y-2 text-xs text-text-muted">
              <li className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <span className="text-text block font-medium">Monday – Saturday</span>
                  <span>6:00 AM – 10:00 PM (EAT)</span>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <span className="text-text block font-medium">Sunday</span>
                  <span>8:00 AM – 6:00 PM (EAT)</span>
                </div>
              </li>
            </ul>
          </div>

          {/* Location & Contact */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-text">Locations</h4>
            <ul className="space-y-2 text-xs text-text-muted">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <strong className="text-text block">Bole Medhanialem Flagship</strong>
                  <span>Next to Edna Mall, Addis Ababa</span>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <strong className="text-text block">Olympia Training Center</strong>
                  <span>Bole Road, Addis Ababa</span>
                </div>
              </li>
              <li className="flex items-center gap-2 pt-1">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                <span>+251 911 234 567</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <span>contact@sweatbox.et</span>
              </li>
            </ul>
          </div>

          {/* Quick Links & Developer Tools */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-text">Quick Links</h4>
            <ul className="space-y-2 text-xs text-text-muted">
              <li>
                <button type="button" onClick={onViewPlans} className="hover:text-primary transition">
                  Membership Plans & Pricing
                </button>
              </li>
              <li>
                <button type="button" onClick={onViewClasses} className="hover:text-primary transition">
                  Group Classes Timetable
                </button>
              </li>
              <li>
                <button type="button" onClick={onJoinNow} className="hover:text-primary transition">
                  Join Member Portal
                </button>
              </li>
              {onOpenDevGallery && (
                <li className="pt-2">
                  <button
                    type="button"
                    onClick={onOpenDevGallery}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface border border-border text-[11px] text-text hover:text-primary hover:border-primary/50 transition"
                  >
                    <Sparkles className="w-3 h-3 text-primary" />
                    <span>Dev Component Gallery</span>
                  </button>
                </li>
              )}
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
};
