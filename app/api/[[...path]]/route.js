import { MongoClient } from 'mongodb'
import { v4 as uuidv4 } from 'uuid'
import { NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import bcrypt from 'bcryptjs'
import QRCode from 'qrcode'
import assetData from '../../lib/asset-data.json'

// Force Node.js runtime (Buffer / filesystem) rather than edge
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// MongoDB connection (cached promise to avoid parallel-request race)
let clientPromise

async function connectToMongo() {
  if (!clientPromise) {
    const c = new MongoClient(process.env.MONGO_URL)
    clientPromise = c.connect().then((cl) => cl.db(process.env.DB_NAME))
  }
  return clientPromise
}

function handleCORS(response) {
  response.headers.set('Access-Control-Allow-Origin', process.env.CORS_ORIGINS || '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  return response
}

export async function OPTIONS() {
  return handleCORS(new NextResponse(null, { status: 200 }))
}

// ---------- Imagery ----------
const IMG = {
  ringA: 'https://images.stockcake.com/public/6/f/5/6f59ac45-bb0f-4f6a-a383-2f0d5147139e_large/dramatic-wrestling-arena-stockcake.jpg',
  ringB: 'https://images.stockcake.com/public/c/d/6/cd687475-d777-4973-88e3-dd3fc9a2ec3b_large/vibrant-wrestling-event-stockcake.jpg',
  fog: 'https://images.unsplash.com/photo-1604277598647-eadc8645952c?crop=entropy&cs=srgb&fm=jpg&q=85',
  fog2: 'https://images.unsplash.com/photo-1561447920-ee278fe828a2?crop=entropy&cs=srgb&fm=jpg&q=85',
  crowd: 'https://images.unsplash.com/photo-1535119512-9e6a24a532c7?crop=entropy&cs=srgb&fm=jpg&q=85',
  w1: 'https://images.unsplash.com/photo-1618517048289-4646902edaf5?crop=entropy&cs=srgb&fm=jpg&q=85',
  w2: 'https://images.unsplash.com/photo-1610312856669-2cee66b2949c?crop=entropy&cs=srgb&fm=jpg&q=85',
  w3: 'https://images.unsplash.com/flagged/photo-1564740839423-076f586e1cee?crop=entropy&cs=srgb&fm=jpg&q=85',
  w4: 'https://images.unsplash.com/photo-1607702713064-0143212236ae?crop=entropy&cs=srgb&fm=jpg&q=85',
  w5: 'https://images.unsplash.com/photo-1710736460914-4a7f22d736c4?crop=entropy&cs=srgb&fm=jpg&q=85',
  w6: 'https://images.unsplash.com/photo-1549505415-e16dbd446231?crop=entropy&cs=srgb&fm=jpg&q=85',
  wf1: 'https://images.unsplash.com/photo-1593352216894-89108a0d2653?crop=entropy&cs=srgb&fm=jpg&q=85',
  wf2: 'https://images.unsplash.com/photo-1611816153165-fed23698666d?crop=entropy&cs=srgb&fm=jpg&q=85',
}

const PAYPAL_BASE = process.env.PAYPAL_API_BASE || 'https://api-m.sandbox.paypal.com'
const TICKET_PRICING = { 'General Admission': 20, 'First Row': 30, 'Kids': 10 }

async function getPayPalAccessToken() {
  const auth = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString('base64')
  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=client_credentials',
  })
  const data = await res.json()
  if (!res.ok) throw new Error('PayPal auth failed: ' + JSON.stringify(data))
  return data.access_token
}

function daysFromNow(d, hour = 19, min = 30) {
  const dt = new Date()
  dt.setDate(dt.getDate() + d)
  dt.setHours(hour, min, 0, 0)
  return dt.toISOString()
}

// ---------- Seed data ----------
function seedEvents() {
  return [
    {
      id: 'inaugural-show',
      title: 'INAUGURAL SHOW',
      tagline: 'Black Amethyst Begins.',
      date: '2026-11-21T19:00:00',
      time: '7:00 PM',
      doorsOpen: '6:00 PM',
      venue: 'Arena Tampico Madero',
      location: 'Houston, TX',
      address: '11620 Almeda Genoa Rd, Houston, TX 77034',
      poster: '/api/asset/inaugural-poster.png',
      banner: IMG.ringA,
      status: 'on-sale',
      featured: true,
      description: 'History begins here. Black Amethyst Wrestling launches its inaugural event live at Arena Tampico Madero in Houston, Texas. Witness the birth of a new dynasty in professional wrestling — elite competition, cinematic spectacle, and the very first chapter of the Black Amethyst legacy. This is just the beginning.',
      matches: [
        { title: 'Full Match Card', competitors: 'To Be Announced — stay tuned', type: 'Main Card' },
      ],
      parking: 'On-site and street parking available at Arena Tampico Madero.',
      vip: 'First Row seating available for $30 — the closest, most intense view of the action. Limited availability, first come first served.',
      faq: [
        { q: 'What time do doors open?', a: 'Doors open at 6:00 PM and the show begins at 7:00 PM.' },
        { q: 'How much are tickets?', a: 'First Row $30, General Admission $20, Kids $10.' },
        { q: 'Where is the venue?', a: 'Arena Tampico Madero, 11620 Almeda Genoa Rd, Houston, TX 77034.' },
        { q: 'Is it family friendly?', a: 'Absolutely! Kids tickets are available for just $10.' },
      ],
    },
    {
      id: 'death-of-winter',
      title: 'DEATH OF WINTER',
      tagline: "The Cold Won't Save You.",
      date: '2027-01-16T19:00:00',
      time: '7:00 PM',
      doorsOpen: '6:00 PM',
      venue: 'To Be Announced',
      location: 'Houston, TX',
      address: 'Houston, TX',
      poster: IMG.fog2,
      banner: IMG.fog2,
      status: 'coming-soon',
      featured: false,
      description: 'When the cold sets in, there is no escape. Death of Winter brings a chilling night of championship warfare to open 2027. Venue and ticket details coming soon.',
      matches: [],
      parking: 'Details announced closer to the event.',
      vip: 'VIP packages to be revealed.',
      faq: [],
    },
    {
      id: 'collab-show-february',
      title: 'COLLAB SHOW',
      tagline: 'Stronger Together.',
      date: '2027-02-06T19:00:00',
      time: '7:00 PM',
      doorsOpen: '6:00 PM',
      venue: 'To Be Announced',
      location: 'Houston, TX',
      address: 'Houston, TX',
      poster: IMG.crowd,
      banner: IMG.crowd,
      status: 'coming-soon',
      featured: false,
      description: 'A special collaboration event — Lucha x Black Amethyst Wrestling. Two promotions, one unforgettable night. Stronger together.',
      matches: [],
      parking: 'Details announced closer to the event.',
      vip: 'VIP packages to be revealed.',
      faq: [],
    },
    {
      id: 'may-the-force',
      title: 'MAY THE FORCE BE WITH YOU',
      tagline: 'A Galaxy Far. A Fight Close.',
      date: '2027-05-04T19:00:00',
      time: '7:00 PM',
      doorsOpen: '6:00 PM',
      venue: 'To Be Announced',
      location: 'Houston, TX',
      address: 'Houston, TX',
      poster: IMG.fog,
      banner: IMG.fog,
      status: 'coming-soon',
      featured: false,
      description: 'A themed spectacle you will not want to miss. From a galaxy far, far away to a fight up close — the Force is strong with Black Amethyst Wrestling this May.',
      matches: [],
      parking: 'Details announced closer to the event.',
      vip: 'VIP packages to be revealed.',
      faq: [],
    },
    {
      id: 'surprise-show',
      title: 'SURPRISE SHOW',
      tagline: '???',
      date: '2027-08-21T19:00:00',
      time: '7:00 PM',
      doorsOpen: '6:00 PM',
      venue: 'To Be Announced',
      location: 'Houston, TX',
      address: 'Houston, TX',
      poster: IMG.ringB,
      banner: IMG.ringB,
      status: 'coming-soon',
      featured: false,
      description: 'Some things are best kept a secret... for now. Something special is coming. Stay tuned.',
      matches: [],
      parking: 'Details announced closer to the event.',
      vip: 'VIP packages to be revealed.',
      faq: [],
    },
    {
      id: 'collab-show-september',
      title: 'COLLAB SHOW',
      tagline: 'Stronger Together.',
      date: '2027-09-18T19:00:00',
      time: '7:00 PM',
      doorsOpen: '6:00 PM',
      venue: 'To Be Announced',
      location: 'Houston, TX',
      address: 'Houston, TX',
      poster: IMG.ringA,
      banner: IMG.ringA,
      status: 'coming-soon',
      featured: false,
      description: 'The collaboration continues — Lucha x Black Amethyst Wrestling returns for another epic night to close out the season. Stronger together.',
      matches: [],
      parking: 'Details announced closer to the event.',
      vip: 'VIP packages to be revealed.',
      faq: [],
    },
  ]
}

