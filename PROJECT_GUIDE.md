# Rasoi: how I built it (simple guide)

This guide explains the whole project in plain words, so you can explain it confidently in an interview.
Read it top to bottom once. Then open each file mentioned and look at the code next to the explanation.

---

## 1. What is Rasoi? (say this first)

> "Rasoi is a food ordering website for an Indian restaurant. Customers browse the menu, add dishes to a cart,
> place a cash-on-delivery order and watch its status change live. The restaurant has a Kitchen page where it
> moves orders along and edits the menu. I built it with the MERN stack and Redux Toolkit."

**MERN** = **M**ongoDB (database) + **E**xpress (server) + **R**eact (website) + **N**ode.js (runs the server).

---

## 2. The big picture

```
   Browser (React + Redux)                 Server (Node + Express)              Database (MongoDB)
 ┌──────────────────────────┐   HTTP    ┌───────────────────────────┐        ┌──────────────────┐
 │ Menu, Cart, Checkout,    │ ───────▶  │ /api/auth   login, signup │ ─────▶ │ users            │
 │ My orders, Kitchen page  │  JSON     │ /api/menu   dishes        │        │ menuitems        │
 │                          │ ◀───────  │ /api/orders place, track  │ ◀───── │ orders           │
 └──────────────────────────┘           └───────────────────────────┘        └──────────────────┘
```

- The **website** never talks to the database directly. It asks the **server** (an "API").
- The **server** checks who you are, checks the data, talks to the **database**, and sends back JSON.

---

## 3. The order I built it in

This is the real step-by-step order. It's also a good way to explain it.

| Step | What I did | Main files |
|---|---|---|
| 1 | Planned the data: users, dishes, orders | `server/src/models/` |
| 2 | Made the Express server and connected MongoDB | `server/src/app.js`, `server.js`, `db.js` |
| 3 | Added sign up / log in with hashed passwords and JWT tokens | `routes/auth.js`, `middleware/auth.js` |
| 4 | Added the menu API with filters (category, veg/non-veg, search) | `routes/menu.js` |
| 5 | Added orders: prices calculated on the server, status flow | `routes/orders.js`, `pricing.js` |
| 6 | Filled the database with 26 sample dishes and an admin account | `seed.js` |
| 7 | Wrote tests for the API | `server/tests/api.test.js` |
| 8 | Built the React website and the Redux store (cart + login) | `client/src/store/` |
| 9 | Built the pages: Menu, Cart, Checkout, Orders, Login, Kitchen | `client/src/pages/` |
| 10 | Design: day/night mode, red and gold theme, photos, animations | `index.css`, `components/` |

---

## 4. The backend (server folder), file by file

### Models: what the data looks like (`server/src/models/`)
A **model** is a template for documents in MongoDB, made with **Mongoose**.

- `User.js`: name, email, **passwordHash** (never the real password), role (`customer` or `admin`), phone, address.
- `MenuItem.js`: name, price, category, isVeg, photo, spice level, available or not, bestseller.
- `Order.js`: who ordered, the dishes (lines), subtotal, delivery fee, GST, total, address, phone, **status**.

Order statuses go in this order: `placed → preparing → out_for_delivery → delivered` (or `cancelled`).

> Each order **copies** the dish name and price into itself. Why? If the restaurant changes a price tomorrow,
> old orders still show what the customer actually paid.

### Login and security (`routes/auth.js`, `middleware/auth.js`)
1. **Sign up:** the password is turned into a hash with **bcrypt** before saving. Even I can't read it.
2. **Log in:** bcrypt compares the password with the hash. If it matches, the server creates a **JWT token**.
3. The browser saves the token and sends it with every request: `Authorization: Bearer <token>`.
4. `requireAuth` checks the token on protected routes. `requireAdmin` also checks that the role is `admin`.

