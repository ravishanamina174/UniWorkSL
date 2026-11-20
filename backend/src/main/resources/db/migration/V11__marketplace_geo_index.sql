CREATE INDEX IF NOT EXISTS tasks_published_geography_idx ON tasks
USING gist ((ST_SetSRID(ST_MakePoint(longitude::double precision, latitude::double precision), 4326)::geography))
WHERE status = 'PUBLISHED';
