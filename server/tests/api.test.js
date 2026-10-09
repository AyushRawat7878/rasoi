// API tests. They use their own temporary database, so your real data is never touched.
// It starts a throwaway in-memory MongoDB, so nothing needs to be installed.  Run: npm test
import assert from 'node:assert/strict'
import { after, before, describe, it } from 'node:test'
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import request from 'supertest'
import { createApp } from '../src/app.js'
import { MenuItem } from '../src/models/MenuItem.js'
import { Order } from '../src/models/Order.js'
import { User } from '../src/models/User.js'
import { priceOrder } from '../src/pricing.js'
import { seed } from '../src/seed.js'

const app = createApp()
let customer, admin, dosa, chai, mongo

before(async () => {
  mongo = await MongoMemoryServer.create()
  await mongoose.connect(mongo.getUri('rasoi_test'))
  await seed()
  dosa = await MenuItem.findOne({ name: 'Masala Dosa' })
  chai = await MenuItem.findOne({ name: 'Masala Chai' })
  const res = await request(app).post('/api/auth/register').send({ name: 'Riya', email: 'riya@example.com', password: 'secret123' })
  customer = res.body.token
  const login = await request(app).post('/api/auth/login').send({ email: 'admin@rasoi.test', password: process.env.ADMIN_PASSWORD || 'admin12345' })
  admin = login.body.token
})

after(async () => {
  await mongoose.disconnect()
  await mongo.stop()
})

const auth = (token) => ({ Authorization: `Bearer ${token}` })
const goodOrder = (lines) => ({ lines, address: '12 MG Road, Indiranagar, Bengaluru', phone: '9876543210' })

describe('pricing', () => {
  it('adds delivery below ₹299 and 5% GST', () => {
    assert.deepEqual(priceOrder([{ price: 100, qty: 2 }]), { subtotal: 200, deliveryFee: 40, gst: 10, total: 250 })
  })
  it('gives free delivery above ₹299', () => {
    assert.deepEqual(priceOrder([{ price: 150, qty: 2 }]), { subtotal: 300, deliveryFee: 0, gst: 15, total: 315 })
  })
})

describe('auth', () => {
  it('registers and returns a token without the password', async () => {
    assert.ok(customer)
    const me = await request(app).get('/api/auth/me').set(auth(customer))
    assert.equal(me.status, 200)
    assert.equal(me.body.user.email, 'riya@example.com')
    assert.equal(me.body.user.passwordHash, undefined)
  })
  it('rejects a duplicate email', async () => {
    const res = await request(app).post('/api/auth/register').send({ name: 'R', email: 'RIYA@example.com', password: 'secret123' })
    assert.equal(res.status, 409)
  })
  it('rejects a wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'riya@example.com', password: 'nope' })
    assert.equal(res.status, 401)
  })
})

describe('menu', () => {
  it('lists dishes and filters veg / category / search', async () => {
    const all = await request(app).get('/api/menu')
    assert.ok(all.body.items.length > 20)
    const veg = await request(app).get('/api/menu?veg=true')
    assert.ok(veg.body.items.every((i) => i.isVeg))
    const nonVeg = await request(app).get('/api/menu?veg=false')
    assert.ok(nonVeg.body.items.length > 0 && nonVeg.body.items.every((i) => !i.isVeg))
    const biryani = await request(app).get('/api/menu?category=Biryani')
    assert.ok(biryani.body.items.every((i) => i.category === 'Biryani'))
    const search = await request(app).get('/api/menu?q=dosa')
    assert.deepEqual(search.body.items.map((i) => i.name), ['Masala Dosa'])
  })
  it('only lets admins add dishes', async () => {
    const dish = { name: 'Pav Bhaji', price: 149, category: 'Mains', isVeg: true }
    assert.equal((await request(app).post('/api/menu').set(auth(customer)).send(dish)).status, 403)
    const res = await request(app).post('/api/menu').set(auth(admin)).send(dish)
    assert.equal(res.status, 201)
  })
})

describe('orders', () => {
  it('needs login', async () => {
    assert.equal((await request(app).post('/api/orders').send(goodOrder([]))).status, 401)
  })
  it('prices the order on the server and ignores a fake price from the browser', async () => {
    const res = await request(app).post('/api/orders').set(auth(customer))
      .send(goodOrder([{ item: dosa._id, qty: 2, price: 1 }, { item: chai._id, qty: 1 }]))
    assert.equal(res.status, 201)
    const o = res.body.order
    assert.equal(o.subtotal, dosa.price * 2 + chai.price)
    assert.equal(o.total, o.subtotal + o.deliveryFee + o.gst)
    assert.equal(o.status, 'placed')
  })
  it('refuses unavailable dishes', async () => {
    await MenuItem.updateOne({ _id: chai._id }, { isAvailable: false })
    const res = await request(app).post('/api/orders').set(auth(customer)).send(goodOrder([{ item: chai._id, qty: 1 }]))
    assert.equal(res.status, 400)
    await MenuItem.updateOne({ _id: chai._id }, { isAvailable: true })
  })
  it('checks the phone number', async () => {
    const res = await request(app).post('/api/orders').set(auth(customer))
      .send({ ...goodOrder([{ item: dosa._id, qty: 1 }]), phone: '12345' })
    assert.equal(res.status, 400)
  })
  it('lets the admin move an order along, and the customer see it', async () => {
    const mine = await request(app).get('/api/orders/mine').set(auth(customer))
    const id = mine.body.orders[0]._id
    assert.equal((await request(app).patch(`/api/orders/${id}/status`).set(auth(customer)).send({ status: 'preparing' })).status, 403)
    const res = await request(app).patch(`/api/orders/${id}/status`).set(auth(admin)).send({ status: 'preparing' })
    assert.equal(res.body.order.status, 'preparing')
    // Too late to cancel now
    assert.equal((await request(app).post(`/api/orders/${id}/cancel`).set(auth(customer))).status, 400)
  })
  it('hides other people\'s orders', async () => {
    const other = await request(app).post('/api/auth/register').send({ name: 'Aman', email: 'aman@example.com', password: 'secret123' })
    const mine = await request(app).get('/api/orders/mine').set(auth(customer))
    const res = await request(app).get(`/api/orders/${mine.body.orders[0]._id}`).set(auth(other.body.token))
    assert.equal(res.status, 404)
  })
})
