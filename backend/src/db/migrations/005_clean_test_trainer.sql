-- Migration: 005_clean_test_trainer.sql
-- Description: Clean up temporary test trainer account created during endpoint diagnostics.

DELETE FROM trainers 
WHERE user_id IN (
    SELECT id FROM users WHERE LOWER(email) = 'testtrainer99@gmail.com'
);

DELETE FROM users 
WHERE LOWER(email) = 'testtrainer99@gmail.com';
