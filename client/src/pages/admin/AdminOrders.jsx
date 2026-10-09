import { useState } from 'react'
import { STATUS_LABEL } from '../../components/StatusTimeline'
import VegMark from '../../components/VegMark'
import { rupees } from '../../lib/pricing'
import { errorText, useGetAllOrdersQuery, useSetOrderStatusMutation } from '../../store/api'
import { orderDate, STATUS_STYLE } from '../Orders'

const NEXT = { placed: 'preparing', preparing: 'out_for_delivery', out_for_delivery: 'delivered' }
const NEXT_LABEL = { placed: 'Start preparing', preparing: 'Send for delivery', out_for_delivery: 'Mark delivered' }
const FILTERS = ['', 'placed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled']

export default function AdminOrders() {
  const [status, setStatus] = useState('')
  // New orders show up by themselves: check every 15 seconds
  const { data, isLoading, error } = useGetAllOrdersQuery(status, { pollingInterval: 15000 })
  const [setOrderStatus, { isLoading: saving }] = useSetOrderStatusMutation()
  const orders = data?.orders || []

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setStatus(f)}
            className={`rounded-full border px-3 py-1 text-sm ${status === f ? 'border-accent bg-tint text-accent-text' : 'border-line text-soft hover:text-ink'}`}
          >
            {f ? STATUS_LABEL[f] : 'All'}
          </button>
        ))}
      </div>

      {isLoading && <p className="mt-6 text-soft">Loading…</p>}
      {error && <p className="mt-6 text-nonveg">{errorText(error)}</p>}
      {!isLoading && orders.length === 0 && <p className="mt-10 text-center text-soft">No orders here.</p>}

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {orders.map((o) => (
          <article key={o._id} className="card flex flex-col p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold">#{o._id.slice(-6).toUpperCase()} · {o.user?.name || 'Customer'}</p>
                <p className="text-xs text-soft">{orderDate(o.createdAt)}</p>
              </div>
              <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLE[o.status]}`}>{STATUS_LABEL[o.status]}</span>
            </div>
            <ul className="my-3 space-y-1 text-sm">
              {o.lines.map((l) => (
                <li key={l.item} className="flex items-center gap-2">
                  <VegMark isVeg={l.isVeg} size={11} />
                  <span className="font-semibold">{l.qty} ×</span> {l.name}
                </li>
              ))}
            </ul>
            {o.note && <p className="mb-2 rounded-md bg-tint px-2 py-1 text-xs text-accent-text">Note: {o.note}</p>}
            <p className="text-xs text-soft">{o.address} · {o.phone}</p>
            <div className="mt-auto flex items-center justify-between gap-2 pt-4">
              <span className="font-semibold">{rupees(o.total)} <span className="text-xs font-normal text-soft">COD</span></span>
              {NEXT[o.status] && (
                <div className="flex gap-2">
                  <button
                    disabled={saving}
                    onClick={() => setOrderStatus({ id: o._id, status: 'cancelled' })}
                    className="btn-ghost px-3 py-1.5 text-xs text-nonveg"
                  >
                    Cancel
                  </button>
                  <button disabled={saving} onClick={() => setOrderStatus({ id: o._id, status: NEXT[o.status] })} className="btn-primary px-3 py-1.5 text-xs">
                    {NEXT_LABEL[o.status]}
                  </button>
                </div>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
