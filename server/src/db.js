import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import mongoose from 'mongoose'

/**
 * Connects to MongoDB.
 * - If MONGODB_URI is set in .env (for example a free MongoDB Atlas database), it uses that.
 * - If not, it starts a small MongoDB on your own PC automatically, so you don't have to install MongoDB
 *   to try the project. The data is kept in your user folder (not inside the project), because cloud-synced
 *   folders like OneDrive lock the database files while syncing them.
 */
function localDbFolder() {
  if (process.env.LOCAL_DB_PATH) return path.resolve(process.env.LOCAL_DB_PATH)
  const base = process.env.LOCALAPPDATA || path.join(os.homedir(), '.local', 'share')
  return path.join(base, 'rasoi-db')
}

export async function connectDb() {
  let uri = process.env.MONGODB_URI
  if (!uri) {
    const { MongoMemoryServer } = await import('mongodb-memory-server')
    const dbPath = localDbFolder()
    fs.mkdirSync(dbPath, { recursive: true })
    const local = await MongoMemoryServer.create({ instance: { dbPath, storageEngine: 'wiredTiger' } })
    uri = local.getUri('rasoi')
    console.log(`No MONGODB_URI in .env, so using a local database saved in ${dbPath}`)
  }
  await mongoose.connect(uri)
}
