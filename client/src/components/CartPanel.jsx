import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import QtyButton from './QtyButton'
import VegMark from './VegMark'
import { priceCart, rupees } from '../lib/pricing'
import { selectCartLines } from '../store/cartSlice'

// The small cart shown next to the menu on big screens
export default function CartPanel() {
  const lines = useSelector(selectCartLines)
  const bill = priceCart(lines)

  return (
    <div className="card p-5">
      <h2 className="font-display text-xl font-bold">Your order</h2>
      {lines.length === 0 ? (
        <p className="mt-3 text-sm text-soft">Nothing here yet. Tap ADD on a dish to start.</p>
      ) : (
        <>
          <ul className="mt-4 space-y-3">
            {lines.map((l) => (
              <li key={l.id} className="flex items-center gap-2 text-sm">
                <VegMark isVeg={l.isVeg} size={12} />
                <span className="min-w-0 flex-1 truncate">{l.name}</span>
                <QtyButton dish={l} compact />
                <span className="w-14 text-right">{rupees(l.price * l.qty)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-between border-t border-line pt-3 font-semibold">
            <span>Item total</span>
            <span>{rupees(bill.subtotal)}</span>
          </div>
          <Link to="/cart" className="btn-primary mt-4 w-full">Go to cart</Link>
        </>
      )}
    </div>
  )
}
