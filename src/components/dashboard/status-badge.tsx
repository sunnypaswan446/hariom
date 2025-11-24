import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { CaseStatus } from "@/lib/types";

export function StatusBadge({
  status,
  className,
}: {
  status: CaseStatus;
  className?: string;
}) {
  const baseClasses = "capitalize font-medium";

  switch (status) {
    case "Reject":
      return (
        <Badge variant="destructive" className={cn(baseClasses, className)}>
          {status}
        </Badge>
      );
    case "Disbursed":
       return (
        <Badge variant="default" className={cn(baseClasses, "bg-blue-600 hover:bg-blue-700", className)}>
          {status}
        </Badge>
      );
    case "Approved":
      return (
        <Badge
          className={cn(
            baseClasses,
            "bg-green-600 text-green-50 hover:bg-green-700 border-transparent",
            className
          )}
        >
          {status}
        </Badge>
      );
    case "In Progress":
      return (
        <Badge
          variant="outline"
          className={cn(
            baseClasses,
            "text-primary border-primary/50",
            className
          )}
        >
          {status}
        </Badge>
      );
    case "Complete":
      return (
        <Badge
          variant="default"
          className={cn(baseClasses, "bg-cyan-600 hover:bg-cyan-700", className)}
        >
          {status}
        </Badge>
      );
    case "Hold":
      return (
        <Badge
          variant="default"
          className={cn(baseClasses, "bg-orange-500 hover:bg-orange-600", className)}
        >
          {status}
        </Badge>
      );
    case "Login":
      return (
        <Badge
          variant="default"
          className={cn(baseClasses, "bg-indigo-500 hover:bg-indigo-600", className)}
        >
          {status}
        </Badge>
      );
     case "RIC":
      return (
        <Badge
          variant="default"
          className={cn(baseClasses, "bg-purple-500 hover:bg-purple-600", className)}
        >
          {status}
        </Badge>
      );
    case "Document Pending":
    default:
      return (
        <Badge variant="secondary" className={cn(baseClasses, className)}>
          {status}
        </Badge>
      );
  }
}
