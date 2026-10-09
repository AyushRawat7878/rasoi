import { PRICING } from './config.js'

/** Work out the bill for a list of { price, qty } lines. All amounts are whole rupees. */
export function priceOrder(lines) {
  const subtotal = lines.reduce((sum, l) => sum + l.price * l.qty, 0)
  const deliveryFee = subtotal === 0 || subtotal > PRICING.freeDeliveryAbove ? 0 : PRICING.deliveryFee
  const gst = Math.round(subtotal * PRICING.gstRate)
  return { subtotal, deliveryFee, gst, total: subtotal + deliveryFee + gst }
}