```js
// middleware/auth.js (simplified)
const payload = jwt.verify(token, config.jwtSecret)   // is the token real and not expired?
req.user = await User.findById(payload.sub)           // who is this?
```

### Menu (`routes/menu.js`)
- `GET /api/menu`: anyone can see the menu.
- Filters come from the URL: `?veg=true` (veg only), `?veg=false` (non-veg only), `?q=paneer` (search), `?category=Biryani`.
- Adding, editing or deleting dishes needs `requireAuth` + `requireAdmin`.

### Orders: the most important part (`routes/orders.js`)
**The browser only sends WHICH dishes and HOW MANY. The server looks up the prices itself.**

```js
const dishes = await MenuItem.find({ _id: { $in: ids } })  // real prices from the database
// ...check every dish exists, is available, and qty is 1 to 20...
const order = await Order.create({ lines: orderLines, ...priceOrder(orderLines), address, phone })
```

Why? Anyone can open the browser's developer tools and change a price to ₹1. If the server trusted
the browser, people could cheat. So the server never uses prices sent from the browser.

Other rules in this file:
- Address must be filled in, and the phone must be a valid 10-digit Indian number.
- A customer can only see **their own** orders. Someone else's order returns "not found".
- A customer can cancel only while the order is still `placed`.
- Only the admin can change the status, and a delivered or cancelled order can't change any more.

### Pricing (`pricing.js`)
```js
subtotal    = sum of price × qty
deliveryFee = subtotal above ₹299 ? 0 : ₹40
gst         = 5% of subtotal (rounded)
total       = subtotal + deliveryFee + gst
```
The cart shows the same rules (`client/src/lib/pricing.js`), but the server's number is the one that counts.

### Database without installing anything (`db.js`)
If there's no `MONGODB_URI` in `.env`, the server starts a small MongoDB by itself (`mongodb-memory-server`)
and saves the data in your user folder (not inside the project, because OneDrive and similar sync apps lock database files). For going online, you paste a free **MongoDB Atlas** address into `.env`.

### Tests (`server/tests/api.test.js`)
13 tests using Node's built-in test runner and **supertest**. They check things like:
- sign up, wrong password, duplicate email
- veg and non-veg filters
- a fake price from the browser is ignored
- customers can't change order status; customers can't see other people's orders

Run them with `npm test` inside `server`.

---

## 5. The frontend (client folder), file by file

### Redux store (`client/src/store/`)
Redux holds data that many pages need, in one place.

| File | What it holds | Why |
|---|---|---|
| `cartSlice.js` | cart items and quantities | used by the menu, cart page, header badge, checkout |
| `authSlice.js` | the logged-in user and token | used everywhere to show or hide things |
| `api.js` | every server call, using **RTK Query** | gives loading, errors and caching for free |
| `store.js` | puts it all together and saves the cart and login to `localStorage` | cart survives a refresh |

```js
// cartSlice.js (simplified): a "reducer" says how the cart changes
addItem(state, { payload: dish }) {
  const line = state.items[dish._id]
  if (line) line.qty += 1          // already in the cart: add one more
  else state.items[dish._id] = { ...dish, qty: 1 }   // new dish
}
```

```js
// api.js: one line per server call; components just use the hook
getMenu: build.query({ query: ({ diet, q }) => ({ url: '/menu', params: { ... } }) })
// in Menu.jsx:
const { data, isLoading } = useGetMenuQuery({ diet, q })
```

### Pages (`client/src/pages/`)
- `Menu.jsx`: fire banner, search, **All / Veg / Non-veg** buttons, category chips, dishes grouped by category.
  Search waits 300 ms after you stop typing before asking the server (called "debounce").
- `Cart.jsx`: change quantities, see the bill.
- `Checkout.jsx`: address, phone, note, cash on delivery. Sends only dish IDs and quantities.
- `OrderDetail.jsx`: the tracking timeline. It asks the server again every 10 seconds (`pollingInterval`),
  so when the kitchen presses a button, the customer's page updates by itself.
