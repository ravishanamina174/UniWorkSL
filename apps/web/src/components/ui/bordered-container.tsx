import type { HTMLAttributes } from "react";
import { Card } from "@/components/ui/card";

export function BorderedContainer({ className = "", ...props }: HTMLAttributes<HTMLElement>) {
  return <Card className={className} {...props} />;
}
