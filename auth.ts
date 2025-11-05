import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { getDatabase } from '@/lib/mongodb'
import { User } from '@/lib/models/User'
import bcrypt from 'bcryptjs'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const email = credentials.email as string
        const password = credentials.password as string

        // Validate email ends with ac.lk
        if (!email.toLowerCase().endsWith('.ac.lk')) {
          throw new Error('Only .ac.lk email addresses are allowed')
        }

        const db = await getDatabase()
        const user = await db.collection<User>('users').findOne({
          email: email.toLowerCase()
        })

        if (!user) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(password, user.password)

        if (!isPasswordValid) {
          return null
        }

        // Return user data for session
        return {
          id: user._id!.toString(),
          email: user.email,
          name: user.name,
          indexNumber: user.indexNumber,
          registrationNumber: user.registrationNumber,
          universityId: user.universityId.toString(),
          image: user.image || null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.indexNumber = (user as any).indexNumber
        token.registrationNumber = (user as any).registrationNumber
        token.universityId = (user as any).universityId
        token.image = (user as any).image
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
          ; (session.user as any).indexNumber = token.indexNumber
          ; (session.user as any).registrationNumber = token.registrationNumber
          ; (session.user as any).universityId = token.universityId
        session.user.image = token.image as string
      }
      return session
    }
  },
  pages: {
    signIn: '/login'
  },
  session: {
    strategy: 'jwt'
  }
})