- `Orders.jsx`: list of my orders. `Login.jsx`: one page for both log in and sign up.
- `admin/AdminOrders.jsx`: the Kitchen page, with buttons like "Start preparing" and "Send for delivery".
- `admin/AdminMenu.jsx`: change prices, mark out of stock, add or delete dishes.
- `Credits.jsx`: names the photographers of the dish photos (their licenses ask for this).

`RequireAuth.jsx` protects pages: if you're not logged in, it sends you to the login page and back afterwards.
Admin pages also check that you are an admin.

### Design (`client/src/index.css` and `components/`)
- **Tailwind CSS** for styling, using class names like `rounded-xl` and `text-sm`.
- **Day and night mode:** all colors are variables (like `--color-accent`). Night mode just swaps the values.
  `ThemeToggle.jsx` switches them and remembers your choice.
- **Fire banner** (`FireBackground.jsx`): blurred orange shapes that grow and shrink, plus small dots
  rising up. Only CSS animations, no library.
- **Burning logo:** a moving red-orange-yellow gradient inside the letters, plus a flickering glow.
- **Cooking animation** (`DishRow.jsx`): when you press ADD, the photo changes to a pan shaking over a flame
  for 1.3 seconds, then the dish pops back.
- **Veg / non-veg marks** (`VegMark.jsx`): the green dot and red triangle used on Indian food packaging.
- People who turn on "reduce motion" in their settings don't see the animations.

### Photos (`client/public/dishes/`)
Real photos from **Wikimedia Commons**, under Creative Commons licenses. `server/scripts/fetch-dish-photos.mjs`
downloaded them and wrote the photographer and license into `credits.json`, which the Photo credits page shows.

---

## 6. One order, start to finish

1. Menu page loads → RTK Query calls `GET /api/menu` → dishes appear.
2. Press **ADD** → `addItem` updates the Redux cart → header badge shows 1 → cooking animation plays.
3. Checkout → `POST /api/orders` with `{ lines: [{ item, qty }], address, phone }` and the JWT token.
4. Server checks the token, loads real prices, calculates the bill, saves the order with status `placed`.
5. Browser goes to the tracking page, which asks for the order every 10 seconds.
6. Kitchen presses **Start preparing** → `PATCH /api/orders/:id/status` → the customer's timeline moves.

---

## 7. Interview questions you might get

**Why Redux instead of just useState?**
The cart is used by many parts of the site (menu, header badge, cart page, checkout). Keeping it in one store
means every part sees the same cart without passing it through every component.

**What is RTK Query?**
Part of Redux Toolkit for calling the server. You define each call once and get hooks with loading, error,
caching, and automatic refresh (after placing an order, the orders list refreshes by itself).

**How is the password stored?**
Hashed with bcrypt. The real password is never saved.

**What is a JWT?**
A signed token the server gives after login. The browser sends it with each request, so the server knows
who you are without asking for your password again. It expires after 7 days.

**Why calculate prices on the server?**
The browser can be edited by the user, so it can't be trusted with money.

**How does live tracking work?**
Polling: the page asks the server every 10 seconds. A better version would use WebSockets (Socket.IO),
so the server can send updates instantly.

**How did you test it?**
API tests with Node's test runner and supertest, using a temporary database so real data is never touched.
I also tested the full flow in the browser: order, kitchen update, live tracking.

**What would you add next?**
Online payment (Razorpay test mode), WebSockets for instant updates, coupon codes, and putting it online
(Vercel for the website, Render for the server, MongoDB Atlas for the database).

---

## 8. Commands to remember

| What | Command |
|---|---|
| Start everything (Windows) | double-click `start-rasoi.bat` |
| Start the server | `cd server` then `npm start` |
| Start the website | `cd client` then `npm run dev` |
| Run the tests | `cd server` then `npm test` |
| Admin login | `admin@rasoi.test` / `admin12345` |
