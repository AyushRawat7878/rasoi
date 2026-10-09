import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import BillSummary from '../components/BillSummary'
import DishImage from '../components/DishImage'
import QtyButton from '../components/QtyButton'
import VegMark from '../components/VegMark'
import { priceCart, rupees } from '../lib/pricing'
import { clearCart, selectCartLines } from '../store/cartSlice'

export default function Cart() {
  const lines = useSelector(selectCartLines)
  const dispatch = useDispatch()

  if (lines.length === 0) {
    return (
      <div className="py-24 text-center">
        <p className="text-5xl">🛒</p>
        <h1 className="mt-4 font-display text-3xl font-bold">Your cart is empty</h1>
        <p className="mt-2 text-soft">Good food is always cooking. Go ahead, order some yummy items from the menu.</p>
        <Link to="/" className="btn-primary mt-6">See the menu</Link>
      </div>
    )
  }

  return (
    <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-[1fr_320px]">
      <section className="card p-5">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold">Cart</h1>
          <button onClick={() => dispatch(clearCart())} className="text-sm text-soft hover:text-nonveg">Clear cart</button>
        </div>
        <ul className="mt-4 divide-y divide-line">
          {lines.map((l) => (
            <li key={l.id} className="flex items-center gap-3 py-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-lg bg-sunk text-2xl">
                <DishImage dish={l} className="h-full w-full" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <VegMark isVeg={l.isVeg} size={12} />
                  <p className="truncate font-medium">{l.name}</p>
                </div>
                <p className="text-sm text-soft">{rupees(l.price)} each</p>
              </div>
              <QtyButton dish={l} compact />
              <p className="w-16 text-right font-semibold">{rupees(l.price * l.qty)}</p>
            </li>
          ))}
        </ul>
        <Link to="/" className="mt-2 inline-block text-sm font-medium text-accent-text">+ Add more items</Link>
      </section>

      <aside className="card h-fit p-5">
        <h2 className="mb-4 font-semibold">Bill details</h2>
        <BillSummary bill={priceCart(lines)} />
        <Link to="/checkout" className="btn-primary mt-5 w-full">Checkout</Link>
      </aside>
    </div>
  )
}
