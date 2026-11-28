ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS primary_category VARCHAR(40);
ALTER TABLE task_applications ADD COLUMN IF NOT EXISTS introduction VARCHAR(1400);
CREATE INDEX IF NOT EXISTS student_profiles_category_idx ON student_profiles(primary_category);
