import { BookOpen, BriefcaseBusiness, Camera, CarFront, CircleHelp, Dog, Laptop, Leaf, Paintbrush, PartyPopper, ShoppingBag, Sparkles } from "lucide-react";
import type { StudentCategory } from "@uniwork/api-contracts";

const icons = {
  MOVING_PACKING: BriefcaseBusiness,
  EVENTS_PROMOTIONS: PartyPopper,
  TUTORING_EDUCATION: BookOpen,
  IT_TECH_SUPPORT: Laptop,
  DESIGN_CREATIVE: Paintbrush,
  PHOTOGRAPHY_VIDEO: Camera,
  SHOPPING_ERRANDS: ShoppingBag,
  DELIVERY_PICKUP: CarFront,
  GARDENING_OUTDOOR: Leaf,
  CLEANING_HOME: Sparkles,
  OFFICE_DATA_ENTRY: CircleHelp,
  PET_CARE_ASSISTANCE: Dog,
} satisfies Record<StudentCategory, typeof BriefcaseBusiness>;

export function CategoryIcon({ category, size = 22 }: { category: StudentCategory; size?: number }) {
  const Icon = icons[category];
  return <Icon size={size} strokeWidth={1.7} aria-hidden="true" />;
}
