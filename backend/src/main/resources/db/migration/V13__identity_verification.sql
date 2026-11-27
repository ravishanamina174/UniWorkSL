-- Verification belongs to the existing account; documents exist only during manual review.
CREATE TABLE identity_verifications (
    user_id UUID PRIMARY KEY REFERENCES uniwork_users(user_id),
    status VARCHAR(32) NOT NULL DEFAULT 'UNVERIFIED' CHECK (status IN ('UNVERIFIED','MANUAL_REVIEW_PENDING','VERIFIED','REJECTED')),
    method VARCHAR(32) CHECK (method IN ('AUTOMATIC_OCR','MANUAL_REVIEW')),
    unsuccessful_attempts INTEGER NOT NULL DEFAULT 0 CHECK (unsuccessful_attempts >= 0),
    last_attempt_at TIMESTAMPTZ,
    verified_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE identity_reviews (
    review_id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES uniwork_users(user_id),
    status VARCHAR(24) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','APPROVED','REJECTED','EXPIRED')),
    object_key VARCHAR(160),
    deletion_pending BOOLEAN NOT NULL DEFAULT FALSE,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    decided_at TIMESTAMPTZ,
    decided_by VARCHAR(255),
    decision_reason VARCHAR(2000),
    expires_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX identity_reviews_one_pending_per_user ON identity_reviews(user_id) WHERE status = 'PENDING';
CREATE INDEX identity_reviews_queue_idx ON identity_reviews(status, submitted_at DESC);
CREATE INDEX identity_reviews_cleanup_idx ON identity_reviews(deletion_pending, expires_at);
