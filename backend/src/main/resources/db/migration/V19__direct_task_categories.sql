ALTER TABLE direct_tasks ADD COLUMN category VARCHAR(40);
CREATE INDEX direct_tasks_category_idx ON direct_tasks(category);
