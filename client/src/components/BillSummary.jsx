import { FREE_DELIVERY_ABOVE, rupees } from '../lib/pricing'

export default function BillSummary({ bill, hint = true }) {
  const more = FREE_DELIVERY_ABOVE + 1 - bill.subtotal
  return (
    <div className="space-y-2 text-sm">
      <Row label="Item total" value={rupees(bill.subtotal)} />
      <Row
        label="Delivery fee"
        value={bill.deliveryFee === 0 && bill.subtotal > 0 ? <span className="font-semibold text-veg">FREE</span> : rupees(bill.deliveryFee)}
      />
      {hint && bill.deliveryFee > 0 && more > 0 && (
        <p className="rounded-md bg-tint px-2.5 py-1.5 text-xs text-accent-text">Add {rupees(more)} more for free delivery</p>
      )}
      <Row label="GST (5%)" value={rupees(bill.gst)} />
      <div className="flex justify-between border-t border-line pt-3 text-base font-bold">
        <span>To pay</span>
        <span>{rupees(bill.total)}</span>
      </div>
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between text-soft">
      <span>{label}</span>
      <span className="text-ink">{value}</span>
    </div>
  )
}
