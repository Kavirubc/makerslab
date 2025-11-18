'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { ReportProjectDialog } from '@/components/report-project-dialog'
import { Flag } from 'lucide-react'

interface ReportProjectButtonProps {
  projectId: string
  projectTitle: string
  projectOwnerId: string
}

export function ReportProjectButton({
  projectId,
  projectTitle,
  projectOwnerId,
}: ReportProjectButtonProps) {
  const { data: session } = useSession()
  const [dialogOpen, setDialogOpen] = useState(false)

  // Only show button if user is authenticated and not the project owner
  if (!session?.user || session.user.id === projectOwnerId) {
    return null
  }

  return (
    <>
      <Button
        variant="outline"
        className="w-full hover:bg-destructive/10 hover:text-destructive hover:border-destructive transition-colors"
        onClick={() => setDialogOpen(true)}
      >
        <Flag className="h-4 w-4 mr-2" />
        Report Project
      </Button>
      <ReportProjectDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        projectId={projectId}
        projectTitle={projectTitle}
      />
    </>
  )
}

