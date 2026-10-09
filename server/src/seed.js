// Adds the sample dishes (with photos) and the admin account.
// The server does this by itself on the first run. Run `npm run seed` (with the server stopped) to update them.
import { pathToFileURL } from 'node:url'
import mongoose from 'mongoose'
import { config } from './config.js'
import { connectDb } from './db.js'
import { MenuItem } from './models/MenuItem.js'
import { User } from './models/User.js'

export const SAMPLE_MENU = [
  // Starters
  { name: 'Paneer Tikka', category: 'Starters', price: 229, isVeg: true, emoji: '🧀', spicy: 2, isBestseller: true, description: 'Cottage cheese cubes marinated in hung curd and spices, charred in the tandoor.' },
  { name: 'Hara Bhara Kebab', category: 'Starters', price: 179, isVeg: true, emoji: '🥬', spicy: 1, description: 'Spinach, peas and potato patties, shallow fried. Served with mint chutney.' },
  { name: 'Chicken 65', category: 'Starters', price: 249, isVeg: false, emoji: '🍗', spicy: 3, isBestseller: true, description: 'Crispy Chennai-style fried chicken with curry leaves and red chilli.' },
  { name: 'Veg Spring Roll', category: 'Starters', price: 149, isVeg: true, emoji: '🥢', spicy: 0, description: 'Crunchy rolls filled with cabbage, carrot and noodles.' },
  // Mains
  { name: 'Butter Chicken', category: 'Mains', price: 319, isVeg: false, emoji: '🍛', spicy: 1, isBestseller: true, description: 'Tandoori chicken in a smooth tomato, butter and cream gravy.' },
  { name: 'Paneer Butter Masala', category: 'Mains', price: 269, isVeg: true, emoji: '🍲', spicy: 1, description: 'Soft paneer in a rich, mildly sweet tomato gravy.' },
  { name: 'Dal Makhani', category: 'Mains', price: 219, isVeg: true, emoji: '🫘', spicy: 1, isBestseller: true, description: 'Black lentils slow cooked overnight with butter and cream.' },
  { name: 'Chole Masala', category: 'Mains', price: 189, isVeg: true, emoji: '🥘', spicy: 2, description: 'Punjabi chickpea curry with whole spices.' },
  { name: 'Mutton Rogan Josh', category: 'Mains', price: 389, isVeg: false, emoji: '🍖', spicy: 2, description: 'Kashmiri-style mutton curry with fennel and dry ginger.' },
  // Biryani
  { name: 'Hyderabadi Chicken Biryani', category: 'Biryani', price: 299, isVeg: false, emoji: '🍚', spicy: 2, isBestseller: true, description: 'Dum-cooked basmati and chicken with saffron and fried onions. Comes with raita.' },
  { name: 'Veg Dum Biryani', category: 'Biryani', price: 239, isVeg: true, emoji: '🍚', spicy: 1, description: 'Basmati layered with seasonal vegetables, mint and saffron.' },
  { name: 'Egg Biryani', category: 'Biryani', price: 249, isVeg: false, emoji: '🥚', spicy: 2, description: 'Spiced rice with masala-fried boiled eggs.' },
  // Breads
  { name: 'Butter Naan', category: 'Breads', price: 55, isVeg: true, emoji: '🫓', description: 'Soft tandoor bread brushed with butter.' },
  { name: 'Garlic Naan', category: 'Breads', price: 65, isVeg: true, emoji: '🧄', description: 'Naan topped with chopped garlic and coriander.' },
  { name: 'Tandoori Roti', category: 'Breads', price: 30, isVeg: true, emoji: '🫓', description: 'Whole wheat bread from the tandoor.' },
  { name: 'Lachha Paratha', category: 'Breads', price: 60, isVeg: true, emoji: '🥞', description: 'Flaky layered paratha.' },
  // South Indian
  { name: 'Masala Dosa', category: 'South Indian', price: 139, isVeg: true, emoji: '🌯', spicy: 1, isBestseller: true, description: 'Crisp rice crepe with potato masala, sambar and coconut chutney.' },
  { name: 'Idli Sambar', category: 'South Indian', price: 99, isVeg: true, emoji: '⚪', description: 'Three steamed rice cakes with sambar and chutney.' },
  { name: 'Medu Vada', category: 'South Indian', price: 109, isVeg: true, emoji: '🍩', description: 'Crispy lentil doughnuts with sambar.' },
  // Desserts
  { name: 'Gulab Jamun', category: 'Desserts', price: 89, isVeg: true, emoji: '🟤', isBestseller: true, description: 'Two warm milk dumplings in cardamom syrup.' },
  { name: 'Rasmalai', category: 'Desserts', price: 119, isVeg: true, emoji: '🍮', description: 'Soft cheese patties in saffron milk with pistachio.' },
  { name: 'Gajar Halwa', category: 'Desserts', price: 109, isVeg: true, emoji: '🥕', description: 'Slow-cooked carrot pudding with khoya and nuts.' },
  // Drinks
  { name: 'Sweet Lassi', category: 'Drinks', price: 79, isVeg: true, emoji: '🥛', description: 'Thick churned yoghurt drink.' },
  { name: 'Masala Chaas', category: 'Drinks', price: 49, isVeg: true, emoji: '🥤', description: 'Spiced buttermilk with roasted cumin.' },
  { name: 'Masala Chai', category: 'Drinks', price: 39, isVeg: true, emoji: '☕', description: 'Kadak chai with ginger and cardamom.' },
  { name: 'Fresh Lime Soda', category: 'Drinks', price: 69, isVeg: true, emoji: '🍋', description: 'Sweet, salted or mixed.' },
]

// Photo for each dish, saved in client/public/dishes (downloaded by scripts/fetch-dish-photos.mjs)
const photo = (name) => `/dishes/${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}.jpg`

export async function seed() {
  // Update each sample dish by name (or add it if missing). Ids stay the same, so carts and orders keep working.
  await MenuItem.bulkWrite(
    SAMPLE_MENU.map((dish) => ({
      updateOne: { filter: { name: dish.name }, update: { $set: { ...dish, imageUrl: photo(dish.name) } }, upsert: true },
    })),
  )

  const email = config.adminEmail.toLowerCase()
  const passwordHash = await User.hashPassword(config.adminPassword)
  await User.findOneAndUpdate(
    { email },
    { name: 'Rasoi Admin', email, passwordHash, role: 'admin' },
    { upsert: true, new: true },
  )
  return { dishes: SAMPLE_MENU.length, adminEmail: email }
}

// Only run when started directly (npm run seed), not when imported by the server or tests
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await connectDb()
  const { dishes, adminEmail } = await seed()
  console.log(`Added ${dishes} dishes. Admin login: ${adminEmail} (password is ADMIN_PASSWORD in .env)`)
  await mongoose.disconnect()
  process.exit(0)
}
