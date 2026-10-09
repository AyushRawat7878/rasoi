import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { errorText, useLoginMutation, useRegisterMutation } from '../store/api'
import { loggedIn } from '../store/authSlice'

// One page for both "Log in" and "Sign up"
export default function Login({ mode }) {
  const isRegister = mode === 'register'
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [login, loginState] = useLoginMutation()
  const [register, registerState] = useRegisterMutation()
  const { isLoading, error } = isRegister ? registerState : loginState
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const next = params.get('next') || '/'

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  async function submit(e) {
    e.preventDefault()
    try {
      const data = isRegister ? await register(form).unwrap() : await login({ email: form.email, password: form.password }).unwrap()
      dispatch(loggedIn(data))
      navigate(data.user.role === 'admin' && next === '/' ? '/admin' : next, { replace: true })
    } catch {
      // shown below
    }
  }

  return (
    <div className="mx-auto max-w-sm py-10">
      <h1 className="font-display text-3xl font-bold">{isRegister ? 'Create an account' : 'Welcome back'}</h1>
      <p className="mt-1 text-soft">{isRegister ? 'Sign up to place orders and track them.' : 'Log in to order and see your orders.'}</p>

      <form onSubmit={submit} className="mt-8 space-y-4">
        {isRegister && (
          <div>
            <label className="label" htmlFor="name">Name</label>
            <input id="name" required value={form.name} onChange={set('name')} className="field" autoComplete="name" />
          </div>
        )}
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" type="email" required value={form.email} onChange={set('email')} className="field" autoComplete="email" />
        </div>
        <div>
          <label className="label" htmlFor="password">Password</label>
          <input id="password" type="password" required minLength={6} value={form.password} onChange={set('password')} className="field"
            autoComplete={isRegister ? 'new-password' : 'current-password'} />
        </div>
        {error && <p className="rounded-md bg-sunk px-3 py-2 text-sm text-nonveg">{errorText(error)}</p>}
        <button disabled={isLoading} className="btn-primary w-full">{isLoading ? 'Please wait…' : isRegister ? 'Sign up' : 'Log in'}</button>
      </form>

      <p className="mt-6 text-center text-sm text-soft">
        {isRegister ? 'Already have an account? ' : 'New to Rasoi? '}
        <Link to={`${isRegister ? '/login' : '/register'}?next=${encodeURIComponent(next)}`} className="font-semibold text-accent-text">
          {isRegister ? 'Log in' : 'Create an account'}
        </Link>
      </p>
    </div>
  )
}
