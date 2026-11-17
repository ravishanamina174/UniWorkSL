ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_status_check;
ALTER TABLE tasks ADD CONSTRAINT tasks_status_check
    CHECK (status IN ('DRAFT', 'PUBLISHED', 'ACCEPTED', 'STARTED', 'CANCELLED', 'ONGOING', 'COMPLETED', 'CLOSED'));

CREATE TABLE student_profiles (
    user_id UUID PRIMARY KEY REFERENCES uniwork_users(user_id) ON DELETE CASCADE,
    full_name VARCHAR(160) NOT NULL,
    age SMALLINT NOT NULL CHECK (age BETWEEN 16 AND 100),
    gender VARCHAR(32) NOT NULL,
    address_ciphertext TEXT NOT NULL,
    phone_number VARCHAR(24) NOT NULL,
    nic_ciphertext TEXT NOT NULL,
    university VARCHAR(200) NOT NULL,
    faculty VARCHAR(200) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE task_executions (
    execution_id UUID PRIMARY KEY,
    task_id UUID NOT NULL UNIQUE REFERENCES tasks(task_id),
    application_id UUID NOT NULL UNIQUE REFERENCES task_applications(application_id),
    student_user_id UUID NOT NULL REFERENCES uniwork_users(user_id),
    start_pin_hash VARCHAR(64),
    start_pin_ciphertext TEXT,
    pin_expires_at TIMESTAMPTZ,
    pin_attempts SMALLINT NOT NULL DEFAULT 0 CHECK (pin_attempts BETWEEN 0 AND 5),
    start_requested_at TIMESTAMPTZ,
    pin_verified_at TIMESTAMPTZ,
    pin_last_attempt_at TIMESTAMPTZ,
    pin_last_result VARCHAR(16),
    started_at TIMESTAMPTZ,
    location_verified BOOLEAN,
    location_distance_meters DOUBLE PRECISION,
    location_accuracy_meters DOUBLE PRECISION,
    location_checked_at TIMESTAMPTZ,
    location_result VARCHAR(32),
    completed_at TIMESTAMPTZ,
    payment_received BOOLEAN,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT task_executions_pin_pair CHECK ((start_pin_hash IS NULL) = (start_pin_ciphertext IS NULL))
);
CREATE INDEX task_executions_student_idx ON task_executions(student_user_id, created_at DESC);
CREATE INDEX task_executions_started_idx ON task_executions(started_at DESC);

CREATE TABLE task_reviews (
    review_id UUID PRIMARY KEY,
    task_id UUID NOT NULL UNIQUE REFERENCES tasks(task_id),
    student_user_id UUID NOT NULL REFERENCES uniwork_users(user_id),
    poster_rating SMALLINT NOT NULL CHECK (poster_rating BETWEEN 1 AND 5),
    positive_feedback BOOLEAN NOT NULL,
    review_text VARCHAR(2000),
    location_feedback VARCHAR(2000),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX task_reviews_student_idx ON task_reviews(student_user_id, created_at DESC);

CREATE TABLE safety_reports (
    report_id UUID PRIMARY KEY,
    task_id UUID NOT NULL REFERENCES tasks(task_id),
    reporter_user_id UUID NOT NULL REFERENCES uniwork_users(user_id),
    category VARCHAR(32) NOT NULL CHECK (category IN ('UNSAFE_LOCATION', 'HARASSMENT', 'MISLEADING_TASK', 'NON_PAYMENT', 'OTHER')),
    description VARCHAR(4000) NOT NULL,
    status VARCHAR(24) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'UNDER_REVIEW', 'RESOLVED', 'CLOSED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX safety_reports_task_created_idx ON safety_reports(task_id, created_at DESC);
CREATE INDEX safety_reports_reporter_created_idx ON safety_reports(reporter_user_id, created_at DESC);
