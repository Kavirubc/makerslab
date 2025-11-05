import { initializeApp, getApps, cert, App } from 'firebase-admin/app'
import { getStorage } from 'firebase-admin/storage'

let app: App

function getFirebaseAdminApp(): App {
  if (getApps().length > 0) {
    return getApps()[0]
  }

  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')

  if (!privateKey || !process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL) {
    throw new Error('Missing Firebase Admin SDK environment variables')
  }

  app = initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: privateKey,
    }),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  })

  return app
}

export function getFirebaseAdminStorage() {
  const app = getFirebaseAdminApp()
  return getStorage(app)
}

export async function uploadFileToFirebase(
  file: Buffer,
  fileName: string,
  folder: string,
  contentType: string
): Promise<string> {
  const storage = getFirebaseAdminStorage()
  const bucket = storage.bucket()
  const filePath = `${folder}/${fileName}`
  const fileUpload = bucket.file(filePath)

  await fileUpload.save(file, {
    metadata: {
      contentType,
    },
  })

  await fileUpload.makePublic()
  return `https://storage.googleapis.com/${bucket.name}/${filePath}`
}

export async function deleteFileFromFirebase(fileUrl: string): Promise<void> {
  try {
    const storage = getFirebaseAdminStorage()
    const bucket = storage.bucket()

    // Extract file path from URL
    const urlParts = fileUrl.split(`${bucket.name}/`)
    if (urlParts.length < 2) return

    const filePath = decodeURIComponent(urlParts[1])
    const file = bucket.file(filePath)

    await file.delete()
  } catch (error) {
    console.error('Error deleting file from Firebase:', error)
  }
}
