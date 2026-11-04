import React, { useState } from 'react';
import {
  Button,
  Input,
  Select,
  Textarea,
  Checkbox,
  RadioGroup,
  Switch,
  DateInput,
  PhotoUploader,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  StatCard,
  Badge,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Modal,
  ModalTrigger,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
  BottomSheet,
  BottomSheetTrigger,
  BottomSheetContent,
  BottomSheetHeader,
  BottomSheetTitle,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  useToast,
  Alert,
  Skeleton,
  CardSkeleton,
  TableSkeleton,
  EmptyState,
  Avatar,
  ProgressRing,
  Pagination,
  ResponsiveTable,
  ThemeToggle,
} from './ui';
import {
  Dumbbell,
  Users,
  Flame,
  Award,
  Sparkles,
  QrCode,
  DollarSign,
  ArrowRight,
  MoreVertical,
  Sliders,
  X,
  Heart,
  MessageSquare,
} from 'lucide-react';

export const DevComponentGallery: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const toast = useToast();

  // State demos
  const [inputText, setInputText] = useState('');
  const [inputError, setInputError] = useState('');
  const [textareaVal, setTextareaVal] = useState('Certified CSCS Trainer note: focus on eccentric tempo.');
  const [selectVal, setSelectVal] = useState('monthly');
  const [checkVal, setCheckVal] = useState(true);
  const [radioVal, setRadioVal] = useState('strength');
  const [switchVal, setSwitchVal] = useState(true);
  const [dateVal, setDateVal] = useState('2026-11-04');
  const [photoVal, setPhotoVal] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const sampleTableData = [
    { id: '1', name: 'John Athlete', plan: 'SWEAT Pro 3-Mo', status: 'Active', visits: 18 },
    { id: '2', name: 'Sara Connor', plan: 'SWEAT Monthly', status: 'Expiring', visits: 12 },
    { id: '3', name: 'Michael Scott', plan: 'VIP Annual', status: 'Active', visits: 42 },
  ];

  return (
    <TooltipProvider>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-base text-content-primary p-4 sm:p-8">
        <div className="max-w-6xl mx-auto space-y-10 pb-20">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border-subtle sticky top-0 bg-base/90 backdrop-blur-md z-30 pt-2">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#FF6B00] text-[#0E1116] flex items-center justify-center font-black">
                  SB
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">SWEATBOX Design System Gallery</h1>
                  <p className="text-xs text-content-secondary">
                    Phase 1 Component Library • Accessible WCAG 2.2 AA Primitives & Design Tokens
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Button variant="secondary" size="sm" onClick={onClose} leftIcon={<X className="w-4 h-4" />}>
                Close Gallery
              </Button>
            </div>
          </div>

          {/* Section 1: Brand Tokens & Palette */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold uppercase tracking-wider text-content-secondary flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#FF6B00]" />
              <span>1. Design Tokens & Color Swatches</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 text-xs">
              <div className="p-3 rounded-xl border border-border-subtle bg-base space-y-1">
                <div className="h-10 rounded-lg bg-base border border-border-strong" />
                <span className="font-bold block">Base Canvas</span>
                <span className="text-content-muted">var(--bg-base)</span>
              </div>
              <div className="p-3 rounded-xl border border-border-subtle bg-surface space-y-1">
                <div className="h-10 rounded-lg bg-surface border border-border-subtle" />
                <span className="font-bold block">Card Surface</span>
                <span className="text-content-muted">var(--bg-surface)</span>
              </div>
              <div className="p-3 rounded-xl border border-border-subtle bg-surface-elevated space-y-1">
                <div className="h-10 rounded-lg bg-surface-elevated border border-border-subtle" />
                <span className="font-bold block">Surface Elevated</span>
                <span className="text-content-muted">var(--bg-surface-elevated)</span>
              </div>
              <div className="p-3 rounded-xl border border-border-subtle bg-surface space-y-1">
                <div className="h-10 rounded-lg bg-[#FF6B00]" />
                <span className="font-bold block text-[#FF6B00]">Brand Orange</span>
                <span className="text-content-muted">#FF6B00</span>
              </div>
              <div className="p-3 rounded-xl border border-border-subtle bg-surface space-y-1">
                <div className="h-10 rounded-lg bg-emerald-500" />
                <span className="font-bold block text-emerald-400">Success</span>
                <span className="text-content-muted">#10B981</span>
              </div>
              <div className="p-3 rounded-xl border border-border-subtle bg-surface space-y-1">
                <div className="h-10 rounded-lg bg-rose-500" />
                <span className="font-bold block text-rose-400">Danger</span>
                <span className="text-content-muted">#EF4444</span>
              </div>
            </div>
          </section>

          {/* Section 2: Buttons & States */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold uppercase tracking-wider text-content-secondary flex items-center gap-2">
              <Flame className="w-4 h-4 text-[#FF6B00]" />
              <span>2. Buttons & Touch Targets (Min 44px)</span>
            </h2>
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="primary">Primary Action</Button>
              <Button variant="secondary">Secondary Action</Button>
              <Button variant="outline">Outline Action</Button>
              <Button variant="ghost">Ghost Action</Button>
              <Button variant="destructive">Destructive Action</Button>
              <Button variant="primary" isLoading>Loading State</Button>
              <Button variant="primary" disabled>Disabled State</Button>
              <Button variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />}>
                With Icon
              </Button>
            </div>
          </section>

          {/* Section 3: Form Controls */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold uppercase tracking-wider text-content-secondary flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#FF6B00]" />
              <span>3. Form Controls & Validation States</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Input
                label="Athlete Full Name"
                placeholder="e.g. Abebe Bikila"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                helperText="Enter your official identification name."
              />

              <Input
                label="Password (with show/hide)"
                placeholder="••••••••••••"
                isPassword
                defaultValue="Secret123"
              />

              <Input
                label="Input With Error"
                placeholder="email@example.com"
                value={inputError}
                onChange={(e) => setInputError(e.target.value)}
                error="Please enter a valid Ethiopian gym email address."
              />

              <Select
                label="Subscription Billing Interval"
                value={selectVal}
                onChange={(e) => setSelectVal(e.target.value)}
                options={[
                  { value: 'monthly', label: 'Monthly Tier (1 Month)' },
                  { value: 'quarterly', label: 'SWEAT Pro (3 Months) - Most Popular' },
                  { value: 'annual', label: 'VIP Unlimited (12 Months)' },
                ]}
              />

              <DateInput
                label="Membership Start Date"
                value={dateVal}
                onChange={(e) => setDateVal(e.target.value)}
              />

              <div className="space-y-3 p-4 rounded-xl border border-border-subtle bg-surface">
                <span className="block text-xs font-semibold uppercase tracking-wider text-content-secondary">
                  Toggles & Checkboxes
                </span>
                <Checkbox
                  label="Accept Fitness Health Waiver"
                  description="Required prior to entering the facility floor."
                  checked={checkVal}
                  onChange={(e) => setCheckVal(e.target.checked)}
                />
                <Switch
                  label="Dynamic 60s QR Auto-Refresh"
                  description="Pulsing token countdown for high-security access."
                  checked={switchVal}
                  onCheckedChange={setSwitchVal}
                />
              </div>

              <div className="md:col-span-2">
                <Textarea
                  label="Coaching Notes / Bio"
                  value={textareaVal}
                  onChange={(e) => setTextareaVal(e.target.value)}
                  helperText="Visible to assigned certified trainers."
                />
              </div>

              <div>
                <span className="block text-xs font-semibold uppercase tracking-wider text-content-secondary mb-2">
                  Training Discipline
                </span>
                <RadioGroup
                  name="discipline"
                  value={radioVal}
                  onChange={setRadioVal}
                  options={[
                    { value: 'strength', label: 'Strength & Conditioning', description: 'Hypertrophy and barbell focus' },
                    { value: 'hiit', label: 'High Intensity Cardio', description: 'Speed, agility, and endurance' },
                  ]}
                />
              </div>

              <div className="md:col-span-2 lg:col-span-3">
                <PhotoUploader
                  label="Athlete Facial Photo / Camera Capture"
                  helperText="Required for reception check-in identity verification."
                  value={photoVal}
                  onChange={setPhotoVal}
                />
              </div>
            </div>
          </section>

          {/* Section 4: Cards & Tabs */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold uppercase tracking-wider text-content-secondary flex items-center gap-2">
              <Award className="w-4 h-4 text-[#FF6B00]" />
              <span>4. Cards, Interactive Containers & Tabs</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card variant="default">
                <CardHeader>
                  <CardTitle>Standard Surface Card</CardTitle>
                  <CardDescription>Container with subtle borders and WCAG AA contrast.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-content-secondary">
                    Contains workout logs, member records, and facility health notices with responsive padding.
                  </p>
                </CardContent>
                <CardFooter>
                  <span className="text-xs text-content-muted">SWEATBOX Gym System</span>
                  <Button variant="outline" size="sm">Action</Button>
                </CardFooter>
              </Card>

              <Card variant="interactive" glow>
                <CardHeader>
                  <CardTitle className="text-[#FF6B00]">Interactive Highlight Card</CardTitle>
                  <CardDescription>Features athletic glow border on active states.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="classes">
                    <TabsList>
                      <TabsTrigger value="classes">Group Classes</TabsTrigger>
                      <TabsTrigger value="workouts">Workouts</TabsTrigger>
                      <TabsTrigger value="coaching">AI Coach</TabsTrigger>
                    </TabsList>
                    <TabsContent value="classes">
                      <p className="text-xs text-content-secondary">
                        Today: 3 classes scheduled (Boxing, HIIT, Yoga).
                      </p>
                    </TabsContent>
                    <TabsContent value="workouts">
                      <p className="text-xs text-content-secondary">
                        Today: Push Routine (Chest, Shoulders, Triceps).
                      </p>
                    </TabsContent>
                    <TabsContent value="coaching">
                      <p className="text-xs text-content-secondary">
                        AI Coach: Hydrate with 2.5L water today for recovery.
                      </p>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Section 5: Stat Cards & Progress Ring */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold uppercase tracking-wider text-content-secondary flex items-center gap-2">
              <Award className="w-4 h-4 text-[#FF6B00]" />
              <span>5. Stat Cards & Athletic Progress Rings</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                label="Total Revenue"
                value="46,000"
                unit="ETB"
                icon={<DollarSign className="w-4 h-4" />}
                trend={{ value: '+14.2%', direction: 'up', label: 'vs last month' }}
                highlight
              />
              <StatCard
                label="Active Check-Ins Today"
                value="142"
                unit="Athletes"
                icon={<Users className="w-4 h-4" />}
                trend={{ value: '+8%', direction: 'up' }}
              />
              <StatCard
                label="Days Remaining"
                value="24"
                unit="Days"
                icon={<Flame className="w-4 h-4" />}
                subtext="Valid until: 28 Tikimt 2019 E.C."
              />
              <div className="p-4 rounded-xl border border-border-subtle bg-surface flex items-center justify-around">
                <ProgressRing
                  value={75}
                  size={96}
                  strokeWidth={8}
                  centerText="75%"
                  centerSubtext="Goal"
                />
                <div className="text-left space-y-1">
                  <span className="text-xs uppercase font-bold text-content-secondary">Transformation</span>
                  <p className="text-sm font-bold text-content-primary">12 / 16 Sessions</p>
                  <Badge variant="success" size="sm" dot>On Track</Badge>
                </div>
              </div>
            </div>
          </section>

          {/* Section 6: Badges & Status Chips */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold uppercase tracking-wider text-content-secondary flex items-center gap-2">
              <Award className="w-4 h-4 text-[#FF6B00]" />
              <span>6. Status Chips & Badges</span>
            </h2>
            <div className="flex flex-wrap gap-2.5">
              <Badge variant="primary">SWEAT Pro Tier</Badge>
              <Badge variant="success" dot>Check-In Allowed</Badge>
              <Badge variant="warning" dot>Expires in 3 Days</Badge>
              <Badge variant="danger" dot>Access Denied</Badge>
              <Badge variant="info">Waitlist #2</Badge>
              <Badge variant="default">Standard Member</Badge>
            </div>
          </section>

          {/* Section 7: Popups, Toasts, Dropdowns & Tooltips */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold uppercase tracking-wider text-content-secondary flex items-center gap-2">
              <QrCode className="w-4 h-4 text-[#FF6B00]" />
              <span>7. Accessible Popups, Drawers, Dropdowns & Toasts</span>
            </h2>
            <div className="flex flex-wrap items-center gap-3">
              {/* Centered Modal */}
              <Modal>
                <ModalTrigger asChild>
                  <Button variant="primary">Open Centered Modal</Button>
                </ModalTrigger>
                <ModalContent size="md">
                  <ModalHeader>
                    <ModalTitle>Dynamic 60s QR Pass</ModalTitle>
                    <ModalDescription>
                      Scan this code at the reception counter to gain gym floor entry.
                    </ModalDescription>
                  </ModalHeader>
                  <div className="py-6 flex flex-col items-center justify-center space-y-3">
                    <div className="w-44 h-44 rounded-2xl bg-white p-3 flex items-center justify-center shadow-glow">
                      <QrCode className="w-36 h-36 text-black" />
                    </div>
                    <span className="font-mono text-xs text-[#FF6B00] font-bold">
                      Expires in 42s • Cryptographically Signed
                    </span>
                  </div>
                  <ModalFooter>
                    <Button variant="secondary">Close</Button>
                    <Button variant="primary">Refresh QR Pass</Button>
                  </ModalFooter>
                </ModalContent>
              </Modal>

              {/* Bottom Sheet */}
              <BottomSheet>
                <BottomSheetTrigger asChild>
                  <Button variant="secondary">Open Mobile Bottom Sheet</Button>
                </BottomSheetTrigger>
                <BottomSheetContent>
                  <BottomSheetHeader>
                    <BottomSheetTitle>Log Body Transformation</BottomSheetTitle>
                  </BottomSheetHeader>
                  <div className="space-y-4 py-2">
                    <Input label="Current Weight (kg)" placeholder="78.5" type="number" />
                    <Input label="Chest Measurement (cm)" placeholder="102" type="number" />
                    <Input label="Waist Measurement (cm)" placeholder="82" type="number" />
                    <Button variant="primary" fullWidth>Save Progress Entry</Button>
                  </div>
                </BottomSheetContent>
              </BottomSheet>

              {/* Dropdown Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" rightIcon={<MoreVertical className="w-4 h-4" />}>
                    Member Options
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>
                    <Heart className="w-4 h-4 text-[#FF6B00]" /> View Fitness Goals
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <MessageSquare className="w-4 h-4 text-blue-400" /> Send Coach Message
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem destructive>
                    Cancel Membership
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Accessible Tooltip */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost">Hover For Tooltip</Button>
                </TooltipTrigger>
                <TooltipContent>
                  WCAG AA Accessible collision-safe tooltip
                </TooltipContent>
              </Tooltip>

              {/* Toast Triggers */}
              <Button variant="outline" onClick={() => toast.success('Check-in Approved', 'Welcome to SWEATBOX, John!')}>
                Success Toast
              </Button>
              <Button variant="outline" onClick={() => toast.error('Pass Expired', 'Please renew your subscription at front desk.')}>
                Error Toast
              </Button>
              <Button variant="outline" onClick={() => toast.warning('Class Starting Soon', 'HIIT Blast starts in 30 minutes.')}>
                Warning Toast
              </Button>
            </div>
          </section>

          {/* Section 8: Alerts & Banners */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold uppercase tracking-wider text-content-secondary flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#FF6B00]" />
              <span>8. Alerts & Feedback Banners</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Alert variant="success" title="Payment Verified Successfully">
                Your 3-Month SWEAT Pro subscription is active until 28 Tikimt 2019 E.C.
              </Alert>
              <Alert variant="warning" title="Anti-Passback Protected">
                QR tokens expire strictly after 60 seconds. Screenshots cannot be shared.
              </Alert>
            </div>
          </section>

          {/* Section 9: Responsive Data Table to Mobile Cards */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold uppercase tracking-wider text-content-secondary flex items-center gap-2">
              <Users className="w-4 h-4 text-[#FF6B00]" />
              <span>9. Responsive Data Table (Turns into Stacked Cards on Mobile)</span>
            </h2>
            <ResponsiveTable
              data={sampleTableData}
              keyExtractor={(item) => item.id}
              columns={[
                {
                  header: 'Athlete',
                  cell: (row) => (
                    <div className="flex items-center gap-2.5">
                      <Avatar name={row.name} size="sm" status="online" />
                      <span className="font-bold">{row.name}</span>
                    </div>
                  ),
                },
                {
                  header: 'Membership Plan',
                  accessorKey: 'plan',
                },
                {
                  header: 'Status',
                  cell: (row) => (
                    <Badge variant={row.status === 'Active' ? 'success' : 'warning'} size="sm" dot>
                      {row.status}
                    </Badge>
                  ),
                },
                {
                  header: 'Monthly Visits',
                  cell: (row) => <span className="font-bold tabular-nums">{row.visits} visits</span>,
                },
              ]}
            />
            <Pagination
              currentPage={currentPage}
              totalPages={3}
              onPageChange={setCurrentPage}
            />
          </section>

          {/* Section 10: Skeletons & Empty States */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold uppercase tracking-wider text-content-secondary flex items-center gap-2">
              <Dumbbell className="w-4 h-4 text-[#FF6B00]" />
              <span>10. Loading Skeletons & Empty State Illustrations</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Skeleton className="h-4 w-48 rounded" />
                <CardSkeleton />
                <TableSkeleton rows={2} />
              </div>
              <EmptyState
                icon={<Dumbbell className="w-8 h-8" />}
                title="No Active Workout Routine"
                description="You don't have a routine formulated yet. Generate one instantly with our AI Coach."
                actionLabel="Formulate with SWEATBOX AI"
                onAction={() => toast.info('AI Routine Formulator', 'Opening workout engine...')}
              />
            </div>
          </section>
        </div>
      </div>
    </TooltipProvider>
  );
};
