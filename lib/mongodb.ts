import { MongoClient, Db } from 'mongodb'

function buildMongoUriFromEnv(): { uri: string; dbName: string } {
  const username = process.env.MongoUsername
  const password = process.env.MongoPassword
  const cluster = process.env.cluster
  const dbName = process.env.dbName
  const authSource = process.env.authSource || 'admin'
  const authMechanism = process.env.authMechanism || 'SCRAM-SHA-1'
  const localUri = process.env.MONGODB_URI

  // If direct URI is provided, use it
  if (localUri) {
    return { uri: localUri, dbName: dbName || 'ucsc-project-share' }
  }

  // Otherwise, build URI from parameters
  if (!username || !password || !cluster || !dbName) {
    throw new Error(
      'Missing MongoDB configuration. Provide either MONGODB_URI or (MongoUsername, MongoPassword, cluster, dbName)'
    )
  }

  const uri = `mongodb+srv://${username}:${password}@${cluster}/${dbName}?retryWrites=true&w=majority&authSource=${authSource}&authMechanism=${authMechanism}`
  return { uri, dbName }
}

const { uri, dbName: defaultDbName } = buildMongoUriFromEnv()

const options = {
  maxPoolSize: 10,
  minPoolSize: 2,
  maxIdleTimeMS: 60000,
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 30000,
}

let client: MongoClient
let clientPromise: Promise<MongoClient>

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options)
    global._mongoClientPromise = client.connect()
  }
  clientPromise = global._mongoClientPromise
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise

export async function getDatabase(): Promise<Db> {
  const client = await clientPromise
  return client.db(defaultDbName)
}
