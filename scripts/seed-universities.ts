/**
 * Script to seed universities into MongoDB
 * Run with: npx ts-node scripts/seed-universities.ts
 */
import { seedUniversities } from '../lib/utils/university'

async function main() {
  console.log('Starting university seeding...')
  try {
    await seedUniversities()
    console.log('University seeding completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('Error seeding universities:', error)
    process.exit(1)
  }
}

main()
