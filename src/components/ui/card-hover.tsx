
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface CardHoverProps {
  icon: ReactNode;
  title: string;
  description: string;
  className?: string;
}

export function CardHover({ icon, title, description, className }: CardHoverProps) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-lg border p-6 shadow-md transition-all hover:shadow-lg hover:-translate-y-1",
        className
      )}
    >
      <div className="mb-2 flex items-center gap-3">
        <div className="rounded-full bg-dragonfly-100 p-2 text-dragonfly-500 group-hover:bg-dragonfly-200 group-hover:text-dragonfly-600 transition-colors">
          {icon}
        </div>
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
