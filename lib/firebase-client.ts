import { initializeApp, getApps } from 'firebase/app'
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
const storage = getStorage(app)

export { storage }

export async function uploadFile(
  file: File,
  folder: string,
  fileName: string
): Promise<string> {
  const storageRef = ref(storage, `${folder}/${fileName}`)
  await uploadBytes(storageRef, file)
  const downloadURL = await getDownloadURL(storageRef)
  return downloadURL
}

export async function deleteFile(fileUrl: string): Promise<void> {
  try {
    const fileRef = ref(storage, fileUrl)
    await deleteObject(fileRef)
  } catch (error) {
    console.error('Error deleting file:', error)
  }
}

// Validate image file
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'File must be an image' }
  }

  // Check file size (2MB = 2 * 1024 * 1024 bytes)
  const maxSize = 2 * 1024 * 1024
  if (file.size > maxSize) {
    return { valid: false, error: 'Image must be less than 2MB' }
  }

  return { valid: true }
}

// Validate aspect ratio
export function validateImageAspectRatio(file: File): Promise<{ valid: boolean; error?: string }> {
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)
      const aspectRatio = img.width / img.height

      // Allow 1:1 aspect ratio with 10% tolerance
      if (aspectRatio < 0.9 || aspectRatio > 1.1) {
        resolve({
          valid: false,
          error: 'Image must be square (1:1 aspect ratio)',
        })
      } else {
        resolve({ valid: true })
      }
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      resolve({ valid: false, error: 'Invalid image file' })
    }

    img.src = url
  })
}

// Validate CV/PDF file
export function validateCVFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  if (file.type !== 'application/pdf') {
    return { valid: false, error: 'CV must be a PDF file' }
  }

  // Check file size (5MB for CV)
  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) {
    return { valid: false, error: 'CV must be less than 5MB' }
  }

  return { valid: true }
}
