import { useDispatch, useSelector } from 'react-redux'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import ThemeToggle from './ThemeToggle'
import { api } from '../store/api'
import { loggedOut, selectUser } from '../store/authSlice'
import { selectCartCount } from '../store/cartSlice'

export default function Layout() {
  const user = useSelector(selectUser)
  const count = useSelector(selectCartCount)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  function logout() {
    dispatch(loggedOut())
    dispatch(api.util.resetApiState()) // forget the previous user's orders
    navigate('/')
  }

  const link = ({ isActive }) =>
    `whitespace-nowrap rounded-md px-2 py-1.5 text-sm font-medium sm:px-3 ${isActive ? 'text-ink bg-sunk' : 'text-soft hover:text-ink'}`

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b-2 border-gold/50 bg-page/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-1.5 px-4 sm:gap-2">
          <Link to="/" className="mr-auto flex items-baseline gap-1.5">
            <span className="relative">
              <span className="burning font-display text-2xl font-bold tracking-tight">Rasoi</span>
              <span className="logo-sparks" aria-hidden="true">
                {[[12, 0, -10], [38, 0.9, 8], [62, 0.4, -6], [86, 1.4, 10]].map(([left, delay, drift]) => (
                  <span key={left} className="spark" style={{ left: `${left}%`, animationDelay: `${delay}s`, '--drift': `${drift}px` }} />
                ))}
              </span>
            </span>
            <span className="hidden text-sm font-semibold text-gold sm:inline">रसोई</span>
          </Link>
          <nav className="flex items-center gap-1">
            <NavLink to="/" end className={(s) => `hidden sm:block ${link(s)}`}>Menu</NavLink>
            {user && <NavLink to="/orders" className={link}>Orders</NavLink>}
            {user?.role === 'admin' && <NavLink to="/admin" className={link}>Kitchen</NavLink>}
          </nav>
          <Link to="/cart" className="relative ml-1 grid h-9 w-9 place-items-center rounded-lg border border-line hover:bg-sunk" aria-label="Cart">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 7h14l-1.2 11.1a2 2 0 0 1-2 1.9H8.2a2 2 0 0 1-2-1.9L5 7Z" />
              <path d="M9 7V6a3 3 0 0 1 6 0v1" />
            </svg>
            {count > 0 && (
              <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 text-[11px] font-bold text-on-accent">
                {count}
              </span>
            )}
          </Link>
          <ThemeToggle />
          {user ? (
            <button onClick={logout} className="whitespace-nowrap rounded-md px-1.5 py-1.5 text-sm text-soft hover:text-ink" title={user.email}>
              Log out
            </button>
          ) : (
            <Link to="/login" className="btn-primary ml-1 py-2">Log in</Link>
          )}
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 pb-28 pt-6">
        <Outlet />
      </main>
      <footer className="border-t border-line py-6 text-center text-xs text-faint">
        Rasoi is a portfolio project. Built with MongoDB, Express, React, Node and Redux Toolkit. ·{' '}
        <Link to="/credits" className="underline hover:text-ink">Photo credits</Link>
      </footer>
    </div>
  )
}
