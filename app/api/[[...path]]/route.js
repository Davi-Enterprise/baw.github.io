import { MongoClient } from 'mongodb'
import { v4 as uuidv4 } from 'uuid'
import { NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
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
      const total = totalNum.toFixed(2)
      const orderDoc = {
        id: uuidv4(), items: lineItems, amount: totalNum,
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
              breakdown: { item_total: { currency_code: 'USD', value: total } },
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
      await db.collection('orders').updateOne(
        { paypalOrderId: orderID },
        { $set: { status: status === 'COMPLETED' ? 'paid' : status, capturedAt: new Date(), captureId: capture?.id || '', payerEmail } }
      )
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
