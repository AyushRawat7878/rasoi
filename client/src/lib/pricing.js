// Same rules as the server (server/src/config.js). The cart uses this to show the bill,
// but the server always recalculates it when the order is placed.
export const FREE_DELIVERY_ABOVE = 299
export const DELIVERY_FEE = 40
export const GST_RATE = 0.05

export function priceCart(lines) {
  const subtotal = lines.reduce((sum, l) => sum + l.price * l.qty, 0)
  const deliveryFee = subtotal === 0 || subtotal > FREE_DELIVERY_ABOVE ? 0 : DELIVERY_FEE
  const gst = Math.round(subtotal * GST_RATE)
  return { subtotal, deliveryFee, gst, total: subtotal + deliveryFee + gst }
}

export const rupees = (n) => '₹' + Number(n || 0).toLocaleString('en-IN')
