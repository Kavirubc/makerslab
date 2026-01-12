import { auth } from '@/auth'
import { redirect, notFound } from 'next/navigation'
import { getDatabase } from '@/lib/mongodb'
import { Project } from '@/lib/models/Project'
import { ObjectId } from 'mongodb'
import { ProjectEditForm } from '@/components/project-edit-form'

interface EditProjectPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditProjectPage({ params }: EditProjectPageProps) {
  const session = await auth()
  const { id } = await params

  if (!session?.user) {
    redirect('/login')
  }

  if (!ObjectId.isValid(id)) {
    notFound()
  }

  const db = await getDatabase()
  const project = await db.collection<Project>('projects').findOne({
    _id: new ObjectId(id)
  })

  if (!project) {
    notFound()
  }

  // Check ownership
  if (project.userId.toString() !== session.user.id) {
    redirect('/projects')
  }

  // Convert ObjectId to string for client component
  const projectData = {
    ...project,
    _id: project._id!.toString(),
    userId: project.userId.toString(),
    universityId: project.userId.toString()
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Edit Project</h1>
          <p className="text-muted-foreground">Update your project details</p>
        </div>

        <ProjectEditForm project={projectData} />
      </div>
    </div>
  )
}
