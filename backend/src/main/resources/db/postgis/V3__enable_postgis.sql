-- Optional migration. Activate with SPRING_PROFILES_ACTIVE=postgis only after
-- PostGIS 3 is installed for the PostgreSQL server and the database role can
-- create extensions. Core APIs use numeric coordinates and do not require it.
CREATE EXTENSION IF NOT EXISTS postgis;
