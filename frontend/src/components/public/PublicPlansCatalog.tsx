import React from 'react';
import { Plan } from '../../api/plans';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Check, CreditCard, ShieldCheck, Sparkles } from 'lucide-react';

const DEFAULT_PLAN_IMAGE = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80';

interface PublicPlansCatalogProps {
  plans: Plan[];
  onSelectPlan: (plan: Plan) => void;
  isLoading?: boolean;
}

export const PublicPlansCatalog: React.FC<PublicPlansCatalogProps> = ({
  plans,
  onSelectPlan,
  isLoading = false,
}) => {
  return (
    <div className="w-full max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12 sm:space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <Badge variant="primary">
          <Sparkles className="w-3.5 h-3.5 mr-1" /> Transparent ETB Pricing
        </Badge>
        <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-text">
          MEMBERSHIP <span className="text-primary">TIERS</span>
        </h1>
        <p className="text-sm sm:text-base text-text-muted">
          Select the tier tailored to your athletic objectives. All memberships include full facility access, 60s dynamic QR pass, and instant Chapa online activation.
        </p>
      </div>

      {/* Grid of Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
        {isLoading ? (
          // Skeletons
          Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="p-8 rounded-2xl bg-surface border border-border animate-pulse space-y-4 shadow-sm">
              <div className="w-full h-44 rounded-xl bg-border" />
              <div className="h-6 w-3/4 bg-border rounded" />
              <div className="h-4 w-1/2 bg-border rounded" />
              <div className="h-10 w-2/3 bg-border rounded mt-4" />
              <div className="space-y-2 pt-4">
                <div className="h-4 bg-border rounded" />
                <div className="h-4 bg-border rounded" />
                <div className="h-4 bg-border rounded" />
              </div>
              <div className="h-11 bg-border rounded-xl mt-6" />
            </div>
          ))
        ) : plans.length > 0 ? (
          plans.map((p, idx) => {
            const isPopular = idx === 1 || p.durationMonths === 3;

            return (
              <Card
                key={p.id}
                className={`p-6 sm:p-8 flex flex-col justify-between transition group relative shadow-sm ${
                  isPopular
                    ? 'border-2 border-primary shadow-2xl shadow-primary/10'
                    : 'border-border'
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-slate-950 text-xs font-black uppercase tracking-wider shadow-lg shadow-primary/30">
                    Most Popular
                  </div>
                )}

                <div>
                  {/* Plan Visual Image */}
                  <div className="w-full h-48 rounded-xl overflow-hidden mb-6 bg-surface-elevated border border-border">
                    <img
                      src={p.imageUrl || DEFAULT_PLAN_IMAGE}
                      alt={p.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = DEFAULT_PLAN_IMAGE;
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-black text-text uppercase">{p.name}</h3>
                    <Badge variant={isPopular ? 'primary' : 'default'} size="sm">
                      {p.durationMonths} {p.durationMonths === 1 ? 'Month' : 'Months'}
                    </Badge>
                  </div>

                  <p className="text-xs text-text-muted mt-2 min-h-[32px] leading-relaxed">
                    {p.description || 'Full equipment floor access, showers, lockers, and mobile QR pass.'}
                  </p>

                  {/* Price */}
                  <div className="mt-6 mb-6 pb-6 border-b border-border">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-4xl font-black text-text">{p.price.toLocaleString()}</span>
                      <span className="text-sm font-bold text-primary">ETB</span>
                      <span className="text-xs text-text-muted ml-1">
                        / {p.durationMonths} {p.durationMonths === 1 ? 'Month' : 'Months'}
                      </span>
                    </div>
                    <span className="text-[11px] text-text-muted block mt-1">
                      ≈ {Math.round(p.price / p.durationMonths).toLocaleString()} ETB per month
                    </span>
                  </div>

                  {/* Feature checklist */}
                  <ul className="space-y-3 text-xs sm:text-sm text-text-muted">
                    <li className="flex items-center gap-2.5 text-text">
                      <Check className="w-4 h-4 text-primary shrink-0" /> Full Gym & Olympic Floor Access
                    </li>
                    <li className="flex items-center gap-2.5 text-text">
                      <Check className="w-4 h-4 text-primary shrink-0" /> 60-Second Rotating QR Mobile Pass
                    </li>
                    <li className="flex items-center gap-2.5 text-text">
                      <Check className="w-4 h-4 text-primary shrink-0" /> Locker Room & Shower Amenities
                    </li>
                    <li className="flex items-center gap-2.5 text-text">
                      <Check className="w-4 h-4 text-primary shrink-0" /> Telebirr & CBE Birr Instant Checkout
                    </li>
                    {p.durationMonths >= 3 && (
                      <li className="flex items-center gap-2.5 text-text">
                        <Check className="w-4 h-4 text-primary shrink-0" /> Group Fitness & HIIT Classes
                      </li>
                    )}
                    {p.durationMonths >= 6 && (
                      <li className="flex items-center gap-2.5 text-text">
                        <Check className="w-4 h-4 text-primary shrink-0" /> SWEATBOX Gemini AI Workout Coach
                      </li>
                    )}
                    {p.durationMonths >= 12 && (
                      <li className="flex items-center gap-2.5 text-text">
                        <Check className="w-4 h-4 text-primary shrink-0" /> Dedicated Certified Trainer Session
                      </li>
                    )}
                  </ul>
                </div>

                <div className="mt-8 pt-4">
                  <Button
                    variant={isPopular ? 'primary' : 'secondary'}
                    size="lg"
                    className="w-full justify-center text-sm font-black uppercase shadow-sm"
                    onClick={() => onSelectPlan(p)}
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Subscribe to {p.name}
                  </Button>
                </div>
              </Card>
            );
          })
        ) : (
          <div className="col-span-3 text-center py-16 text-text-muted">
            No public membership packages are currently active. Please check back shortly.
          </div>
        )}
      </div>

      {/* Assurance banner */}
      <div className="w-full p-6 sm:p-8 rounded-2xl bg-surface border border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/25 flex items-center justify-center text-primary shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm sm:text-base font-bold text-text">100% Secure Chapa Gateway</h4>
            <p className="text-xs text-text-muted mt-0.5">
              Telebirr, CBE Birr, and Bank Card transactions are encrypted with bank-grade 256-bit SSL.
            </p>
          </div>
        </div>
        <div className="text-xs text-text-muted">
          Need corporate or team billing? <span className="text-primary font-bold">Contact Reception</span>
        </div>
      </div>
    </div>
  );
};
