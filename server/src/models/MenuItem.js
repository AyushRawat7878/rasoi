import mongoose from 'mongoose'

export const CATEGORIES = ['Starters', 'Mains', 'Biryani', 'Breads', 'South Indian', 'Desserts', 'Drinks']

const menuItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    description: { type: String, default: '', maxlength: 300 },
    price: { type: Number, required: true, min: 1 }, // rupees
    category: { type: String, enum: CATEGORIES, required: true },
    isVeg: { type: Boolean, default: true },
    emoji: { type: String, default: '🍽️' },
    imageUrl: { type: String, default: '' },
    spicy: { type: Number, min: 0, max: 3, default: 0 },
    isAvailable: { type: Boolean, default: true },
    isBestseller: { type: Boolean, default: false },
  },
  { timestamps: true },
)

export const MenuItem = mongoose.model('MenuItem', menuItemSchema)
