import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { signOut } from '@/auth'

export default async function Dashboard() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <form
            action={async () => {
              'use server'
              await signOut({ redirectTo: '/login' })
            }}
          >
            <Button type="submit" variant="outline">
              Sign out
            </Button>
          </form>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Welcome back, {session.user.name}!</CardTitle>
            <CardDescription>Your profile information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="text-base">{session.user.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Name</p>
                <p className="text-base">{session.user.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Index Number</p>
                <p className="text-base">{(session.user as any).indexNumber}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Registration Number</p>
                <p className="text-base">{(session.user as any).registrationNumber}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
