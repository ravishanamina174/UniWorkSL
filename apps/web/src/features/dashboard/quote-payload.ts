import type { StudentCategory } from "@uniwork/api-contracts";
import type { Coordinates } from "./google-map-picker";

export type QuoteFields = { description: string; scheduledAt: string; amountLkr: string; locationAddress: string };
export type QuoteFieldErrors = Partial<Record<keyof QuoteFields | "location", string>>;

export function prepareQuote(studentId: string, category: StudentCategory, fields: QuoteFields, location: Coordinates | null) {
  const errors: QuoteFieldErrors = {};
  const description = fields.description.trim();
  const locationAddress = fields.locationAddress.trim();
  const amountLkr = Number(fields.amountLkr);
  const scheduledAt = new Date(fields.scheduledAt);
  if (!description || description.length > 2000) errors.description = "Describe the work in 1–2,000 characters.";
  if (!fields.scheduledAt || Number.isNaN(scheduledAt.getTime())) errors.scheduledAt = "Choose a valid date and time.";
  if (!/^\d+(?:\.\d{1,2})?$/.test(fields.amountLkr.trim()) || !Number.isFinite(amountLkr)
      || amountLkr <= 0 || amountLkr >= 10_000_000_000) errors.amountLkr = "Enter a positive LKR amount with up to two decimal places.";
  if (!locationAddress || locationAddress.length > 500) errors.locationAddress = "Enter a readable address of up to 500 characters.";
  if (!location || !Number.isFinite(location.latitude) || !Number.isFinite(location.longitude)
      || Math.abs(location.latitude) > 90 || Math.abs(location.longitude) > 180) errors.location = "Select a valid location on the map or use your current location.";
  if (Object.keys(errors).length) return { errors, payload: null };
  return { errors, payload: {
    studentId, category, description, scheduledAt: scheduledAt.toISOString(), amountLkr,
    locationAddress,
    latitude: Number(location!.latitude.toFixed(6)),
    longitude: Number(location!.longitude.toFixed(6)),
  } };
}
