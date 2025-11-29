import { Pencil } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface DraftBadgeProps {
  className?: string
}

export function DraftBadge({ className }: DraftBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        'border-amber-500 text-amber-600 dark:text-amber-400',
        className
      )}
    >
      <Pencil className="h-3 w-3" />
      Draft
    </Badge>
  )
}
