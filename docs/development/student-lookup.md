# Student professional profiles and lookup

Students can optionally save a professional summary, structured skills, general locations, availability, and spoken languages from the mobile profile screen. Discoverability is off by default. Only profiles with explicit discoverability consent are queried by the Task Poster Student Lookup endpoint.

`POST /api/v1/poster/student-lookup` sends the poster's short natural-language query to the configured Gemini provider for bounded criteria extraction. The backend then queries the discoverable profile projection and calculates deterministic scores: skills 45%, location 25%, availability 20%, and languages 10%. The score is an estimated suitability score, not a prediction of work quality.

The lookup response excludes NIC, age, gender, home address, phone number, email, Clerk identifiers, task history, safety reports, and private location history. Gemini never receives unrestricted database access or SQL execution tools. If Gemini is unavailable, lookup returns a provider error and does not fabricate candidates. The task form enhancer follows the same provider and preserves the original draft until the poster explicitly chooses the enhanced text.

Set `GEMINI_API_KEY` and optionally `GEMINI_MODEL` in the backend environment. Provider quotas and availability apply; real provider smoke tests should only run when credentials and quota are available.
