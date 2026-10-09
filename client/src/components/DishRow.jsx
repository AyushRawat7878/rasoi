import { useEffect, useRef, useState } from 'react'
import DishImage from './DishImage'
import VegMark from './VegMark'
import QtyButton from './QtyButton'
import { rupees } from '../lib/pricing'

// One dish on the menu: details on the left, picture tile and ADD button on the right
export default function DishRow({ dish }) {
  // When you add the dish, the picture shows a pan "cooking" for a moment, then the dish pops back
  const [cooking, setCooking] = useState(false)
  const [round, setRound] = useState(0) // changes on every add, so the animation restarts
  const timer = useRef()
  useEffect(() => () => clearTimeout(timer.current), [])

  function cook() {
    setRound((r) => r + 1)
    setCooking(true)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setCooking(false), 1300)
  }

  return (
    <article className="flex gap-4 border-b border-dashed border-line py-6 last:border-b-0">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <VegMark isVeg={dish.isVeg} />
          {dish.isBestseller && <span className="text-xs font-semibold text-gold">★ Bestseller</span>}
        </div>
        <h3 className="mt-1.5 text-[17px] font-semibold leading-snug">{dish.name}</h3>
        <p className="mt-0.5 font-semibold">{rupees(dish.price)}</p>
        {dish.description && <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-soft">{dish.description}</p>}
        {dish.spicy > 0 && (
          <p className="mt-1.5 text-xs text-soft" title={`Spice level ${dish.spicy} of 3`}>
            {'🌶️'.repeat(dish.spicy)} <span className="ml-0.5">{['', 'Mild', 'Medium', 'Hot'][dish.spicy]}</span>
          </p>
        )}
      </div>
      <div className="relative flex w-32 shrink-0 flex-col items-center">
        <div className={`grid h-28 w-32 place-items-center overflow-hidden rounded-xl bg-sunk text-5xl ${cooking ? 'cook-tile' : ''}`}>
          {cooking ? (
            <CookingPan key={round} />
          ) : (
            <DishImage key={round} dish={dish} className={`h-full w-full ${round ? 'pop-in' : ''}`} emojiClass={round ? 'pop-in' : ''} />
          )}
        </div>
        <div className="-mt-5">
          <QtyButton dish={dish} onAdd={cook} />
        </div>
      </div>
    </article>
  )
}

function CookingPan() {
  return (
    <div className="cook" aria-label="Cooking">
      <span className="cook-label">Cooking…</span>
      <span className="steam s1" />
      <span className="steam s2" />
      <span className="steam s3" />
      <span className="pan">🥘</span>
      <span className="cook-fire">🔥</span>
    </div>
  )
}