function seedWrestlers() {
  return [
    { id: 'tj-slater', name: 'TJ SLATER', category: 'men', champion: false, image: '/api/asset/tj-slater.png', showName: false },
    { id: 'arik-walker', name: 'ARIK WALKER', category: 'men', champion: false, image: '/api/asset/arik-walker.png', showName: false },
    { id: 'dangelo-leflame', name: "D'ANGELO LE FLAME", category: 'men', champion: false, image: '/api/asset/dangelo-leflame.png', showName: false },
    { id: 'alex-rey', name: 'ALEX REY', category: 'men', champion: false, image: '/api/asset/alex-rey.png', showName: false },
    { id: 'big-haus', name: 'BIG HAUS', category: 'men', champion: false, image: '/api/asset/big-haus.jpeg', showName: false },
    { id: 'draco', name: 'DRACO', nickname: 'The Last Dragon', category: 'men', champion: false, image: '/api/asset/draco.png', showName: false },
    { id: 'james-derek', name: 'JAMES DEREK', nickname: 'Da Product', category: 'men', champion: false, image: '/api/asset/james-derek.webp', showName: false },
    { id: 'rakzo-moreno', name: 'RAKZO MORENO', category: 'men', champion: false, image: '/api/asset/rakzo-moreno.webp', showName: false },
  ]
}

function seedNews() {
  return [
    {
      id: 'inaugural-announcement',
      category: 'Announcements',
      title: 'Our Inaugural Show — November 21 in Houston',
      excerpt: "We are so excited to announce the very first Black Amethyst Wrestling show, live on November 21st at Arena Tampico Madero, 11620 Almeda Genoa Rd, Houston, TX 77034. This is the exciting beginning of a long, long story we can't wait to build together for generations to come. Our roster for this historic night features TJ Slater, Arik Walker, D'Angelo Le Flame, Alex Rey, Big Haus, DRACO, James Derek, and Rakzo Moreno. Doors open at 6:00 PM and the show starts at 7:00 PM. Tickets are First Row $30, General Admission $20, and Kids just $10. Bring your family and friends and be part of history with us. We can't wait to see everybody there — see you November 21st!",
      date: daysFromNow(-1),
      image: '/api/asset/inaugural-poster.png',
      author: 'Black Amethyst Wrestling',
    },
  ]
}

async function ensureSeed(db) {
  // Idempotent, race-safe seeding: upsert each seed doc by its unique `id`.
  const seedColl = async (coll, docs) => {
    const ops = docs.map((d) => ({ updateOne: { filter: { id: d.id }, update: { $setOnInsert: d }, upsert: true } }))
    if (ops.length) {
      try { await db.collection(coll).bulkWrite(ops, { ordered: false }) } catch (e) { /* ignore dup races */ }
    }
  }
  await seedColl('events', seedEvents())
  await seedColl('wrestlers', seedWrestlers())
  await seedColl('news', seedNews())
  await seedAssets(db)
  await migrateImagePaths(db)
}

// Self-heal stale image paths in the DB. Older seeds stored local paths like
// "/tj-slater.png" or "/inaugural-poster.png" which do not resolve in production.
// Rewrite any local (non-http, non-/api/) path to "/api/asset/<file>".
async function migrateImagePaths(db) {
  const fix = (v) => {
    if (typeof v === 'string' && v.startsWith('/') && !v.startsWith('/api/')) {
      return '/api/asset/' + v.replace(/^\/+/, '')
    }
    return v
  }
  const migrateColl = async (coll, fields) => {
    try {
      const docs = await db.collection(coll).find({}).toArray()
      const ops = []
      for (const d of docs) {
        const set = {}
        for (const f of fields) {
          const nv = fix(d[f])
          if (nv !== d[f]) set[f] = nv
        }
        if (Object.keys(set).length) {
          ops.push({ updateOne: { filter: { id: d.id }, update: { $set: set } } })
        }
      }
      if (ops.length) await db.collection(coll).bulkWrite(ops, { ordered: false })
    } catch (e) { /* non-fatal */ }
  }
  await migrateColl('wrestlers', ['image'])
  await migrateColl('events', ['poster', 'banner'])
  await migrateColl('news', ['image'])
}

// Store image bytes in MongoDB from the bundled base64 module (deployment-proof source)
async function seedAssets(db) {
  try {
    const names = Object.keys(assetData || {})
    const ops = names.map((filename) => ({
      updateOne: {
        filter: { filename },
        update: { $set: { filename, contentType: assetData[filename].contentType, data: assetData[filename].data } },
        upsert: true,
      },
    }))
    if (ops.length) await db.collection('assets').bulkWrite(ops, { ordered: false })
  } catch (e) { /* non-fatal: bundled module still serves images */ }
}

function clean(arr) {
  return arr.map(({ _id, ...rest }) => rest)
}

// ---------- Admin auth ----------
async function getSession(request, db) {
  try {
    const auth = request.headers.get('authorization') || ''
    const token = auth.replace(/^Bearer\s+/i, '').trim()
    if (!token) return null
    return await db.collection('sessions').findOne({ token })
  } catch { return null }
}

