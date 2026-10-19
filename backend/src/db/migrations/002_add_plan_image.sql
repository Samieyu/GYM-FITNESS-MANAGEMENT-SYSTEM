-- Migration 002: Add image_url to membership_plans table
ALTER TABLE membership_plans
ADD COLUMN IF NOT EXISTS image_url TEXT;
