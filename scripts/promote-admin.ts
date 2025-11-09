/**
 * Script to promote a user to admin
 * Run with: npx ts-node --compiler-options {\"module\":\"commonjs\"} scripts/promote-admin.ts <email>
 * Example: npx ts-node --compiler-options {\"module\":\"commonjs\"} scripts/promote-admin.ts user@example.ac.lk
 */
import * as fs from 'fs'
import * as path from 'path'

// Load environment variables from .env files
function loadEnvFile() {
  const envFiles = ['.env.local', '.env']
  // Get the directory where the script is located
  const scriptDir = __dirname || path.dirname(require.main?.filename || __filename)
  const rootDir = path.resolve(scriptDir, '..')

  for (const envFile of envFiles) {
    const envPath = path.join(rootDir, envFile)
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf-8')
      envContent.split('\n').forEach((line) => {
        const trimmedLine = line.trim()
        if (trimmedLine && !trimmedLine.startsWith('#')) {
          const [key, ...valueParts] = trimmedLine.split('=')
          if (key && valueParts.length > 0) {
            const value = valueParts.join('=').replace(/^["']|["']$/g, '')
            if (!process.env[key.trim()]) {
              process.env[key.trim()] = value.trim()
            }
          }
        }
      })
      console.log(`Loaded environment variables from ${envFile}`)
      break
    }
  }
}

// Load env before importing other modules
loadEnvFile()

import { getDatabase } from '../lib/mongodb'
import { User } from '../lib/models/User'

async function main() {
  const email = process.argv[2]

  if (!email) {
    console.error('Error: Email address is required')
    console.log('Usage: npx ts-node --compiler-options {"module":"commonjs"} scripts/promote-admin.ts <email>')
    console.log('Example: npx ts-node --compiler-options {"module":"commonjs"} scripts/promote-admin.ts user@example.ac.lk')
    process.exit(1)
  }

  console.log(`Promoting user with email: ${email} to admin...`)

  try {
    const db = await getDatabase()
    const usersCollection = db.collection<User>('users')

    // Find user by email
    const user = await usersCollection.findOne({
      email: email.toLowerCase()
    })

    if (!user) {
      console.error(`Error: User with email ${email} not found`)
      console.log('Please make sure the user exists in the database.')
      process.exit(1)
    }

    // Check if already admin
    if (user.role === 'admin') {
      console.log(`User ${email} is already an admin.`)
      process.exit(0)
    }

    // Update user to admin
    const result = await usersCollection.updateOne(
      { email: email.toLowerCase() },
      {
        $set: {
          role: 'admin',
          updatedAt: new Date()
        }
      }
    )

    if (result.modifiedCount > 0) {
      console.log(`✅ Successfully promoted ${email} to admin!`)
      console.log(`User: ${user.name}`)
      console.log(`Email: ${user.email}`)
      console.log(`Index Number: ${user.indexNumber}`)
      console.log('\nYou can now log in and access the admin dashboard at /admin')
    } else {
      console.error('Error: Failed to update user')
      process.exit(1)
    }

    process.exit(0)
  } catch (error) {
    console.error('Error promoting user to admin:', error)
    process.exit(1)
  }
}

main()

