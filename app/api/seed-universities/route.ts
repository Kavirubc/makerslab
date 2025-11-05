import { NextResponse } from 'next/server'
import { seedUniversities } from '@/lib/utils/university'

export async function GET() {
  try {
    await seedUniversities()
    return NextResponse.json(
      { message: 'Universities seeded successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error seeding universities:', error)
    return NextResponse.json(
      { error: 'Failed to seed universities' },
      { status: 500 }
    )
  }
}
