CREATE TABLE safetask_sessions (
    session_id uuid PRIMARY KEY,
    execution_id uuid NOT NULL UNIQUE REFERENCES task_executions(execution_id) ON DELETE CASCADE,
    token_hash char(64) NOT NULL UNIQUE,
    created_at timestamptz NOT NULL,
    revoked_at timestamptz,
    latitude double precision,
    longitude double precision,
    accuracy_meters double precision,
    location_updated_at timestamptz,
    CONSTRAINT safetask_coordinates_pair CHECK ((latitude IS NULL) = (longitude IS NULL)),
    CONSTRAINT safetask_latitude_range CHECK (latitude IS NULL OR latitude BETWEEN -90 AND 90),
    CONSTRAINT safetask_longitude_range CHECK (longitude IS NULL OR longitude BETWEEN -180 AND 180),
    CONSTRAINT safetask_accuracy_range CHECK (accuracy_meters IS NULL OR accuracy_meters BETWEEN 0 AND 10000)
);
CREATE INDEX safetask_sessions_execution_idx ON safetask_sessions(execution_id);
