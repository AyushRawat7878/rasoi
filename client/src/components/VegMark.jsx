// The Indian food symbol: green square with a dot = veg, red square with a triangle = non-veg
export default function VegMark({ isVeg, size = 14 }) {
  const color = isVeg ? 'var(--color-veg)' : 'var(--color-nonveg)'
  return (
    <span
      title={isVeg ? 'Vegetarian' : 'Non-vegetarian'}
      className="inline-grid shrink-0 place-items-center rounded-[3px] border-[1.5px]"
      style={{ width: size, height: size, borderColor: color }}
    >
      {isVeg ? (
        <span className="rounded-full" style={{ width: size * 0.45, height: size * 0.45, background: color }} />
      ) : (
        <svg width={size * 0.55} height={size * 0.5} viewBox="0 0 10 9">
          <path d="M5 0 10 9H0Z" fill={color} />
        </svg>
      )}
    </span>
  )
}
