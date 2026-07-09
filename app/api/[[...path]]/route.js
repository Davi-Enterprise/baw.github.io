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
      id: 'amethyst-rising',
      title: 'AMETHYST RISING',
      tagline: 'The Beginning Of A Dynasty',
      date: daysFromNow(21),
      time: '7:30 PM',
      doorsOpen: '6:00 PM',
      venue: 'The Obsidian Arena',
      location: 'Los Angeles, CA',
      address: '1111 S Figueroa St, Los Angeles, CA 90015',
      poster: IMG.ringA,
      banner: IMG.ringA,
      status: 'on-sale',
      featured: true,
      description: 'The flagship spectacle returns. Championship gold on the line, blood feuds settled, and a new era of Black Amethyst Wrestling begins under the lights of The Obsidian Arena.',
      matches: [
        { title: 'World Heavyweight Championship', competitors: 'Kane "The Obsidian King" Voss (c) vs. Marcus "Midnight" Cole', type: 'Main Event' },
        { title: "Women's Championship", competitors: 'Aisha "Nightshade" Bennett (c) vs. Vera "Violet Storm" Kane', type: 'Co-Main' },
        { title: 'No Disqualification Match', competitors: 'Dante Reyes vs. Julian Frost', type: 'Grudge Match' },
        { title: 'Tag Team Showcase', competitors: 'The Amethyst Twins vs. The Iron Syndicate', type: 'Tag Team' },
      ],
      parking: 'On-site parking available for $25. Premium valet available for VIP ticket holders.',
      vip: 'VIP packages include front-row seating, exclusive meet & greet, backstage tour, commemorative merchandise, and access to the VIP lounge.',
      faq: [
        { q: 'What time do doors open?', a: 'Doors open at 6:00 PM, one and a half hours before bell time.' },
        { q: 'Is there an age restriction?', a: 'All ages welcome. Children under 2 enter free on a lap.' },
        { q: 'Can I bring a sign?', a: 'Yes! Signs must be smaller than 11x14 inches and cannot obstruct other fans.' },
      ],
    },
    {
      id: 'midnight-dominion',
      title: 'MIDNIGHT DOMINION',
      tagline: 'When The Lights Go Out, Legends Are Born',
      date: daysFromNow(48),
      time: '8:00 PM',
      doorsOpen: '6:30 PM',
      venue: 'Crown Point Coliseum',
      location: 'Chicago, IL',
      address: '1901 W Madison St, Chicago, IL 60612',
      poster: IMG.ringB,
      banner: IMG.ringB,
      status: 'on-sale',
      featured: false,
      description: 'An electric night of high-stakes competition as the road to glory intensifies. Rivalries reach a boiling point in the heart of Chicago.',
      matches: [
        { title: 'Number One Contender Gauntlet', competitors: 'Six Superstars, One Opportunity', type: 'Main Event' },
        { title: 'Falls Count Anywhere', competitors: 'Julian Frost vs. Marcus "Midnight" Cole', type: 'Rivalry' },
      ],
      parking: 'Street and garage parking available nearby starting at $15.',
      vip: 'VIP includes reserved seating, early entry, and a signed poster.',
      faq: [
        { q: 'Is the venue accessible?', a: 'Yes, the venue is fully ADA accessible.' },
        { q: 'Are cameras allowed?', a: 'Personal cameras and phones are welcome. Professional equipment requires media credentials.' },
      ],
    },
    {
      id: 'royal-eclipse',
      title: 'ROYAL ECLIPSE',
      tagline: 'Ascend To The Throne',
      date: daysFromNow(75),
      time: '7:00 PM',
      doorsOpen: '5:30 PM',
      venue: 'Empire Hall',
      location: 'New York, NY',
      address: '4 Pennsylvania Plaza, New York, NY 10001',
      poster: IMG.fog,
      banner: IMG.fog,
      status: 'on-sale',
      featured: false,
      description: 'The grandest stage of them all. Under the eclipse, only one can wear the crown. A cinematic evening of championship warfare.',
      matches: [
        { title: 'Royal Eclipse Battle Royal', competitors: '20 Superstars', type: 'Main Event' },
      ],
      parking: 'Multiple public garages within walking distance.',
      vip: 'Ringside VIP with hospitality package available.',
      faq: [
        { q: 'Can I upgrade my ticket?', a: 'Upgrades are subject to availability at the box office.' },
      ],
    },
    {
      id: 'shadow-realm',
      title: 'SHADOW REALM',
      tagline: 'Enter The Darkness',
      date: daysFromNow(110),
      time: '8:00 PM',
      doorsOpen: '6:30 PM',
      venue: 'The Vault',
      location: 'Atlanta, GA',
      address: '1 State Farm Dr, Atlanta, GA 30303',
      poster: IMG.crowd,
      banner: IMG.crowd,
      status: 'coming-soon',
      featured: false,
      description: 'A haunting spectacle where the boldest competitors descend into the Shadow Realm. Tickets coming soon.',
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
