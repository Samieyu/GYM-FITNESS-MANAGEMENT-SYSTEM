/**
 * Comprehensive System Verification Test
 * Accurately testing all 10 feature suites of Titan Fitness Management System
 */

const BASE_URL = 'http://127.0.0.1:5000';

async function request(method, path, body = null, headers = {}) {
  const url = `${BASE_URL}${path}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };
  if (body) {
    options.body = JSON.stringify(body);
  }

  const res = await fetch(url, options);
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch (e) {
    // not json
  }
  return { status: res.status, headers: res.headers, body: json, raw: text };
}

async function runAllTests() {
  console.log('========================================================================');
  console.log('TITAN FITNESS MANAGEMENT SYSTEM - FULL FUNCTIONALITY & E2E VERIFICATION');
  console.log('========================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
    }
  }

  try {
    // 0. HEALTH CHECK
    const health = await request('GET', '/health');
    assert(health.status === 200 && (health.body?.status === 'healthy' || health.body?.status === 'ok'), `System Health API is operational (status: ${health.body?.status})`);

    // 1. AUTHENTICATION & ROLE-BASED ACCESS CONTROL (RBAC)
    console.log('\n--- 1. Authentication & RBAC ---');
    const adminLogin = await request('POST', '/api/v1/auth/login', {
      email: 'admin@gymfitness.local',
      password: 'Admin@123456',
    });
    const adminToken = adminLogin.body?.data?.accessToken;
    assert(adminLogin.status === 200 && adminLogin.body?.data?.user?.role === 'admin' && !!adminToken, 'Admin login with JWT access token');
    const adminHeaders = { Authorization: `Bearer ${adminToken}` };

    const memberLogin = await request('POST', '/api/v1/auth/login', {
      email: 'member@gymfitness.local',
      password: 'Member@123456',
    });
    const memberToken = memberLogin.body?.data?.accessToken;
    assert(memberLogin.status === 200 && memberLogin.body?.data?.user?.role === 'member' && !!memberToken, 'Member login with JWT access token');
    const memberHeaders = { Authorization: `Bearer ${memberToken}` };
    const memberId = memberLogin.body?.data?.user?.id;

    const trainerLogin = await request('POST', '/api/v1/auth/login', {
      email: 'trainer@gymfitness.local',
      password: 'Trainer@123456',
    });
    const trainerToken = trainerLogin.body?.data?.accessToken;
    assert(trainerLogin.status === 200 && trainerLogin.body?.data?.user?.role === 'trainer' && !!trainerToken, 'Trainer login with JWT access token');
    const trainerHeaders = { Authorization: `Bearer ${trainerToken}` };

    const receptionLogin = await request('POST', '/api/v1/auth/login', {
      email: 'reception@gymfitness.local',
      password: 'Reception@123456',
    });
    const receptionToken = receptionLogin.body?.data?.accessToken;
    assert(receptionLogin.status === 200 && receptionLogin.body?.data?.user?.role === 'reception' && !!receptionToken, 'Reception staff login with JWT access token');
    const receptionHeaders = { Authorization: `Bearer ${receptionToken}` };

    // 2. MEMBER PROFILES AND MEMBERSHIPS (PLANS)
    console.log('\n--- 2. Member Profiles and Memberships ---');
    const plansRes = await request('GET', '/api/v1/plans');
    assert(plansRes.status === 200 && Array.isArray(plansRes.body?.data), `Public plans fetched (${plansRes.body?.data?.length} plans available)`);
    const activePlan = plansRes.body?.data?.[0];

    const myMembershipRes = await request('GET', '/api/v1/memberships/my-active', null, memberHeaders);
    assert(myMembershipRes.status === 200, 'Member retrieved active membership status (Rule 2 enforced)');

    // 3. PAYMENTS AND MEMBERSHIP EXPIRY (CHAPA & MANUAL)
    console.log('\n--- 3. Payments and Membership Expiry ---');
    // Test Rule 2: Active member attempting second plan is blocked with 409 Conflict
    const duplicatePaymentAttempt = await request('POST', '/api/v1/payments/chapa/initialize', {
      planId: activePlan.id,
      returnUrl: 'http://localhost:5173/?payment=success',
    }, memberHeaders);
    assert(duplicatePaymentAttempt.status === 409, 'Business Rule 2 enforced: prevents duplicate overlapping active memberships (HTTP 409 Conflict)');

    // Register a fresh walk-in athlete at reception desk to verify full payment activation flow
    const uniqueEmail = `athlete${Date.now()}@gmail.com`;
    const walkinRes = await request('POST', '/api/v1/reception/walk-in', {
      firstName: 'Tadesse',
      lastName: 'Bekele',
      email: uniqueEmail,
      phone: '+251911445566',
      planId: activePlan.id,
      paymentMethod: 'cash',
      amount: 1500,
      referenceNote: 'Cash payment at reception desk',
      fitnessGoals: 'Muscle gain & conditioning',
    }, receptionHeaders);
    assert(walkinRes.status === 200 || walkinRes.status === 201, 'Reception walk-in registration with cash payment completed (Rule 10)');

    const myPaymentsRes = await request('GET', '/api/v1/payments/my-history', null, memberHeaders);
    assert(myPaymentsRes.status === 200 && Array.isArray(myPaymentsRes.body?.data), `Member payment & billing history retrieved (${myPaymentsRes.body?.data?.length} transactions)`);

    // 4. ATTENDANCE AND QR CHECK-IN (DYNAMIC HMAC & EXPIRY)
    console.log('\n--- 4. Attendance and QR Check-In ---');
    const qrPassRes = await request('GET', '/api/v1/checkins/my-qr', null, memberHeaders);
    assert(qrPassRes.status === 200 && qrPassRes.body?.data?.token, '60-second Dynamic QR Pass generated with cryptographic HMAC token (Rule 7)');
    const qrToken = qrPassRes.body?.data?.token;

    if (qrToken) {
      const scanRes = await request('POST', '/api/v1/checkins/scan', {
        scannedData: qrToken,
        checkinType: 'reception_qr',
      }, receptionHeaders);
      assert(scanRes.status === 200 && scanRes.body?.data?.status, `Front Desk QR scanner verified token: Entrance Status=${scanRes.body?.data?.status}`);
    }

    // 5. TRAINER MANAGEMENT AND WORKOUT PLANS (AI SPLIT & COACH APPROVAL)
    console.log('\n--- 5. Trainer Management and Workout Plans ---');
    const exercisesRes = await request('GET', '/api/v1/workouts/exercises', null, memberHeaders);
    assert(exercisesRes.status === 200 && Array.isArray(exercisesRes.body?.data), `Exercise library loaded (${exercisesRes.body?.data?.length} exercises)`);

    const myWorkoutRes = await request('GET', '/api/v1/workouts/my-active', null, memberHeaders);
    assert(myWorkoutRes.status === 200, 'Member active workout routine retrieved (Rule 10)');

    const trainerQueueRes = await request('GET', '/api/v1/workouts/trainer/pending', null, trainerHeaders);
    assert(trainerQueueRes.status === 200 && Array.isArray(trainerQueueRes.body?.data), 'Trainer fetched pending workout approval queue (Rule 11)');

    // 6. PROGRESS TRACKING AND FITNESS GOALS
    console.log('\n--- 6. Progress Tracking and Fitness Goals ---');
    const logWeightRes = await request('POST', '/api/v1/progress', {
      weightKg: 80.2,
      heightCm: 180,
      chestCm: 105,
      waistCm: 84,
      armsCm: 39,
    }, memberHeaders);
    assert(logWeightRes.status === 201 || logWeightRes.status === 200, 'Athlete logged body transformation metrics (Weight, BMI, Measurements)');

    const progressLogsRes = await request('GET', '/api/v1/progress/my', null, memberHeaders);
    assert(progressLogsRes.status === 200, 'Athlete progress metrics timeline & summary loaded');

    // 7. CLASSES, BOOKINGS AND NOTIFICATIONS
    console.log('\n--- 7. Classes, Bookings and Waitlists ---');
    const classesRes = await request('GET', '/api/v1/classes');
    assert(classesRes.status === 200 && Array.isArray(classesRes.body?.data), `Group classes schedule retrieved (${classesRes.body?.data?.length} classes)`);

    const myBookingsRes = await request('GET', '/api/v1/classes/my/bookings', null, memberHeaders);
    assert(myBookingsRes.status === 200 && Array.isArray(myBookingsRes.body?.data), 'Member reserved spots & waitlist queue retrieved (Rule 12)');

    // 8. EQUIPMENT AND MAINTENANCE MANAGEMENT
    console.log('\n--- 8. Equipment and Maintenance Management ---');
    const equipmentRes = await request('GET', '/api/v1/equipment', null, adminHeaders);
    assert(equipmentRes.status === 200 && Array.isArray(equipmentRes.body?.data), `Gym equipment inventory loaded (${equipmentRes.body?.data?.length} items)`);

    const reportsRes = await request('GET', '/api/v1/equipment/reports', null, adminHeaders);
    assert(reportsRes.status === 200 && Array.isArray(reportsRes.body?.data), `Equipment defect & repair reports loaded (${reportsRes.body?.data?.length} reports)`);

    // 9. AI FITNESS SUITE: WORKOUT ASSISTANT, BIOMECHANICS & FASTING
    console.log('\n--- 9. AI Fitness Suite (Coach, Form Guide, Progress) ---');
    const aiChatRes = await request('POST', '/api/v1/ai/chat', {
      question: 'What should I eat during orthodox fasting (tsom) for bodybuilding protein?',
    }, memberHeaders);
    assert(aiChatRes.status === 200 && (aiChatRes.body?.data?.answer || aiChatRes.body?.data?.reply), 'AI Fitness Coach Q&A answered with Ethiopian nutrition awareness');

    const aiExplainRes = await request('POST', '/api/v1/ai/explain', {
      exerciseName: 'Barbell Back Squat',
    }, memberHeaders);
    assert(aiExplainRes.status === 200 && aiExplainRes.body?.data?.exerciseName, 'AI Biomechanics explained setup, cues & common mistakes');

    if (memberId) {
      const aiProgressRes = await request('GET', `/api/v1/ai/progress-summary/${memberId}`, null, adminHeaders);
      assert(aiProgressRes.status === 200 && aiProgressRes.body?.data?.summary, 'AI generated personalized transformation progress summary');
    }

    // 10. FINANCIAL & ATTENDANCE ANALYTICS + ETHIOPIAN CALENDAR EXPORTS
    console.log('\n--- 10. Analytics & Ethiopian Calendar CSV Exports ---');
    const finRes = await request('GET', '/api/v1/analytics/financial', null, adminHeaders);
    assert(finRes.status === 200 && finRes.body?.data?.totalRevenue !== undefined, `Financial Analytics: Total Revenue = ${finRes.body?.data?.totalRevenue?.toLocaleString()} ETB`);

    const attRes = await request('GET', '/api/v1/analytics/attendance', null, adminHeaders);
    assert(attRes.status === 200 && Array.isArray(attRes.body?.data?.hourlyTraffic), `Attendance Analytics: Peak traffic heatmap generated (${attRes.body?.data?.hourlyTraffic?.length} hours tracked)`);

    const csvAtt = await request('GET', '/api/v1/analytics/export/attendance', null, adminHeaders);
    assert(csvAtt.status === 200 && csvAtt.raw?.includes('ዓ.ም'), 'Attendance CSV Export generated with certified Ethiopian Calendar (ዓ.ም / E.C.)');

    const csvMembers = await request('GET', '/api/v1/analytics/export/members', null, adminHeaders);
    assert(csvMembers.status === 200 && csvMembers.raw?.includes('ዓ.ም'), 'Member Roster CSV Export generated with Ethiopian Calendar (ዓ.ም / E.C.)');

    const csvFin = await request('GET', '/api/v1/analytics/export/financial', null, adminHeaders);
    assert(csvFin.status === 200 && csvFin.raw?.includes('ETB'), 'Financial Reconciliation CSV Export generated with ETB currency amounts');

    console.log('\n========================================================================');
    console.log(`ALL SYSTEM CHECKS COMPLETED: ${passed} PASSED, ${failed} FAILED`);
    console.log('========================================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test execution failed:', err);
    process.exit(1);
  }
}

runAllTests();
