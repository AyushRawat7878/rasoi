import { useState } from 'react'
import VegMark from '../../components/VegMark'
import { errorText, useAddDishMutation, useDeleteDishMutation, useGetMenuQuery, useUpdateDishMutation } from '../../store/api'

const EMPTY = { name: '', price: '', category: 'Mains', isVeg: true, emoji: '🍛', description: '' }

export default function AdminMenu() {
  const { data, isLoading } = useGetMenuQuery({ all: true }) // includes dishes that are switched off
  const [updateDish] = useUpdateDishMutation()
  const [deleteDish] = useDeleteDishMutation()
  const [addDish, addState] = useAddDishMutation()
  const [form, setForm] = useState(EMPTY)
  const items = data?.items || []
  const categories = data?.categories || []

  async function add(e) {
    e.preventDefault()
    try {
      await addDish({ ...form, price: Number(form.price) }).unwrap()
      setForm(EMPTY)
    } catch {
      // shown below
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-line text-left text-soft">
            <tr>
              <th className="px-4 py-3 font-medium">Dish</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">In stock</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {isLoading && (
              <tr><td className="px-4 py-6 text-soft" colSpan={5}>Loading…</td></tr>
            )}
            {items.map((d) => (
              <tr key={d._id} className={d.isAvailable ? '' : 'opacity-50'}>
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{d.emoji}</span>
                    <VegMark isVeg={d.isVeg} size={11} />
                    <span className="font-medium">{d.name}</span>
                  </div>
                </td>
                <td className="px-4 py-2.5 text-soft">{d.category}</td>
                <td className="px-4 py-2.5">
                  <PriceInput dish={d} onSave={(price) => updateDish({ id: d._id, price })} />
                </td>
                <td className="px-4 py-2.5">
                  <input
                    type="checkbox"
                    checked={d.isAvailable}
                    onChange={() => updateDish({ id: d._id, isAvailable: !d.isAvailable })}
                    className="h-4 w-4 accent-[var(--color-veg)]"
                    aria-label={`${d.name} in stock`}
                  />
                </td>
                <td className="px-4 py-2.5 text-right">
                  <DeleteButton onDelete={() => deleteDish(d._id)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <form onSubmit={add} className="card h-fit space-y-3 p-5">
        <h2 className="font-semibold">Add a dish</h2>
        <input required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="field" />
        <div className="flex gap-2">
          <input required type="number" min="1" placeholder="Price ₹" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="field" />
          <input value={form.emoji} onChange={(e) => setForm({ ...form, emoji: e.target.value })} className="field w-16 text-center" aria-label="Emoji" />
        </div>
        <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="field">
          {categories.map((c) => <option key={c}>{c}</option>)}
        </select>
        <textarea rows={2} placeholder="Short description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="field resize-none" />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.isVeg} onChange={(e) => setForm({ ...form, isVeg: e.target.checked })} className="h-4 w-4" />
          Vegetarian
        </label>
        {addState.error && <p className="text-sm text-nonveg">{errorText(addState.error)}</p>}
        <button disabled={addState.isLoading} className="btn-primary w-full">Add to menu</button>
      </form>
    </div>
  )
}

// Click the price, type a new one, press Enter (or click away) to save
function PriceInput({ dish, onSave }) {
  const [value, setValue] = useState(dish.price)
  const save = () => {
    const price = Math.round(Number(value))
    if (price > 0 && price !== dish.price) onSave(price)
    else setValue(dish.price)
  }
  return (
    <span className="inline-flex items-center gap-0.5">
      ₹
      <input
        type="number"
        min="1"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={save}
        onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
        className="w-16 rounded border border-transparent bg-transparent px-1 py-0.5 hover:border-line focus:border-accent focus:outline-none"
        aria-label={`Price of ${dish.name}`}
      />
    </span>
  )
}

// Asks "Sure?" on the first click instead of a popup
function DeleteButton({ onDelete }) {
  const [sure, setSure] = useState(false)
  return (
    <button
      onClick={() => (sure ? onDelete() : setSure(true))}
      onBlur={() => setSure(false)}
      className={`text-xs ${sure ? 'font-semibold text-nonveg' : 'text-soft hover:text-nonveg'}`}
    >
      {sure ? 'Sure? Delete' : 'Delete'}
    </button>
  )
}
