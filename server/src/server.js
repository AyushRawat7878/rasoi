import { createApp } from './app.js'
import { config } from './config.js'
import { connectDb } from './db.js'
import { MenuItem } from './models/MenuItem.js'
import { seed } from './seed.js'

await connectDb()

// First run: fill the menu and create the admin account
if ((await MenuItem.estimatedDocumentCount()) === 0) {
  const { dishes, adminEmail } = await seed()
  console.log(`Empty database, so added ${dishes} sample dishes and the admin account ${adminEmail}`)
}

createApp().listen(config.port, () => console.log(`API running on http://localhost:${config.port}`))
