import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { getDatabase } from '@/lib/mongodb'
import { User } from '@/lib/models/User'
import { ObjectId } from 'mongodb'
import { ProfileEditForm } from '@/components/profile-edit-form'

export default async function EditProfilePage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  const db = await getDatabase()
  const user = await db.collection<User>('users').findOne({
    _id: new ObjectId(session.user.id)
  })

  if (!user) {
    redirect('/login')
  }

  // Convert ObjectId to string for client component
  const userData = {
    _id: user._id!.toString(),
    name: user.name,
    email: user.email,
    profilePicture: user.profilePicture || null,
    bio: user.bio || null,
    cv: user.cv || null,
    cvUpdatedAt: user.cvUpdatedAt?.toISOString() || null,
    linkedin: user.linkedin || null,
    github: user.github || null
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Edit Profile</h1>
          <p className="text-muted-foreground">Update your profile information</p>
        </div>

        <ProfileEditForm user={userData} />
      </div>
    </div>
  )
}
