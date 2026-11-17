type ClerkEnvironment = Record<string, string | undefined>;

export function hasClerkConfiguration(environment: ClerkEnvironment = process.env): boolean {
  return Boolean(environment.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim() && environment.CLERK_SECRET_KEY?.trim());
}
