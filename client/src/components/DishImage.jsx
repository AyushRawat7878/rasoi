import { useState } from 'react'

// Shows the dish photo, or its emoji when there is no photo (or it can't load)
export default function DishImage({ dish, className = '', emojiClass = '' }) {
  const [broken, setBroken] = useState(false)
  if (dish.imageUrl && !broken) {
    return <img src={dish.imageUrl} alt={dish.name} loading="lazy" onError={() => setBroken(true)} className={`object-cover ${className}`} />
  }
  return <span className={emojiClass}>{dish.emoji}</span>
}
