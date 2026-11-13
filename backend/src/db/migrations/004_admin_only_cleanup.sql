-- Migration: 004_admin_only_cleanup.sql
-- Description: Ensure sole verified Gmail Admin account (samiwm63@gmail.com) with strong password hash
--              and remove all seeded default .local accounts safely.

DO $$
DECLARE
    v_admin_id UUID;
    v_replacement_trainer_id UUID;
BEGIN
    -- 1. Promote or insert sole admin account (samiwm63@gmail.com) with strong bcrypt hash (cost 12)
    SELECT id INTO v_admin_id
    FROM users
    WHERE LOWER(email) = 'samiwm63@gmail.com'
    LIMIT 1;

    IF v_admin_id IS NOT NULL THEN
        UPDATE users
        SET email = 'samiwm63@gmail.com',
            password_hash = '$2a$12$Ob3kUsyqnP2YlYFfT4peVO3trneUvSRaznFtG1Ao8WPp.BYZQQ3G2',
            role = 'admin',
            is_verified = true,
            is_active = true,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = v_admin_id;
    ELSE
        INSERT INTO users (email, password_hash, role, first_name, last_name, is_verified, is_active)
        VALUES (
            'samiwm63@gmail.com',
            '$2a$12$Ob3kUsyqnP2YlYFfT4peVO3trneUvSRaznFtG1Ao8WPp.BYZQQ3G2',
            'admin',
            'System',
            'Administrator',
            true,
            true
        )
        RETURNING id INTO v_admin_id;
    END IF;

    -- 2. Reassign ownership references away from seeded .local default users
    UPDATE membership_plans
    SET created_by_admin_id = v_admin_id
    WHERE created_by_admin_id IN (
        SELECT id FROM users
        WHERE LOWER(email) IN (
            'admin@gymfitness.local',
            'reception@gymfitness.local',
            'trainer@gymfitness.local',
            'member@gymfitness.local'
        )
    );

    UPDATE equipment_reports
    SET reported_by_user_id = v_admin_id
    WHERE reported_by_user_id IN (
        SELECT id FROM users
        WHERE LOWER(email) IN (
            'admin@gymfitness.local',
            'reception@gymfitness.local',
            'trainer@gymfitness.local',
            'member@gymfitness.local'
        )
    );

    -- 3. Reassign or remove classes tied to the seeded .local trainer (ON DELETE RESTRICT on classes.trainer_id)
    SELECT t.id INTO v_replacement_trainer_id
    FROM trainers t
    JOIN users u ON u.id = t.user_id
    WHERE LOWER(u.email) NOT IN (
        'admin@gymfitness.local',
        'reception@gymfitness.local',
        'trainer@gymfitness.local',
        'member@gymfitness.local'
    )
    LIMIT 1;

    IF v_replacement_trainer_id IS NOT NULL THEN
        UPDATE classes
        SET trainer_id = v_replacement_trainer_id
        WHERE trainer_id IN (
            SELECT t.id FROM trainers t
            JOIN users u ON u.id = t.user_id
            WHERE LOWER(u.email) IN (
                'admin@gymfitness.local',
                'reception@gymfitness.local',
                'trainer@gymfitness.local',
                'member@gymfitness.local'
            )
        );
    ELSE
        DELETE FROM classes
        WHERE trainer_id IN (
            SELECT t.id FROM trainers t
            JOIN users u ON u.id = t.user_id
            WHERE LOWER(u.email) IN (
                'admin@gymfitness.local',
                'reception@gymfitness.local',
                'trainer@gymfitness.local',
                'member@gymfitness.local'
            )
        );
    END IF;

    -- 4. Remove payments linked to seeded .local default accounts (ON DELETE RESTRICT on payments.member_id)
    DELETE FROM payments
    WHERE member_id IN (
        SELECT id FROM users
        WHERE LOWER(email) IN (
            'admin@gymfitness.local',
            'reception@gymfitness.local',
            'trainer@gymfitness.local',
            'member@gymfitness.local'
        )
    );

    -- 5. Delete all 4 seeded .local default accounts
    DELETE FROM users
    WHERE LOWER(email) IN (
        'admin@gymfitness.local',
        'reception@gymfitness.local',
        'trainer@gymfitness.local',
        'member@gymfitness.local'
    );
END $$;
