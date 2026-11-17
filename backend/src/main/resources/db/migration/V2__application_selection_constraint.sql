-- Prompt 4 can add the selection workflow with the one-accepted-student rule
-- already enforced by PostgreSQL.
CREATE UNIQUE INDEX task_applications_one_accepted_per_task
    ON task_applications(task_id)
    WHERE status = 'ACCEPTED';
