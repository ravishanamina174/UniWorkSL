export function parseRequiredSkills(raw: string): { skills: string[]; error?: never } | { skills?: never; error: string } {
  const skills = [...new Set(raw.split(",").map((skill) => skill.trim()).filter(Boolean))];
  if (!skills.length || skills.length > 20) return { error: "Add between 1 and 20 required skills, separated by commas." };
  if (skills.some((skill) => skill.length > 80)) return { error: "Each skill must be 80 characters or fewer." };
  return { skills };
}

export function isValidCoordinatePair(latitude: number, longitude: number): boolean {
  return Number.isFinite(latitude) && Number.isFinite(longitude) && latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
}
