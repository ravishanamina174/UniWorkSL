ALTER TABLE tasks ADD COLUMN category VARCHAR(40);
CREATE INDEX tasks_category_idx ON tasks(category);
