import { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import CartPanel from '../components/CartPanel'
import DishRow from '../components/DishRow'
import FireBackground from '../components/FireBackground'
import VegMark from '../components/VegMark'
import { FREE_DELIVERY_ABOVE, priceCart, rupees } from '../lib/pricing'
import { errorText, useGetMenuQuery } from '../store/api'
import { selectCartCount, selectCartLines } from '../store/cartSlice'

export default function Menu() {
  const [diet, setDiet] = useState('all') // 'all' | 'veg' | 'nonveg'
  const [search, setSearch] = useState('')
  const q = useDebounced(search.trim(), 300)

  // Filtering happens on the server: /api/menu?veg=true (veg) or ?veg=false (non-veg), &q=paneer
  const { data, isLoading, isFetching, error } = useGetMenuQuery({ diet, q })
  const items = data?.items || []

  // Group dishes by category, in the menu's order
  const sections = useMemo(() => {
    const order = data?.categories || []
    return order.map((c) => ({ name: c, dishes: items.filter((i) => i.category === c) })).filter((s) => s.dishes.length)
  }, [data, items])

  return (
    <div className="grid gap-8 lg:grid-cols-[180px_1fr_300px]">
      {/* Category list (big screens) */}
      <aside className="hidden lg:block">
        <nav className="sticky top-24 space-y-0.5 border-r border-line pr-4 text-sm">
          {sections.map((s) => (
            <a key={s.name} href={`#${slug(s.name)}`} className="flex justify-between rounded-md px-2 py-1.5 text-soft hover:bg-sunk hover:text-ink">
              {s.name}
              <span className="text-faint">{s.dishes.length}</span>
            </a>
          ))}
        </nav>
      </aside>

      <div className="min-w-0">
        <section className="relative overflow-hidden rounded-2xl bg-accent px-6 py-7 text-on-accent">
          <FireBackground />
          <p className="relative text-xs font-bold uppercase tracking-[0.2em] text-[#ffd76a]">Fresh from the tandoor</p>
          <h1 className="relative mt-2 font-display text-4xl font-bold tracking-tight sm:text-5xl">
            Rasoi <span className="text-[#ffd76a]">Kitchen</span>
          </h1>
          <p className="relative mt-2 opacity-90">North Indian · South Indian · Biryani · Desserts</p>
          <div className="relative mt-5 flex flex-wrap gap-2 text-sm font-medium">
            <span className="rounded-full bg-black/25 px-3 py-1 backdrop-blur-sm">🕒 30–40 min</span>
            <span className="rounded-full bg-black/25 px-3 py-1 backdrop-blur-sm">🛵 Free delivery above {rupees(FREE_DELIVERY_ABOVE)}</span>
            <span className="rounded-full bg-black/25 px-3 py-1 backdrop-blur-sm">💵 Cash on delivery</span>
          </div>
        </section>

        {/* Search and veg filter */}
        <div className="sticky top-16 z-20 -mx-4 mt-2 flex flex-wrap items-center gap-3 bg-page px-4 py-3">
          <div className="relative min-w-[200px] flex-1">
            <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search for a dish" className="field pl-9" />
          </div>
          <DietFilter value={diet} onChange={setDiet} />
        </div>

        {/* Category chips (phones) */}
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 [scrollbar-width:none] lg:hidden">
          {sections.map((s) => (
            <a key={s.name} href={`#${slug(s.name)}`} className="shrink-0 rounded-full border border-gold/50 px-3 py-1 text-sm text-soft hover:bg-tint hover:text-ink">
              {s.name}
            </a>
          ))}
        </div>

        {!isLoading && !error && (diet !== 'all' || q) && (
          <p key={diet + q} className="mt-3 animate-[fadein_.25s_ease-out] text-sm text-soft">
            Showing <span className="font-semibold text-ink">{items.length}</span>{' '}
            {diet === 'veg' ? 'veg' : diet === 'nonveg' ? 'non-veg' : ''} dish{items.length === 1 ? '' : 'es'}
            {q && <> for "<span className="text-ink">{q}</span>"</>}
            {' · '}
            <button onClick={() => { setDiet('all'); setSearch('') }} className="font-semibold text-accent-text hover:underline">
              Show all
            </button>
          </p>
        )}
        {isLoading && <WakeUpNote />}
        {isLoading && <MenuSkeleton />}
        {error && <p className="mt-6 rounded-lg bg-sunk p-4 text-nonveg">{errorText(error)}</p>}
        {!isLoading && !error && items.length === 0 && (
          <p className="py-16 text-center text-soft">No dishes found. Try another word or filter.</p>
        )}

        <div className={isFetching && !isLoading ? 'opacity-60 transition-opacity' : ''}>
          {sections.map((s) => (
            <section key={s.name} id={slug(s.name)} className="scroll-mt-32 pt-6">
              <h2 className="font-display text-2xl font-bold">
                {s.name} <span className="text-base font-normal text-faint">({s.dishes.length})</span>
              </h2>
              {s.dishes.map((d) => (
                <DishRow key={d._id} dish={d} />
              ))}
            </section>
          ))}
        </div>
      </div>

      {/* Cart (big screens) */}
      <aside className="hidden lg:block">
        <div className="sticky top-24">
          <CartPanel />
        </div>
      </aside>

      <MobileCartBar />
    </div>
  )
}

// All / Veg / Non-veg buttons. The chosen one is highlighted.
function DietFilter({ value, onChange }) {
  const options = [
    { key: 'all', label: 'All' },
    { key: 'veg', label: 'Veg', mark: true, isVeg: true, active: 'border-veg bg-veg/10 text-veg' },
    { key: 'nonveg', label: 'Non-veg', mark: true, isVeg: false, active: 'border-nonveg bg-nonveg/10 text-nonveg' },
  ]
  return (
    <div role="radiogroup" aria-label="Food type" className="flex shrink-0 gap-1.5">
      {options.map((o) => {
        const on = value === o.key
        return (
          <button
            key={o.key}
            role="radio"
            aria-checked={on}
            onClick={() => onChange(o.key)}
            className={`flex h-11 items-center gap-1.5 rounded-lg border px-3 text-sm font-semibold transition-all active:scale-95 ${
              on ? o.active || 'border-accent bg-tint text-accent-text' : 'border-line text-soft hover:bg-sunk hover:text-ink'
            }`}
          >
            {o.mark && <VegMark isVeg={o.isVeg} size={13} />}
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

function MobileCartBar() {
  const count = useSelector(selectCartCount)
  const lines = useSelector(selectCartLines)
  if (!count) return null
  return (
    <Link
      to="/cart"
      className="fixed inset-x-3 bottom-3 z-30 flex items-center justify-between rounded-xl bg-accent px-5 py-3.5 font-semibold text-on-accent shadow-lg lg:hidden"
    >
      <span>
        {count} item{count > 1 ? 's' : ''} · {rupees(priceCart(lines).subtotal)}
      </span>
      <span>View cart →</span>
    </Link>
  )
}

// The free server sleeps when nobody uses it. If loading takes long, say why.
function WakeUpNote() {
  const [slow, setSlow] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setSlow(true), 3000)
    return () => clearTimeout(t)
  }, [])
  if (!slow) return null
  return (
    <p className="mt-4 flex items-center gap-2 rounded-lg bg-tint px-4 py-3 text-sm text-accent-text">
      <span className="animate-pulse">🔥</span>
      Waking up the kitchen… The free server sleeps when idle, so the first load can take up to a minute.
    </p>
  )
}

function MenuSkeleton() {
  return (
    <div className="mt-6 space-y-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex animate-pulse gap-4">
          <div className="flex-1 space-y-3">
            <div className="h-4 w-1/2 rounded bg-sunk" />
            <div className="h-3 w-16 rounded bg-sunk" />
            <div className="h-3 w-3/4 rounded bg-sunk" />
          </div>
          <div className="h-28 w-32 rounded-xl bg-sunk" />
        </div>
      ))}
    </div>
  )
}

const slug = (s) => s.toLowerCase().replace(/\s+/g, '-')

// Waits until you stop typing before searching, so we don't call the server on every key
function useDebounced(value, ms) {
  const [v, setV] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms)
    return () => clearTimeout(t)
  }, [value, ms])
  return v
}
