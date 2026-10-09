import { useDispatch, useSelector } from 'react-redux'
import { addItem, removeItem, selectQty } from '../store/cartSlice'

// Shows "ADD" when the dish isn't in the cart, and  −  2  +  when it is
// onAdd (optional) runs every time one is added, e.g. to play the cooking animation
export default function QtyButton({ dish, compact = false, onAdd }) {
  const dispatch = useDispatch()
  const qty = useSelector(selectQty(dish._id || dish.id))
  const item = dish._id ? dish : { ...dish, _id: dish.id }
  const size = compact ? 'h-8 w-24 text-sm' : 'h-9 w-28 text-sm'
  const add = () => {
    dispatch(addItem(item))
    onAdd?.()
  }

  if (qty === 0) {
    return (
      <button
        onClick={add}
        className={`${size} rounded-lg border border-line bg-card font-bold tracking-wide text-accent-text shadow-sm hover:bg-tint`}
      >
        ADD
      </button>
    )
  }
  return (
    <div className={`${size} flex items-center justify-between rounded-lg bg-accent font-bold text-on-accent shadow-sm`}>
      <button className="h-full w-8 text-lg" onClick={() => dispatch(removeItem(item._id))} aria-label="Remove one">
        −
      </button>
      <span>{qty}</span>
      <button className="h-full w-8 text-lg" onClick={add} aria-label="Add one">
        +
      </button>
    </div>
  )
}
