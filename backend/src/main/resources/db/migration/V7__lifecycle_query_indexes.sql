CREATE INDEX tasks_published_amount_schedule_idx
    ON tasks(amount_lkr, scheduled_at)
    WHERE status = 'PUBLISHED';

CREATE INDEX task_applications_task_created_idx
    ON task_applications(task_id, created_at DESC);
