'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion'
import {
  Menu, X, ArrowRight, ChevronRight, ChevronLeft, MapPin, Calendar, Clock,
  Ticket, Play, Instagram, Youtube, Twitter, Facebook, Search, ArrowUp,
  Trophy, Users, Zap, Mail, Phone, Send, ChevronDown, Check, Star, Share2, Flame,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion'

/* ============================= STYLES ============================= */
const GlobalStyles = () => (
  <style jsx global>{`
    html { scroll-behavior: smooth; }
    body { background:#090909; color:#F5F5F5; font-family:'Inter',sans-serif; }
    .font-bebas { font-family:'Bebas Neue',sans-serif; letter-spacing:.03em; }
    .font-oswald { font-family:'Oswald',sans-serif; }
    .font-poppins { font-family:'Poppins',sans-serif; }
    ::selection { background:#6A0DAD; color:#fff; }
    ::-webkit-scrollbar { width:10px; height:10px; }
    ::-webkit-scrollbar-track { background:#090909; }
    ::-webkit-scrollbar-thumb { background:linear-gradient(#6A0DAD,#8A2BE2); border-radius:8px; }
    .amethyst-text { background:linear-gradient(90deg,#B15EFF,#7F3FBF,#8A2BE2); -webkit-background-clip:text; background-clip:text; color:transparent; }
    .glow { box-shadow:0 0 25px rgba(138,43,226,.45), inset 0 0 8px rgba(177,94,255,.15); }
    .glow-btn { position:relative; transition:all .3s ease; box-shadow:0 0 0 rgba(138,43,226,0); }
    .glow-btn:hover { box-shadow:0 0 30px rgba(138,43,226,.7); transform:translateY(-2px); }
    .glass { background:rgba(17,17,17,.55); backdrop-filter:blur(14px); border:1px solid rgba(255,255,255,.08); }
    .hide-scroll::-webkit-scrollbar { display:none; }
    .hide-scroll { -ms-overflow-style:none; scrollbar-width:none; }
    @keyframes smokeDrift { 0%{transform:translate(0,0) scale(1);opacity:.35} 50%{transform:translate(40px,-30px) scale(1.15);opacity:.55} 100%{transform:translate(0,0) scale(1);opacity:.35} }
    .smoke { animation:smokeDrift 16s ease-in-out infinite; }
    @keyframes marquee { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
    .marquee { animation:marquee 30s linear infinite; }
    @keyframes pulseGlow { 0%,100%{opacity:.5;transform:scale(1)} 50%{opacity:1;transform:scale(1.08)} }
    .pulse-glow { animation:pulseGlow 2.4s ease-in-out infinite; }
    @keyframes floatUp { 0%{opacity:0;transform:translateY(20px)} 100%{opacity:1;transform:translateY(0)} }
  `}</style>
)

/* ============================= DATA ============================= */
const HERO_SLIDES = [
  { img: 'https://images.stockcake.com/public/6/f/5/6f59ac45-bb0f-4f6a-a383-2f0d5147139e_large/dramatic-wrestling-arena-stockcake.jpg' },
  { img: 'https://images.unsplash.com/photo-1561447920-ee278fe828a2?crop=entropy&cs=srgb&fm=jpg&q=85' },
  { img: 'https://images.stockcake.com/public/c/d/6/cd687475-d777-4973-88e3-dd3fc9a2ec3b_large/vibrant-wrestling-event-stockcake.jpg' },
]
const SMOKE_IMG = 'https://images.unsplash.com/photo-1508898578281-774ac4893c0c?crop=entropy&cs=srgb&fm=jpg&q=85'
const SPONSORS = ['APEX ATHLETICS', 'MONOLITH', 'VOID ENERGY', 'IRON FORGE', 'NOX APPAREL', 'PRIME FUEL', 'TITAN GEAR', 'ECLIPSE MEDIA']
const NAV = ['Home', 'Events', 'Tickets', 'Roster', 'Media', 'News', 'About', 'Contact']

const TICKET_TIERS = [
  { name: 'General Admission', price: 20, popular: false, benefits: ['General open seating', 'Access to the full show', 'Concessions available', 'Unbeatable value for the night'] },
  { name: 'First Row', price: 30, popular: true, benefits: ['Front-row ringside seat', 'Closest view of the action', 'Feel every impact up close', 'Strictly limited availability'] },
  { name: 'Kids', price: 10, popular: false, benefits: ['Discounted kids admission', 'Ages 12 and under', 'Seating with your group', 'Perfect for the whole family'] },
]

const TICKET_FAQ = [
  { q: 'How will I receive my tickets?', a: 'Tickets are delivered digitally to your email immediately after purchase. Present the QR code at the door for entry.' },
  { q: 'Can I get a refund?', a: 'Tickets are non-refundable but fully transferable. See our refund policy for details on cancelled or postponed events.' },
  { q: 'Do children need a ticket?', a: 'Children aged 2 and over require a ticket. Under 2 may enter free on a parent\'s lap.' },
  { q: 'Are VIP packages limited?', a: 'Yes, VIP experiences are strictly limited per event to ensure a premium experience.' },
]

/* ============================= HELPERS ============================= */
const reveal = {
  hidden: { opacity: 0, y: 40 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.7, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] } }),
}

const fmtDate = (iso) => {
  try {
    return new Date(iso).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })
  } catch { return iso }
}
const fmtShort = (iso) => {
  try { return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) } catch { return iso }
}

const GlowButton = ({ children, onClick, variant = 'primary', className = '', type = 'button', full = false }) => {
  const base = 'glow-btn font-oswald font-600 uppercase tracking-widest text-sm px-8 py-3.5 rounded-md inline-flex items-center justify-center gap-2 cursor-pointer'
  const styles = {
    primary: 'bg-gradient-to-r from-[#6A0DAD] to-[#8A2BE2] text-white',
    outline: 'border border-white/20 text-[#F5F5F5] hover:border-[#B15EFF] hover:bg-white/5',
    ghost: 'text-[#BDBDBD] hover:text-white',
  }
  return (
    <button type={type} onClick={onClick} className={`${base} ${styles[variant]} ${full ? 'w-full' : ''} ${className}`}>
      {children}
    </button>
  )
}

const SectionHeading = ({ overline, title, center = false, light }) => (
  <div className={`${center ? 'text-center mx-auto' : ''} mb-12 max-w-3xl`}>
    {overline && (
      <div className={`flex items-center gap-3 mb-4 ${center ? 'justify-center' : ''}`}>
        <span className="h-px w-8 bg-[#8A2BE2]" />
        <span className="font-oswald uppercase tracking-[0.35em] text-xs text-[#B15EFF]">{overline}</span>
        <span className="h-px w-8 bg-[#8A2BE2]" />
      </div>
    )}
    <h2 className={`font-bebas text-5xl md:text-6xl leading-none ${light ? 'text-white' : ''}`}>{title}</h2>
  </div>
)

const SmokeOverlay = ({ className = '' }) => (
  <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
    <img src={SMOKE_IMG} alt="" className="smoke absolute -top-1/4 left-0 w-[80%] opacity-30 mix-blend-screen" />
    <img src={SMOKE_IMG} alt="" className="smoke absolute bottom-0 right-0 w-[70%] opacity-25 mix-blend-screen" style={{ animationDelay: '-6s' }} />
  </div>
)

const VideoThumb = ({ img, label = 'Watch Highlight', className = 'aspect-video' }) => (
  <div className={`group relative rounded-xl overflow-hidden glow border border-white/8 cursor-pointer ${className}`}>
    <img src={img} alt={label} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
    <div className="absolute inset-0 bg-gradient-to-t from-[#090909]/90 via-[#090909]/20 to-transparent" />
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#6A0DAD] to-[#8A2BE2] glow flex items-center justify-center group-hover:scale-110 transition-transform">
        <Play size={26} className="text-white ml-1" fill="white" />
      </div>
    </div>
    <div className="absolute bottom-4 left-4 flex items-center gap-2">
      <span className="w-2 h-2 rounded-full bg-[#B15EFF] pulse-glow" />
      <span className="font-oswald uppercase tracking-widest text-xs text-[#F5F5F5]">{label}</span>
    </div>
  </div>
)

/* ============================= COUNTDOWN ============================= */
const Countdown = ({ target, size = 'lg' }) => {
  const [t, setT] = useState({ d: 0, h: 0, m: 0, s: 0 })
  useEffect(() => {
    const tick = () => {
      const diff = new Date(target).getTime() - Date.now()
      if (diff <= 0) { setT({ d: 0, h: 0, m: 0, s: 0 }); return }
      setT({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff / 3600000) % 24),
        m: Math.floor((diff / 60000) % 60),
        s: Math.floor((diff / 1000) % 60),
      })
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [target])
  const units = [{ v: t.d, l: 'Days' }, { v: t.h, l: 'Hrs' }, { v: t.m, l: 'Min' }, { v: t.s, l: 'Sec' }]
  const box = size === 'lg' ? 'w-20 h-20 md:w-24 md:h-24 text-4xl md:text-5xl' : 'w-16 h-16 text-3xl'
  return (
    <div className="flex gap-3 md:gap-4">
      {units.map((u) => (
        <div key={u.l} className="text-center">
          <div className={`glass glow ${box} rounded-lg flex items-center justify-center font-bebas text-white`}>
            {String(u.v).padStart(2, '0')}
          </div>
          <div className="mt-2 font-oswald uppercase tracking-widest text-[10px] text-[#BDBDBD]">{u.l}</div>
        </div>
      ))}
    </div>
  )
}

