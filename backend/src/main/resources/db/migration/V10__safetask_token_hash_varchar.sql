-- Hibernate maps SafeTaskSession.tokenHash to varchar(64). Convert the V9
-- fixed-width column without changing token values or deleting sessions.
ALTER TABLE safetask_sessions
    ALTER COLUMN token_hash TYPE varchar(64)
    USING rtrim(token_hash)::varchar(64);
