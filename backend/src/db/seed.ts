import bcrypt from 'bcryptjs';
import { pool } from './pool';

export const seedDatabase = async () => {
  const client = await pool.connect();
  try {
    console.log('[Seed] Seeding initial data...');
    await client.query('BEGIN');

    // 1. Seed Sole Admin Account (no default reception/trainer/member/.local demo accounts)
    const adminEmail = (process.env.ADMIN_EMAIL || 'samiwm63@gmail.com').toLowerCase().trim();
    const adminPasswordHash = process.env.ADMIN_PASSWORD
      ? await bcrypt.hash(process.env.ADMIN_PASSWORD, 12)
      : '$2a$12$Ob3kUsyqnP2YlYFfT4peVO3trneUvSRaznFtG1Ao8WPp.BYZQQ3G2';

    const adminRes = await client.query(
      `
      INSERT INTO users (email, password_hash, role, first_name, last_name, is_verified, is_active)
      VALUES ($1, $2, 'admin', 'System', 'Administrator', true, true)
      ON CONFLICT (email) DO UPDATE SET role = 'admin', is_verified = true, is_active = true
      RETURNING id;
    `,
      [adminEmail, adminPasswordHash]
    );
    const adminId = adminRes.rows[0].id;

    // 2. Seed Membership Plans
    await client.query(
      `
      INSERT INTO membership_plans (name, description, duration_months, price, is_active, created_by_admin_id)
      VALUES 
        ('Standard Monthly', 'Access to general gym facilities and locker room.', 1, 1500.00, true, $1),
        ('Quarterly Fitness', '3 Months unlimited gym access + 1 free fitness assessment.', 3, 4000.00, true, $1),
        ('Annual VIP Elite', 'Full 12 Months access, sauna, classes, and dedicated trainer plan.', 12, 14000.00, true, $1)
      ON CONFLICT (name) DO NOTHING;
    `,
      [adminId]
    );

    // 3. Seed Exercise Library
    const exercises = [
      {
        name: 'Barbell Bench Press',
        category: 'Strength',
        muscle: 'Chest',
        equipment: 'Barbell, Bench',
        description: 'Compound upper-body pressing movement targeting pectorals and triceps.',
      },
      {
        name: 'Barbell Back Squat',
        category: 'Strength',
        muscle: 'Quadriceps, Glutes',
        equipment: 'Barbell, Squat Rack',
        description: 'Fundamental lower body strength exercise engaging quads, glutes, and core.',
      },
      {
        name: 'Conventional Deadlift',
        category: 'Strength',
        muscle: 'Hamstrings, Back',
        equipment: 'Barbell',
        description: 'Hip-hinge posterior chain exercise building total body strength.',
      },
      {
        name: 'Overhead Shoulder Press',
        category: 'Strength',
        muscle: 'Shoulders, Triceps',
        equipment: 'Barbell or Dumbbells',
        description: 'Vertical pressing movement building shoulder stability and power.',
      },
      {
        name: 'Pull-Up',
        category: 'Bodyweight',
        muscle: 'Lats, Biceps',
        equipment: 'Pull-up Bar',
        description: 'Bodyweight vertical pulling exercise for upper back width and grip.',
      },
      {
        name: 'Dumbbell Walking Lunge',
        category: 'Strength',
        muscle: 'Quads, Glutes',
        equipment: 'Dumbbells',
        description: 'Unilateral leg strength builder improving balance and stability.',
      },
      {
        name: 'Plank Hold',
        category: 'Core',
        muscle: 'Abs, Core',
        equipment: 'Mat',
        description: 'Isometric core exercise strengthening abdominal wall and spine stabilizers.',
      },
    ];

    for (const ex of exercises) {
      await client.query(
        `
        INSERT INTO exercise_library (name, category, muscle_group, equipment_needed, description)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (name) DO NOTHING;
      `,
        [ex.name, ex.category, ex.muscle, ex.equipment, ex.description]
      );
    }

    await client.query('COMMIT');
    console.log('[Seed] Database seeded successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[Seed] Seeding failed:', err);
    throw err;
  } finally {
    client.release();
  }
};

if (require.main === module) {
  seedDatabase()
    .then(() => {
      process.exit(0);
    })
    .catch(() => {
      process.exit(1);
    });
}