// Extract a YouTube video id from many URL formats
function extractYouTubeId(url) {
  if (!url || typeof url !== 'string') return null
  const patterns = [
    /(?:youtube\.com\/watch\?(?:.*&)?v=)([A-Za-z0-9_-]{11})/,
    /(?:youtu\.be\/)([A-Za-z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([A-Za-z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([A-Za-z0-9_-]{11})/,
    /(?:youtube\.com\/live\/)([A-Za-z0-9_-]{11})/,
  ]
  for (const re of patterns) { const m = url.match(re); if (m) return m[1] }
  if (/^[A-Za-z0-9_-]{11}$/.test(url.trim())) return url.trim()
  return null
}

// Auto-grant the event's commemorative card to a ticket buyer
async function grantEventCommemorative(db, order) {
  if (!order || !order.email || !order.eventId) return
  const email = String(order.email).toLowerCase().trim()
  const evc = await db.collection('eventcommems').findOne({ eventId: order.eventId })
  if (!evc) return
  await db.collection('items').updateOne(
    { email, eventId: order.eventId, kind: 'commemorative', orderId: order.id },
    { $set: { id: uuidv4(), email, eventId: order.eventId, kind: 'commemorative', orderId: order.id, title: evc.title || 'Commemorative', subtitle: evc.eventTitle || '', image: evc.image, createdAt: new Date() } },
    { upsert: true }
  )
}

// Compute a promo discount against ticket line items
function computePromoDiscount(promo, lineItems, subtotal) {
  if (!promo) return 0
  let d = 0
  if (promo.type === 'percent') d = subtotal * (Math.min(100, Math.max(0, promo.value)) / 100)
  else if (promo.type === 'amount') d = Math.max(0, promo.value)
  else if (promo.type === 'bogo') { for (const li of lineItems) d += Math.floor((li.qty || 0) / 2) * li.unit }
  d = Math.min(d, subtotal)
  return Math.round(d * 100) / 100
}

// ---------- Fan (user) auth ----------
async function getUserSession(request, db) {
  try {
    const auth = request.headers.get('authorization') || ''
    const token = auth.replace(/^Bearer\s+/i, '').trim()
    if (!token) return null
    return await db.collection('usersessions').findOne({ token })
  } catch { return null }
}

// Create ticket library items (with QR) for a paid order
async function issueTicketsForOrder(db, order) {
  if (!order || !order.email) return
  const email = String(order.email).toLowerCase().trim()
  if (!email) return
  for (const li of (order.items || [])) {
    for (let n = 0; n < (li.qty || 1); n++) {
      const id = uuidv4()
      const code = `BAW-${(order.id || '').slice(0, 8)}-${id.slice(0, 6)}`.toUpperCase()
      let qr = ''
      try { qr = await QRCode.toDataURL(code, { margin: 1, width: 240, color: { dark: '#0d0d0d', light: '#ffffff' } }) } catch {}
      await db.collection('items').insertOne({
        id, email, kind: 'ticket',
        title: `${li.tier} Ticket`,
        subtitle: 'Inaugural Show',
        eventId: order.eventId || 'inaugural-show',
        code, qr, image: '/api/asset/inaugural-poster.png',
        orderId: order.id, createdAt: new Date(),
      })
    }
  }
}

async function storeImageAsset(db, id, imageBase64, contentType, prefix = 'ig') {
  const ct = contentType || 'image/jpeg'
  const ext = (ct.split('/')[1] || 'jpg').replace('jpeg', 'jpg')
  const filename = `${prefix}-${id}.${ext}`
  await db.collection('assets').updateOne(
    { filename },
    { $set: { filename, contentType: ct, data: imageBase64 } },
    { upsert: true }
  )
  return `/api/asset/${filename}`
}

async function handleRoute(request, { params }) {
  const { path = [] } = await params
  const route = `/${path.join('/')}`
  const method = request.method

  try {
    // Serve static image assets via API (production may not serve /public directly).
    // Priority: bundled base64 module (always deployed with code) -> DB -> filesystem.
    if (path[0] === 'asset' && method === 'GET') {
      const name = path.slice(1).join('/').replace(/\.\.+/g, '').replace(/[^a-zA-Z0-9._-]/g, '')
      const ext = (name.split('.').pop() || '').toLowerCase()
      const types = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', gif: 'image/gif', svg: 'image/svg+xml' }
      const send = (buf, ct) => new NextResponse(buf, {
        status: 200,
        headers: {
          'Content-Type': ct || types[ext] || 'application/octet-stream',
          'Cache-Control': 'public, max-age=31536000, immutable',
          'Access-Control-Allow-Origin': '*',
        },
      })

      // 1) Bundled module (deployment-proof)
      const bundled = assetData[name]
      if (bundled && bundled.data) {
        return send(Buffer.from(bundled.data, 'base64'), bundled.contentType)
      }

      // 2) MongoDB assets collection
      try {
        const db = await connectToMongo()
        const doc = await db.collection('assets').findOne({ filename: name })
        if (doc && doc.data) {
          return send(Buffer.from(doc.data, 'base64'), doc.contentType)
        }
      } catch (e) { /* fall through */ }

      // 3) Filesystem (works in local/preview)
      try {
        const buf = await readFile(process.cwd() + '/public/' + name)
        return send(buf)
      } catch (e) {
        return handleCORS(NextResponse.json({ error: 'asset not found' }, { status: 404 }))
      }
    }

    const db = await connectToMongo()
    await ensureSeed(db)

    if ((route === '/' || route === '/root') && method === 'GET') {
      return handleCORS(NextResponse.json({ message: 'Black Amethyst Wrestling API' }))
    }

    // Force reseed (dev helper)
    if (route === '/reseed' && method === 'POST') {
      await db.collection('events').deleteMany({})
      await db.collection('wrestlers').deleteMany({})
      await db.collection('news').deleteMany({})
      await ensureSeed(db)
      return handleCORS(NextResponse.json({ message: 'reseeded' }))
    }

    // Events
    if (route === '/events' && method === 'GET') {
      const events = await db.collection('events').find({}).toArray()
      events.sort((a, b) => new Date(a.date) - new Date(b.date))
      return handleCORS(NextResponse.json(clean(events)))
    }
    if (route.startsWith('/events/') && method === 'GET') {
      const id = path[1]
      const ev = await db.collection('events').findOne({ id })
      if (!ev) return handleCORS(NextResponse.json({ error: 'Event not found' }, { status: 404 }))
      const { _id, ...rest } = ev
      return handleCORS(NextResponse.json(rest))
    }

    // Wrestlers
    if (route === '/wrestlers' && method === 'GET') {
      const ws = await db.collection('wrestlers').find({}).toArray()
      return handleCORS(NextResponse.json(clean(ws)))
    }
    if (route.startsWith('/wrestlers/') && method === 'GET') {
      const id = path[1]
      const w = await db.collection('wrestlers').findOne({ id })
      if (!w) return handleCORS(NextResponse.json({ error: 'Wrestler not found' }, { status: 404 }))
      const { _id, ...rest } = w
      return handleCORS(NextResponse.json(rest))
    }

    // News
    if (route === '/news' && method === 'GET') {
      const news = await db.collection('news').find({}).toArray()
      news.sort((a, b) => new Date(b.date) - new Date(a.date))
      return handleCORS(NextResponse.json(clean(news)))
    }

    // ---------- Instagram grid (public) ----------
    if (route === '/instagram' && method === 'GET') {
      const posts = await db.collection('igposts').find({}).toArray()
      posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      return handleCORS(NextResponse.json(clean(posts)))
    }

    // ---------- Stories (public) ----------
    if (route === '/stories' && method === 'GET') {
      const now = new Date()
      const all = await db.collection('stories').find({}).toArray()
      // Only show stories that are published (no schedule, or scheduled time has passed)
      const visible = all.filter((s) => !s.publishAt || new Date(s.publishAt) <= now)
      visible.sort((a, b) => {
        if (!!b.featured !== !!a.featured) return (b.featured ? 1 : 0) - (a.featured ? 1 : 0)
        return new Date(b.publishAt || b.createdAt) - new Date(a.publishAt || a.createdAt)
      })
      return handleCORS(NextResponse.json(clean(visible)))
    }

    // ---------- Story reactions (public): tap a flame ----------
    if (path[0] === 'stories' && path[1] && path[2] === 'react' && method === 'POST') {
      const id = path[1]
      const r = await db.collection('stories').findOneAndUpdate(
        { id },
        { $inc: { reactions: 1 } },
        { returnDocument: 'after' }
      )
      const doc = r && (r.value || r)
      if (!doc || (doc && doc.value === null)) {
        const exists = await db.collection('stories').findOne({ id })
        if (!exists) return handleCORS(NextResponse.json({ error: 'Story not found' }, { status: 404 }))
        return handleCORS(NextResponse.json({ reactions: exists.reactions || 1 }))
      }
      return handleCORS(NextResponse.json({ reactions: (doc.reactions != null ? doc.reactions : 1) }))
    }

    // ---------- Promo code validate (public) ----------
    if (route === '/promo/validate' && method === 'POST') {
      const body = await request.json()
      const code = String(body.code || '').toUpperCase().trim()
      if (!code) return handleCORS(NextResponse.json({ valid: false, error: 'Enter a code' }))
      const promo = await db.collection('promocodes').findOne({ code })
      if (!promo || !promo.active) return handleCORS(NextResponse.json({ valid: false, error: 'Invalid or inactive code' }))
      if (promo.maxUses && promo.uses >= promo.maxUses) return handleCORS(NextResponse.json({ valid: false, error: 'This code has reached its usage limit' }))
      const lineItems = []
      for (const it of (body.items || [])) {
        const unit = TICKET_PRICING[it.tier]
        if (unit) lineItems.push({ tier: it.tier, qty: Math.max(1, parseInt(it.qty) || 1), unit })
      }
      const subtotal = lineItems.reduce((s, i) => s + i.unit * i.qty, 0)
      const discount = computePromoDiscount(promo, lineItems, subtotal)
      let label = ''
      if (promo.type === 'percent') label = `${promo.value}% off`
      else if (promo.type === 'amount') label = `$${Number(promo.value).toFixed(2)} off`
      else label = 'Buy One Get One Free'
      return handleCORS(NextResponse.json({ valid: true, type: promo.type, value: promo.value, label, discount, subtotal, total: Math.max(0, Math.round((subtotal - discount) * 100) / 100) }))
    }

    // ---------- Media / YouTube videos (public) ----------
    if (route === '/media' && method === 'GET') {
      const vids = await db.collection('media').find({}).toArray()
      vids.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      return handleCORS(NextResponse.json(clean(vids)))
    }

    // ---------- Locked media catalog (public, sanitized) ----------
    if (route === '/locked-media' && method === 'GET') {
      const list = await db.collection('lockedmedia').find({}).toArray()
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      const safe = list.map((m) => ({ id: m.id, kind: m.kind, title: m.title, price: m.price, previewImage: m.previewImage, createdAt: m.createdAt }))
      return handleCORS(NextResponse.json(safe))
    }

    // ---------- Fan auth: register ----------
    if (route === '/auth/register' && method === 'POST') {
      const body = await request.json()
      const email = String(body.email || '').toLowerCase().trim()
      const password = String(body.password || '')
      if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return handleCORS(NextResponse.json({ error: 'Please enter a valid email' }, { status: 400 }))
      if (password.length < 6) return handleCORS(NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 }))
      const existing = await db.collection('users').findOne({ email })
      if (existing) return handleCORS(NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 }))
      const passwordHash = await bcrypt.hash(password, 10)
      const user = { id: uuidv4(), email, name: String(body.name || '').slice(0, 80), passwordHash, createdAt: new Date() }
      await db.collection('users').insertOne(user)
      const token = uuidv4() + '-' + uuidv4()
      await db.collection('usersessions').insertOne({ token, userId: user.id, email, createdAt: new Date() })
      return handleCORS(NextResponse.json({ token, user: { email, name: user.name } }))
    }

    // ---------- Fan auth: login ----------
    if (route === '/auth/login' && method === 'POST') {
      const body = await request.json()
      const email = String(body.email || '').toLowerCase().trim()
      const password = String(body.password || '')
      const user = await db.collection('users').findOne({ email })
      if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
        return handleCORS(NextResponse.json({ error: 'Incorrect email or password' }, { status: 401 }))
      }
      const token = uuidv4() + '-' + uuidv4()
      await db.collection('usersessions').insertOne({ token, userId: user.id, email, createdAt: new Date() })
      return handleCORS(NextResponse.json({ token, user: { email, name: user.name } }))
    }

    // ---------- Fan auth: me ----------
    if (route === '/auth/me' && method === 'GET') {
      const s = await getUserSession(request, db)
      if (!s) return handleCORS(NextResponse.json({ authenticated: false }))
      const user = await db.collection('users').findOne({ email: s.email })
      return handleCORS(NextResponse.json({ authenticated: true, user: user ? { email: user.email, name: user.name } : { email: s.email } }))
    }

    // ---------- Fan auth: logout ----------
    if (route === '/auth/logout' && method === 'POST') {
      const auth = request.headers.get('authorization') || ''
      const token = auth.replace(/^Bearer\s+/i, '').trim()
      if (token) await db.collection('usersessions').deleteOne({ token })
      return handleCORS(NextResponse.json({ ok: true }))
    }

    // ---------- Fan: My Account library (items + unlocked media) ----------
    if (route === '/me/library' && method === 'GET') {
      const s = await getUserSession(request, db)
      if (!s) return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
      const email = s.email
      const items = await db.collection('items').find({ email }).toArray()
      items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      const ents = await db.collection('entitlements').find({ email }).toArray()
      const mediaIds = ents.map((e) => e.mediaId)
      const medias = mediaIds.length ? await db.collection('lockedmedia').find({ id: { $in: mediaIds } }).toArray() : []
      const unlocked = medias.map((m) => ({
        id: m.id, kind: m.kind, title: m.title,
        image: m.previewImage,
        videoId: m.kind === 'video' ? m.videoId : undefined,
        fileUrl: m.kind === 'photo' ? `/api/me/unlocked/${m.id}/file` : undefined,
      }))
      return handleCORS(NextResponse.json({ items: clean(items), unlocked }))
    }

    // ---------- Fan: gated full photo download (entitlement required) ----------
    if (path[0] === 'me' && path[1] === 'unlocked' && path[2] && path[3] === 'file' && method === 'GET') {
      const s = await getUserSession(request, db)
      if (!s) return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
      const mediaId = path[2]
      const ent = await db.collection('entitlements').findOne({ email: s.email, mediaId })
      if (!ent) return handleCORS(NextResponse.json({ error: 'Not unlocked' }, { status: 403 }))
      const full = await db.collection('lockedassets').findOne({ mediaId })
      if (!full) return handleCORS(NextResponse.json({ error: 'File not found' }, { status: 404 }))
      const media = await db.collection('lockedmedia').findOne({ id: mediaId })
      const fname = `${(media?.title || 'baw-photo').replace(/[^a-zA-Z0-9._-]/g, '-')}.jpg`
      return new NextResponse(Buffer.from(full.data, 'base64'), {
        status: 200,
        headers: {
          'Content-Type': full.contentType || 'image/jpeg',
          'Content-Disposition': `attachment; filename="${fname}"`,
          'Access-Control-Allow-Origin': '*',
        },
      })
    }

    // ---------- Admin: login ----------
    if (route === '/admin/login' && method === 'POST') {
      const body = await request.json()
      if (!process.env.ADMIN_PASSWORD) {
        return handleCORS(NextResponse.json({ error: 'Admin not configured' }, { status: 500 }))
      }
      if (!body.password || body.password !== process.env.ADMIN_PASSWORD) {
        return handleCORS(NextResponse.json({ error: 'Incorrect password' }, { status: 401 }))
      }
      const token = uuidv4() + '-' + uuidv4()
      await db.collection('sessions').insertOne({ token, createdAt: new Date() })
      return handleCORS(NextResponse.json({ token }))
    }

    // ---------- Admin: verify session ----------
    if (route === '/admin/me' && method === 'GET') {
      const s = await getSession(request, db)
      return handleCORS(NextResponse.json({ authenticated: !!s }))
    }

    // ---------- Admin: logout ----------
    if (route === '/admin/logout' && method === 'POST') {
      const auth = request.headers.get('authorization') || ''
      const token = auth.replace(/^Bearer\s+/i, '').trim()
      if (token) await db.collection('sessions').deleteOne({ token })
      return handleCORS(NextResponse.json({ ok: true }))
    }

    // All /admin/* routes below require a valid session
    if (path[0] === 'admin') {
      const session = await getSession(request, db)
      if (!session) return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))

      // Create Instagram post
      if (route === '/admin/instagram' && method === 'POST') {
        const body = await request.json()
        const id = uuidv4()
        let image = ''
        if (body.imageBase64) {
          image = await storeImageAsset(db, id, body.imageBase64, body.contentType)
        } else if (body.imageUrl) {
          image = body.imageUrl
        }
        if (!image) return handleCORS(NextResponse.json({ error: 'An image is required' }, { status: 400 }))
        const doc = { id, link: body.link || '', caption: body.caption || '', image, createdAt: new Date() }
        await db.collection('igposts').insertOne(doc)
        const { _id, ...rest } = doc
        return handleCORS(NextResponse.json(rest))
      }

      // Create a Story directly (no Instagram post needed)
      if (route === '/admin/stories' && method === 'POST') {
        const body = await request.json()
        const id = uuidv4()
        let image = ''
        if (body.imageBase64) {
          image = await storeImageAsset(db, id, body.imageBase64, body.contentType, 'st')
        } else if (body.imageUrl) {
          image = body.imageUrl
        }
        if (!image) return handleCORS(NextResponse.json({ error: 'An image is required' }, { status: 400 }))
        const caption = body.caption || ''
        const title = (body.title || caption.split('\n')[0] || 'Story').slice(0, 90)
        let publishAt = null
        if (body.publishAt) {
          const d = new Date(body.publishAt)
          if (!isNaN(d.getTime())) publishAt = d
        }
        const doc = { id, title, caption, image, link: body.link || '', featured: !!body.featured, publishAt, reactions: 0, createdAt: new Date() }
        await db.collection('stories').insertOne(doc)
        // Optionally also publish as a News article (only if not scheduled for the future)
        if (body.asNews && (!publishAt || publishAt <= new Date())) {
          await db.collection('news').insertOne({
            id: uuidv4(), category: 'Instagram', title,
            excerpt: caption.slice(0, 200), content: caption,
            date: new Date().toISOString(), image, author: 'Black Amethyst Wrestling', link: body.link || '',
          })
        }
        const { _id, ...rest } = doc
        return handleCORS(NextResponse.json(rest))
      }

      // Promote an Instagram post -> News article and/or Story
      if (path[1] === 'instagram' && path[3] === 'promote' && method === 'POST') {
        const igId = path[2]
        const post = await db.collection('igposts').findOne({ id: igId })
        if (!post) return handleCORS(NextResponse.json({ error: 'Post not found' }, { status: 404 }))
        const body = await request.json().catch(() => ({}))
        const asNews = body.asNews !== false
        const asStory = body.asStory !== false
        const result = {}
        const caption = post.caption || ''
        const firstLine = (caption.split('\n')[0] || 'From Instagram').slice(0, 90)
        if (asStory) {
          const sid = uuidv4()
          await db.collection('stories').insertOne({ id: sid, title: firstLine, image: post.image, caption, link: post.link || '', featured: false, publishAt: null, reactions: 0, createdAt: new Date() })
          result.storyId = sid
        }
        if (asNews) {
          const nid = uuidv4()
          await db.collection('news').insertOne({
            id: nid, category: 'Instagram', title: firstLine,
            excerpt: caption.slice(0, 200), content: caption,
            date: new Date().toISOString(), image: post.image, author: 'Black Amethyst Wrestling',
            link: post.link || '',
          })
          result.newsId = nid
        }
        await db.collection('igposts').updateOne({ id: igId }, { $set: { promoted: true } })
        return handleCORS(NextResponse.json({ ok: true, ...result }))
      }

      // Delete Instagram post
      if (path[1] === 'instagram' && path[2] && !path[3] && method === 'DELETE') {
        const igId = path[2]
        const post = await db.collection('igposts').findOne({ id: igId })
        await db.collection('igposts').deleteOne({ id: igId })
        if (post?.image?.startsWith('/api/asset/')) {
          const fn = post.image.replace('/api/asset/', '')
          if (fn.startsWith('ig-')) await db.collection('assets').deleteOne({ filename: fn })
        }
        return handleCORS(NextResponse.json({ ok: true }))
      }

      // Admin: list ALL stories (including scheduled/future) for the dashboard
      if (route === '/admin/stories' && method === 'GET') {
        const all = await db.collection('stories').find({}).toArray()
        const now = new Date()
        all.sort((a, b) => {
          if (!!b.featured !== !!a.featured) return (b.featured ? 1 : 0) - (a.featured ? 1 : 0)
          return new Date(b.publishAt || b.createdAt) - new Date(a.publishAt || a.createdAt)
        })
        const withState = all.map(({ _id, ...s }) => ({
          ...s,
          scheduled: !!(s.publishAt && new Date(s.publishAt) > now),
        }))
        return handleCORS(NextResponse.json(withState))
      }

      // Admin: pin/unpin a story (feature)
      if (path[1] === 'stories' && path[2] && path[3] === 'feature' && method === 'POST') {
        const body = await request.json().catch(() => ({}))
        await db.collection('stories').updateOne({ id: path[2] }, { $set: { featured: !!body.featured } })
        return handleCORS(NextResponse.json({ ok: true, featured: !!body.featured }))
      }

      // Add a Media / YouTube video
      if (route === '/admin/media' && method === 'POST') {
        const body = await request.json()
        const vid = extractYouTubeId(body.youtubeUrl)
        if (!vid) return handleCORS(NextResponse.json({ error: 'Please enter a valid YouTube link' }, { status: 400 }))
        const id = uuidv4()
        const doc = {
          id,
          title: (body.title || '').slice(0, 120) || 'Untitled',
          youtubeUrl: body.youtubeUrl,
          videoId: vid,
          thumbnail: `https://img.youtube.com/vi/${vid}/hqdefault.jpg`,
          createdAt: new Date(),
        }
        await db.collection('media').insertOne(doc)
        const { _id, ...rest } = doc
        return handleCORS(NextResponse.json(rest))
      }

      // Delete a Media video
      if (path[1] === 'media' && path[2] && method === 'DELETE') {
        await db.collection('media').deleteOne({ id: path[2] })
        return handleCORS(NextResponse.json({ ok: true }))
      }

      // Assign a library item (commemorative card / other item) to a fan by email
      if (route === '/admin/items' && method === 'POST') {
        const body = await request.json()
        const email = String(body.email || '').toLowerCase().trim()
        if (!email) return handleCORS(NextResponse.json({ error: 'Fan email is required' }, { status: 400 }))
        const id = uuidv4()
        let image = ''
        if (body.imageBase64) image = await storeImageAsset(db, id, body.imageBase64, body.contentType, 'item')
        else if (body.imageUrl) image = body.imageUrl
        const doc = {
          id, email, kind: body.kind === 'item' ? 'item' : 'commemorative',
          title: (body.title || 'Commemorative').slice(0, 120),
          subtitle: (body.subtitle || '').slice(0, 120),
          image, createdAt: new Date(),
        }
        await db.collection('items').insertOne(doc)
        const { _id, ...rest } = doc
        return handleCORS(NextResponse.json(rest))
      }

      // Admin: list library items (optional ?email= filter)
      if (route === '/admin/items' && method === 'GET') {
        const em = (new URL(request.url).searchParams.get('email') || '').toLowerCase().trim()
        const q = em ? { email: em } : {}
        const list = await db.collection('items').find(q).toArray()
        list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        return handleCORS(NextResponse.json(clean(list)))
      }

      // Admin: delete a library item
      if (path[1] === 'items' && path[2] && method === 'DELETE') {
        const it = await db.collection('items').findOne({ id: path[2] })
        await db.collection('items').deleteOne({ id: path[2] })
        if (it?.image?.startsWith('/api/asset/item-')) {
          await db.collection('assets').deleteOne({ filename: it.image.replace('/api/asset/', '') })
        }
        return handleCORS(NextResponse.json({ ok: true }))
      }

      // Admin: set an event's commemorative card (auto-granted to ticket buyers)
      if (route === '/admin/event-commemorative' && method === 'POST') {
        const body = await request.json()
        const eventId = String(body.eventId || '').trim()
        if (!eventId) return handleCORS(NextResponse.json({ error: 'Choose an event' }, { status: 400 }))
        const ev = await db.collection('events').findOne({ id: eventId })
        let image = ''
        if (body.imageBase64) image = await storeImageAsset(db, eventId, body.imageBase64, body.contentType, 'evc')
        else {
          const cur = await db.collection('eventcommems').findOne({ eventId })
          image = cur?.image || ''
        }
        if (!image) return handleCORS(NextResponse.json({ error: 'Upload a card image' }, { status: 400 }))
        const doc = { eventId, eventTitle: ev?.title || '', title: (body.title || 'Commemorative Ticket').slice(0, 120), image, updatedAt: new Date() }
        await db.collection('eventcommems').updateOne({ eventId }, { $set: doc }, { upsert: true })
        return handleCORS(NextResponse.json(doc))
      }

      // Admin: list event commemoratives
      if (route === '/admin/event-commemoratives' && method === 'GET') {
        const list = await db.collection('eventcommems').find({}).toArray()
        return handleCORS(NextResponse.json(clean(list)))
      }

      // Admin: delete an event commemorative
      if (path[1] === 'event-commemoratives' && path[2] && method === 'DELETE') {
        const evc = await db.collection('eventcommems').findOne({ eventId: path[2] })
        await db.collection('eventcommems').deleteOne({ eventId: path[2] })
        if (evc?.image?.startsWith('/api/asset/evc-')) await db.collection('assets').deleteOne({ filename: evc.image.replace('/api/asset/', '') })
        return handleCORS(NextResponse.json({ ok: true }))
      }

      // Admin: create locked (pay-to-unlock) media
      if (route === '/admin/locked-media' && method === 'POST') {
        const body = await request.json()
        const kind = body.kind === 'video' ? 'video' : 'photo'
        const price = Math.max(0, parseFloat(body.price) || 0)
        if (!price) return handleCORS(NextResponse.json({ error: 'Please set a price greater than 0' }, { status: 400 }))
        const id = uuidv4()
        let previewImage = ''
        let videoId = null
        if (body.previewBase64) previewImage = await storeImageAsset(db, id, body.previewBase64, body.previewContentType || 'image/jpeg', 'lm')
        if (kind === 'video') {
          videoId = extractYouTubeId(body.youtubeUrl)
          if (!videoId) return handleCORS(NextResponse.json({ error: 'Please enter a valid YouTube link' }, { status: 400 }))
          if (!previewImage) previewImage = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
        } else {
          if (!body.fullBase64) return handleCORS(NextResponse.json({ error: 'Please upload the photo to lock' }, { status: 400 }))
          await db.collection('lockedassets').updateOne(
            { mediaId: id },
            { $set: { mediaId: id, contentType: body.fullContentType || 'image/jpeg', data: body.fullBase64 } },
            { upsert: true }
          )
          if (!previewImage) previewImage = await storeImageAsset(db, id, body.fullBase64, body.fullContentType || 'image/jpeg', 'lm')
        }
        const doc = { id, kind, title: (body.title || 'Exclusive').slice(0, 120), price, previewImage, videoId, createdAt: new Date() }
        await db.collection('lockedmedia').insertOne(doc)
        const { _id, ...rest } = doc
        return handleCORS(NextResponse.json(rest))
      }

      // Admin: list locked media (full)
      if (route === '/admin/locked-media' && method === 'GET') {
        const list = await db.collection('lockedmedia').find({}).toArray()
        list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        return handleCORS(NextResponse.json(clean(list)))
      }

      // Admin: delete locked media
      if (path[1] === 'locked-media' && path[2] && method === 'DELETE') {
        const id = path[2]
        const m = await db.collection('lockedmedia').findOne({ id })
        await db.collection('lockedmedia').deleteOne({ id })
        await db.collection('lockedassets').deleteOne({ mediaId: id })
        await db.collection('entitlements').deleteMany({ mediaId: id })
        if (m?.previewImage?.startsWith('/api/asset/lm-')) {
          await db.collection('assets').deleteOne({ filename: m.previewImage.replace('/api/asset/', '') })
        }
        return handleCORS(NextResponse.json({ ok: true }))
      }

      // Admin: create a promo code
      if (route === '/admin/promos' && method === 'POST') {
        const body = await request.json()
        const code = String(body.code || '').toUpperCase().trim().replace(/\s+/g, '')
        if (!code) return handleCORS(NextResponse.json({ error: 'Enter a code' }, { status: 400 }))
        const type = ['percent', 'amount', 'bogo'].includes(body.type) ? body.type : 'percent'
        let value = parseFloat(body.value) || 0
        if (type === 'percent') value = Math.min(100, Math.max(0, value))
        if (type !== 'bogo' && value <= 0) return handleCORS(NextResponse.json({ error: 'Enter a discount value greater than 0' }, { status: 400 }))
        const existing = await db.collection('promocodes').findOne({ code })
        if (existing) return handleCORS(NextResponse.json({ error: 'That code already exists' }, { status: 409 }))
        const maxUses = Math.max(0, parseInt(body.maxUses) || 0) // 0 = unlimited
        const doc = { id: uuidv4(), code, type, value, maxUses, uses: 0, active: true, createdAt: new Date() }
        await db.collection('promocodes').insertOne(doc)
        const { _id, ...rest } = doc
        return handleCORS(NextResponse.json(rest))
      }

      // Admin: list promo codes
      if (route === '/admin/promos' && method === 'GET') {
        const list = await db.collection('promocodes').find({}).toArray()
        list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        return handleCORS(NextResponse.json(clean(list)))
      }

      // Admin: toggle a promo code active/inactive
      if (path[1] === 'promos' && path[2] && path[3] === 'toggle' && method === 'POST') {
        const p = await db.collection('promocodes').findOne({ id: path[2] })
        if (p) await db.collection('promocodes').updateOne({ id: path[2] }, { $set: { active: !p.active } })
        return handleCORS(NextResponse.json({ ok: true, active: p ? !p.active : false }))
      }

      // Admin: delete a promo code
      if (path[1] === 'promos' && path[2] && method === 'DELETE') {
        await db.collection('promocodes').deleteOne({ id: path[2] })
        return handleCORS(NextResponse.json({ ok: true }))
      }

      // Admin: get/set settings (ticket limit per order)
      if (route === '/admin/settings' && method === 'GET') {
        const s = await db.collection('settings').findOne({ key: 'ticketLimitPerOrder' })
        return handleCORS(NextResponse.json({ ticketLimitPerOrder: s && s.value ? parseInt(s.value) : 0 }))
      }
      if (route === '/admin/settings' && method === 'POST') {
        const body = await request.json()
        const value = Math.max(0, parseInt(body.ticketLimitPerOrder) || 0)
        await db.collection('settings').updateOne({ key: 'ticketLimitPerOrder' }, { $set: { key: 'ticketLimitPerOrder', value } }, { upsert: true })
        return handleCORS(NextResponse.json({ ticketLimitPerOrder: value }))
      }

      // Delete Story
      if (path[1] === 'stories' && path[2] && method === 'DELETE') {
        const story = await db.collection('stories').findOne({ id: path[2] })
        await db.collection('stories').deleteOne({ id: path[2] })
        if (story?.image?.startsWith('/api/asset/')) {
          const fn = story.image.replace('/api/asset/', '')
          if (fn.startsWith('st-')) await db.collection('assets').deleteOne({ filename: fn })
        }
        return handleCORS(NextResponse.json({ ok: true }))
      }

      // Delete News article
      if (path[1] === 'news' && path[2] && method === 'DELETE') {
        await db.collection('news').deleteOne({ id: path[2] })
        return handleCORS(NextResponse.json({ ok: true }))
      }

      return handleCORS(NextResponse.json({ error: `Admin route ${route} not found` }, { status: 404 }))
    }

    // Newsletter signup
    if (route === '/newsletter' && method === 'POST') {
      const body = await request.json()
      if (!body.email) return handleCORS(NextResponse.json({ error: 'email is required' }, { status: 400 }))
      const doc = { id: uuidv4(), email: body.email, createdAt: new Date() }
      await db.collection('newsletter').insertOne(doc)
      return handleCORS(NextResponse.json({ message: 'Subscribed', id: doc.id }))
    }

    // Contact form
    if (route === '/contact' && method === 'POST') {
      const body = await request.json()
      if (!body.name || !body.email || !body.message) {
        return handleCORS(NextResponse.json({ error: 'name, email and message are required' }, { status: 400 }))
      }
      const doc = {
        id: uuidv4(),
        name: body.name, email: body.email, phone: body.phone || '',
        subject: body.subject || 'General', message: body.message,
        createdAt: new Date(),
      }
      await db.collection('contacts').insertOne(doc)
      return handleCORS(NextResponse.json({ message: 'Message received', id: doc.id }))
    }

    // PayPal: create order
    if (route === '/paypal/create-order' && method === 'POST') {
      const body = await request.json()

      // Purpose: unlock a locked media item (pay-to-unlock)
      if (body.purpose === 'unlock' && body.mediaId) {
        const media = await db.collection('lockedmedia').findOne({ id: body.mediaId })
        if (!media) return handleCORS(NextResponse.json({ error: 'Item not found' }, { status: 404 }))
        const email = String(body.email || '').toLowerCase().trim()
        if (!email) return handleCORS(NextResponse.json({ error: 'Please log in first' }, { status: 400 }))
        const value = Number(media.price).toFixed(2)
        const orderDoc = { id: uuidv4(), purpose: 'unlock', mediaId: media.id, mediaTitle: media.title, amount: media.price, email, status: 'pending', createdAt: new Date() }
        const token = await getPayPalAccessToken()
        const res = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            intent: 'CAPTURE',
            purchase_units: [{
              custom_id: orderDoc.id,
              description: `BAW Unlock: ${media.title}`.slice(0, 127),
              amount: { currency_code: 'USD', value },
            }],
            application_context: { brand_name: 'Black Amethyst Wrestling', shipping_preference: 'NO_SHIPPING', user_action: 'PAY_NOW' },
          }),
        })
        const data = await res.json()
        if (!res.ok) return handleCORS(NextResponse.json({ error: 'PayPal order failed', details: data }, { status: 502 }))
        orderDoc.paypalOrderId = data.id
        await db.collection('orders').insertOne(orderDoc)
        return handleCORS(NextResponse.json({ orderID: data.id }))
      }

      const rawItems = Array.isArray(body.items) && body.items.length
        ? body.items
        : (body.tier ? [{ tier: body.tier, qty: body.qty }] : [])
      const lineItems = []
      for (const it of rawItems) {
        const unit = TICKET_PRICING[it.tier]
        if (!unit) return handleCORS(NextResponse.json({ error: `Invalid ticket tier: ${it.tier}` }, { status: 400 }))
        const q = Math.max(1, Math.min(20, parseInt(it.qty) || 1))
        lineItems.push({ tier: it.tier, qty: q, unit, amount: unit * q })
      }
      if (!lineItems.length) return handleCORS(NextResponse.json({ error: 'Cart is empty' }, { status: 400 }))
      const totalNum = lineItems.reduce((s, i) => s + i.amount, 0)

      // Enforce ticket limit per order (0 = unlimited)
      const limitSetting = await db.collection('settings').findOne({ key: 'ticketLimitPerOrder' })
      const ticketLimit = limitSetting && limitSetting.value ? parseInt(limitSetting.value) : 0
      const totalQty = lineItems.reduce((s, i) => s + i.qty, 0)
      if (ticketLimit > 0 && totalQty > ticketLimit) {
        return handleCORS(NextResponse.json({ error: `You can buy at most ${ticketLimit} tickets per order for this show.` }, { status: 400 }))
      }

      // Apply promo code (if provided)
      let promo = null, discount = 0, promoCode = ''
      if (body.promoCode) {
        promoCode = String(body.promoCode).toUpperCase().trim()
        promo = await db.collection('promocodes').findOne({ code: promoCode })
        if (!promo || !promo.active) return handleCORS(NextResponse.json({ error: 'Invalid or inactive promo code' }, { status: 400 }))
        if (promo.maxUses && promo.uses >= promo.maxUses) return handleCORS(NextResponse.json({ error: 'This promo code has reached its usage limit' }, { status: 400 }))
        discount = computePromoDiscount(promo, lineItems, totalNum)
      }
      let finalNum = Math.max(0, Math.round((totalNum - discount) * 100) / 100)
      if (finalNum < 0.5) finalNum = 0.5 // PayPal requires a positive amount
      const total = finalNum.toFixed(2)
      const orderDoc = {
        id: uuidv4(), items: lineItems, subtotal: totalNum, discount, amount: finalNum,
        promoCode: promoCode || null,
        email: body.email || '', eventId: body.eventId || 'inaugural-show',
        status: 'pending', createdAt: new Date(),
      }
      const token = await getPayPalAccessToken()
      const res = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intent: 'CAPTURE',
          purchase_units: [{
            custom_id: orderDoc.id,
            description: `BAW Inaugural Show Tickets`.slice(0, 127),
            amount: {
              currency_code: 'USD',
              value: total,
              breakdown: {
                item_total: { currency_code: 'USD', value: totalNum.toFixed(2) },
                ...(discount > 0 ? { discount: { currency_code: 'USD', value: Math.min(discount, totalNum).toFixed(2) } } : {}),
              },
            },
            items: lineItems.map((i) => ({
              name: `${i.tier} Ticket`.slice(0, 127),
              quantity: String(i.qty),
              unit_amount: { currency_code: 'USD', value: i.unit.toFixed(2) },
            })),
          }],
          application_context: { brand_name: 'Black Amethyst Wrestling', shipping_preference: 'NO_SHIPPING', user_action: 'PAY_NOW' },
        }),
      })
      const data = await res.json()
      if (!res.ok) return handleCORS(NextResponse.json({ error: 'PayPal order failed', details: data }, { status: 502 }))
      orderDoc.paypalOrderId = data.id
      await db.collection('orders').insertOne(orderDoc)
      return handleCORS(NextResponse.json({ orderID: data.id }))
    }

    // PayPal: capture order
    if (route === '/paypal/capture-order' && method === 'POST') {
      const body = await request.json()
      const orderID = body.orderID
      if (!orderID) return handleCORS(NextResponse.json({ error: 'orderID required' }, { status: 400 }))
      const token = await getPayPalAccessToken()
      const res = await fetch(`${PAYPAL_BASE}/v2/checkout/orders/${orderID}/capture`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      })
      const data = await res.json()
      if (!res.ok) return handleCORS(NextResponse.json({ error: 'Capture failed', details: data }, { status: 502 }))
      const status = data.status
      const capture = data?.purchase_units?.[0]?.payments?.captures?.[0]
      const payerEmail = data?.payer?.email_address || ''
      const order = await db.collection('orders').findOne({ paypalOrderId: orderID })
      const alreadyPaid = order && order.status === 'paid'
      await db.collection('orders').updateOne(
        { paypalOrderId: orderID },
        { $set: { status: status === 'COMPLETED' ? 'paid' : status, capturedAt: new Date(), captureId: capture?.id || '', payerEmail } }
      )
      // Fulfillment on first successful capture only
      if (status === 'COMPLETED' && order && !alreadyPaid) {
        try {
          if (order.purpose === 'unlock') {
            const email = (order.email || payerEmail || '').toLowerCase().trim()
            if (email && order.mediaId) {
              await db.collection('entitlements').updateOne(
                { email, mediaId: order.mediaId },
                { $set: { id: uuidv4(), email, mediaId: order.mediaId, title: order.mediaTitle || '', createdAt: new Date() } },
                { upsert: true }
              )
            }
          } else {
            const ord = { ...order, email: (order.email || payerEmail) }
            await issueTicketsForOrder(db, ord)
            await grantEventCommemorative(db, ord)
            if (order.promoCode) {
              await db.collection('promocodes').updateOne({ code: order.promoCode }, { $inc: { uses: 1 } })
            }
          }
        } catch (e) { console.error('fulfillment error', e) }
      }
      return handleCORS(NextResponse.json({ status, orderID, captureId: capture?.id || '' }))
    }

    return handleCORS(NextResponse.json({ error: `Route ${route} not found` }, { status: 404 }))
  } catch (error) {
    console.error('API Error:', error)
    return handleCORS(NextResponse.json({ error: 'Internal server error' }, { status: 500 }))
  }
}

export const GET = handleRoute
export const POST = handleRoute
export const PUT = handleRoute
export const DELETE = handleRoute
export const PATCH = handleRoute
