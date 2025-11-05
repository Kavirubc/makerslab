import 'next-auth'
import 'next-auth/jwt'

declare module 'next-auth' {
  interface User {
    id: string
    email: string
    name: string
    indexNumber: string
    registrationNumber: string
    universityId: string
    image?: string | null
  }

  interface Session {
    user: {
      id: string
      email: string
      name: string
      indexNumber: string
      registrationNumber: string
      universityId: string
      image?: string | null
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    indexNumber: string
    registrationNumber: string
    universityId: string
    image?: string | null
  }
}
