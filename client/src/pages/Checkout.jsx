import { useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import BillSummary from '../components/BillSummary'
import { priceCart } from '../lib/pricing'
import { errorText, usePlaceOrderMutation } from '../store/api'
import { selectUser, userUpdated } from '../store/authSlice'
import { clearCart, selectCartLines } from '../store/cartSlice'

export default function Checkout() {
  const lines = useSelector(selectCartLines)
  const user = useSelector(selectUser)
  const [form, setForm] = useState({ address: user.address || '', phone: user.phone || '', note: '' })
  const [placeOrder, { isLoading, error }] = usePlaceOrderMutation()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const placed = useRef(false) // stops the empty-cart redirect right after ordering

  if (lines.length === 0 && !placed.current) return <Navigate to="/cart" replace />

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  async function submit(e) {
    e.preventDefault()
    try {
      // Only dish ids and quantities are sent. The server looks up the prices itself.
      const { order } = await placeOrder({
        lines: lines.map((l) => ({ item: l.id, qty: l.qty })),
        ...form,
      }).unwrap()
      placed.current = true
      dispatch(userUpdated({ ...user, address: form.address, phone: form.phone }))
      navigate(`/orders/${order._id}?new=1`)
      dispatch(clearCart())
    } catch {
      // the error is shown below from `error`
    }
  }

  return (
    <form onSubmit={submit} className="mx-auto grid max-w-4xl gap-6 md:grid-cols-[1fr_320px]">
      <section className="card space-y-5 p-5">
        <h1 className="font-display text-2xl font-bold">Delivery details</h1>
        <div>
          <label className="label" htmlFor="address">Full address</label>
          <textarea id="address" rows={3} required value={form.address} onChange={set('address')} className="field resize-none"
            placeholder="House no., street, area, city, PIN code" />
        </div>
        <div>
          <label className="label" htmlFor="phone">Mobile number</label>
          <input id="phone" required inputMode="numeric" value={form.phone} onChange={set('phone')} className="field" placeholder="98765 43210" />
        </div>
        <div>
          <label className="label" htmlFor="note">Note for the kitchen <span className="text-faint">(optional)</span></label>
          <input id="note" maxLength={200} value={form.note} onChange={set('note')} className="field" placeholder="Less spicy, no onion..." />
        </div>
        <div>
          <p className="label">Payment</p>
          <div className="flex items-center gap-3 rounded-lg border-2 border-accent bg-tint px-4 py-3">
            <span className="text-xl">💵</span>
            <div>
              <p className="font-semibold">Cash on delivery</p>
              <p className="text-xs text-soft">Pay when your food arrives</p>
            </div>
          </div>
        </div>
      </section>

      <aside className="card h-fit p-5">
        <h2 className="mb-4 font-semibold">Bill details</h2>
        <BillSummary bill={priceCart(lines)} />
        {error && <p className="mt-4 rounded-md bg-sunk px-3 py-2 text-sm text-nonveg">{errorText(error)}</p>}
        <button disabled={isLoading} className="btn-primary mt-5 w-full">{isLoading ? 'Placing order…' : 'Place order'}</button>
        <Link to="/cart" className="mt-3 block text-center text-sm text-soft hover:text-ink">Back to cart</Link>
      </aside>
    </form>
  )
}
