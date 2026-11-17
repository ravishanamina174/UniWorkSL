CREATE TABLE student_professional_profiles (
    user_id UUID PRIMARY KEY REFERENCES student_profiles(user_id) ON DELETE CASCADE,
    professional_summary VARCHAR(1200),
    primary_location VARCHAR(160),
    primary_latitude NUMERIC(9, 6),
    primary_longitude NUMERIC(9, 6),
    secondary_location VARCHAR(160),
    secondary_latitude NUMERIC(9, 6),
    secondary_longitude NUMERIC(9, 6),
    discoverable BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (primary_latitude IS NULL OR primary_latitude BETWEEN -90 AND 90),
    CHECK (primary_longitude IS NULL OR primary_longitude BETWEEN -180 AND 180),
    CHECK (secondary_latitude IS NULL OR secondary_latitude BETWEEN -90 AND 90),
    CHECK (secondary_longitude IS NULL OR secondary_longitude BETWEEN -180 AND 180)
);

CREATE TABLE student_professional_skills (
    user_id UUID NOT NULL REFERENCES student_professional_profiles(user_id) ON DELETE CASCADE,
    skill VARCHAR(80) NOT NULL,
    PRIMARY KEY (user_id, skill)
);

CREATE TABLE student_professional_availability (
    user_id UUID NOT NULL REFERENCES student_professional_profiles(user_id) ON DELETE CASCADE,
    availability VARCHAR(40) NOT NULL,
    PRIMARY KEY (user_id, availability)
);

CREATE TABLE student_professional_languages (
    user_id UUID NOT NULL REFERENCES student_professional_profiles(user_id) ON DELETE CASCADE,
    language VARCHAR(40) NOT NULL,
    PRIMARY KEY (user_id, language)
);

CREATE INDEX student_professional_discoverable_idx ON student_professional_profiles(discoverable);
CREATE INDEX student_professional_skills_idx ON student_professional_skills(skill);
