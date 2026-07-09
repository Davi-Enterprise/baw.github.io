import { MongoClient } from 'mongodb'
import { v4 as uuidv4 } from 'uuid'
import { NextResponse } from 'next/server'

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
      poster: '/inaugural-poster.png',
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
    {
      id: 'obsidian-king', name: 'KANE VOSS', nickname: 'The Obsidian King', category: 'men',
      champion: true, championship: 'World Heavyweight Champion', image: IMG.w1,
      height: '6\'5"', weight: '265 lbs', hometown: 'Detroit, Michigan', debut: '2016',
      finisher: 'The Amethyst Crush', signatures: ['Obsidian Bomb', 'King\'s Decree', 'Shadow Lariat'],
      bio: 'A monolith of raw power and cold precision, Kane Voss rules the ring with an iron will. Undefeated in championship defenses for over 400 days, the Obsidian King is the standard by which all others are measured.',
      social: { twitter: '#', instagram: '#' },
    },
    {
      id: 'midnight-cole', name: 'MARCUS COLE', nickname: 'Midnight', category: 'men',
      champion: false, championship: '', image: IMG.w2,
      height: '6\'1"', weight: '225 lbs', hometown: 'New Orleans, Louisiana', debut: '2018',
      finisher: 'The Witching Hour', signatures: ['Midnight Express', 'Eclipse DDT'],
      bio: 'Charismatic, calculated, and dangerous after dark. Marcus Cole thrives when the stakes are highest, earning a reputation as the man who never blinks.',
      social: { twitter: '#', instagram: '#' },
    },
    {
      id: 'nightshade', name: 'AISHA BENNETT', nickname: 'Nightshade', category: 'women',
      champion: true, championship: 'Women\'s Champion', image: IMG.wf1,
      height: '5\'9"', weight: '145 lbs', hometown: 'Atlanta, Georgia', debut: '2017',
      finisher: 'Venom Strike', signatures: ['Poison Kick', 'Nightfall Suplex'],
      bio: 'Lethal, poised, and utterly unpredictable. Nightshade has redefined what it means to be a champion, blending striking artistry with ruthless efficiency.',
      social: { twitter: '#', instagram: '#' },
    },
    {
      id: 'violet-storm', name: 'VERA KANE', nickname: 'Violet Storm', category: 'women',
      champion: false, championship: '', image: IMG.wf2,
      height: '5\'7"', weight: '138 lbs', hometown: 'Seattle, Washington', debut: '2019',
      finisher: 'Storm Surge', signatures: ['Thunderclap', 'Violet Twister'],
      bio: 'A force of nature. Vera Kane brings relentless intensity and a lightning-fast arsenal that leaves opponents reeling.',
      social: { twitter: '#', instagram: '#' },
    },
    {
      id: 'dante-reyes', name: 'DANTE REYES', nickname: 'El Fuego', category: 'men',
      champion: false, championship: '', image: IMG.w4,
      height: '6\'0"', weight: '218 lbs', hometown: 'San Antonio, Texas', debut: '2015',
      finisher: 'Inferno Driver', signatures: ['Fuego Splash', 'Reyes Cutter'],
      bio: 'High-flying and fearless, Dante Reyes ignites every arena he steps into with breathtaking aerial assaults and unbreakable heart.',
      social: { twitter: '#', instagram: '#' },
    },
    {
      id: 'julian-frost', name: 'JULIAN FROST', nickname: 'The Cold Prince', category: 'men',
      champion: false, championship: '', image: IMG.w6,
      height: '6\'3"', weight: '240 lbs', hometown: 'Boston, Massachusetts', debut: '2014',
      finisher: 'Frostbite', signatures: ['Glacier Slam', 'Cold Snap'],
      bio: 'Methodical and merciless, Julian Frost freezes the momentum of any opponent. His technical mastery is matched only by his icy resolve.',
      social: { twitter: '#', instagram: '#' },
    },
    {
      id: 'selena-cruz', name: 'SELENA CRUZ', nickname: 'La Reina', category: 'women',
      champion: false, championship: '', image: IMG.w5,
      height: '5\'8"', weight: '142 lbs', hometown: 'Miami, Florida', debut: '2020',
      finisher: 'Reina Lock', signatures: ['Crown Kick', 'Royal Bridge'],
      bio: 'Regal, ruthless, and rising fast. Selena Cruz carries herself like royalty and backs it up with a devastating submission game.',
      social: { twitter: '#', instagram: '#' },
    },
    {
      id: 'amethyst-twins', name: 'THE AMETHYST TWINS', nickname: 'Gemini Dynasty', category: 'tag',
      champion: true, championship: 'Tag Team Champions', image: IMG.w3,
      height: '6\'2"', weight: '460 lbs (combined)', hometown: 'Las Vegas, Nevada', debut: '2018',
      finisher: 'Twin Eclipse', signatures: ['Double Amethyst', 'Gemini Bomb'],
      bio: 'Perfectly synchronized and impossible to predict, The Amethyst Twins have dominated the tag division with flawless teamwork and twin telepathy.',
      social: { twitter: '#', instagram: '#' },
    },
  ]
}

function seedNews() {
  return [
    { id: 'era-begins', category: 'Announcements', title: 'A New Era Begins: Black Amethyst Wrestling Announces Nationwide Tour', excerpt: 'BAW unveils an ambitious cross-country tour bringing premium sports entertainment to arenas nationwide.', date: daysFromNow(-2), image: IMG.ringB, author: 'BAW Media' },
    { id: 'voss-reign', category: 'Results', title: 'The Obsidian King Extends Historic Championship Reign', excerpt: 'Kane Voss overcomes a brutal challenge to defend the World Heavyweight Championship in a match for the ages.', date: daysFromNow(-6), image: IMG.ringA, author: 'BAW Media' },
    { id: 'nightshade-interview', category: 'Interviews', title: 'Nightshade Speaks: "I Was Born To Rule This Division"', excerpt: 'The Women\'s Champion opens up about her journey, her rivals, and what comes next.', date: daysFromNow(-9), image: IMG.wf1, author: 'BAW Media' },
    { id: 'amethyst-rising-card', category: 'Events', title: 'Full Match Card Revealed For Amethyst Rising', excerpt: 'Four championship-caliber bouts headline the flagship event. Here is everything you need to know.', date: daysFromNow(-11), image: IMG.fog, author: 'BAW Media' },
    { id: 'signing', category: 'Press Releases', title: 'BAW Signs Multi-Year Broadcast Partnership', excerpt: 'A landmark deal that brings Black Amethyst Wrestling to millions of new fans.', date: daysFromNow(-15), image: IMG.crowd, author: 'BAW Media' },
    { id: 'twins-dominate', category: 'Results', title: 'The Amethyst Twins Remain Untouchable In Tag Division', excerpt: 'The Gemini Dynasty turns back another challenge in dominant fashion.', date: daysFromNow(-19), image: IMG.w3, author: 'BAW Media' },
  ]
}

async function ensureSeed(db) {
  const eCount = await db.collection('events').countDocuments()
  if (eCount === 0) await db.collection('events').insertMany(seedEvents())
  const wCount = await db.collection('wrestlers').countDocuments()
  if (wCount === 0) await db.collection('wrestlers').insertMany(seedWrestlers())
  const nCount = await db.collection('news').countDocuments()
  if (nCount === 0) await db.collection('news').insertMany(seedNews())
}

function clean(arr) {
  return arr.map(({ _id, ...rest }) => rest)
}

async function handleRoute(request, { params }) {
  const { path = [] } = await params
  const route = `/${path.join('/')}`
  const method = request.method

  try {
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
