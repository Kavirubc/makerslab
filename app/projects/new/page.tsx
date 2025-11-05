import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { ProjectForm } from '@/components/project-form'

export default async function NewProjectPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Create New Project</h1>
          <p className="text-muted-foreground">
            Share your academic project with the UCSC community
          </p>
        </div>

        <ProjectForm />
      </div>
    </div>
  )
}
