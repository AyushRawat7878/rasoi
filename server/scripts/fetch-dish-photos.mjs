// Downloads a free photo for every sample dish from Wikipedia / Wikimedia Commons
// into client/public/dishes/, and saves who made each photo and its license in credits.json.
// Run: node scripts/fetch-dish-photos.mjs        (needs internet; only needed once)
import fs from 'node:fs'
import path from 'node:path'

const OUT = path.resolve('../client/public/dishes')
const UA = 'RasoiPortfolioProject/1.0 (student portfolio; dish photos)'

// name -> Wikipedia article (its main photo), and a Commons search used if that has no free photo.
// `file` forces one exact Commons file when the automatic pick is wrong.
const PHOTOS = [
  { name: 'Paneer Tikka', wiki: 'Paneer tikka', search: 'paneer tikka' },
  { name: 'Hara Bhara Kebab', wiki: 'Hara bhara kabab', search: 'hara bhara kabab' },
  { name: 'Chicken 65', wiki: 'Chicken 65', search: 'chicken 65' },
  { name: 'Veg Spring Roll', search: 'vegetable spring rolls' },
  { name: 'Butter Chicken', wiki: 'Butter chicken', search: 'butter chicken' },
  { name: 'Paneer Butter Masala', wiki: 'Paneer makhani', search: 'paneer butter masala' },
  { name: 'Dal Makhani', wiki: 'Dal makhani', search: 'dal makhani' },
  { name: 'Chole Masala', wiki: 'Chana masala', search: 'chole masala' },
  { name: 'Mutton Rogan Josh', wiki: 'Rogan josh', search: 'rogan josh' },
  { name: 'Hyderabadi Chicken Biryani', wiki: 'Hyderabadi biryani', search: 'hyderabadi chicken biryani' },
  { name: 'Veg Dum Biryani', search: 'vegetable biryani' },
  { name: 'Egg Biryani', search: 'egg biryani' },
  { name: 'Butter Naan', wiki: 'Naan', search: 'butter naan' },
  { name: 'Garlic Naan', search: 'garlic naan' },
  { name: 'Tandoori Roti', search: 'tandoori roti' },
  { name: 'Lachha Paratha', wiki: 'Lachha paratha', search: 'lachha paratha' },
  { name: 'Masala Dosa', wiki: 'Masala dosa', search: 'masala dosa' },
  { name: 'Idli Sambar', wiki: 'Idli', search: 'idli sambar' },
  { name: 'Medu Vada', wiki: 'Medu vada', search: 'medu vada' },
  { name: 'Gulab Jamun', wiki: 'Gulab jamun', search: 'gulab jamun' },
  { name: 'Rasmalai', wiki: 'Ras malai', search: 'rasmalai' },
  { name: 'Gajar Halwa', wiki: 'Gajar ka halwa', search: 'gajar halwa' },
  { name: 'Sweet Lassi', wiki: 'Lassi', search: 'lassi' },
  { name: 'Masala Chaas', search: 'chaas buttermilk' },
  { name: 'Masala Chai', wiki: 'Masala chai', search: 'masala chai' },
  { name: 'Fresh Lime Soda', search: 'fresh lime soda' },
]

const slug = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// fetch that waits and tries again when Wikimedia says "too many requests" (429)
async function politeFetch(url) {
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(url, { headers: { 'User-Agent': UA } })
    if (res.status !== 429 || attempt >= 4) return res
    const wait = 15000 * (attempt + 1)
    console.log(`  (busy, waiting ${wait / 1000}s)`)
    await sleep(wait)
  }
}

async function api(host, params) {
  const url = `https://${host}/w/api.php?` + new URLSearchParams({ format: 'json', formatversion: '2', ...params })
  const res = await politeFetch(url)
  if (!res.ok) throw new Error(`${res.status} from ${host}`)
  return res.json()
}

const strip = (html = '') => html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()

function toInfo(page) {
  const ii = page?.imageinfo?.[0]
  if (!ii || !/image\/(jpeg|png|webp)/.test(ii.mime || 'image/jpeg')) return null
  const meta = ii.extmetadata || {}
  return {
    file: page.title,
    thumb: ii.thumburl || ii.url,
    page: ii.descriptionurl,
    author: strip(meta.Artist?.value) || 'Unknown',
    license: strip(meta.LicenseShortName?.value) || 'See file page',
  }
}

async function commonsFile(title) {
  const data = await api('commons.wikimedia.org', {
    action: 'query', titles: title, prop: 'imageinfo', iiprop: 'url|mime|extmetadata', iiurlwidth: '480',
  })
  return toInfo(data.query?.pages?.[0])
}

async function fromWikipedia(article) {
  const data = await api('en.wikipedia.org', { action: 'query', titles: article, prop: 'pageimages', piprop: 'name', redirects: '1' })
  const name = data.query?.pages?.[0]?.pageimage
  return name ? commonsFile('File:' + name) : null // null if the photo isn't a free Commons file
}

async function fromSearch(query) {
  const data = await api('commons.wikimedia.org', {
    action: 'query', generator: 'search', gsrsearch: `${query} filetype:bitmap`, gsrnamespace: '6', gsrlimit: '8',
    prop: 'imageinfo', iiprop: 'url|mime|extmetadata', iiurlwidth: '480',
  })
  const pages = (data.query?.pages || []).sort((a, b) => a.index - b.index)
  for (const p of pages) {
    const info = toInfo(p)
    if (info) return info
  }
  return null
}

fs.mkdirSync(OUT, { recursive: true })
const creditsFile = path.join(OUT, 'credits.json')
const old = fs.existsSync(creditsFile) ? JSON.parse(fs.readFileSync(creditsFile, 'utf8')) : []
const credits = []
for (const dish of PHOTOS) {
  // Already downloaded earlier (and not forced to a different file)? Keep it.
  const had = old.find((c) => c.dish === dish.name)
  if (had && fs.existsSync(path.join(OUT, `${slug(dish.name)}.jpg`)) && (!dish.file || had.source === dish.file)) {
    credits.push(had)
    console.log(`KEPT     ${dish.name}`)
    continue
  }
  try {
    const info = (dish.file && (await commonsFile(dish.file))) || (dish.wiki && (await fromWikipedia(dish.wiki))) || (await fromSearch(dish.search))
    if (!info) {
      console.log(`MISSING  ${dish.name}`)
      continue
    }
    const res = await politeFetch(info.thumb)
    if (!res.ok) throw new Error(`download ${res.status}`)
    const file = `${slug(dish.name)}.jpg`
    fs.writeFileSync(path.join(OUT, file), Buffer.from(await res.arrayBuffer()))
    credits.push({ dish: dish.name, image: `/dishes/${file}`, source: info.file, author: info.author, license: info.license, link: info.page })
    console.log(`OK       ${dish.name}  <-  ${info.file}`)
  } catch (e) {
    console.log(`FAILED   ${dish.name}: ${e.message}`)
  }
  await sleep(2500) // be polite to Wikimedia
}
fs.writeFileSync(creditsFile, JSON.stringify(credits, null, 2))
console.log(`\nSaved ${credits.length} of ${PHOTOS.length} photos to client/public/dishes`)
