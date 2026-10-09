import { useEffect, useState } from 'react'

// The dish photos come from Wikimedia Commons. Their licenses ask us to name the photographer,
// so this page lists every photo with its author and license.
export default function Credits() {
  const [credits, setCredits] = useState([])
  useEffect(() => {
    fetch('/dishes/credits.json')
      .then((r) => r.json())
      .then(setCredits)
      .catch(() => setCredits([]))
  }, [])

  const clean = (text) => text.replace(/&amp;/g, '&')

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-3xl font-bold">Photo credits</h1>
      <p className="mt-2 text-soft">
        Dish photos are from Wikimedia Commons, used under Creative Commons licenses. Thank you to the photographers.
      </p>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {credits.map((c) => (
          <li key={c.dish} className="card flex gap-3 p-3">
            <img src={c.image} alt={c.dish} loading="lazy" className="h-16 w-16 shrink-0 rounded-lg object-cover" />
            <div className="min-w-0 text-sm">
              <p className="font-semibold">{c.dish}</p>
              <p className="truncate text-soft">by {clean(c.author)}</p>
              <a href={c.link} target="_blank" rel="noreferrer" className="text-accent-text hover:underline">
                {c.license}
              </a>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
