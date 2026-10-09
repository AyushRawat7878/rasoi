import { Link } from 'react-router-dom'
import { STATUS_LABEL } from '../components/StatusTimeline'
import { rupees } from '../lib/pricing'
import { errorText, useGetMyOrdersQuery } from '../store/api'

export const STATUS_STYLE = {
  placed: 'bg-sunk text-ink',
  preparing: 'bg-tint text-accent-text',
  out_for_delivery: 'bg-tint text-accent-text',
  delivered: 'bg-sunk text-veg',
  cancelled: 'bg-sunk text-nonveg',
}

export const orderDate = (d) =>
  new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })

export default function Orders() {
  const { data, isLoading, error } = useGetMyOrdersQuery(undefined, { refetchOnMountOrArgChange: true })
  const orders = data?.orders || []

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-3xl font-bold">My orders</h1>
      {isLoading && <p className="mt-6 text-soft">Loading…</p>}
      {error && <p className="mt-6 text-nonveg">{errorText(error)}</p>}
      {!isLoading && orders.length === 0 && (
        <div className="mt-10 text-center">
          <p className="text-soft">You haven't ordered anything yet.</p>
          <Link to="/" className="btn-primary mt-4">Order something</Link>
        </div>
      )}
      <ul className="mt-6 space-y-3">
        {orders.map((o) => (
          <li key={o._id}>
            <Link to={`/orders/${o._id}`} className="card block p-4 hover:border-faint">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-soft">{orderDate(o.createdAt)} · #{o._id.slice(-6).toUpperCase()}</p>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLE[o.status]}`}>{STATUS_LABEL[o.status]}</span>
              </div>
              <p className="mt-2 line-clamp-1">
                {o.lines.map((l) => `${l.name} × ${l.qty}`).join(', ')}
              </p>
              <p className="mt-1 font-semibold">{rupees(o.total)}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
