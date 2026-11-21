-- Additive safety administration records. Existing reviews, reports and tasks remain authoritative.
CREATE TABLE payment_disputes (
    dispute_id UUID PRIMARY KEY,
    task_id UUID NOT NULL REFERENCES tasks(task_id),
    student_user_id UUID NOT NULL REFERENCES uniwork_users(user_id),
    reason VARCHAR(32) NOT NULL CHECK (reason IN ('PAYMENT_NOT_RECEIVED', 'INCORRECT_PAYMENT_AMOUNT')),
    actual_amount_lkr NUMERIC(12, 2) CHECK (actual_amount_lkr >= 0),
    student_statement VARCHAR(2000) NOT NULL,
    poster_response VARCHAR(2000),
    poster_says_paid BOOLEAN,
    status VARCHAR(32) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'AWAITING_POSTER_RESPONSE', 'UNDER_REVIEW', 'RESOLVED', 'INSUFFICIENT_EVIDENCE')),
    outcome VARCHAR(2000),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    responded_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT payment_disputes_task_reason_unique UNIQUE (task_id, reason)
);
CREATE INDEX payment_disputes_status_created_idx ON payment_disputes(status, created_at DESC);
CREATE INDEX payment_disputes_student_created_idx ON payment_disputes(student_user_id, created_at DESC);

CREATE TABLE admin_watchlist_cases (
    poster_user_id UUID PRIMARY KEY REFERENCES uniwork_users(user_id),
    status VARCHAR(32) NOT NULL DEFAULT 'FLAGGED_FOR_REVIEW' CHECK (status IN ('FLAGGED_FOR_REVIEW', 'UNDER_INVESTIGATION', 'RESOLVED', 'DISMISSED')),
    flagged_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_signal_at TIMESTAMPTZ NOT NULL,
    decision_reason VARCHAR(2000),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX admin_watchlist_status_idx ON admin_watchlist_cases(status, flagged_at DESC);

CREATE TABLE admin_case_notes (
    note_id UUID PRIMARY KEY,
    case_type VARCHAR(24) NOT NULL CHECK (case_type IN ('WATCHLIST', 'DISPUTE', 'SAFETY_REPORT')),
    case_id UUID NOT NULL,
    admin_clerk_id VARCHAR(255) NOT NULL,
    note VARCHAR(2000) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX admin_case_notes_case_idx ON admin_case_notes(case_type, case_id, created_at DESC);

CREATE TABLE admin_publishing_restrictions (
    poster_user_id UUID PRIMARY KEY REFERENCES uniwork_users(user_id),
    reason VARCHAR(2000) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    removed_at TIMESTAMPTZ,
    applied_by VARCHAR(255) NOT NULL,
    removed_by VARCHAR(255)
);

CREATE TABLE admin_audit_events (
    audit_id UUID PRIMARY KEY,
    admin_clerk_id VARCHAR(255) NOT NULL,
    action VARCHAR(64) NOT NULL,
    target_type VARCHAR(32) NOT NULL,
    target_id UUID NOT NULL,
    before_state VARCHAR(64),
    after_state VARCHAR(64),
    reason VARCHAR(2000) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX admin_audit_created_idx ON admin_audit_events(created_at DESC);
