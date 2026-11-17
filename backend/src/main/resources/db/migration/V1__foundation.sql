CREATE TABLE uniwork_users (
    user_id UUID PRIMARY KEY,
    clerk_user_id VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(32) NOT NULL CHECK (role IN ('TASK_POSTER', 'STUDENT')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE task_poster_profiles (
    user_id UUID PRIMARY KEY REFERENCES uniwork_users(user_id) ON DELETE CASCADE,
    full_name VARCHAR(160) NOT NULL,
    address VARCHAR(500) NOT NULL,
    phone_number VARCHAR(24) NOT NULL,
    nic_ciphertext TEXT NOT NULL,
    gender VARCHAR(32) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE tasks (
    task_id UUID PRIMARY KEY,
    poster_user_id UUID NOT NULL REFERENCES uniwork_users(user_id),
    title VARCHAR(120) NOT NULL,
    description VARCHAR(5000) NOT NULL,
    amount_lkr NUMERIC(12, 2) NOT NULL CHECK (amount_lkr > 0),
    scheduled_at TIMESTAMPTZ NOT NULL,
    location_address VARCHAR(500) NOT NULL,
    latitude NUMERIC(9, 6) NOT NULL CHECK (latitude BETWEEN -90 AND 90),
    longitude NUMERIC(9, 6) NOT NULL CHECK (longitude BETWEEN -180 AND 180),
    status VARCHAR(24) NOT NULL CHECK (status IN ('DRAFT', 'PUBLISHED', 'CANCELLED', 'ONGOING', 'COMPLETED', 'CLOSED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX tasks_poster_created_idx ON tasks(poster_user_id, created_at DESC);
CREATE INDEX tasks_status_scheduled_idx ON tasks(status, scheduled_at);

CREATE TABLE task_skills (
    task_id UUID NOT NULL REFERENCES tasks(task_id) ON DELETE CASCADE,
    skill VARCHAR(80) NOT NULL,
    PRIMARY KEY (task_id, skill)
);

CREATE TABLE task_applications (
    application_id UUID PRIMARY KEY,
    task_id UUID NOT NULL REFERENCES tasks(task_id) ON DELETE CASCADE,
    student_user_id UUID NOT NULL REFERENCES uniwork_users(user_id),
    status VARCHAR(24) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT task_applications_task_student_unique UNIQUE (task_id, student_user_id)
);

CREATE INDEX task_applications_task_status_idx ON task_applications(task_id, status);
CREATE INDEX task_applications_student_idx ON task_applications(student_user_id, created_at DESC);
