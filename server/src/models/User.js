import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
    phone: { type: String, default: '' },
    address: { type: String, default: '' }, // remembered for next checkout
  },
  { timestamps: true },
)

userSchema.methods.checkPassword = function (password) {
  return bcrypt.compare(password, this.passwordHash)
}

userSchema.statics.hashPassword = (password) => bcrypt.hash(password, 10)

// Never send the password hash to the browser
userSchema.methods.toPublic = function () {
  return { id: this._id, name: this.name, email: this.email, role: this.role, phone: this.phone, address: this.address }
}

export const User = mongoose.model('User', userSchema)
