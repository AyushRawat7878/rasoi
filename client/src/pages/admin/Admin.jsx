import { useState } from 'react'
import AdminMenu from './AdminMenu'
import AdminOrders from './AdminOrders'

// The restaurant's side: incoming orders and the menu
export default function Admin() {
  const [tab, setTab] = useState('orders')
  const tabClass = (t) =>
    `border-b-2 px-1 pb-2 text-sm font-semibold ${tab === t ? 'border-accent text-ink' : 'border-transparent text-soft hover:text-ink'}`

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Kitchen</h1>
      <div className="mt-4 flex gap-6 border-b border-line">
        <button className={tabClass('orders')} onClick={() => setTab('orders')}>Orders</button>
        <button className={tabClass('menu')} onClick={() => setTab('menu')}>Menu</button>
      </div>
      <div className="mt-6">{tab === 'orders' ? <AdminOrders /> : <AdminMenu />}</div>
    </div>
  )
}
