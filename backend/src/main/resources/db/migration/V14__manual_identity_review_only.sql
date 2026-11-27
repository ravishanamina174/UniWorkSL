-- Identity verification is manual review only; remove obsolete automatic-attempt state.
ALTER TABLE identity_verifications DROP COLUMN IF EXISTS unsuccessful_attempts;
ALTER TABLE identity_verifications DROP COLUMN IF EXISTS last_attempt_at;