/* ============================= CARDS ============================= */
const EventCard = ({ ev, onOpen, onTickets, i }) => (
  <motion.div variants={reveal} initial="hidden" whileInView="show" viewport={{ once: true }} custom={i}
    className="group glass rounded-xl overflow-hidden hover:border-[#8A2BE2]/50 transition-all duration-500">
    <div className="relative h-56 overflow-hidden">
      <img src={ev.poster} alt={ev.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#090909] via-transparent to-transparent" />
      <div className="absolute top-4 left-4">
        {ev.status === 'coming-soon'
          ? <span className="glass px-3 py-1 rounded-full text-[10px] font-oswald uppercase tracking-widest text-[#B15EFF]">Tickets Soon</span>
          : <span className="bg-gradient-to-r from-[#6A0DAD] to-[#8A2BE2] px-3 py-1 rounded-full text-[10px] font-oswald uppercase tracking-widest text-white">On Sale</span>}
      </div>
      <div className="absolute bottom-4 left-4 right-4">
        <div className="font-oswald text-xs uppercase tracking-widest text-[#B15EFF]">{ev.tagline}</div>
        <h3 className="font-bebas text-3xl leading-none mt-1">{ev.title}</h3>
      </div>
    </div>
    <div className="p-6">
      <div className="space-y-2 text-sm text-[#BDBDBD] font-poppins">
        <div className="flex items-center gap-2"><Calendar size={15} className="text-[#8A2BE2]" /> {fmtDate(ev.date)}</div>
        <div className="flex items-center gap-2"><Clock size={15} className="text-[#8A2BE2]" /> Doors {ev.doorsOpen} · Bell {ev.time}</div>
        <div className="flex items-center gap-2"><MapPin size={15} className="text-[#8A2BE2]" /> {ev.venue}, {ev.location}</div>
      </div>
      <p className="mt-4 text-sm text-[#BDBDBD] line-clamp-2 font-poppins">{ev.description}</p>
      <div className="flex gap-3 mt-6">
        {ev.status !== 'coming-soon'
          ? <GlowButton onClick={() => onTickets(ev)} className="!px-5 !py-2.5 text-xs"><Ticket size={14} /> Tickets</GlowButton>
          : <GlowButton variant="outline" className="!px-5 !py-2.5 text-xs cursor-not-allowed opacity-70">Coming Soon</GlowButton>}
        <GlowButton variant="outline" onClick={() => onOpen(ev)} className="!px-5 !py-2.5 text-xs">Learn More</GlowButton>
      </div>
    </div>
  </motion.div>
)

const WrestlerCard = ({ w, onOpen, i }) => (
  <motion.div variants={reveal} initial="hidden" whileInView="show" viewport={{ once: true }} custom={i}
    onClick={() => onOpen(w)}
    className="group relative rounded-xl overflow-hidden cursor-pointer h-[420px] border border-white/8">
    <img src={w.image} alt={w.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
    <div className="absolute inset-0 bg-gradient-to-t from-[#090909] via-[#090909]/40 to-transparent" />
    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-t from-[#6A0DAD]/40 to-transparent" />
    <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-1 group-hover:translate-y-0 transition-transform duration-500">
      {w.nickname ? <div className="font-oswald text-xs uppercase tracking-widest text-[#B15EFF]">"{w.nickname}"</div> : null}
      <h3 className="font-bebas text-3xl leading-none mt-1">{w.name}</h3>
    </div>
  </motion.div>
)

const NewsCard = ({ n, i }) => (
  <motion.div variants={reveal} initial="hidden" whileInView="show" viewport={{ once: true }} custom={i}
    className="group glass rounded-xl overflow-hidden hover:border-[#8A2BE2]/50 transition-all duration-500 cursor-pointer">
    <div className="relative h-48 overflow-hidden">
      <img src={n.image} alt={n.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#111] to-transparent" />
      <span className="absolute top-3 left-3 bg-[#6A0DAD]/80 backdrop-blur px-3 py-1 rounded-full text-[10px] font-oswald uppercase tracking-widest">{n.category}</span>
    </div>
    <div className="p-6">
      <div className="text-[11px] font-oswald uppercase tracking-widest text-[#BDBDBD]">{fmtShort(n.date)}</div>
      <h3 className="font-oswald text-lg font-600 mt-2 leading-snug group-hover:text-[#B15EFF] transition-colors">{n.title}</h3>
      <p className="mt-2 text-sm text-[#BDBDBD] line-clamp-2 font-poppins">{n.excerpt}</p>
      <div className="mt-4 flex items-center gap-1 text-[#B15EFF] font-oswald uppercase tracking-widest text-xs">Read More <ChevronRight size={14} /></div>
    </div>
  </motion.div>
)

/* ============================= NAV ============================= */
const Navbar = ({ nav, scrolled, current, onOpen }) => {
  const [menu, setMenu] = useState(false)
  const go = (p) => { setMenu(false); nav(p) }
  return (
    <>
      <motion.header initial={{ y: -80 }} animate={{ y: 0 }} transition={{ duration: 0.6 }}
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${scrolled ? 'glass py-3 shadow-lg shadow-black/40' : 'bg-transparent py-5'}`}>
        <div className="container mx-auto px-5 flex items-center justify-between">
          <div onClick={() => go('home')} className="flex items-center gap-3 cursor-pointer group">
            <div className="w-9 h-9 rotate-45 bg-gradient-to-br from-[#6A0DAD] to-[#B15EFF] rounded-sm glow flex items-center justify-center">
              <span className="-rotate-45 font-bebas text-xl text-white">BA</span>
            </div>
            <div className="leading-none">
              <div className="font-bebas text-xl tracking-wide">BLACK AMETHYST</div>
              <div className="font-oswald text-[9px] tracking-[0.4em] text-[#B15EFF]">WRESTLING</div>
            </div>
          </div>
          <nav className="hidden lg:flex items-center gap-7">
            {NAV.map((item) => {
              const key = item.toLowerCase()
              return (
                <button key={item} onClick={() => go(key)}
                  className={`font-oswald uppercase tracking-widest text-xs transition-colors relative ${current === key ? 'text-[#B15EFF]' : 'text-[#F5F5F5] hover:text-[#B15EFF]'}`}>
                  {item}
                  {current === key && <motion.span layoutId="navdot" className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#B15EFF]" />}
                </button>
              )
            })}
          </nav>
          <div className="hidden lg:block">
            <GlowButton onClick={() => go('tickets')} className="!px-6 !py-2.5 text-xs"><Ticket size={14} /> Buy Tickets</GlowButton>
          </div>
          <button className="lg:hidden text-white" onClick={() => setMenu(true)}><Menu size={26} /></button>
        </div>
      </motion.header>
      <AnimatePresence>
        {menu && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-[#090909]/98 backdrop-blur-xl lg:hidden">
            <div className="flex justify-between items-center px-5 py-5">
              <div className="font-bebas text-2xl">MENU</div>
              <button onClick={() => setMenu(false)}><X size={28} /></button>
            </div>
            <div className="flex flex-col px-8 gap-6 mt-8">
              {NAV.map((item, i) => (
                <motion.button key={item} initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                  onClick={() => go(item.toLowerCase())} className="text-left font-bebas text-4xl hover:text-[#B15EFF] transition-colors">
                  {item}
                </motion.button>
              ))}
              <GlowButton onClick={() => go('tickets')} className="mt-4"><Ticket size={16} /> Buy Tickets</GlowButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

/* ============================= HERO ============================= */
const Hero = ({ nav, nextEvent }) => {
  const [slide, setSlide] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setSlide((s) => (s + 1) % HERO_SLIDES.length), 5500)
    return () => clearInterval(id)
  }, [])
  return (
    <section className="relative h-screen min-h-[680px] w-full overflow-hidden">
      <AnimatePresence>
        <motion.div key={slide} initial={{ opacity: 0, scale: 1.12 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 1.6, ease: 'easeOut' }} className="absolute inset-0">
          <img src={HERO_SLIDES[slide].img} alt="BAW" className="w-full h-full object-cover" />
        </motion.div>
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-b from-[#090909]/70 via-[#090909]/40 to-[#090909]" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#090909]/90 via-transparent to-[#6A0DAD]/20" />
      <SmokeOverlay />
      <div className="relative z-10 h-full container mx-auto px-5 flex flex-col justify-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="flex items-center gap-3 mb-6">
          <span className="h-px w-10 bg-[#B15EFF]" />
          <span className="font-oswald uppercase tracking-[0.4em] text-xs text-[#B15EFF]">Independent Professional Wrestling</span>
        </motion.div>
        <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.9 }}
          className="font-bebas text-6xl md:text-8xl lg:text-9xl leading-[0.9] max-w-5xl">
          WHERE RAW ENERGY<br /><span className="amethyst-text">MEETS DESTINY.</span>
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          className="mt-6 text-lg md:text-xl text-[#BDBDBD] max-w-2xl font-poppins font-300">
          Independent Professional Wrestling. Elite Athletes. Unforgettable Moments.
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
          className="mt-10 flex flex-wrap gap-4">
          <GlowButton onClick={() => nav('tickets')}><Ticket size={16} /> Buy Tickets</GlowButton>
          <GlowButton variant="outline" onClick={() => nav('events')}><Calendar size={16} /> Upcoming Events</GlowButton>
          <GlowButton variant="ghost" onClick={() => nav('media')}><Play size={16} /> Watch Highlights</GlowButton>
        </motion.div>
      </div>
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-[#BDBDBD]">
        <span className="font-oswald uppercase tracking-widest text-[10px]">Scroll</span>
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1.8 }}><ChevronDown size={20} /></motion.div>
      </div>
      <div className="absolute bottom-8 right-8 z-10 hidden md:flex gap-2">
        {HERO_SLIDES.map((_, i) => (
          <button key={i} onClick={() => setSlide(i)} className={`h-1.5 rounded-full transition-all ${slide === i ? 'w-8 bg-[#B15EFF]' : 'w-3 bg-white/30'}`} />
        ))}
      </div>
    </section>
  )
}

/* ============================= PAGE SHELL ============================= */
const PageBanner = ({ title, overline, img }) => (
  <section className="relative h-[45vh] min-h-[340px] flex items-end overflow-hidden">
    <img src={img} alt={title} className="absolute inset-0 w-full h-full object-cover" />
    <div className="absolute inset-0 bg-gradient-to-t from-[#090909] via-[#090909]/60 to-[#090909]/30" />
    <SmokeOverlay />
    <div className="relative container mx-auto px-5 pb-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="font-oswald uppercase tracking-[0.4em] text-xs text-[#B15EFF] mb-3">{overline}</div>
        <h1 className="font-bebas text-6xl md:text-8xl leading-none">{title}</h1>
      </motion.div>
    </div>
  </section>
)

/* ============================= HOME ============================= */
const HomePage = ({ nav, data, onOpenEvent, onOpenWrestler, onTickets }) => {
  const next = data.events.find((e) => e.status !== 'coming-soon') || data.events[0]
  const scroller = useRef(null)
  const scrollBy = (dir) => scroller.current?.scrollBy({ left: dir * 360, behavior: 'smooth' })
  return (
    <div>
      <Hero nav={nav} nextEvent={next} />

      {/* ABOUT / MISSION */}
      <section className="relative py-28 overflow-hidden">
        <SmokeOverlay className="opacity-50" />
        <div className="container mx-auto px-5 relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div variants={reveal} initial="hidden" whileInView="show" viewport={{ once: true }}>
              <SectionHeading overline="The Promotion" title="A NEW DYNASTY OF WRESTLING" />
              <p className="text-[#BDBDBD] text-lg leading-relaxed font-poppins font-300">
                Black Amethyst Wrestling is an independent professional wrestling promotion dedicated to showcasing elite talent through cinematic storytelling, premium production, and unforgettable live events.
              </p>
              <p className="mt-5 text-[#BDBDBD] leading-relaxed font-poppins font-300">
                We exist to elevate the art of professional wrestling — blending raw athletic power with the drama, spectacle, and prestige of a nationally recognized brand. Every show is a statement. Every match is a story. Every moment matters.
              </p>
              <div className="mt-8"><GlowButton onClick={() => nav('about')}>Our Story <ArrowRight size={16} /></GlowButton></div>
            </motion.div>
            <motion.div variants={reveal} initial="hidden" whileInView="show" viewport={{ once: true }} className="relative">
              <div className="relative rounded-2xl overflow-hidden glow h-[440px]">
                <img src={HERO_SLIDES[2].img} alt="BAW" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#6A0DAD]/40 to-transparent" />
              </div>
              <div className="absolute -bottom-6 -left-6 glass rounded-xl p-6 glow">
                <div className="font-bebas text-5xl amethyst-text">100%</div>
                <div className="font-oswald uppercase tracking-widest text-xs text-[#BDBDBD]">Elite Competition</div>
              </div>
            </motion.div>
          </div>

          {/* FEATURE CARDS */}
          <div className="grid md:grid-cols-3 gap-6 mt-24">
            {[
              { icon: Trophy, t: 'Elite Competition', d: 'The finest independent athletes in the world compete for championship glory under the brightest lights.' },
              { icon: Users, t: 'Community', d: 'Built by fans, for fans. We create moments and memories that unite a passionate global community.' },
              { icon: Zap, t: 'Entertainment', d: 'Cinematic production, dramatic storytelling, and jaw-dropping spectacle in every single show.' },
            ].map((f, i) => (
              <motion.div key={f.t} variants={reveal} custom={i} initial="hidden" whileInView="show" viewport={{ once: true }}
                className="glass rounded-xl p-8 hover:border-[#8A2BE2]/50 transition-all duration-500 group">
                <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-[#6A0DAD] to-[#8A2BE2] flex items-center justify-center glow group-hover:scale-110 transition-transform">
                  <f.icon size={24} className="text-white" />
                </div>
                <h3 className="font-bebas text-3xl mt-6">{f.t}</h3>
                <p className="mt-3 text-[#BDBDBD] font-poppins font-300 leading-relaxed">{f.d}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* NEXT EVENT + COUNTDOWN */}
      {next && (
        <section className="relative py-24 overflow-hidden">
          <img src={next.banner} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#090909] via-[#111]/80 to-[#090909]" />
          <div className="container mx-auto px-5 relative">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div variants={reveal} initial="hidden" whileInView="show" viewport={{ once: true }}
                className="relative rounded-2xl overflow-hidden glow max-w-md">
                <img src={next.poster} alt={next.title} className="w-full h-[500px] object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#090909]/90 to-transparent" />
                <div className="absolute bottom-6 left-6">
                  <div className="font-oswald uppercase tracking-widest text-xs text-[#B15EFF]">{next.tagline}</div>
                  <div className="font-bebas text-5xl leading-none">{next.title}</div>
                </div>
              </motion.div>
              <motion.div variants={reveal} initial="hidden" whileInView="show" viewport={{ once: true }}>
                <div className="font-oswald uppercase tracking-[0.4em] text-xs text-[#B15EFF] mb-3">Next Live Event</div>
                <h2 className="font-bebas text-6xl leading-none mb-6">THE COUNTDOWN IS ON</h2>
                <div className="space-y-2 text-[#BDBDBD] font-poppins mb-8">
                  <div className="flex items-center gap-2"><Calendar size={16} className="text-[#8A2BE2]" /> {fmtDate(next.date)}</div>
                  <div className="flex items-center gap-2"><MapPin size={16} className="text-[#8A2BE2]" /> {next.venue}, {next.location}</div>
                  <div className="flex items-center gap-2"><Clock size={16} className="text-[#8A2BE2]" /> Doors {next.doorsOpen} · Bell Time {next.time}</div>
                </div>
                <Countdown target={next.date} />
                <div className="flex gap-4 mt-10">
                  <GlowButton onClick={() => onTickets(next)}><Ticket size={16} /> Buy Tickets</GlowButton>
                  <GlowButton variant="outline" onClick={() => onOpenEvent(next)}>Learn More</GlowButton>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      )}

      {/* FEATURED WRESTLERS CAROUSEL */}
      <section className="py-24">
        <div className="container mx-auto px-5">
          <div className="flex items-end justify-between">
            <SectionHeading overline="The Roster" title="FEATURED SUPERSTARS" />
            <div className="hidden md:flex gap-2 mb-12">
              <button onClick={() => scrollBy(-1)} className="w-11 h-11 rounded-full glass hover:border-[#8A2BE2] flex items-center justify-center"><ChevronLeft size={18} /></button>
              <button onClick={() => scrollBy(1)} className="w-11 h-11 rounded-full glass hover:border-[#8A2BE2] flex items-center justify-center"><ChevronRight size={18} /></button>
            </div>
          </div>
          <div ref={scroller} className="flex gap-6 overflow-x-auto hide-scroll snap-x pb-4">
            {data.wrestlers.map((w, i) => (
              <div key={w.id} className="min-w-[300px] max-w-[300px] snap-start">
                <WrestlerCard w={w} onOpen={onOpenWrestler} i={i} />
              </div>
            ))}
          </div>
          <div className="text-center mt-10"><GlowButton variant="outline" onClick={() => nav('roster')}>View Full Roster <ArrowRight size={16} /></GlowButton></div>
        </div>
      </section>

      {/* LATEST NEWS */}
      <section className="py-24 bg-[#111]/40">
        <div className="container mx-auto px-5">
          <SectionHeading overline="Newsroom" title="LATEST NEWS" center />
          <div className="grid md:grid-cols-3 gap-6">
            {data.news.slice(0, 3).map((n, i) => <NewsCard key={n.id} n={n} i={i} />)}
          </div>
          <div className="text-center mt-12"><GlowButton variant="outline" onClick={() => nav('news')}>All Stories <ArrowRight size={16} /></GlowButton></div>
        </div>
      </section>

      {/* SPONSORS */}
      <section className="py-16 border-y border-white/8 overflow-hidden">
        <div className="text-center font-oswald uppercase tracking-[0.4em] text-xs text-[#BDBDBD] mb-8">Trusted By The Best</div>
        <div className="relative overflow-hidden">
          <div className="flex marquee w-max gap-16">
            {[...SPONSORS, ...SPONSORS].map((s, i) => (
              <span key={i} className="font-bebas text-3xl text-white/25 hover:text-[#B15EFF] transition-colors whitespace-nowrap">{s}</span>
            ))}
          </div>
        </div>
      </section>

      {/* SOCIAL / INSTAGRAM + YOUTUBE */}
      <section className="py-24">
        <div className="container mx-auto px-5">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <SectionHeading overline="@blackamethystwrestling" title="ON INSTAGRAM" />
              <div className="grid grid-cols-3 gap-3">
                {[HERO_SLIDES[0].img, data.wrestlers[0]?.image, HERO_SLIDES[2].img, data.wrestlers[2]?.image, HERO_SLIDES[1].img, data.wrestlers[4]?.image].map((img, i) => (
                  <div key={i} className="group relative aspect-square rounded-lg overflow-hidden cursor-pointer">
                    <img src={img} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-[#6A0DAD]/0 group-hover:bg-[#6A0DAD]/50 transition-colors flex items-center justify-center">
                      <Instagram size={26} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <SectionHeading overline="BAW On YouTube" title="WATCH HIGHLIGHTS" />
              <VideoThumb img={HERO_SLIDES[1].img} label="BAW Signature Highlights" />
              <div className="mt-4"><GlowButton variant="outline" onClick={() => nav('media')}><Youtube size={16} /> More Videos</GlowButton></div>
            </div>
          </div>
        </div>
      </section>

      <NewsletterCTA />
    </div>
  )
}

/* ============================= NEWSLETTER ============================= */
const NewsletterCTA = () => {
  const [email, setEmail] = useState('')
  const [done, setDone] = useState(false)
  const submit = async (e) => {
    e.preventDefault()
    if (!email) return
    try { await fetch('/api/newsletter', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) }) } catch {}
    setDone(true); setEmail('')
  }
  return (
    <section className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-[#6A0DAD]/30 via-[#090909] to-[#8A2BE2]/20" />
      <SmokeOverlay />
      <div className="container mx-auto px-5 relative text-center max-w-2xl">
        <Flame className="mx-auto text-[#B15EFF] mb-4" size={32} />
        <h2 className="font-bebas text-5xl md:text-6xl">JOIN THE AMETHYST NATION</h2>
        <p className="mt-4 text-[#BDBDBD] font-poppins font-300">Be first to know about event drops, ticket presales, and exclusive content.</p>
        {done ? (
          <div className="mt-8 glass rounded-lg p-6 inline-flex items-center gap-3 text-[#B15EFF]"><Check size={20} /> You're in. Welcome to the Nation.</div>
        ) : (
          <form onSubmit={submit} className="mt-8 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required placeholder="Enter your email"
              className="bg-white/5 border-white/10 h-12 text-white placeholder:text-[#BDBDBD]/60" />
            <GlowButton type="submit" className="h-12">Subscribe</GlowButton>
          </form>
        )}
      </div>
    </section>
  )
}

/* ============================= EVENTS PAGE ============================= */
const EventsPage = ({ data, onOpenEvent, onTickets }) => (
  <div>
    <PageBanner overline="Live & Loud" title="EVENTS" img={HERO_SLIDES[0].img} />
    <section className="py-20">
      <div className="container mx-auto px-5">
        <SectionHeading overline="Mark Your Calendar" title="UPCOMING EVENTS" center />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {data.events.map((ev, i) => <EventCard key={ev.id} ev={ev} i={i} onOpen={onOpenEvent} onTickets={onTickets} />)}
        </div>

        <div className="mt-24 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div variants={reveal} initial="hidden" whileInView="show" viewport={{ once: true }}
            className="relative rounded-2xl overflow-hidden glow border border-white/8 max-w-sm mx-auto">
            <img src="/schedule-poster.jpeg" alt="Black Amethyst Wrestling 2026-2027 Event Schedule" className="w-full h-auto" />
          </motion.div>
          <motion.div variants={reveal} initial="hidden" whileInView="show" viewport={{ once: true }}>
            <div className="font-oswald uppercase tracking-[0.4em] text-xs text-[#B15EFF] mb-3">2026 — 2027 Season</div>
            <h2 className="font-bebas text-5xl md:text-6xl leading-none">THIS IS JUST THE BEGINNING</h2>
            <p className="mt-5 text-[#BDBDBD] text-lg leading-relaxed font-poppins font-300">
              Six landmark events. One unforgettable season. From the Inaugural Show in Houston to themed spectacles and cross-promotion collaborations, the Black Amethyst Wrestling 2026–2027 season is a statement of intent.
            </p>
            <div className="mt-8"><GlowButton onClick={() => onTickets(null)}><Ticket size={16} /> Get Inaugural Tickets</GlowButton></div>
          </motion.div>
        </div>
      </div>
    </section>
  </div>
)

/* ============================= EVENT DETAIL ============================= */
const EventDetail = ({ ev, data, onOpenEvent, onTickets, nav }) => {
  if (!ev) return null
  const related = data.events.filter((e) => e.id !== ev.id).slice(0, 3)
  const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(ev.address || ev.venue)}&output=embed`
  return (
    <div>
      <section className="relative h-[70vh] min-h-[520px] flex items-end overflow-hidden">
        <img src={ev.banner} alt={ev.title} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#090909] via-[#090909]/50 to-[#090909]/40" />
        <SmokeOverlay />
        <div className="relative container mx-auto px-5 pb-14">
          <button onClick={() => nav('events')} className="flex items-center gap-1 text-[#BDBDBD] hover:text-white mb-6 font-oswald uppercase tracking-widest text-xs"><ChevronLeft size={16} /> All Events</button>
          <div className="font-oswald uppercase tracking-[0.4em] text-sm text-[#B15EFF] mb-3">{ev.tagline}</div>
          <h1 className="font-bebas text-7xl md:text-9xl leading-none">{ev.title}</h1>
          <div className="mt-6 flex flex-wrap gap-6 text-[#BDBDBD] font-poppins">
            <span className="flex items-center gap-2"><Calendar size={16} className="text-[#8A2BE2]" /> {fmtDate(ev.date)}</span>
            <span className="flex items-center gap-2"><Clock size={16} className="text-[#8A2BE2]" /> {ev.time}</span>
            <span className="flex items-center gap-2"><MapPin size={16} className="text-[#8A2BE2]" /> {ev.venue}, {ev.location}</span>
          </div>
        </div>
      </section>

      <section className="py-16 border-b border-white/8">
        <div className="container mx-auto px-5 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div>
            <div className="font-oswald uppercase tracking-widest text-xs text-[#B15EFF] mb-4">Time Until Bell</div>
            <Countdown target={ev.date} />
          </div>
          <div className="flex gap-4">
            {ev.status !== 'coming-soon'
              ? <GlowButton onClick={() => onTickets(ev)}><Ticket size={16} /> Buy Tickets</GlowButton>
              : <GlowButton variant="outline" className="opacity-70">Tickets Coming Soon</GlowButton>}
            <GlowButton variant="outline" onClick={() => navigator.share ? navigator.share({ title: ev.title, url: window.location.href }).catch(()=>{}) : null}><Share2 size={16} /> Share</GlowButton>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-5 grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            <div>
              <SectionHeading overline="The Spectacle" title="ABOUT THIS EVENT" />
              <p className="text-[#BDBDBD] text-lg leading-relaxed font-poppins font-300">{ev.description}</p>
            </div>
            {ev.matches?.length > 0 && (
              <div>
                <h3 className="font-bebas text-4xl mb-6">MATCH CARD</h3>
                <div className="space-y-4">
                  {ev.matches.map((m, i) => (
                    <motion.div key={i} variants={reveal} custom={i} initial="hidden" whileInView="show" viewport={{ once: true }}
                      className="glass rounded-xl p-6 flex flex-col md:flex-row md:items-center gap-4 hover:border-[#8A2BE2]/50 transition-all">
                      <span className="bg-gradient-to-r from-[#6A0DAD] to-[#8A2BE2] px-3 py-1 rounded-full text-[10px] font-oswald uppercase tracking-widest w-max">{m.type}</span>
                      <div>
                        <div className="font-oswald uppercase tracking-wide text-[#B15EFF] text-sm">{m.title}</div>
                        <div className="font-bebas text-2xl leading-tight">{m.competitors}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
            <div>
              <h3 className="font-bebas text-4xl mb-6">FREQUENTLY ASKED QUESTIONS</h3>
              <Accordion type="single" collapsible className="w-full">
                {(ev.faq || []).map((f, i) => (
                  <AccordionItem key={i} value={`item-${i}`} className="border-white/8">
                    <AccordionTrigger className="font-oswald text-left hover:text-[#B15EFF]">{f.q}</AccordionTrigger>
                    <AccordionContent className="text-[#BDBDBD] font-poppins font-300">{f.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
            <div>
              <h3 className="font-bebas text-4xl mb-6">VENUE & MAP</h3>
              <div className="rounded-xl overflow-hidden border border-white/8 glow h-80">
                <iframe src={mapSrc} className="w-full h-full grayscale-[0.4]" loading="lazy" title="map" />
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="glass rounded-xl p-6">
              <h4 className="font-bebas text-2xl mb-4">VENUE INFO</h4>
              <div className="space-y-3 text-sm text-[#BDBDBD] font-poppins">
                <div className="flex gap-2"><MapPin size={16} className="text-[#8A2BE2] shrink-0" /> {ev.venue}<br />{ev.address}</div>
                <div className="flex gap-2"><Clock size={16} className="text-[#8A2BE2] shrink-0" /> Doors Open: {ev.doorsOpen}</div>
              </div>
            </div>
            <div className="glass rounded-xl p-6">
              <h4 className="font-bebas text-2xl mb-3 flex items-center gap-2"><Star size={18} className="text-[#B15EFF]" /> VIP INFORMATION</h4>
              <p className="text-sm text-[#BDBDBD] font-poppins font-300">{ev.vip}</p>
            </div>
            <div className="glass rounded-xl p-6">
              <h4 className="font-bebas text-2xl mb-3">PARKING</h4>
              <p className="text-sm text-[#BDBDBD] font-poppins font-300">{ev.parking}</p>
            </div>
          </aside>
        </div>
      </section>

      {related.length > 0 && (
        <section className="py-16 bg-[#111]/40">
          <div className="container mx-auto px-5">
            <SectionHeading overline="Don't Miss" title="RELATED EVENTS" />
            <div className="grid md:grid-cols-3 gap-8">
              {related.map((e, i) => <EventCard key={e.id} ev={e} i={i} onOpen={onOpenEvent} onTickets={onTickets} />)}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

/* ============================= TICKETS PAGE ============================= */
const TicketsPage = ({ selectedEvent, data }) => {
  const [promo, setPromo] = useState('')
  const [selected, setSelected] = useState(null)
  const ev = selectedEvent || data.events.find((e) => e.status !== 'coming-soon')
  return (
    <div>
      <PageBanner overline="Secure Your Seat" title="TICKETS" img={HERO_SLIDES[1].img} />
      <section className="py-20">
        <div className="container mx-auto px-5">
          {ev && (
            <div className="glass rounded-xl p-6 md:p-8 mb-14 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <div className="font-oswald uppercase tracking-widest text-xs text-[#B15EFF]">Now Selling</div>
                <div className="font-bebas text-4xl">{ev.title}</div>
                <div className="text-[#BDBDBD] font-poppins text-sm mt-1">{fmtDate(ev.date)} · {ev.venue}, {ev.location}</div>
              </div>
              <Countdown target={ev.date} size="sm" />
            </div>
          )}
          <SectionHeading overline="Choose Your Experience" title="TICKET OPTIONS" center />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TICKET_TIERS.map((t, i) => (
              <motion.div key={t.name} variants={reveal} custom={i} initial="hidden" whileInView="show" viewport={{ once: true }}
                className={`relative rounded-xl p-8 flex flex-col transition-all duration-500 ${t.popular ? 'bg-gradient-to-b from-[#6A0DAD]/30 to-[#111] border border-[#8A2BE2] glow' : 'glass hover:border-[#8A2BE2]/50'}`}>
                {t.popular && <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#6A0DAD] to-[#B15EFF] px-4 py-1 rounded-full text-[10px] font-oswald uppercase tracking-widest">Most Popular</span>}
                <h3 className="font-bebas text-3xl">{t.name}</h3>
                <div className="mt-3 flex items-end gap-1">
                  <span className="font-bebas text-5xl amethyst-text">${t.price}</span>
                  <span className="text-[#BDBDBD] text-sm mb-2 font-poppins">/ ticket</span>
                </div>
                <div className="h-px bg-white/8 my-6" />
                <ul className="space-y-3 flex-1">
                  {t.benefits.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-sm text-[#BDBDBD] font-poppins font-300"><Check size={16} className="text-[#B15EFF] mt-0.5 shrink-0" /> {b}</li>
                  ))}
                </ul>
                <GlowButton full variant={t.popular ? 'primary' : 'outline'} className="mt-8" onClick={() => setSelected(t.name)}>
                  {selected === t.name ? 'Added ✓' : 'Purchase'}
                </GlowButton>
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mt-16">
            <div className="glass rounded-xl p-8">
              <h3 className="font-bebas text-3xl mb-4">PROMO CODE</h3>
              <div className="flex gap-3">
                <Input value={promo} onChange={(e) => setPromo(e.target.value)} placeholder="Enter promo code"
                  className="bg-white/5 border-white/10 h-12 text-white placeholder:text-[#BDBDBD]/60" />
                <GlowButton className="h-12" onClick={() => {}}>Apply</GlowButton>
              </div>
              <div className="mt-8">
                <h4 className="font-bebas text-2xl mb-2">REFUND POLICY</h4>
                <p className="text-sm text-[#BDBDBD] font-poppins font-300">All ticket sales are final and non-refundable. Tickets are fully transferable. In the event of a cancelled or postponed show, ticket holders will be offered a full refund or transfer to the rescheduled date.</p>
              </div>
            </div>
            <div className="glass rounded-xl p-8">
              <h3 className="font-bebas text-3xl mb-4">TICKET FAQ</h3>
              <Accordion type="single" collapsible>
                {TICKET_FAQ.map((f, i) => (
                  <AccordionItem key={i} value={`t-${i}`} className="border-white/8">
                    <AccordionTrigger className="font-oswald text-left hover:text-[#B15EFF] text-sm">{f.q}</AccordionTrigger>
                    <AccordionContent className="text-[#BDBDBD] font-poppins font-300 text-sm">{f.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

/* ============================= ROSTER PAGE ============================= */
const ROSTER_FILTERS = [
  { k: 'all', l: 'All' }, { k: 'men', l: 'Men' },
  { k: 'women', l: 'Women' }, { k: 'tag', l: 'Tag Teams' },
]
const RosterPage = ({ data, onOpenWrestler }) => {
  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')
  const list = data.wrestlers.filter((w) => {
    const matchF = filter === 'all' ? true : filter === 'champions' ? w.champion : w.category === filter
    const matchQ = !query || `${w.name} ${w.nickname}`.toLowerCase().includes(query.toLowerCase())
    return matchF && matchQ
  })
  return (
    <div>
      <PageBanner overline="Elite Athletes" title="THE ROSTER" img={HERO_SLIDES[2].img} />
      <section className="py-16">
        <div className="container mx-auto px-5">
          <div className="flex flex-col md:flex-row gap-6 items-center justify-between mb-12">
            <div className="flex flex-wrap gap-2">
              {ROSTER_FILTERS.map((f) => (
                <button key={f.k} onClick={() => setFilter(f.k)}
                  className={`px-5 py-2 rounded-full font-oswald uppercase tracking-widest text-xs transition-all ${filter === f.k ? 'bg-gradient-to-r from-[#6A0DAD] to-[#8A2BE2] text-white glow' : 'glass text-[#BDBDBD] hover:text-white'}`}>
                  {f.l}
                </button>
              ))}
            </div>
            <div className="relative w-full md:w-72">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#BDBDBD]" />
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search superstars..."
                className="bg-white/5 border-white/10 pl-10 h-11 text-white placeholder:text-[#BDBDBD]/60" />
            </div>
          </div>
          {list.length === 0 ? (
            <div className="text-center py-20 text-[#BDBDBD] font-poppins">No superstars found.</div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {list.map((w, i) => <WrestlerCard key={w.id} w={w} onOpen={onOpenWrestler} i={i} />)}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

/* ============================= WRESTLER DETAIL ============================= */
const WrestlerDetail = ({ w, data, nav, onOpenWrestler }) => {
  if (!w) return null
  const stats = [
    { l: 'Height', v: w.height }, { l: 'Weight', v: w.weight },
    { l: 'Hometown', v: w.hometown }, { l: 'Debut', v: w.debut },
  ].filter((s) => s.v)
  const hasDetails = !!(w.bio || w.finisher || (w.signatures && w.signatures.length))
  const others = data.wrestlers.filter((x) => x.id !== w.id).slice(0, 4)
  const gallery = [w.image, HERO_SLIDES[0].img, HERO_SLIDES[2].img]
  return (
    <div>
      <section className="relative pt-28 pb-16 overflow-hidden">
        <img src={w.image} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20 blur-sm" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#090909]/80 to-[#090909]" />
        <SmokeOverlay />
        <div className="container mx-auto px-5 relative">
          <button onClick={() => nav('roster')} className="flex items-center gap-1 text-[#BDBDBD] hover:text-white mb-8 font-oswald uppercase tracking-widest text-xs"><ChevronLeft size={16} /> Roster</button>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative rounded-2xl overflow-hidden glow max-w-md">
              <img src={w.image} alt={w.name} className="w-full h-[540px] object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#6A0DAD]/40 to-transparent" />
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}>
              {w.nickname ? <div className="font-oswald uppercase tracking-[0.3em] text-[#B15EFF]">"{w.nickname}"</div> : null}
              <h1 className="font-bebas text-7xl md:text-8xl leading-none">{w.name}</h1>
              {w.bio ? <p className="mt-6 text-[#BDBDBD] text-lg leading-relaxed font-poppins font-300">{w.bio}</p> : null}
              <div className="flex gap-4 mt-6">
                <a href={w.social?.instagram || '#'} className="w-11 h-11 rounded-full glass flex items-center justify-center hover:border-[#8A2BE2] hover:text-[#B15EFF]"><Instagram size={18} /></a>
                <a href={w.social?.twitter || '#'} className="w-11 h-11 rounded-full glass flex items-center justify-center hover:border-[#8A2BE2] hover:text-[#B15EFF]"><Twitter size={18} /></a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {stats.length > 0 && (
        <section className="py-12 border-y border-white/8">
          <div className="container mx-auto px-5 grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((s) => (
              <div key={s.l} className="text-center">
                <div className="font-bebas text-3xl amethyst-text">{s.v}</div>
                <div className="font-oswald uppercase tracking-widest text-xs text-[#BDBDBD] mt-1">{s.l}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="py-16">
        <div className="container mx-auto px-5 grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-10">
            {hasDetails ? (
              <>
                {(w.finisher || (w.signatures && w.signatures.length > 0)) && (
                  <div className="grid md:grid-cols-2 gap-6">
                    {w.finisher && (
                      <div className="glass rounded-xl p-6">
                        <div className="font-oswald uppercase tracking-widest text-xs text-[#B15EFF] mb-2">Finisher</div>
                        <div className="font-bebas text-3xl">{w.finisher}</div>
                      </div>
                    )}
                    {w.signatures && w.signatures.length > 0 && (
                      <div className="glass rounded-xl p-6">
                        <div className="font-oswald uppercase tracking-widest text-xs text-[#B15EFF] mb-3">Signature Moves</div>
                        <ul className="space-y-1">
                          {w.signatures.map((s) => <li key={s} className="flex items-center gap-2 text-[#BDBDBD] font-poppins text-sm"><Zap size={13} className="text-[#8A2BE2]" /> {s}</li>)}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
                <div>
                  <h3 className="font-bebas text-4xl mb-5">GALLERY</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {gallery.map((g, i) => (
                      <div key={i} className="rounded-lg overflow-hidden aspect-[4/5]"><img src={g} alt="" className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" /></div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-bebas text-4xl mb-5">ENTRANCE VIDEO</h3>
                  <VideoThumb img={w.image} label={`${w.name} — Entrance`} />
                </div>
              </>
            ) : (
              <div className="glass rounded-xl p-10 text-center">
                <div className="font-bebas text-4xl">FULL PROFILE COMING SOON</div>
                <p className="mt-3 text-[#BDBDBD] font-poppins font-300">Bio, stats, signature moves, and media for {w.name} will be added soon. Stay tuned.</p>
              </div>
            )}
          </div>
          <aside className="space-y-6">
            <div className="glass rounded-xl p-6">
              <h4 className="font-bebas text-2xl mb-4">UPCOMING MATCHES</h4>
              {data.events.filter((e) => e.status !== 'coming-soon').slice(0, 2).map((e) => (
                <div key={e.id} className="py-3 border-b border-white/8 last:border-0">
                  <div className="font-oswald text-sm text-[#B15EFF]">{e.title}</div>
                  <div className="text-xs text-[#BDBDBD] font-poppins">{fmtShort(e.date)} · {e.venue}</div>
                </div>
              ))}
            </div>
            <div className="glass rounded-xl p-6">
              <h4 className="font-bebas text-2xl mb-4">MORE SUPERSTARS</h4>
              <div className="space-y-3">
                {others.map((o) => (
                  <button key={o.id} onClick={() => onOpenWrestler(o)} className="flex items-center gap-3 w-full text-left group">
                    <img src={o.image} alt={o.name} className="w-12 h-12 rounded-lg object-cover" />
                    <div>
                      <div className="font-oswald text-sm group-hover:text-[#B15EFF] transition-colors">{o.name}</div>
                      <div className="text-xs text-[#BDBDBD]">"{o.nickname}"</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  )
}

/* ============================= MEDIA PAGE ============================= */
const MediaPage = ({ data }) => {
  const [tab, setTab] = useState('photos')
  const photos = [HERO_SLIDES[0].img, HERO_SLIDES[1].img, HERO_SLIDES[2].img, ...data.wrestlers.map((w) => w.image)]
  return (
    <div>
      <PageBanner overline="The Archive" title="MEDIA" img={HERO_SLIDES[1].img} />
      <section className="py-16">
        <div className="container mx-auto px-5">
          <div className="flex justify-center gap-2 mb-12">
            {[{ k: 'photos', l: 'Photo Gallery' }, { k: 'videos', l: 'Video Highlights' }, { k: 'bts', l: 'Behind The Scenes' }].map((t) => (
              <button key={t.k} onClick={() => setTab(t.k)}
                className={`px-6 py-2.5 rounded-full font-oswald uppercase tracking-widest text-xs transition-all ${tab === t.k ? 'bg-gradient-to-r from-[#6A0DAD] to-[#8A2BE2] text-white glow' : 'glass text-[#BDBDBD] hover:text-white'}`}>
                {t.l}
              </button>
            ))}
          </div>
          {tab === 'videos' ? (
            <div className="grid md:grid-cols-2 gap-6">
              {[HERO_SLIDES[0].img, HERO_SLIDES[2].img, data.wrestlers[0]?.image, data.wrestlers[3]?.image].map((im, i) => (
                <VideoThumb key={i} img={im || HERO_SLIDES[0].img} label={['Main Event Recap', 'Championship Moments', 'Superstar Spotlight', 'Best Of BAW'][i]} />
              ))}
            </div>
          ) : (
            <div className="columns-2 md:columns-3 gap-4 space-y-4">
              {(tab === 'bts' ? [...photos].reverse() : photos).map((img, i) => (
                <motion.div key={i} variants={reveal} custom={i % 6} initial="hidden" whileInView="show" viewport={{ once: true }}
                  className="break-inside-avoid rounded-xl overflow-hidden group cursor-pointer relative">
                  <img src={img} alt="" className="w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#6A0DAD]/0 group-hover:from-[#6A0DAD]/50 to-transparent transition-all" />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

/* ============================= NEWS PAGE ============================= */
const NEWS_CATS = ['All', 'Announcements', 'Results', 'Interviews', 'Events', 'Press Releases']
const NewsPage = ({ data }) => {
  const [cat, setCat] = useState('All')
  const list = cat === 'All' ? data.news : data.news.filter((n) => n.category === cat)
  return (
    <div>
      <PageBanner overline="Newsroom" title="NEWS" img={HERO_SLIDES[0].img} />
      <section className="py-16">
        <div className="container mx-auto px-5">
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {NEWS_CATS.map((c) => (
              <button key={c} onClick={() => setCat(c)}
                className={`px-5 py-2 rounded-full font-oswald uppercase tracking-widest text-xs transition-all ${cat === c ? 'bg-gradient-to-r from-[#6A0DAD] to-[#8A2BE2] text-white glow' : 'glass text-[#BDBDBD] hover:text-white'}`}>
                {c}
              </button>
            ))}
          </div>
          {list[0] && (
            <div className="glass rounded-2xl overflow-hidden grid lg:grid-cols-2 mb-12 group cursor-pointer">
              <div className="h-72 lg:h-auto overflow-hidden">
                <img src={list[0].image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
              <div className="p-8 flex flex-col justify-center">
                <span className="bg-[#6A0DAD]/60 w-max px-3 py-1 rounded-full text-[10px] font-oswald uppercase tracking-widest mb-4">{list[0].category}</span>
                <h2 className="font-bebas text-5xl leading-none">{list[0].title}</h2>
                <p className="mt-4 text-[#BDBDBD] font-poppins font-300">{list[0].excerpt}</p>
                <div className="mt-6 text-xs text-[#BDBDBD] font-oswald uppercase tracking-widest">{fmtDate(list[0].date)}</div>
              </div>
            </div>
          )}
          <div className="grid md:grid-cols-3 gap-6">
            {list.slice(1).map((n, i) => <NewsCard key={n.id} n={n} i={i} />)}
          </div>
        </div>
      </section>
    </div>
  )
}

/* ============================= ABOUT PAGE ============================= */
const AboutPage = () => {
  const timeline = [
    { y: '2019', t: 'The Vision', d: 'Black Amethyst Wrestling is founded with a mission to redefine independent wrestling.' },
    { y: '2021', t: 'First Sold-Out Show', d: 'Our debut spectacle sells out in record time, announcing BAW to the world.' },
    { y: '2023', t: 'National Expansion', d: 'BAW takes the show on the road, touring arenas across the country.' },
    { y: '2025', t: 'Broadcast Era', d: 'A landmark broadcast partnership brings BAW to millions of new fans.' },
  ]
  const values = [
    { icon: Trophy, t: 'Excellence', d: 'We demand the very best in and out of the ring.' },
    { icon: Flame, t: 'Passion', d: 'Wrestling is our art, our craft, and our obsession.' },
    { icon: Users, t: 'Community', d: 'We build for the fans who make it all possible.' },
    { icon: Star, t: 'Prestige', d: 'Every detail reflects a premium, world-class brand.' },
  ]
  return (
    <div>
      <PageBanner overline="Our Story" title="ABOUT BAW" img={HERO_SLIDES[2].img} />
      <section className="py-20">
        <div className="container mx-auto px-5">
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-24">
            <div>
              <SectionHeading overline="Who We Are" title="THE HOME OF ELITE WRESTLING" />
              <p className="text-[#BDBDBD] text-lg leading-relaxed font-poppins font-300">Black Amethyst Wrestling is an independent professional wrestling promotion built on cinematic storytelling, premium production, and a relentless commitment to excellence. We showcase elite talent in unforgettable live events designed to feel like nothing else in the industry.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="glass rounded-xl p-8">
                <div className="font-oswald uppercase tracking-widest text-xs text-[#B15EFF] mb-3">Mission</div>
                <p className="text-sm text-[#BDBDBD] font-poppins font-300">To elevate professional wrestling into a premium art form that unites and electrifies fans worldwide.</p>
              </div>
              <div className="glass rounded-xl p-8">
                <div className="font-oswald uppercase tracking-widest text-xs text-[#B15EFF] mb-3">Vision</div>
                <p className="text-sm text-[#BDBDBD] font-poppins font-300">To become the most respected independent wrestling brand on the planet.</p>
              </div>
            </div>
          </div>

          <SectionHeading overline="Brand Values" title="WHAT WE STAND FOR" center />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
            {values.map((v, i) => (
              <motion.div key={v.t} variants={reveal} custom={i} initial="hidden" whileInView="show" viewport={{ once: true }} className="glass rounded-xl p-8 text-center">
                <v.icon size={28} className="mx-auto text-[#B15EFF] mb-4" />
                <h3 className="font-bebas text-2xl">{v.t}</h3>
                <p className="mt-2 text-sm text-[#BDBDBD] font-poppins font-300">{v.d}</p>
              </motion.div>
            ))}
          </div>

          <SectionHeading overline="Milestones" title="OUR JOURNEY" center />
          <div className="relative max-w-3xl mx-auto">
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-[#6A0DAD] to-[#8A2BE2]" />
            {timeline.map((tl, i) => (
              <motion.div key={tl.y} variants={reveal} custom={i} initial="hidden" whileInView="show" viewport={{ once: true }}
                className={`relative flex ${i % 2 === 0 ? 'md:justify-start' : 'md:justify-end'} mb-10 pl-12 md:pl-0`}>
                <div className={`md:w-1/2 ${i % 2 === 0 ? 'md:pr-10 md:text-right' : 'md:pl-10'}`}>
                  <div className="glass rounded-xl p-6">
                    <div className="font-bebas text-4xl amethyst-text">{tl.y}</div>
                    <div className="font-oswald uppercase tracking-widest text-sm mt-1">{tl.t}</div>
                    <p className="mt-2 text-sm text-[#BDBDBD] font-poppins font-300">{tl.d}</p>
                  </div>
                </div>
                <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[#B15EFF] glow pulse-glow" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

/* ============================= CONTACT PAGE ============================= */
const ContactPage = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: 'Business Inquiry', message: '' })
  const [done, setDone] = useState(false)
  const subjects = ['Business Inquiry', 'Booking Requests', 'Talent Applications', 'Media Requests', 'Sponsorship Opportunities']
  const submit = async (e) => {
    e.preventDefault()
    try { await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) }) } catch {}
    setDone(true)
  }
  return (
    <div>
      <PageBanner overline="Get In Touch" title="CONTACT" img={HERO_SLIDES[1].img} />
      <section className="py-16">
        <div className="container mx-auto px-5 grid lg:grid-cols-2 gap-12">
          <div>
            <SectionHeading overline="Reach Out" title="LET'S TALK" />
            {done ? (
              <div className="glass rounded-xl p-8 text-center">
                <Check size={40} className="mx-auto text-[#B15EFF] mb-4" />
                <h3 className="font-bebas text-3xl">MESSAGE SENT</h3>
                <p className="text-[#BDBDBD] font-poppins mt-2">Our team will be in touch shortly. Thank you for reaching out to BAW.</p>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-white/5 border-white/10 h-12 text-white placeholder:text-[#BDBDBD]/60" />
                  <Input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="bg-white/5 border-white/10 h-12 text-white placeholder:text-[#BDBDBD]/60" />
                </div>
                <Input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="bg-white/5 border-white/10 h-12 text-white placeholder:text-[#BDBDBD]/60" />
                <select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full h-12 rounded-md bg-white/5 border border-white/10 px-3 text-white font-poppins text-sm focus:outline-none focus:border-[#8A2BE2]">
                  {subjects.map((s) => <option key={s} className="bg-[#111]">{s}</option>)}
                </select>
                <Textarea required placeholder="Your message" rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="bg-white/5 border-white/10 text-white placeholder:text-[#BDBDBD]/60" />
                <GlowButton type="submit" full><Send size={16} /> Send Message</GlowButton>
              </form>
            )}
          </div>
          <div className="space-y-6">
            <div className="glass rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-3"><div className="w-11 h-11 rounded-lg bg-gradient-to-br from-[#6A0DAD] to-[#8A2BE2] flex items-center justify-center"><Mail size={18} /></div><div><div className="font-oswald uppercase tracking-widest text-xs text-[#BDBDBD]">Email</div><div className="font-poppins">info@blackamethystwrestling.com</div></div></div>
              <div className="flex items-center gap-3"><div className="w-11 h-11 rounded-lg bg-gradient-to-br from-[#6A0DAD] to-[#8A2BE2] flex items-center justify-center"><Phone size={18} /></div><div><div className="font-oswald uppercase tracking-widest text-xs text-[#BDBDBD]">Phone</div><div className="font-poppins">+1 (800) 555-BAW1</div></div></div>
              <div className="flex items-center gap-3"><div className="w-11 h-11 rounded-lg bg-gradient-to-br from-[#6A0DAD] to-[#8A2BE2] flex items-center justify-center"><MapPin size={18} /></div><div><div className="font-oswald uppercase tracking-widest text-xs text-[#BDBDBD]">HQ</div><div className="font-poppins">Los Angeles, California</div></div></div>
              <div className="flex gap-3 pt-2">
                {[Instagram, Youtube, Twitter, Facebook].map((Ic, i) => <a key={i} href="#" className="w-10 h-10 rounded-full glass flex items-center justify-center hover:border-[#8A2BE2] hover:text-[#B15EFF]"><Ic size={16} /></a>)}
              </div>
            </div>
            <div className="rounded-xl overflow-hidden border border-white/8 glow h-64">
              <iframe src="https://maps.google.com/maps?q=Los+Angeles,+CA&output=embed" className="w-full h-full grayscale-[0.4]" loading="lazy" title="map" />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

/* ============================= FOOTER ============================= */
const Footer = ({ nav }) => (
  <footer className="relative border-t border-white/8 pt-16 pb-8 overflow-hidden">
    <SmokeOverlay className="opacity-40" />
    <div className="container mx-auto px-5 relative">
      <div className="grid md:grid-cols-4 gap-10 mb-12">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rotate-45 bg-gradient-to-br from-[#6A0DAD] to-[#B15EFF] rounded-sm glow flex items-center justify-center"><span className="-rotate-45 font-bebas text-lg text-white">BA</span></div>
            <div><div className="font-bebas text-lg">BLACK AMETHYST</div><div className="font-oswald text-[8px] tracking-[0.4em] text-[#B15EFF]">WRESTLING</div></div>
          </div>
          <p className="text-sm text-[#BDBDBD] font-poppins font-300">Where raw energy meets destiny. Independent professional wrestling at its finest.</p>
          <div className="flex gap-3 mt-5">
            {[Instagram, Youtube, Twitter, Facebook].map((Ic, i) => <a key={i} href="#" className="w-9 h-9 rounded-full glass flex items-center justify-center hover:border-[#8A2BE2] hover:text-[#B15EFF]"><Ic size={15} /></a>)}
          </div>
        </div>
        <div>
          <div className="font-oswald uppercase tracking-widest text-sm mb-4">Explore</div>
          <ul className="space-y-2 text-sm text-[#BDBDBD] font-poppins">
            {['Home', 'Events', 'Roster', 'Media', 'News'].map((l) => <li key={l}><button onClick={() => nav(l.toLowerCase())} className="hover:text-[#B15EFF] transition-colors">{l}</button></li>)}
          </ul>
        </div>
        <div>
          <div className="font-oswald uppercase tracking-widest text-sm mb-4">Company</div>
          <ul className="space-y-2 text-sm text-[#BDBDBD] font-poppins">
            {['About', 'Contact', 'Tickets'].map((l) => <li key={l}><button onClick={() => nav(l.toLowerCase())} className="hover:text-[#B15EFF] transition-colors">{l}</button></li>)}
            <li><button onClick={() => nav('merch')} className="hover:text-[#B15EFF] transition-colors">Merch (Soon)</button></li>
            <li><button onClick={() => nav('privacy')} className="hover:text-[#B15EFF] transition-colors">Privacy Policy</button></li>
            <li><button onClick={() => nav('terms')} className="hover:text-[#B15EFF] transition-colors">Terms of Service</button></li>
          </ul>
        </div>
        <div>
          <div className="font-oswald uppercase tracking-widest text-sm mb-4">Newsletter</div>
          <p className="text-sm text-[#BDBDBD] font-poppins font-300 mb-3">Join the Amethyst Nation.</p>
          <GlowButton full variant="outline" className="!py-2.5 text-xs" onClick={() => nav('contact')}><Mail size={14} /> Subscribe</GlowButton>
        </div>
      </div>
      <div className="border-t border-white/8 pt-6 flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-[#BDBDBD] font-poppins">
        <div>© {new Date().getFullYear()} Black Amethyst Wrestling. All Rights Reserved.</div>
        <div className="flex gap-5">
          <button onClick={() => nav('privacy')} className="hover:text-[#B15EFF]">Privacy</button>
          <button onClick={() => nav('terms')} className="hover:text-[#B15EFF]">Terms</button>
        </div>
      </div>
    </div>
  </footer>
)

/* ============================= SIMPLE PAGES ============================= */
const SimplePage = ({ title, overline, children }) => (
  <div>
    <PageBanner overline={overline} title={title} img={HERO_SLIDES[2].img} />
    <section className="py-16"><div className="container mx-auto px-5 max-w-3xl text-[#BDBDBD] font-poppins font-300 leading-relaxed space-y-4">{children}</div></section>
  </div>
)

const MerchPage = () => (
  <div className="min-h-[70vh] flex items-center justify-center relative overflow-hidden">
    <SmokeOverlay />
    <div className="text-center relative px-5">
      <div className="font-oswald uppercase tracking-[0.4em] text-xs text-[#B15EFF] mb-4">The Amethyst Store</div>
      <h1 className="font-bebas text-7xl md:text-9xl amethyst-text">MERCH</h1>
      <div className="font-bebas text-4xl mt-2">COMING SOON</div>
      <p className="text-[#BDBDBD] font-poppins mt-4 max-w-md mx-auto">Premium apparel and collectibles are on the way. Join the Nation to be notified at launch.</p>
    </div>
  </div>
)

/* ============================= LOADING ============================= */
const LoadingScreen = () => (
  <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.7 }}
    className="fixed inset-0 z-[100] bg-[#090909] flex flex-col items-center justify-center">
    <motion.div initial={{ scale: 0.6, opacity: 0, rotate: 45 }} animate={{ scale: 1, opacity: 1, rotate: 45 }} transition={{ duration: 0.8 }}
      className="w-24 h-24 bg-gradient-to-br from-[#6A0DAD] to-[#B15EFF] rounded-lg glow flex items-center justify-center pulse-glow">
      <span className="-rotate-45 font-bebas text-4xl text-white">BA</span>
    </motion.div>
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mt-8 text-center">
      <div className="font-bebas text-3xl tracking-widest">BLACK AMETHYST</div>
      <div className="font-oswald text-xs tracking-[0.5em] text-[#B15EFF] mt-1">WRESTLING</div>
    </motion.div>
    <div className="mt-8 w-40 h-0.5 bg-white/10 rounded-full overflow-hidden">
      <motion.div initial={{ x: '-100%' }} animate={{ x: '100%' }} transition={{ repeat: Infinity, duration: 1.1, ease: 'easeInOut' }} className="h-full w-1/2 bg-gradient-to-r from-transparent via-[#B15EFF] to-transparent" />
    </div>
  </motion.div>
)

/* ============================= APP ============================= */
export default function App() {
  const [loading, setLoading] = useState(true)
  const [route, setRoute] = useState({ page: 'home', id: null })
  const [scrolled, setScrolled] = useState(false)
  const [showTop, setShowTop] = useState(false)
  const [data, setData] = useState({ events: [], wrestlers: [], news: [] })
  const [selectedEvent, setSelectedEvent] = useState(null)
  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, 'change', (v) => { setScrolled(v > 40); setShowTop(v > 600) })

  useEffect(() => {
    const load = async () => {
      try {
        const [e, w, n] = await Promise.all([
          fetch('/api/events').then((r) => r.json()),
          fetch('/api/wrestlers').then((r) => r.json()),
          fetch('/api/news').then((r) => r.json()),
        ])
        setData({ events: Array.isArray(e) ? e : [], wrestlers: Array.isArray(w) ? w : [], news: Array.isArray(n) ? n : [] })
      } catch (err) { console.error(err) }
    }
    load()
    const t = setTimeout(() => setLoading(false), 2000)
    return () => clearTimeout(t)
  }, [])

  const nav = (page, id = null) => { setRoute({ page, id }); window.scrollTo({ top: 0, behavior: 'auto' }) }
  const openEvent = (ev) => nav('event', ev.id)
  const openWrestler = (w) => nav('wrestler', w.id)
  const goTickets = (ev) => { setSelectedEvent(ev || null); nav('tickets') }

  const currentEvent = data.events.find((e) => e.id === route.id)
  const currentWrestler = data.wrestlers.find((w) => w.id === route.id)

  const renderPage = () => {
    switch (route.page) {
      case 'home': return <HomePage nav={nav} data={data} onOpenEvent={openEvent} onOpenWrestler={openWrestler} onTickets={goTickets} />
      case 'events': return <EventsPage data={data} onOpenEvent={openEvent} onTickets={goTickets} />
      case 'event': return <EventDetail ev={currentEvent} data={data} onOpenEvent={openEvent} onTickets={goTickets} nav={nav} />
      case 'tickets': return <TicketsPage selectedEvent={selectedEvent} data={data} />
      case 'roster': return <RosterPage data={data} onOpenWrestler={openWrestler} />
      case 'wrestler': return <WrestlerDetail w={currentWrestler} data={data} nav={nav} onOpenWrestler={openWrestler} />
      case 'media': return <MediaPage data={data} />
      case 'news': return <NewsPage data={data} />
      case 'about': return <AboutPage />
      case 'contact': return <ContactPage />
      case 'merch': return <MerchPage />
      case 'privacy': return <SimplePage overline="Legal" title="PRIVACY POLICY"><p>Black Amethyst Wrestling respects your privacy. We collect only the information necessary to deliver our services, process ticket orders, and communicate event updates. We never sell your personal data to third parties.</p><p>By using this website, you consent to our data practices as described in this policy. For any privacy inquiries, contact info@blackamethystwrestling.com.</p></SimplePage>
      case 'terms': return <SimplePage overline="Legal" title="TERMS OF SERVICE"><p>By accessing this website and purchasing tickets, you agree to abide by all venue rules and BAW policies. All ticket sales are final. Black Amethyst Wrestling reserves the right to refuse entry and to modify event lineups without notice.</p><p>All content, logos, and imagery are the property of Black Amethyst Wrestling and may not be reproduced without permission.</p></SimplePage>
      default: return <HomePage nav={nav} data={data} onOpenEvent={openEvent} onOpenWrestler={openWrestler} onTickets={goTickets} />
    }
  }

  return (
    <>
      <GlobalStyles />
      <AnimatePresence>{loading && <LoadingScreen />}</AnimatePresence>

      <Navbar nav={nav} scrolled={scrolled} current={route.page} />

      <main className="min-h-screen">
        <AnimatePresence mode="wait">
          <motion.div key={route.page + (route.id || '')} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer nav={nav} />

      {/* Floating Buy Tickets */}
      <AnimatePresence>
        {route.page !== 'tickets' && !loading && (
          <motion.button initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6 }}
            onClick={() => goTickets(null)}
            className="fixed bottom-6 right-6 z-40 glow-btn bg-gradient-to-r from-[#6A0DAD] to-[#8A2BE2] text-white font-oswald uppercase tracking-widest text-xs px-5 py-3.5 rounded-full flex items-center gap-2 shadow-lg">
            <Ticket size={16} /> <span className="hidden sm:inline">Buy Tickets</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Back to top */}
      <AnimatePresence>
        {showTop && (
          <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-6 left-6 z-40 w-11 h-11 rounded-full glass hover:border-[#8A2BE2] flex items-center justify-center">
            <ArrowUp size={18} />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  )
}
