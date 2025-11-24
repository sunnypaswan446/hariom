import { Landmark } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="bg-primary text-primary-foreground p-2 rounded-lg">
        <Landmark className="h-5 w-5" />
      </div>
      <span className="text-lg font-bold">LoanFlow</span>
    </div>
  );
}
