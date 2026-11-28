ALTER TABLE direct_tasks ADD COLUMN task_id UUID REFERENCES tasks(task_id);
CREATE UNIQUE INDEX direct_tasks_task_unique_idx ON direct_tasks(task_id) WHERE task_id IS NOT NULL;
