CREATE TABLE direct_tasks (
    direct_task_id UUID PRIMARY KEY,
    poster_user_id UUID NOT NULL REFERENCES uniwork_users(user_id),
    student_user_id UUID NOT NULL REFERENCES uniwork_users(user_id),
    description VARCHAR(2000) NOT NULL,
    scheduled_at TIMESTAMPTZ NOT NULL,
    amount_lkr NUMERIC(12,2) NOT NULL CHECK (amount_lkr > 0),
    location_address VARCHAR(500) NOT NULL,
    latitude NUMERIC(9,6) NOT NULL CHECK (latitude BETWEEN -90 AND 90),
    longitude NUMERIC(9,6) NOT NULL CHECK (longitude BETWEEN -180 AND 180),
    status VARCHAR(24) NOT NULL DEFAULT 'SENT' CHECK (status IN ('SENT','COUNTEROFFERED','ACCEPTED','DECLINED','COUNTER_REJECTED')),
    counter_amount_lkr NUMERIC(12,2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX direct_tasks_student_status_idx ON direct_tasks(student_user_id, status, created_at DESC);
CREATE INDEX direct_tasks_poster_status_idx ON direct_tasks(poster_user_id, status, created_at DESC);
