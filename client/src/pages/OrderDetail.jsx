import { Link, useParams, useSearchParams } from 'react-router-dom'
import BillSummary from '../components/BillSummary'
import StatusTimeline from '../components/StatusTimeline'
import VegMark from '../components/VegMark'
import { rupees } from '../lib/pricing'
import { errorText, useCancelOrderMutation, useGetOrderQuery } from '../store/api'
import { orderDate } from './Orders'

export default function OrderDetail() {
  const { id } = useParams()
  const [params] = useSearchParams()
  // Ask the server again every 10 seconds, so the status updates by itself when the kitchen changes it
  const { data, isLoading, error } = useGetOrderQuery(id, { pollingInterval: 10000 })
  const [cancel, cancelState] = useCancelOrderMutation()
  const order = data?.order

  if (isLoading) return <p className="text-soft">Loading…</p>
  if (error) return <p className="text-nonveg">{errorText(error)}</p>

  const live = !['delivered', 'cancelled'].includes(order.status)

  return (
    <div className="mx-auto max-w-3xl">
      {params.get('new') && order.status === 'placed' && (
        <div className="mb-6 rounded-xl border border-veg/40 bg-card p-4">
          <p className="font-semibold text-veg">Order placed! 🎉</p>
          <p className="text-sm text-soft">Pay {rupees(order.total)} in cash when it arrives.</p>
        </div>
      )}

      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-sm text-soft">Order #{order._id.slice(-6).toUpperCase()} · {orderDate(order.createdAt)}</p>
          <h1 className="font-display text-3xl font-bold">{live ? 'Tracking your order' : 'Order details'}</h1>
        </div>
        {live && <p className="text-xs text-faint">Updates automatically</p>}
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-[1fr_300px]">
        <section className="card p-5">
          <StatusTimeline order={order} />
          {order.status === 'placed' && (
            <button
              onClick={() => cancel(order._id)}
              disabled={cancelState.isLoading}
              className="mt-6 text-sm font-medium text-nonveg hover:underline"
            >
              Cancel order
            </button>
          )}
          {cancelState.error && <p className="mt-2 text-sm text-nonveg">{errorText(cancelState.error)}</p>}

          <div className="mt-6 border-t border-line pt-4 text-sm">
            <p className="text-soft">Delivering to</p>
            <p className="mt-1">{order.address}</p>
            <p className="mt-1 text-soft">{order.phone}</p>
            {order.note && <p className="mt-2 text-soft">Note: “{order.note}”</p>}
          </div>
        </section>

        <aside className="card h-fit p-5">
          <h2 className="mb-3 font-semibold">Items</h2>
          <ul className="mb-4 space-y-2 text-sm">
            {order.lines.map((l) => (
              <li key={l.item} className="flex items-center gap-2">
                <VegMark isVeg={l.isVeg} size={12} />
                <span className="flex-1">{l.name} × {l.qty}</span>
                <span>{rupees(l.price * l.qty)}</span>
              </li>
            ))}
          </ul>
          <BillSummary bill={order} hint={false} />
          <p className="mt-3 text-xs text-soft">Paid by cash on delivery</p>
        </aside>
      </div>

      <Link to="/orders" className="mt-6 inline-block text-sm text-soft hover:text-ink">← All orders</Link>
    </div>
  )
}
