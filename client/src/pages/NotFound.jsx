import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="py-24 text-center">
      <p className="text-5xl">🍽️</p>
      <h1 className="mt-4 font-display text-3xl font-bold">This plate is empty</h1>
      <p className="mt-2 text-soft">The page you're looking for isn't on the menu.</p>
      <Link to="/" className="btn-primary mt-6">Back to the menu</Link>
    </div>
  )
}
