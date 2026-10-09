const STEPS = [
  { key: 'placed', label: 'Order placed', hint: 'The restaurant has your order' },
  { key: 'preparing', label: 'Preparing', hint: 'Your food is being cooked' },
  { key: 'out_for_delivery', label: 'Out for delivery', hint: 'On the way to you' },
  { key: 'delivered', label: 'Delivered', hint: 'Enjoy your meal!' },
]

export const STATUS_LABEL = {
  placed: 'Placed',
  preparing: 'Preparing',
  out_for_delivery: 'Out for delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

const time = (d) => new Date(d).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })

export default function StatusTimeline({ order }) {
  if (order.status === 'cancelled') {
    return <p className="rounded-lg bg-sunk px-4 py-3 text-sm text-nonveg">This order was cancelled.</p>
  }
  const current = STEPS.findIndex((s) => s.key === order.status)
  const when = Object.fromEntries((order.statusHistory || []).map((h) => [h.status, h.at]))

  return (
    <ol>
      {STEPS.map((step, i) => {
        const done = i <= current
        const now = i === current && order.status !== 'delivered'
        return (
          <li key={step.key} className="relative flex gap-4 pb-6 last:pb-0">
            {i < STEPS.length - 1 && (
              <span className={`absolute left-[11px] top-6 h-[calc(100%-1.25rem)] w-0.5 ${i < current ? 'bg-veg' : 'bg-line'}`} />
            )}
            <span
              className={`relative grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 text-xs font-bold ${
                done ? 'border-veg bg-veg text-card' : 'border-line bg-card text-faint'
              }`}
            >
              {done ? '✓' : i + 1}
              {now && <span className="absolute inset-0 animate-ping rounded-full bg-veg opacity-30" />}
            </span>
            <div className="-mt-0.5">
              <p className={`font-semibold ${done ? '' : 'text-faint'}`}>
                {step.label}
                {when[step.key] && <span className="ml-2 text-xs font-normal text-soft">{time(when[step.key])}</span>}
              </p>
              {now && <p className="text-sm text-soft">{step.hint}</p>}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
