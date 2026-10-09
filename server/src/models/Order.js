import mongoose from 'mongoose'

export const ORDER_STATUSES = ['placed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled']

// Name and price are copied into the order, so old orders stay correct even if the menu changes later.
const orderLineSchema = new mongoose.Schema(
  {
    item: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
    name: String,
    price: Number,
    qty: { type: Number, min: 1, max: 20 },
    isVeg: Boolean,
    emoji: String,
  },
  { _id: false },
)

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    lines: { type: [orderLineSchema], validate: (v) => v.length > 0 },
    subtotal: Number,
    deliveryFee: Number,
    gst: Number,
    total: Number,
    address: { type: String, required: true },
    phone: { type: String, required: true },
    note: { type: String, default: '' },
    paymentMethod: { type: String, enum: ['cod'], default: 'cod' },
    status: { type: String, enum: ORDER_STATUSES, default: 'placed' },
    statusHistory: [{ status: String, at: { type: Date, default: Date.now }, _id: false }],
  },
  { timestamps: true },
)

export const Order = mongoose.model('Order', orderSchema)
