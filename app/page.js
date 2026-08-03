'use client'

import { useState, useEffect, useRef, createContext, useContext } from 'react'
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion'
import {
  Menu, X, ArrowRight, ChevronRight, ChevronLeft, MapPin, Calendar, Clock,
  Ticket, Play, Instagram, Youtube, Twitter, Facebook, Search, ArrowUp,
  Trophy, Users, Zap, Mail, Phone, Send, ChevronDown, Check, Star, Share2, Flame,
  ShoppingCart, Plus, Minus, Trash2, Upload, LogOut, Lock, Loader2, Sparkles, Pin, User, Download, Unlock, Tag,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js'

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
    .logo-blend { mix-blend-mode:screen; }
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
    className="group relative rounded-xl overflow-hidden cursor-pointer h-[440px] border border-white/8 bg-[#090909]">
    <img src={w.image} alt={w.name} className={`w-full h-full transition-transform duration-700 group-hover:scale-105 ${w.showName === false ? 'object-contain' : 'object-cover'}`} />
    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-t from-[#6A0DAD]/40 to-transparent pointer-events-none" />
    {w.showName === false ? (
      <div className="absolute inset-0 flex items-end justify-center pb-5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <span className="glass px-4 py-2 rounded-full font-oswald uppercase tracking-widest text-xs text-[#B15EFF]">View Profile</span>
      </div>
    ) : (
      <>
        <div className="absolute inset-0 bg-gradient-to-t from-[#090909] via-[#090909]/40 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-1 group-hover:translate-y-0 transition-transform duration-500">
          {w.nickname ? <div className="font-oswald text-xs uppercase tracking-widest text-[#B15EFF]">"{w.nickname}"</div> : null}
          <h3 className="font-bebas text-3xl leading-none mt-1">{w.name}</h3>
        </div>
      </>
    )}
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
const CartButton = () => {
  const cart = useCart()
  return (
    <button onClick={() => cart.setOpen(true)} aria-label="Cart"
      className="relative w-10 h-10 rounded-full glass flex items-center justify-center hover:border-[#8A2BE2] text-[#F5F5F5]">
      <ShoppingCart size={18} />
      {cart.count > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-gradient-to-r from-[#6A0DAD] to-[#B15EFF] text-[10px] font-bold rounded-full flex items-center justify-center">{cart.count}</span>
      )}
    </button>
  )
}

const Navbar = ({ nav, scrolled, current, onOpen }) => {
  const [menu, setMenu] = useState(false)
  const go = (p) => { setMenu(false); nav(p) }
  return (
    <>
      <motion.header initial={{ y: -80 }} animate={{ y: 0 }} transition={{ duration: 0.6 }}
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${scrolled ? 'glass py-3 shadow-lg shadow-black/40' : 'bg-transparent py-5'}`}>
        <div className="container mx-auto px-5 flex items-center justify-between">
          <div onClick={() => go('home')} className="flex items-center gap-3 cursor-pointer group">
            <img src="/api/asset/logo-t.png" alt="Black Amethyst Wrestling" className="h-12 md:h-14 w-auto transition-transform duration-300 group-hover:scale-105" />
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
          <div className="hidden lg:flex items-center gap-3">
            <button onClick={() => go('account')} title="My Account" className="text-white/90 hover:text-[#B15EFF] transition-colors"><User size={22} /></button>
            <CartButton />
            <GlowButton onClick={() => go('tickets')} className="!px-6 !py-2.5 text-xs"><Ticket size={14} /> Buy Tickets</GlowButton>
          </div>
          <div className="lg:hidden flex items-center gap-3">
            <button onClick={() => go('account')} title="My Account" className="text-white/90 hover:text-[#B15EFF] transition-colors"><User size={22} /></button>
            <CartButton />
            <button className="text-white" onClick={() => setMenu(true)}><Menu size={26} /></button>
          </div>
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
  const [storyIdx, setStoryIdx] = useState(null)
  const scrollBy = (dir) => scroller.current?.scrollBy({ left: dir * 360, behavior: 'smooth' })
  return (
    <div>
      <Hero nav={nav} nextEvent={next} />

      <StoriesBar stories={data.stories} onOpen={setStoryIdx} />
      <StoryViewer stories={data.stories || []} index={storyIdx} onClose={() => setStoryIdx(null)} onIndex={setStoryIdx} />

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
                {(() => {
                  const real = (data.instagram || []).slice(0, 6)
                  const fallback = [HERO_SLIDES[0].img, data.wrestlers[0]?.image, HERO_SLIDES[2].img, data.wrestlers[2]?.image, HERO_SLIDES[1].img, data.wrestlers[4]?.image].map((img) => ({ image: img, link: '' }))
                  const tiles = real.length ? real : fallback
                  return tiles.map((post, i) => {
                    const inner = (
                      <>
                        <img src={post.image} alt={post.caption || ''} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-[#6A0DAD]/0 group-hover:bg-[#6A0DAD]/50 transition-colors flex items-center justify-center">
                          <Instagram size={26} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </>
                    )
                    return post.link ? (
                      <a key={i} href={post.link} target="_blank" rel="noreferrer" className="group relative aspect-square rounded-lg overflow-hidden cursor-pointer">{inner}</a>
                    ) : (
                      <div key={i} className="group relative aspect-square rounded-lg overflow-hidden cursor-pointer">{inner}</div>
                    )
                  })
                })()}
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
            <img src="/api/asset/schedule-poster.jpeg" alt="Black Amethyst Wrestling 2026-2027 Event Schedule" className="w-full h-auto" />
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
const CheckoutModal = ({ tier, ev, onClose }) => {
  const [qty, setQty] = useState(1)
  const [email, setEmail] = useState('')
  const [paid, setPaid] = useState(null)
  const [err, setErr] = useState('')
  const total = (tier.price * qty).toFixed(2)
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID
  return (
    <Dialog open={!!tier} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="bg-[#111] border-white/10 text-[#F5F5F5] max-w-md">
        <DialogHeader>
          <DialogTitle className="font-bebas text-3xl tracking-wide">
            {paid ? 'ORDER CONFIRMED' : `CHECKOUT`}
          </DialogTitle>
        </DialogHeader>
        {paid ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-[#6A0DAD] to-[#8A2BE2] glow flex items-center justify-center mb-4"><Check size={30} /></div>
            <div className="font-bebas text-4xl amethyst-text">YOU'RE IN!</div>
            <p className="text-[#BDBDBD] font-poppins text-sm mt-2">Your {qty} × {tier.name} ticket{qty > 1 ? 's' : ''} for {ev?.title} {qty > 1 ? 'are' : 'is'} confirmed. See you November 21 at Arena Tampico Madero!</p>
            <div className="glass rounded-lg p-3 mt-4 text-xs text-[#BDBDBD] break-all">Confirmation #: {paid.captureId || paid.orderID}</div>
            <GlowButton full className="mt-6" onClick={onClose}>Done</GlowButton>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="glass rounded-lg p-3 flex justify-between items-center">
              <div>
                <div className="font-oswald uppercase tracking-widest text-xs text-[#B15EFF]">{tier.name}</div>
                <div className="text-xs text-[#BDBDBD] font-poppins">{ev?.title} · Nov 21</div>
              </div>
              <div className="font-bebas text-2xl">${tier.price}<span className="text-xs text-[#BDBDBD]">/ea</span></div>
            </div>
            <div>
              <label className="text-xs font-oswald uppercase tracking-widest text-[#BDBDBD]">Quantity</label>
              <div className="flex items-center gap-3 mt-1">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="w-9 h-9 rounded-md glass flex items-center justify-center text-xl">−</button>
                <span className="font-bebas text-2xl w-8 text-center">{qty}</span>
                <button onClick={() => setQty((q) => Math.min(20, q + 1))} className="w-9 h-9 rounded-md glass flex items-center justify-center text-xl">+</button>
              </div>
            </div>
            <div>
              <label className="text-xs font-oswald uppercase tracking-widest text-[#BDBDBD]">Email (for receipt)</label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="you@email.com" className="bg-white/5 border-white/10 h-11 mt-1 text-white placeholder:text-[#BDBDBD]/60" />
            </div>
            <div className="flex justify-between items-center font-bebas text-2xl border-t border-white/8 pt-3">
              <span>TOTAL</span><span className="amethyst-text">${total}</span>
            </div>
            {err && <div className="text-red-400 text-sm font-poppins">{err}</div>}
            <div className="pt-1 rounded-lg overflow-hidden">
              {clientId ? (
                <PayPalScriptProvider options={{ clientId, currency: 'USD', intent: 'capture', components: 'buttons', enableFunding: 'venmo,card' }}>
                  <PayPalButtons
                    style={{ layout: 'vertical', color: 'gold', shape: 'rect', label: 'paypal', height: 45 }}
                    forceReRender={[qty, tier.name]}
                    createOrder={async () => {
                      setErr('')
                      const r = await fetch('/api/paypal/create-order', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tier: tier.name, qty, email, eventId: ev?.id }) })
                      const d = await r.json()
                      if (!d.orderID) { setErr('Could not start checkout. Please try again.'); throw new Error('no order id') }
                      return d.orderID
                    }}
                    onApprove={async (data) => {
                      const r = await fetch('/api/paypal/capture-order', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderID: data.orderID }) })
                      const d = await r.json()
                      if (d.status === 'COMPLETED') setPaid(d)
                      else setErr('Payment could not be completed.')
                    }}
                    onError={(e) => { console.error('PayPal error', e); setErr('A payment error occurred. Please try again.') }}
                  />
                </PayPalScriptProvider>
              ) : (
                <div className="text-sm text-[#BDBDBD] font-poppins text-center py-3">Payments are being configured.</div>
              )}
            </div>
            <p className="text-[10px] text-[#BDBDBD] text-center font-poppins">Secure checkout · Pay with PayPal, Venmo, or credit/debit card.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

const TicketsPage = ({ selectedEvent, data }) => {
  const [promo, setPromo] = useState('')
  const cart = useCart()
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
                <GlowButton full variant={t.popular ? 'primary' : 'outline'} className="mt-8" onClick={() => cart.add(t)}>
                  <Plus size={14} /> Add to Cart
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
  const CAT_LABELS = { men: 'Men', women: 'Women', tag: 'Tag Teams', managers: 'Managers', officials: 'Officials', alumni: 'Alumni' }
  const presentCats = [...new Set(data.wrestlers.map((w) => w.category).filter(Boolean))]
  const filters = [{ k: 'all', l: 'All' }, ...presentCats.map((c) => ({ k: c, l: CAT_LABELS[c] || c }))]
  const list = data.wrestlers.filter((w) => {
    const matchF = filter === 'all' ? true : w.category === filter
    const matchQ = !query || `${w.name} ${w.nickname || ''}`.toLowerCase().includes(query.toLowerCase())
    return matchF && matchQ
  })
  return (
    <div>
      <PageBanner overline="Elite Athletes" title="THE ROSTER" img={HERO_SLIDES[2].img} />
      <section className="py-16">
        <div className="container mx-auto px-5">
          <div className="flex flex-col md:flex-row gap-6 items-center justify-between mb-12">
            <div className="flex flex-wrap gap-2">
              {filters.map((f) => (
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
const MediaPage = ({ data, nav }) => {
  const [tab, setTab] = useState('videos')
  const [playing, setPlaying] = useState(null)
  const photos = [HERO_SLIDES[0].img, HERO_SLIDES[1].img, HERO_SLIDES[2].img, ...data.wrestlers.map((w) => w.image)]
  const videos = data.media || []
  return (
    <div>
      <PageBanner overline="The Archive" title="MEDIA" img={HERO_SLIDES[1].img} />
      {/* YouTube player modal */}
      <AnimatePresence>
        {playing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[95] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setPlaying(null)}>
            <button onClick={() => setPlaying(null)} className="absolute top-5 right-5 z-10 text-white/80 hover:text-white"><X size={30} /></button>
            <div className="w-full max-w-4xl aspect-video rounded-xl overflow-hidden glow border border-white/10" onClick={(e) => e.stopPropagation()}>
              <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${playing}?autoplay=1&rel=0`} title="YouTube video" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <section className="py-16">
        <div className="container mx-auto px-5">
          <div className="flex justify-center gap-2 mb-12">
            {[{ k: 'videos', l: 'Video Highlights' }, { k: 'photos', l: 'Photo Gallery' }, { k: 'bts', l: 'Behind The Scenes' }].map((t) => (
              <button key={t.k} onClick={() => setTab(t.k)}
                className={`px-6 py-2.5 rounded-full font-oswald uppercase tracking-widest text-xs transition-all ${tab === t.k ? 'bg-gradient-to-r from-[#6A0DAD] to-[#8A2BE2] text-white glow' : 'glass text-[#BDBDBD] hover:text-white'}`}>
                {t.l}
              </button>
            ))}
          </div>
          {tab === 'videos' ? (
            videos.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.map((v, i) => (
                  <motion.button key={v.id} variants={reveal} custom={i % 6} initial="hidden" whileInView="show" viewport={{ once: true }}
                    onClick={() => setPlaying(v.videoId)} className="group text-left rounded-xl overflow-hidden glass hover:border-[#8A2BE2] transition-colors">
                    <div className="relative aspect-video overflow-hidden">
                      <img src={v.thumbnail} alt={v.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 flex items-center justify-center transition-colors">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#6A0DAD] to-[#8A2BE2] flex items-center justify-center glow group-hover:scale-110 transition-transform"><Play size={26} className="text-white ml-1" /></div>
                      </div>
                    </div>
                    <div className="p-4 font-oswald uppercase tracking-widest text-sm text-white truncate">{v.title}</div>
                  </motion.button>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-[#BDBDBD] font-poppins">
                <Youtube size={40} className="mx-auto mb-4 text-[#8A2BE2]" />
                No videos yet — check back soon for match highlights and recaps.
              </div>
            )
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
      <LockedVault nav={nav} />
    </div>
  )
}

/* ============================= NEWS PAGE ============================= */
const NewsPage = ({ data }) => {
  const [cat, setCat] = useState('All')
  const NEWS_CATS = ['All', ...Array.from(new Set(data.news.map((n) => n.category).filter(Boolean)))]
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
            <img src="/api/asset/logo-t.png" alt="Black Amethyst Wrestling" className="h-20 w-auto" />
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
            <li><button onClick={() => nav('admin')} className="hover:text-[#B15EFF] transition-colors">Admin</button></li>
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
    <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.9 }} className="relative pulse-glow">
      <div className="absolute inset-0 blur-3xl bg-[#6A0DAD]/50 rounded-full scale-90" />
      <img src="/api/asset/logo-t.png" alt="Black Amethyst Wrestling" className="relative w-52 h-52 md:w-60 md:h-60 object-contain" />
    </motion.div>
    <div className="mt-8 w-40 h-0.5 bg-white/10 rounded-full overflow-hidden">
      <motion.div initial={{ x: '-100%' }} animate={{ x: '100%' }} transition={{ repeat: Infinity, duration: 1.1, ease: 'easeInOut' }} className="h-full w-1/2 bg-gradient-to-r from-transparent via-[#B15EFF] to-transparent" />
    </div>
  </motion.div>
)

/* ============================= CART ============================= */
const CartContext = createContext(null)
const useCart = () => useContext(CartContext)

const CartProvider = ({ children }) => {
  const [items, setItems] = useState([])
  const [open, setOpen] = useState(false)
  const add = (t) => {
    setItems((prev) => {
      const ex = prev.find((i) => i.tier === t.name)
      if (ex) return prev.map((i) => (i.tier === t.name ? { ...i, qty: Math.min(20, i.qty + 1) } : i))
      return [...prev, { tier: t.name, price: t.price, qty: 1 }]
    })
    setOpen(true)
  }
  const setQty = (tier, qty) => setItems((prev) => (qty <= 0 ? prev.filter((i) => i.tier !== tier) : prev.map((i) => (i.tier === tier ? { ...i, qty: Math.min(20, qty) } : i))))
  const remove = (tier) => setItems((prev) => prev.filter((i) => i.tier !== tier))
  const clear = () => setItems([])
  const count = items.reduce((s, i) => s + i.qty, 0)
  const total = items.reduce((s, i) => s + i.price * i.qty, 0)
  return <CartContext.Provider value={{ items, open, setOpen, add, setQty, remove, clear, count, total }}>{children}</CartContext.Provider>
}

const CartDrawer = ({ ev }) => {
  const cart = useCart()
  const [email, setEmail] = useState('')
  const [paid, setPaid] = useState(null)
  const [err, setErr] = useState('')
  const [promoInput, setPromoInput] = useState('')
  const [promo, setPromo] = useState(null)
  const [promoErr, setPromoErr] = useState('')
  const [applying, setApplying] = useState(false)
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID
  const applyPromo = async (silent = false) => {
    const code = promoInput.trim()
    if (!code) return
    if (!silent) setApplying(true)
    setPromoErr('')
    try {
      const r = await fetch('/api/promo/validate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code, items: cart.items.map((i) => ({ tier: i.tier, qty: i.qty })) }) })
      const d = await r.json()
      if (d.valid) { setPromo({ code: code.toUpperCase(), label: d.label, discount: d.discount, total: d.total }); setPromoErr('') }
      else { setPromo(null); setPromoErr(d.error || 'Invalid code') }
    } catch { setPromo(null); setPromoErr('Could not validate code') } finally { if (!silent) setApplying(false) }
  }
  const removePromo = () => { setPromo(null); setPromoInput(''); setPromoErr('') }
  useEffect(() => { if (promo && cart.items.length) applyPromo(true) }, [cart.total, cart.count])
  const grandTotal = promo ? promo.total : cart.total
  const close = () => { cart.setOpen(false); setTimeout(() => { setPaid(null); setErr('') }, 300) }
  return (
    <AnimatePresence>
      {cart.open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={close} className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm" />
          <motion.aside initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'tween', duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-0 right-0 bottom-0 z-[80] w-full max-w-md bg-[#0d0d0d] border-l border-white/10 flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-white/8">
              <div className="flex items-center gap-2"><ShoppingCart size={20} className="text-[#B15EFF]" /><span className="font-bebas text-3xl">YOUR CART</span></div>
              <button onClick={close} className="text-[#BDBDBD] hover:text-white"><X size={24} /></button>
            </div>

            {paid ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#6A0DAD] to-[#8A2BE2] glow flex items-center justify-center mb-4"><Check size={30} /></div>
                <div className="font-bebas text-4xl amethyst-text">ORDER CONFIRMED!</div>
                <p className="text-[#BDBDBD] font-poppins text-sm mt-2">Your tickets for {ev?.title} are confirmed. See you November 21 at Arena Tampico Madero!</p>
                <div className="glass rounded-lg p-3 mt-4 text-xs text-[#BDBDBD] break-all">Confirmation #: {paid.captureId || paid.orderID}</div>
                <GlowButton className="mt-6" onClick={close}>Done</GlowButton>
              </div>
            ) : cart.items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
                <ShoppingCart size={44} className="text-[#BDBDBD]/40 mb-4" />
                <div className="font-bebas text-3xl">YOUR CART IS EMPTY</div>
                <p className="text-[#BDBDBD] font-poppins text-sm mt-2">Add tickets for the Inaugural Show to get started.</p>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                  <div className="text-xs font-oswald uppercase tracking-widest text-[#B15EFF]">{ev?.title} · Nov 21 · Houston, TX</div>
                  {cart.items.map((i) => (
                    <div key={i.tier} className="glass rounded-xl p-4 flex items-center gap-3">
                      <div className="flex-1">
                        <div className="font-oswald uppercase tracking-wide text-sm">{i.tier}</div>
                        <div className="text-[#B15EFF] font-bebas text-xl">${i.price} <span className="text-[#BDBDBD] text-xs font-poppins">each</span></div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => cart.setQty(i.tier, i.qty - 1)} className="w-8 h-8 rounded-md glass flex items-center justify-center"><Minus size={14} /></button>
                        <input
                          type="number" min="1" max="20" value={i.qty}
                          onChange={(e) => cart.setQty(i.tier, parseInt(e.target.value) || 1)}
                          className="w-14 h-8 bg-white/5 border border-white/10 rounded-md text-center font-bebas text-lg text-white focus:outline-none focus:border-[#8A2BE2]"
                          style={{ appearance: 'textfield' }}
                        />
                        <button onClick={() => cart.setQty(i.tier, i.qty + 1)} className="w-8 h-8 rounded-md glass flex items-center justify-center"><Plus size={14} /></button>
                      </div>
                      <button onClick={() => cart.remove(i.tier)} className="text-[#BDBDBD] hover:text-red-400 ml-1"><Trash2 size={16} /></button>
                    </div>
                  ))}
                </div>
                <div className="p-5 border-t border-white/8 space-y-3">
                  {/* Promo code */}
                  {promo ? (
                    <div className="flex items-center justify-between gap-2 rounded-lg border border-[#8A2BE2]/50 bg-[#8A2BE2]/10 px-3 py-2.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <Tag size={16} className="text-[#B15EFF] shrink-0" />
                        <div className="min-w-0">
                          <div className="font-oswald uppercase tracking-wide text-sm text-white truncate">{promo.code} <span className="text-green-400 normal-case font-poppins text-xs">applied</span></div>
                          <div className="text-[11px] text-[#BDBDBD] font-poppins truncate">{promo.label} · −${Number(promo.discount).toFixed(2)}</div>
                        </div>
                      </div>
                      <button onClick={removePromo} className="text-[#BDBDBD] hover:text-red-400 text-xs font-oswald uppercase tracking-wide shrink-0">Remove</button>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <Tag size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#BDBDBD]/70" />
                          <Input
                            value={promoInput}
                            onChange={(e) => { setPromoInput(e.target.value.toUpperCase()); if (promoErr) setPromoErr('') }}
                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); applyPromo() } }}
                            placeholder="Promo code"
                            className="bg-white/5 border-white/10 h-11 pl-9 text-white uppercase tracking-wide placeholder:text-[#BDBDBD]/60 placeholder:normal-case"
                          />
                        </div>
                        <button
                          onClick={() => applyPromo()}
                          disabled={applying || !promoInput.trim()}
                          className="h-11 px-4 rounded-md glass font-oswald uppercase tracking-wide text-sm text-white hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {applying ? <Loader2 size={15} className="animate-spin" /> : 'Apply'}
                        </button>
                      </div>
                      {promoErr && <div className="text-red-400 text-xs font-poppins mt-1.5">{promoErr}</div>}
                    </div>
                  )}
                  {promo && (
                    <div className="space-y-1 text-sm font-poppins">
                      <div className="flex justify-between text-[#BDBDBD]"><span>Subtotal</span><span>${cart.total.toFixed(2)}</span></div>
                      <div className="flex justify-between text-green-400"><span>Discount</span><span>−${Number(promo.discount).toFixed(2)}</span></div>
                    </div>
                  )}
                  <div className="flex justify-between items-center font-bebas text-3xl">
                    <span>TOTAL</span><span className="amethyst-text">${grandTotal.toFixed(2)}</span>
                  </div>
                  <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email for your receipt"
                    className="bg-white/5 border-white/10 h-11 text-white placeholder:text-[#BDBDBD]/60" />
                  {err && <div className="text-red-400 text-sm font-poppins">{err}</div>}
                  {clientId ? (
                    <PayPalScriptProvider options={{ clientId, currency: 'USD', intent: 'capture', components: 'buttons', enableFunding: 'venmo,card' }}>
                      <PayPalButtons
                        style={{ layout: 'vertical', color: 'gold', shape: 'rect', label: 'paypal', height: 45 }}
                        forceReRender={[cart.total, cart.count, promo?.code]}
                        createOrder={async () => {
                          setErr('')
                          const r = await fetch('/api/paypal/create-order', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items: cart.items.map((i) => ({ tier: i.tier, qty: i.qty })), email, eventId: ev?.id, promoCode: promo?.code || undefined }) })
                          const d = await r.json()
                          if (!d.orderID) { setErr('Could not start checkout. Please try again.'); throw new Error('no order id') }
                          return d.orderID
                        }}
                        onApprove={async (data) => {
                          const r = await fetch('/api/paypal/capture-order', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderID: data.orderID }) })
                          const d = await r.json()
                          if (d.status === 'COMPLETED') { setPaid(d); cart.clear() }
                          else setErr('Payment could not be completed.')
                        }}
                        onError={(e) => { console.error('PayPal error', e); setErr('A payment error occurred. Please try again.') }}
                      />
                    </PayPalScriptProvider>
                  ) : <div className="text-sm text-[#BDBDBD] text-center py-2">Payments are being configured.</div>}
                  <p className="text-[10px] text-[#BDBDBD] text-center font-poppins">Secure checkout · PayPal, Venmo, or credit/debit card.</p>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

/* ============================= STORIES ============================= */
const fileToResizedBase64 = (file, maxDim = 1080, quality = 0.82) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = reject
    reader.onload = () => {
      const img = new window.Image()
      img.onerror = reject
      img.onload = () => {
        let { width, height } = img
        if (Math.max(width, height) > maxDim) {
          if (width > height) { height = Math.round((height * maxDim) / width); width = maxDim }
          else { width = Math.round((width * maxDim) / height); height = maxDim }
        }
        const canvas = document.createElement('canvas')
        canvas.width = width; canvas.height = height
        canvas.getContext('2d').drawImage(img, 0, 0, width, height)
        const dataUrl = canvas.toDataURL('image/jpeg', quality)
        resolve({ base64: dataUrl.split(',')[1], contentType: 'image/jpeg', preview: dataUrl })
      }
      img.src = reader.result
    }
    reader.readAsDataURL(file)
  })

const fileToBlurredPreview = (file, maxDim = 500, quality = 0.6) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = reject
    reader.onload = () => {
      const img = new window.Image()
      img.onerror = reject
      img.onload = () => {
        let { width, height } = img
        if (Math.max(width, height) > maxDim) {
          if (width > height) { height = Math.round((height * maxDim) / width); width = maxDim }
          else { width = Math.round((width * maxDim) / height); height = maxDim }
        }
        const canvas = document.createElement('canvas')
        canvas.width = width; canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.filter = 'blur(10px)'
        ctx.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', quality).split(',')[1])
      }
      img.src = reader.result
    }
    reader.readAsDataURL(file)
  })

const StoriesBar = ({ stories, onOpen }) => {
  if (!stories || stories.length === 0) return null
  return (
    <section className="border-b border-white/8 bg-[#0d0d0d]/60">
      <div className="container mx-auto px-5 py-5">
        <div className="flex gap-4 overflow-x-auto hide-scroll">
          {stories.map((s, i) => (
            <button key={s.id} onClick={() => onOpen(i)} className="flex flex-col items-center gap-2 shrink-0 group">
              <div className="p-[3px] rounded-full bg-gradient-to-tr from-[#6A0DAD] via-[#B15EFF] to-[#8A2BE2] group-hover:scale-105 transition-transform">
                <div className="p-[2px] rounded-full bg-[#0d0d0d]">
                  <img src={s.image} alt={s.title || 'Story'} className="w-16 h-16 md:w-[70px] md:h-[70px] rounded-full object-cover" />
                </div>
              </div>
              <span className="text-[10px] font-oswald uppercase tracking-widest text-[#BDBDBD] max-w-[74px] truncate">{s.title || 'Story'}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

const REACTED_KEY = 'baw_story_reactions'
const StoryViewer = ({ stories, index, onClose, onIndex }) => {
  const active = index != null && stories[index]
  const [counts, setCounts] = useState({})
  const [reacted, setReacted] = useState({})
  useEffect(() => {
    try { setReacted(JSON.parse(localStorage.getItem(REACTED_KEY) || '{}')) } catch {}
  }, [])
  useEffect(() => {
    if (index == null) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') onIndex(Math.min(stories.length - 1, index + 1))
      if (e.key === 'ArrowLeft') onIndex(Math.max(0, index - 1))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [index, stories, onClose, onIndex])

  const getCount = (s) => (counts[s.id] != null ? counts[s.id] : (s.reactions || 0))
  const react = async (s) => {
    if (reacted[s.id]) return
    const optimistic = getCount(s) + 1
    setCounts((c) => ({ ...c, [s.id]: optimistic }))
    const nextReacted = { ...reacted, [s.id]: true }
    setReacted(nextReacted)
    try { localStorage.setItem(REACTED_KEY, JSON.stringify(nextReacted)) } catch {}
    try {
      const r = await fetch(`/api/stories/${s.id}/react`, { method: 'POST' })
      const d = await r.json()
      if (d && typeof d.reactions === 'number') setCounts((c) => ({ ...c, [s.id]: d.reactions }))
    } catch {}
  }

  return (
    <AnimatePresence>
      {active && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[95] bg-black/95 backdrop-blur-sm flex items-center justify-center">
          <button onClick={onClose} className="absolute top-5 right-5 z-10 text-white/80 hover:text-white"><X size={30} /></button>
          {/* progress bars */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-1.5 w-[min(420px,80vw)]">
            {stories.map((_, i) => (
              <div key={i} className="h-1 flex-1 rounded-full bg-white/25 overflow-hidden">
                <div className={`h-full ${i <= index ? 'bg-[#B15EFF]' : ''}`} style={{ width: i <= index ? '100%' : 0 }} />
              </div>
            ))}
          </div>
          {index > 0 && (
            <button onClick={() => onIndex(index - 1)} className="absolute left-3 md:left-8 z-10 w-11 h-11 rounded-full glass flex items-center justify-center text-white"><ChevronLeft size={22} /></button>
          )}
          <motion.div key={active.id} initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="relative w-[min(440px,92vw)] max-h-[88vh] rounded-2xl overflow-hidden glow border border-white/10 bg-[#0d0d0d]">
            <img src={active.image} alt={active.title || ''} className="w-full max-h-[70vh] object-contain bg-black" />
            <div className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <Instagram size={16} className="text-[#B15EFF]" />
                <span className="font-oswald uppercase tracking-widest text-xs text-[#B15EFF]">@blackamethystwrestling</span>
              </div>
              {active.caption && <p className="text-sm text-[#E8E8E8] font-poppins font-300 whitespace-pre-line line-clamp-5">{active.caption}</p>}
              <div className="mt-4 flex items-center justify-between">
                <button onClick={() => react(active)} disabled={!!reacted[active.id]}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${reacted[active.id] ? 'border-orange-500/60 bg-orange-500/15 text-orange-400 cursor-default' : 'border-white/15 hover:border-orange-500/60 hover:bg-orange-500/10 text-[#E8E8E8] active:scale-95'}`}>
                  <Flame size={18} className={reacted[active.id] ? 'text-orange-400 fill-orange-400' : ''} />
                  <span className="font-oswald text-sm">{getCount(active)}</span>
                </button>
                {active.link && (
                  <a href={active.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[#B15EFF] font-oswald uppercase tracking-widest text-xs hover:underline">
                    View on Instagram <ArrowRight size={14} />
                  </a>
                )}
              </div>
            </div>
          </motion.div>
          {index < stories.length - 1 && (
            <button onClick={() => onIndex(index + 1)} className="absolute right-3 md:right-8 z-10 w-11 h-11 rounded-full glass flex items-center justify-center text-white"><ChevronRight size={22} /></button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ============================= ADMIN ============================= */
const TOKEN_KEY = 'baw_admin_token'
const adminHeaders = (token, json = true) => ({ ...(json ? { 'Content-Type': 'application/json' } : {}), Authorization: `Bearer ${token}` })

const AdminPage = ({ onDataChange, events = [] }) => {
  const [token, setToken] = useState(() => (typeof window !== 'undefined' ? (localStorage.getItem(TOKEN_KEY) || '') : ''))
  const [pw, setPw] = useState('')
  const [loginErr, setLoginErr] = useState('')
  const [posts, setPosts] = useState([])
  const [stories, setStories] = useState([])
  const [media, setMedia] = useState([])
  const [vault, setVault] = useState([])
  const [mTitle, setMTitle] = useState('')
  const [mUrl, setMUrl] = useState('')
  const [mType, setMType] = useState('video')
  const [mLocked, setMLocked] = useState(false)
  const [mPrice, setMPrice] = useState('')
  const [mPhoto, setMPhoto] = useState(null)
  const [mBusy, setMBusy] = useState(false)
  const mFileRef = useRef(null)
  // Event commemorative (auto-granted on ticket purchase)
  const [ecEvent, setEcEvent] = useState('')
  const [ecTitle, setEcTitle] = useState('')
  const [ecImg, setEcImg] = useState(null)
  const [ecBusy, setEcBusy] = useState(false)
  const [eventCommems, setEventCommems] = useState([])
  const ecFileRef = useRef(null)
  // Promo codes + settings
  const [promos, setPromos] = useState([])
  const [pCode, setPCode] = useState('')
  const [pType, setPType] = useState('percent')
  const [pValue, setPValue] = useState('')
  const [pMax, setPMax] = useState('')
  const [pBusy, setPBusy] = useState(false)
  const [ticketLimit, setTicketLimit] = useState('')
  const [caption, setCaption] = useState('')
  const [link, setLink] = useState('')
  const [imgData, setImgData] = useState(null)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  const fileRef = useRef(null)
  // Direct-story form
  const [sCaption, setSCaption] = useState('')
  const [sLink, setSLink] = useState('')
  const [sImg, setSImg] = useState(null)
  const [sAsNews, setSAsNews] = useState(true)
  const [sFeatured, setSFeatured] = useState(false)
  const [sSchedule, setSSchedule] = useState('')
  const [sBusy, setSBusy] = useState(false)
  const sFileRef = useRef(null)

  const loadLists = async (tok = token) => {
    try {
      const [p, s, m, v, pr, st] = await Promise.all([
        fetch('/api/instagram').then((r) => r.json()),
        fetch('/api/admin/stories', { headers: adminHeaders(tok, false) }).then((r) => r.json()),
        fetch('/api/media').then((r) => r.json()),
        fetch('/api/admin/locked-media', { headers: adminHeaders(tok, false) }).then((r) => r.json()),
        fetch('/api/admin/promos', { headers: adminHeaders(tok, false) }).then((r) => r.json()),
        fetch('/api/admin/settings', { headers: adminHeaders(tok, false) }).then((r) => r.json()),
      ])
      setPosts(Array.isArray(p) ? p : [])
      setStories(Array.isArray(s) ? s : [])
      setMedia(Array.isArray(m) ? m : [])
      setVault(Array.isArray(v) ? v : [])
      setPromos(Array.isArray(pr) ? pr : [])
      setTicketLimit(st && st.ticketLimitPerOrder ? String(st.ticketLimitPerOrder) : '0')
    } catch {}
  }

  const addPromo = async (e) => {
    e.preventDefault()
    if (!pCode.trim()) { flash('Enter a code.'); return }
    if (pType !== 'bogo' && (!parseFloat(pValue) || parseFloat(pValue) <= 0)) { flash('Enter a discount value.'); return }
    setPBusy(true)
    try {
      const r = await fetch('/api/admin/promos', { method: 'POST', headers: adminHeaders(token), body: JSON.stringify({ code: pCode, type: pType, value: parseFloat(pValue) || 0, maxUses: parseInt(pMax) || 0 }) })
      const d = await r.json()
      if (r.ok) { setPCode(''); setPValue(''); setPMax(''); flash('Promo code created!'); await loadLists() }
      else flash(d.error || 'Failed to create code')
    } finally { setPBusy(false) }
  }
  const togglePromo = async (id) => { await fetch(`/api/admin/promos/${id}/toggle`, { method: 'POST', headers: adminHeaders(token, false) }); await loadLists() }
  const delPromo = async (id) => { await fetch(`/api/admin/promos/${id}`, { method: 'DELETE', headers: adminHeaders(token, false) }); await loadLists() }
  const saveLimit = async () => {
    await fetch('/api/admin/settings', { method: 'POST', headers: adminHeaders(token), body: JSON.stringify({ ticketLimitPerOrder: parseInt(ticketLimit) || 0 }) })
    flash('Ticket limit saved!')
  }

  const pickMediaPhoto = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try { const res = await fileToResizedBase64(file); const preview = await fileToBlurredPreview(file); setMPhoto({ ...res, previewBase64: preview }) } catch { flash('Could not read image') }
  }

  const addMedia = async (e) => {
    e.preventDefault()
    setMBusy(true)
    try {
      let r, d
      if (mLocked) {
        const price = parseFloat(mPrice)
        if (!price || price <= 0) { flash('Set a price greater than 0 for locked media.'); setMBusy(false); return }
        if (mType === 'video') {
          if (!mUrl.trim()) { flash('Paste a YouTube link.'); setMBusy(false); return }
          r = await fetch('/api/admin/locked-media', { method: 'POST', headers: adminHeaders(token), body: JSON.stringify({ kind: 'video', title: mTitle, price, youtubeUrl: mUrl }) })
        } else {
          if (!mPhoto) { flash('Upload the photo to lock.'); setMBusy(false); return }
          r = await fetch('/api/admin/locked-media', { method: 'POST', headers: adminHeaders(token), body: JSON.stringify({ kind: 'photo', title: mTitle, price, fullBase64: mPhoto.base64, fullContentType: mPhoto.contentType, previewBase64: mPhoto.previewBase64, previewContentType: 'image/jpeg' }) })
        }
      } else {
        if (mType !== 'video') { flash('Free photos are shown automatically — only videos or LOCKED photos can be added here.'); setMBusy(false); return }
        if (!mUrl.trim()) { flash('Paste a YouTube link.'); setMBusy(false); return }
        r = await fetch('/api/admin/media', { method: 'POST', headers: adminHeaders(token), body: JSON.stringify({ title: mTitle, youtubeUrl: mUrl }) })
      }
      d = await r.json()
      if (r.ok) { setMTitle(''); setMUrl(''); setMPrice(''); setMPhoto(null); setMLocked(false); if (mFileRef.current) mFileRef.current.value = ''; flash(mLocked ? 'Locked media added to The Vault!' : 'Video added!'); await loadLists(); onDataChange?.() }
      else flash(d.error || 'Failed to add media')
    } finally { setMBusy(false) }
  }
  const delMedia = async (id) => {
    await fetch(`/api/admin/media/${id}`, { method: 'DELETE', headers: adminHeaders(token, false) })
    await loadLists(); onDataChange?.()
  }
  const delVault = async (id) => {
    await fetch(`/api/admin/locked-media/${id}`, { method: 'DELETE', headers: adminHeaders(token, false) })
    await loadLists(); onDataChange?.()
  }

  const pickEcImage = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try { const res = await fileToResizedBase64(file); setEcImg(res) } catch { flash('Could not read image') }
  }
  const addEventCommem = async (e) => {
    e.preventDefault()
    if (!ecEvent) { flash('Choose an event.'); return }
    const existing = eventCommems.find((c) => c.eventId === ecEvent)
    if (!ecImg && !existing) { flash('Upload a card image.'); return }
    setEcBusy(true)
    try {
      const r = await fetch('/api/admin/event-commemorative', { method: 'POST', headers: adminHeaders(token), body: JSON.stringify({ eventId: ecEvent, title: ecTitle, imageBase64: ecImg?.base64, contentType: ecImg?.contentType }) })
      const d = await r.json()
      if (r.ok) { setEcTitle(''); setEcImg(null); if (ecFileRef.current) ecFileRef.current.value = ''; flash('Commemorative set — buyers of this show get it automatically!'); await loadCommems() }
      else flash(d.error || 'Failed to save')
    } finally { setEcBusy(false) }
  }
  const loadCommems = async () => {
    try { const c = await fetch('/api/admin/event-commemoratives', { headers: adminHeaders(token, false) }).then((r) => r.json()); setEventCommems(Array.isArray(c) ? c : []) } catch {}
  }
  useEffect(() => { if (token) loadCommems() }, [token])
  const delEventCommem = async (eventId) => {
    await fetch(`/api/admin/event-commemoratives/${eventId}`, { method: 'DELETE', headers: adminHeaders(token, false) })
    await loadCommems()
  }

  useEffect(() => {
    if (!token) return
    fetch('/api/admin/me', { headers: adminHeaders(token, false) })
      .then((r) => r.json())
      .then((d) => { if (d.authenticated) { loadLists(token) } else { localStorage.removeItem(TOKEN_KEY); setToken('') } })
      .catch(() => {})
  }, [])

  const login = async (e) => {
    e.preventDefault()
    setLoginErr('')
    const r = await fetch('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: pw }) })
    const d = await r.json()
    if (d.token) { localStorage.setItem(TOKEN_KEY, d.token); setToken(d.token); setPw(''); loadLists(d.token) }
    else setLoginErr(d.error || 'Login failed')
  }

  const logout = async () => {
    try { await fetch('/api/admin/logout', { method: 'POST', headers: adminHeaders(token, false) }) } catch {}
    localStorage.removeItem(TOKEN_KEY); setToken('')
  }

  const pickImage = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try { const res = await fileToResizedBase64(file); setImgData(res) } catch { setMsg('Could not read image') }
  }

  const flash = (m) => { setMsg(m); setTimeout(() => setMsg(''), 3000) }

  const addPost = async (e) => {
    e.preventDefault()
    if (!imgData) { flash('Please choose an image first.'); return }
    setBusy(true)
    try {
      const r = await fetch('/api/admin/instagram', { method: 'POST', headers: adminHeaders(token), body: JSON.stringify({ link, caption, imageBase64: imgData.base64, contentType: imgData.contentType }) })
      const d = await r.json()
      if (r.ok) { setCaption(''); setLink(''); setImgData(null); if (fileRef.current) fileRef.current.value = ''; flash('Post added!'); await loadLists(); onDataChange?.() }
      else flash(d.error || 'Failed to add post')
    } finally { setBusy(false) }
  }

  const promote = async (id) => {    setBusy(true)
    try {
      await fetch(`/api/admin/instagram/${id}/promote`, { method: 'POST', headers: adminHeaders(token), body: JSON.stringify({ asNews: true, asStory: true }) })
      flash('Turned into a Story + News article!'); await loadLists(); onDataChange?.()
    } finally { setBusy(false) }
  }

  const delPost = async (id) => {
    await fetch(`/api/admin/instagram/${id}`, { method: 'DELETE', headers: adminHeaders(token, false) })
    await loadLists(); onDataChange?.()
  }
  const delStory = async (id) => {
    await fetch(`/api/admin/stories/${id}`, { method: 'DELETE', headers: adminHeaders(token, false) })
    await loadLists(); onDataChange?.()
  }

  const pickStoryImage = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try { const res = await fileToResizedBase64(file); setSImg(res) } catch { flash('Could not read image') }
  }

  const addStory = async (e) => {
    e.preventDefault()
    if (!sImg) { flash('Please choose an image for the story.'); return }
    setSBusy(true)
    try {
      const publishAt = sSchedule ? new Date(sSchedule).toISOString() : null
      const r = await fetch('/api/admin/stories', { method: 'POST', headers: adminHeaders(token), body: JSON.stringify({ caption: sCaption, link: sLink, asNews: sAsNews, featured: sFeatured, publishAt, imageBase64: sImg.base64, contentType: sImg.contentType }) })
      const d = await r.json()
      if (r.ok) {
        setSCaption(''); setSLink(''); setSImg(null); setSFeatured(false); setSSchedule(''); if (sFileRef.current) sFileRef.current.value = ''
        flash(publishAt && new Date(publishAt) > new Date() ? 'Story scheduled!' : (sAsNews ? 'Story added (and posted to News)!' : 'Story added!'))
        await loadLists(); onDataChange?.()
      } else flash(d.error || 'Failed to add story')
    } finally { setSBusy(false) }
  }

  const toggleFeature = async (story) => {
    await fetch(`/api/admin/stories/${story.id}/feature`, { method: 'POST', headers: adminHeaders(token), body: JSON.stringify({ featured: !story.featured }) })
    await loadLists(); onDataChange?.()
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5 pt-24 pb-16 relative overflow-hidden">
        <SmokeOverlay />
        <form onSubmit={login} className="relative glass rounded-2xl p-8 w-full max-w-sm glow">
          <div className="flex flex-col items-center mb-6">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#6A0DAD] to-[#8A2BE2] flex items-center justify-center glow mb-3"><Lock size={22} /></div>
            <h1 className="font-bebas text-4xl">ADMIN LOGIN</h1>
            <p className="text-[#BDBDBD] font-poppins text-sm mt-1">Black Amethyst Wrestling</p>
          </div>
          <label className="text-xs font-oswald uppercase tracking-widest text-[#BDBDBD]">Password</label>
          <Input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Enter admin password"
            className="bg-white/5 border-white/10 h-12 mt-1 text-white placeholder:text-[#BDBDBD]/60" />
          {loginErr && <div className="text-red-400 text-sm font-poppins mt-2">{loginErr}</div>}
          <GlowButton type="submit" full className="mt-5">Log In</GlowButton>
        </form>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-28 pb-20">
      <div className="container mx-auto px-5">
        <div className="flex items-center justify-between mb-10">
          <div>
            <div className="font-oswald uppercase tracking-[0.4em] text-xs text-[#B15EFF] mb-2">Content Manager</div>
            <h1 className="font-bebas text-6xl leading-none">ADMIN DASHBOARD</h1>
          </div>
          <GlowButton variant="outline" onClick={logout}><LogOut size={16} /> Log Out</GlowButton>
        </div>

        {msg && <div className="mb-6 glass rounded-lg p-3 text-[#B15EFF] font-poppins text-sm inline-flex items-center gap-2"><Check size={16} /> {msg}</div>}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Add post */}
          <div className="glass rounded-2xl p-6">
            <h2 className="font-bebas text-3xl mb-4 flex items-center gap-2"><Instagram size={22} className="text-[#B15EFF]" /> ADD INSTAGRAM POST</h2>
            <form onSubmit={addPost} className="space-y-4">
              <div>
                <label className="text-xs font-oswald uppercase tracking-widest text-[#BDBDBD]">Instagram Post Link (optional)</label>
                <Input value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://www.instagram.com/p/..." className="bg-white/5 border-white/10 h-11 mt-1 text-white placeholder:text-[#BDBDBD]/60" />
              </div>
              <div>
                <label className="text-xs font-oswald uppercase tracking-widest text-[#BDBDBD]">Caption</label>
                <Textarea value={caption} onChange={(e) => setCaption(e.target.value)} rows={4} placeholder="Write the caption / story text..." className="bg-white/5 border-white/10 mt-1 text-white placeholder:text-[#BDBDBD]/60" />
              </div>
              <div>
                <label className="text-xs font-oswald uppercase tracking-widest text-[#BDBDBD]">Image</label>
                <div onClick={() => fileRef.current?.click()} className="mt-1 border border-dashed border-white/20 rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:border-[#8A2BE2] transition-colors">
                  {imgData ? (
                    <img src={imgData.preview} alt="preview" className="w-20 h-20 rounded-lg object-cover" />
                  ) : (
                    <div className="w-20 h-20 rounded-lg bg-white/5 flex items-center justify-center"><Upload size={22} className="text-[#BDBDBD]" /></div>
                  )}
                  <div className="text-sm text-[#BDBDBD] font-poppins">{imgData ? 'Image selected — tap to change' : 'Tap to upload the post image (screenshot or saved photo)'}</div>
                </div>
                <input ref={fileRef} type="file" accept="image/*" onChange={pickImage} className="hidden" />
              </div>
              <GlowButton type="submit" full className={busy ? 'opacity-70 pointer-events-none' : ''}>
                {busy ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} Add to Instagram Grid
              </GlowButton>
            </form>
          </div>

          {/* Manage */}
          <div className="space-y-8">
            <div className="glass rounded-2xl p-6">
              <h2 className="font-bebas text-3xl mb-4">POSTS ({posts.length})</h2>
              {posts.length === 0 ? <p className="text-[#BDBDBD] font-poppins text-sm">No posts yet. Add one on the left.</p> : (
                <div className="space-y-3 max-h-[360px] overflow-y-auto hide-scroll">
                  {posts.map((p) => (
                    <div key={p.id} className="flex items-center gap-3 glass rounded-xl p-3">
                      <img src={p.image} alt="" className="w-14 h-14 rounded-lg object-cover shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-poppins text-[#E8E8E8] truncate">{p.caption || '(no caption)'}</div>
                        {p.promoted && <span className="text-[10px] font-oswald uppercase tracking-widest text-[#B15EFF]">Promoted</span>}
                      </div>
                      <button onClick={() => promote(p.id)} title="Make into a Story + News" className="px-3 py-2 rounded-md bg-gradient-to-r from-[#6A0DAD] to-[#8A2BE2] text-white text-xs font-oswald uppercase tracking-widest inline-flex items-center gap-1"><Sparkles size={14} /> Story</button>
                      <button onClick={() => delPost(p.id)} className="text-[#BDBDBD] hover:text-red-400 shrink-0"><Trash2 size={16} /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="glass rounded-2xl p-6">
              <h2 className="font-bebas text-3xl mb-4">STORIES ({stories.length})</h2>
              {stories.length === 0 ? <p className="text-[#BDBDBD] font-poppins text-sm">No stories yet. Add one directly below, or use the “Story” button on a post.</p> : (
                <div className="space-y-3 max-h-[240px] overflow-y-auto hide-scroll">
                  {stories.map((s) => (
                    <div key={s.id} className="flex items-center gap-3 glass rounded-xl p-3">
                      <img src={s.image} alt="" className="w-12 h-12 rounded-full object-cover shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-poppins text-[#E8E8E8] truncate">{s.title || s.caption || 'Story'}</div>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          {s.featured && <span className="inline-flex items-center gap-1 text-[10px] font-oswald uppercase tracking-widest text-[#B15EFF]"><Pin size={11} /> Pinned</span>}
                          {s.scheduled && <span className="inline-flex items-center gap-1 text-[10px] font-oswald uppercase tracking-widest text-amber-400"><Clock size={11} /> {new Date(s.publishAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>}
                          {s.reactions > 0 && <span className="inline-flex items-center gap-1 text-[10px] font-oswald uppercase tracking-widest text-[#BDBDBD]"><Flame size={11} className="text-orange-400" /> {s.reactions}</span>}
                        </div>
                      </div>
                      <button onClick={() => toggleFeature(s)} title={s.featured ? 'Unpin' : 'Pin to front'} className={`shrink-0 ${s.featured ? 'text-[#B15EFF]' : 'text-[#BDBDBD] hover:text-[#B15EFF]'}`}><Pin size={16} /></button>
                      <button onClick={() => delStory(s.id)} className="text-[#BDBDBD] hover:text-red-400 shrink-0"><Trash2 size={16} /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Add Story directly */}
          <div className="glass rounded-2xl p-6">
            <h2 className="font-bebas text-3xl mb-4 flex items-center gap-2"><Sparkles size={20} className="text-[#B15EFF]" /> ADD STORY DIRECTLY</h2>
            <form onSubmit={addStory} className="space-y-4">
              <div>
                <label className="text-xs font-oswald uppercase tracking-widest text-[#BDBDBD]">Caption / Title</label>
                <Textarea value={sCaption} onChange={(e) => setSCaption(e.target.value)} rows={3} placeholder="Write your story text..." className="bg-white/5 border-white/10 mt-1 text-white placeholder:text-[#BDBDBD]/60" />
              </div>
              <div>
                <label className="text-xs font-oswald uppercase tracking-widest text-[#BDBDBD]">Link (optional)</label>
                <Input value={sLink} onChange={(e) => setSLink(e.target.value)} placeholder="https://..." className="bg-white/5 border-white/10 h-11 mt-1 text-white placeholder:text-[#BDBDBD]/60" />
              </div>
              <div>
                <label className="text-xs font-oswald uppercase tracking-widest text-[#BDBDBD]">Image</label>
                <div onClick={() => sFileRef.current?.click()} className="mt-1 border border-dashed border-white/20 rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:border-[#8A2BE2] transition-colors">
                  {sImg ? <img src={sImg.preview} alt="preview" className="w-20 h-20 rounded-lg object-cover" /> : <div className="w-20 h-20 rounded-lg bg-white/5 flex items-center justify-center"><Upload size={22} className="text-[#BDBDBD]" /></div>}
                  <div className="text-sm text-[#BDBDBD] font-poppins">{sImg ? 'Image selected — tap to change' : 'Tap to upload a story image'}</div>
                </div>
                <input ref={sFileRef} type="file" accept="image/*" onChange={pickStoryImage} className="hidden" />
              </div>
              <div>
                <label className="text-xs font-oswald uppercase tracking-widest text-[#BDBDBD]">Schedule for (optional)</label>
                <Input type="datetime-local" value={sSchedule} onChange={(e) => setSSchedule(e.target.value)} className="bg-white/5 border-white/10 h-11 mt-1 text-white [color-scheme:dark]" />
                <p className="text-[11px] text-[#BDBDBD]/70 font-poppins mt-1">Leave blank to publish now. Scheduled stories stay hidden on the site until this time.</p>
              </div>
              <label className="flex items-center gap-2 text-sm text-[#BDBDBD] font-poppins cursor-pointer">
                <input type="checkbox" checked={sAsNews} onChange={(e) => setSAsNews(e.target.checked)} className="accent-[#8A2BE2] w-4 h-4" />
                Also publish to Newsroom
              </label>
              <label className="flex items-center gap-2 text-sm text-[#BDBDBD] font-poppins cursor-pointer">
                <input type="checkbox" checked={sFeatured} onChange={(e) => setSFeatured(e.target.checked)} className="accent-[#8A2BE2] w-4 h-4" />
                Pin to front of Stories bar
              </label>
              <GlowButton type="submit" full className={sBusy ? 'opacity-70 pointer-events-none' : ''}>
                {sBusy ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />} Add Story
              </GlowButton>
            </form>
          </div>

          {/* Media Manager (videos + locked vault) */}
          <div className="glass rounded-2xl p-6">
            <h2 className="font-bebas text-3xl mb-4 flex items-center gap-2"><Youtube size={22} className="text-[#B15EFF]" /> MEDIA MANAGER</h2>
            <form onSubmit={addMedia} className="space-y-4">
              <div className="flex gap-2">
                {[{ k: 'video', l: 'YouTube Video' }, { k: 'photo', l: 'Photo' }].map((t) => (
                  <button type="button" key={t.k} onClick={() => setMType(t.k)} className={`flex-1 py-2 rounded-full font-oswald uppercase tracking-widest text-xs transition-all ${mType === t.k ? 'bg-gradient-to-r from-[#6A0DAD] to-[#8A2BE2] text-white' : 'glass text-[#BDBDBD]'}`}>{t.l}</button>
                ))}
              </div>
              <div>
                <label className="text-xs font-oswald uppercase tracking-widest text-[#BDBDBD]">Title</label>
                <Input value={mTitle} onChange={(e) => setMTitle(e.target.value)} placeholder="e.g. Inaugural Show Highlights" className="bg-white/5 border-white/10 h-11 mt-1 text-white placeholder:text-[#BDBDBD]/60" />
              </div>
              {mType === 'video' ? (
                <div>
                  <label className="text-xs font-oswald uppercase tracking-widest text-[#BDBDBD]">YouTube Link</label>
                  <Input value={mUrl} onChange={(e) => setMUrl(e.target.value)} placeholder="https://youtu.be/..." className="bg-white/5 border-white/10 h-11 mt-1 text-white placeholder:text-[#BDBDBD]/60" />
                </div>
              ) : (
                <div>
                  <label className="text-xs font-oswald uppercase tracking-widest text-[#BDBDBD]">Photo</label>
                  <div onClick={() => mFileRef.current?.click()} className="mt-1 border border-dashed border-white/20 rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:border-[#8A2BE2] transition-colors">
                    {mPhoto ? <img src={mPhoto.preview} alt="preview" className="w-16 h-16 rounded-lg object-cover" /> : <div className="w-16 h-16 rounded-lg bg-white/5 flex items-center justify-center"><Upload size={20} className="text-[#BDBDBD]" /></div>}
                    <div className="text-sm text-[#BDBDBD] font-poppins">{mPhoto ? 'Image selected — tap to change' : 'Tap to upload photo'}</div>
                  </div>
                  <input ref={mFileRef} type="file" accept="image/*" onChange={pickMediaPhoto} className="hidden" />
                </div>
              )}
              {/* Lock toggle */}
              <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${mLocked ? 'border-[#8A2BE2] bg-[#8A2BE2]/10' : 'border-white/10'}`}>
                <input type="checkbox" checked={mLocked} onChange={(e) => setMLocked(e.target.checked)} className="accent-[#8A2BE2] w-4 h-4" />
                <span className="flex items-center gap-2 text-sm font-oswald uppercase tracking-widest text-white"><Lock size={15} className={mLocked ? 'text-[#B15EFF]' : 'text-[#BDBDBD]'} /> Lock behind paywall</span>
              </label>
              {mLocked && (
                <div>
                  <label className="text-xs font-oswald uppercase tracking-widest text-[#BDBDBD]">Unlock Price (USD)</label>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[#BDBDBD] font-bebas text-2xl">$</span>
                    <Input type="number" step="0.01" min="0" value={mPrice} onChange={(e) => setMPrice(e.target.value)} placeholder="5.00" className="bg-white/5 border-white/10 h-11 text-white placeholder:text-[#BDBDBD]/60" />
                  </div>
                  <p className="text-[11px] text-[#BDBDBD]/70 font-poppins mt-1">Fans pay this once via PayPal to unlock it forever in their account.</p>
                </div>
              )}
              <GlowButton type="submit" full className={mBusy ? 'opacity-70 pointer-events-none' : ''}>
                {mBusy ? <Loader2 size={16} className="animate-spin" /> : (mLocked ? <Lock size={16} /> : <Plus size={16} />)} {mLocked ? 'Add to The Vault' : 'Add Video'}
              </GlowButton>
            </form>
            <div className="mt-5 grid gap-5">
              <div>
                <h3 className="font-bebas text-2xl mb-3">FREE VIDEOS ({media.length})</h3>
                {media.length === 0 ? <p className="text-[#BDBDBD] font-poppins text-sm">No free videos yet.</p> : (
                  <div className="space-y-3 max-h-[180px] overflow-y-auto hide-scroll">
                    {media.map((v) => (
                      <div key={v.id} className="flex items-center gap-3 glass rounded-xl p-2">
                        <img src={v.thumbnail} alt="" className="w-16 h-10 rounded object-cover shrink-0" />
                        <div className="flex-1 min-w-0 text-sm font-poppins text-[#E8E8E8] truncate">{v.title}</div>
                        <button onClick={() => delMedia(v.id)} className="text-[#BDBDBD] hover:text-red-400 shrink-0"><Trash2 size={16} /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-bebas text-2xl mb-3 flex items-center gap-2"><Lock size={16} className="text-[#B15EFF]" /> THE VAULT ({vault.length})</h3>
                {vault.length === 0 ? <p className="text-[#BDBDBD] font-poppins text-sm">No locked media yet.</p> : (
                  <div className="space-y-3 max-h-[180px] overflow-y-auto hide-scroll">
                    {vault.map((v) => (
                      <div key={v.id} className="flex items-center gap-3 glass rounded-xl p-2">
                        <img src={v.previewImage} alt="" className="w-12 h-12 rounded object-cover shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-poppins text-[#E8E8E8] truncate">{v.title}</div>
                          <div className="text-[10px] font-oswald uppercase tracking-widest text-[#B15EFF]">{v.kind} · ${Number(v.price).toFixed(2)}</div>
                        </div>
                        <button onClick={() => delVault(v.id)} className="text-[#BDBDBD] hover:text-red-400 shrink-0"><Trash2 size={16} /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Event Commemoratives (auto-granted on ticket purchase) */}
          <div className="glass rounded-2xl p-6">
            <h2 className="font-bebas text-3xl mb-2 flex items-center gap-2"><Star size={20} className="text-[#B15EFF]" /> EVENT COMMEMORATIVES</h2>
            <p className="text-[#BDBDBD] font-poppins text-sm mb-4">Pick an announced show and upload its commemorative card. Anyone who buys tickets for that show automatically gets it in their “My Account”.</p>
            <form onSubmit={addEventCommem} className="space-y-4">
              <div>
                <label className="text-xs font-oswald uppercase tracking-widest text-[#BDBDBD]">Event / Show</label>
                <select value={ecEvent} onChange={(e) => setEcEvent(e.target.value)} className="w-full h-11 mt-1 rounded-md bg-white/5 border border-white/10 text-white px-3 text-sm">
                  <option value="" className="bg-[#0d0d0d]">Select a show…</option>
                  {events.map((ev) => (
                    <option key={ev.id} value={ev.id} className="bg-[#0d0d0d]">{ev.title}{ev.date ? ` — ${ev.date}` : ''}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-oswald uppercase tracking-widest text-[#BDBDBD]">Card Title</label>
                <Input value={ecTitle} onChange={(e) => setEcTitle(e.target.value)} placeholder="e.g. Inaugural Show Commemorative Ticket" className="bg-white/5 border-white/10 h-11 mt-1 text-white placeholder:text-[#BDBDBD]/60" />
              </div>
              <div>
                <label className="text-xs font-oswald uppercase tracking-widest text-[#BDBDBD]">Card Image</label>
                <div onClick={() => ecFileRef.current?.click()} className="mt-1 border border-dashed border-white/20 rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:border-[#8A2BE2] transition-colors">
                  {ecImg ? <img src={ecImg.preview} alt="preview" className="w-16 h-20 rounded-lg object-cover" /> : <div className="w-16 h-20 rounded-lg bg-white/5 flex items-center justify-center"><Upload size={20} className="text-[#BDBDBD]" /></div>}
                  <div className="text-sm text-[#BDBDBD] font-poppins">{ecImg ? 'Image selected — tap to change' : 'Tap to upload the commemorative card'}</div>
                </div>
                <input ref={ecFileRef} type="file" accept="image/*" onChange={pickEcImage} className="hidden" />
              </div>
              <GlowButton type="submit" full className={ecBusy ? 'opacity-70 pointer-events-none' : ''}>
                {ecBusy ? <Loader2 size={16} className="animate-spin" /> : <Star size={16} />} Save Commemorative for Show
              </GlowButton>
            </form>
            <div className="mt-5">
              <h3 className="font-bebas text-2xl mb-3">SET FOR SHOWS ({eventCommems.length})</h3>
              {eventCommems.length === 0 ? <p className="text-[#BDBDBD] font-poppins text-sm">None yet. Buyers only get a commemorative for shows you set up here.</p> : (
                <div className="space-y-3 max-h-[220px] overflow-y-auto hide-scroll">
                  {eventCommems.map((c) => (
                    <div key={c.eventId} className="flex items-center gap-3 glass rounded-xl p-3">
                      <img src={c.image} alt="" className="w-12 h-14 rounded object-cover shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-poppins text-[#E8E8E8] truncate">{c.eventTitle || c.eventId}</div>
                        <div className="text-[11px] text-[#BDBDBD] truncate">{c.title}</div>
                      </div>
                      <button onClick={() => delEventCommem(c.eventId)} className="text-[#BDBDBD] hover:text-red-400 shrink-0"><Trash2 size={16} /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Promo codes & ticket limits */}
          <div className="glass rounded-2xl p-6">
            <h2 className="font-bebas text-3xl mb-4 flex items-center gap-2"><Ticket size={20} className="text-[#B15EFF]" /> PROMO CODES & LIMITS</h2>
            <form onSubmit={addPromo} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-oswald uppercase tracking-widest text-[#BDBDBD]">Code</label>
                  <Input value={pCode} onChange={(e) => setPCode(e.target.value.toUpperCase())} placeholder="SAVE20" className="bg-white/5 border-white/10 h-11 mt-1 text-white placeholder:text-[#BDBDBD]/60 uppercase" />
                </div>
                <div>
                  <label className="text-xs font-oswald uppercase tracking-widest text-[#BDBDBD]">Type</label>
                  <select value={pType} onChange={(e) => setPType(e.target.value)} className="w-full h-11 mt-1 rounded-md bg-white/5 border border-white/10 text-white px-3 text-sm">
                    <option value="percent" className="bg-[#0d0d0d]">% Percent Off</option>
                    <option value="amount" className="bg-[#0d0d0d]">$ Amount Off</option>
                    <option value="bogo" className="bg-[#0d0d0d]">Buy One Get One Free</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {pType !== 'bogo' && (
                  <div>
                    <label className="text-xs font-oswald uppercase tracking-widest text-[#BDBDBD]">{pType === 'percent' ? 'Percent (%)' : 'Amount ($)'}</label>
                    <Input type="number" step="0.01" min="0" value={pValue} onChange={(e) => setPValue(e.target.value)} placeholder={pType === 'percent' ? '20' : '10.00'} className="bg-white/5 border-white/10 h-11 mt-1 text-white placeholder:text-[#BDBDBD]/60" />
                  </div>
                )}
                <div>
                  <label className="text-xs font-oswald uppercase tracking-widest text-[#BDBDBD]">Max Uses (0 = unlimited)</label>
                  <Input type="number" min="0" value={pMax} onChange={(e) => setPMax(e.target.value)} placeholder="0" className="bg-white/5 border-white/10 h-11 mt-1 text-white placeholder:text-[#BDBDBD]/60" />
                </div>
              </div>
              <GlowButton type="submit" full className={pBusy ? 'opacity-70 pointer-events-none' : ''}>
                {pBusy ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} Create Promo Code
              </GlowButton>
            </form>

            <div className="mt-5">
              <h3 className="font-bebas text-2xl mb-3">ACTIVE CODES ({promos.length})</h3>
              {promos.length === 0 ? <p className="text-[#BDBDBD] font-poppins text-sm">No promo codes yet.</p> : (
                <div className="space-y-3 max-h-[220px] overflow-y-auto hide-scroll">
                  {promos.map((p) => (
                    <div key={p.id} className="flex items-center gap-3 glass rounded-xl p-3">
                      <div className="flex-1 min-w-0">
                        <div className="font-oswald uppercase tracking-widest text-sm text-white">{p.code}</div>
                        <div className="text-[11px] text-[#BDBDBD] font-poppins">
                          {p.type === 'percent' ? `${p.value}% off` : p.type === 'amount' ? `$${Number(p.value).toFixed(2)} off` : 'BOGO Free'}
                          {' · '}{p.uses}{p.maxUses ? `/${p.maxUses}` : ''} used
                        </div>
                      </div>
                      <button onClick={() => togglePromo(p.id)} className={`text-[10px] font-oswald uppercase tracking-widest px-2 py-1 rounded ${p.active ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-[#BDBDBD]'}`}>{p.active ? 'Active' : 'Off'}</button>
                      <button onClick={() => delPromo(p.id)} className="text-[#BDBDBD] hover:text-red-400 shrink-0"><Trash2 size={16} /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 pt-5 border-t border-white/10">
              <label className="text-xs font-oswald uppercase tracking-widest text-[#BDBDBD]">Max Tickets Per Order (0 = no limit)</label>
              <div className="flex items-center gap-2 mt-1">
                <Input type="number" min="0" value={ticketLimit} onChange={(e) => setTicketLimit(e.target.value)} placeholder="0" className="bg-white/5 border-white/10 h-11 text-white placeholder:text-[#BDBDBD]/60" />
                <GlowButton type="button" onClick={saveLimit} className="!px-5 !py-2.5 shrink-0">Save</GlowButton>
              </div>
              <p className="text-[11px] text-[#BDBDBD]/70 font-poppins mt-1">Caps how many tickets a customer can buy in a single checkout for the show.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ============================= FAN ACCOUNTS ============================= */
const FAN_TOKEN = 'baw_fan_token'
const FanContext = createContext(null)
const useFan = () => useContext(FanContext)
const FanProvider = ({ children }) => {
  const [token, setToken] = useState('')
  const [fan, setFan] = useState(null)
  useEffect(() => {
    const t = typeof window !== 'undefined' ? localStorage.getItem(FAN_TOKEN) : ''
    if (!t) return
    setToken(t)
    fetch('/api/auth/me', { headers: { Authorization: 'Bearer ' + t } })
      .then((r) => r.json())
      .then((d) => { if (d.authenticated) setFan(d.user); else { localStorage.removeItem(FAN_TOKEN); setToken('') } })
      .catch(() => {})
  }, [])
  const doAuth = (t, user) => { localStorage.setItem(FAN_TOKEN, t); setToken(t); setFan(user) }
  const logout = () => {
    if (token) fetch('/api/auth/logout', { method: 'POST', headers: { Authorization: 'Bearer ' + token } }).catch(() => {})
    localStorage.removeItem(FAN_TOKEN); setToken(''); setFan(null)
  }
  return <FanContext.Provider value={{ token, fan, doAuth, logout }}>{children}</FanContext.Provider>
}

const AccountPage = ({ nav }) => {
  const { token, fan, doAuth, logout } = useFan()
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const [lib, setLib] = useState({ items: [], unlocked: [] })
  const [playing, setPlaying] = useState(null)

  const loadLib = () => {
    if (!token) return
    fetch('/api/me/library', { headers: { Authorization: 'Bearer ' + token } }).then((r) => r.json()).then((d) => { if (d.items) setLib(d) }).catch(() => {})
  }
  useEffect(() => { loadLib() }, [token])

  const submit = async (e) => {
    e.preventDefault(); setErr(''); setBusy(true)
    try {
      const url = mode === 'login' ? '/api/auth/login' : '/api/auth/register'
      const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password, name }) })
      const d = await r.json()
      if (d.token) { doAuth(d.token, d.user); setPassword('') }
      else setErr(d.error || 'Something went wrong')
    } finally { setBusy(false) }
  }

  const tickets = lib.items.filter((i) => i.kind === 'ticket')
  const commems = lib.items.filter((i) => i.kind !== 'ticket')

  if (!fan) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5 pt-24 pb-16 relative overflow-hidden">
        <SmokeOverlay />
        <div className="relative glass rounded-2xl p-8 w-full max-w-md glow">
          <div className="flex flex-col items-center mb-6">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#6A0DAD] to-[#8A2BE2] flex items-center justify-center glow mb-3"><User size={22} /></div>
            <h1 className="font-bebas text-4xl">{mode === 'login' ? 'FAN LOGIN' : 'CREATE ACCOUNT'}</h1>
            <p className="text-[#BDBDBD] font-poppins text-sm mt-1">Access your tickets, commemoratives & unlocked media</p>
          </div>
          <div className="flex gap-2 mb-6">
            {['login', 'register'].map((m) => (
              <button key={m} onClick={() => { setMode(m); setErr('') }} className={`flex-1 py-2 rounded-full font-oswald uppercase tracking-widest text-xs transition-all ${mode === m ? 'bg-gradient-to-r from-[#6A0DAD] to-[#8A2BE2] text-white' : 'glass text-[#BDBDBD]'}`}>{m === 'login' ? 'Log In' : 'Sign Up'}</button>
            ))}
          </div>
          <form onSubmit={submit} className="space-y-3">
            {mode === 'register' && <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="bg-white/5 border-white/10 h-12 text-white placeholder:text-[#BDBDBD]/60" />}
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="bg-white/5 border-white/10 h-12 text-white placeholder:text-[#BDBDBD]/60" />
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password (min 6 chars)" className="bg-white/5 border-white/10 h-12 text-white placeholder:text-[#BDBDBD]/60" />
            {err && <div className="text-red-400 text-sm font-poppins">{err}</div>}
            <GlowButton type="submit" full className={busy ? 'opacity-70 pointer-events-none' : ''}>{busy ? <Loader2 size={16} className="animate-spin" /> : null} {mode === 'login' ? 'Log In' : 'Create Account'}</GlowButton>
          </form>
          <p className="text-[11px] text-[#BDBDBD]/70 font-poppins mt-4 text-center">Use the same email you use at checkout so your tickets & items show up here.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-28 pb-20">
      <AnimatePresence>
        {playing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[95] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setPlaying(null)}>
            <button onClick={() => setPlaying(null)} className="absolute top-5 right-5 z-10 text-white/80 hover:text-white"><X size={30} /></button>
            <div className="w-full max-w-4xl aspect-video rounded-xl overflow-hidden glow border border-white/10" onClick={(e) => e.stopPropagation()}>
              <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${playing}?autoplay=1&rel=0`} title="Video" frameBorder="0" allow="autoplay; encrypted-media; fullscreen" allowFullScreen />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="container mx-auto px-5">
        <div className="flex items-center justify-between mb-10">
          <div>
            <div className="font-oswald uppercase tracking-[0.4em] text-xs text-[#B15EFF] mb-2">Welcome{fan.name ? `, ${fan.name}` : ''}</div>
            <h1 className="font-bebas text-6xl leading-none">MY ACCOUNT</h1>
            <p className="text-[#BDBDBD] font-poppins text-sm mt-1">{fan.email}</p>
          </div>
          <GlowButton variant="outline" onClick={logout}><LogOut size={16} /> Log Out</GlowButton>
        </div>

        {/* Tickets */}
        <h2 className="font-bebas text-3xl mb-4 flex items-center gap-2"><Ticket size={22} className="text-[#B15EFF]" /> MY TICKETS ({tickets.length})</h2>
        {tickets.length === 0 ? <p className="text-[#BDBDBD] font-poppins text-sm mb-10">No tickets yet. Tickets you buy (with this email) will appear here with a scannable QR code.</p> : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
            {tickets.map((t) => (
              <div key={t.id} className="glass rounded-2xl overflow-hidden flex">
                <img src={t.image} alt="" className="w-24 object-cover" />
                <div className="p-4 flex-1">
                  <div className="font-bebas text-2xl leading-none">{t.title}</div>
                  <div className="text-[11px] text-[#BDBDBD] font-oswald uppercase tracking-widest mt-1">{t.subtitle}</div>
                  {t.qr && <img src={t.qr} alt="QR" className="w-20 h-20 mt-3 rounded bg-white p-1" />}
                  <div className="text-[10px] text-[#BDBDBD]/70 font-mono mt-2">{t.code}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Commemoratives */}
        <h2 className="font-bebas text-3xl mb-4 flex items-center gap-2"><Star size={20} className="text-[#B15EFF]" /> COMMEMORATIVES ({commems.length})</h2>
        {commems.length === 0 ? <p className="text-[#BDBDBD] font-poppins text-sm mb-10">Your collectible cards from each show will appear here.</p> : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
            {commems.map((c) => (
              <div key={c.id} className="glass rounded-2xl overflow-hidden group">
                {c.image && <div className="aspect-[3/4] overflow-hidden"><img src={c.image} alt={c.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /></div>}
                <div className="p-4"><div className="font-bebas text-2xl leading-none">{c.title}</div>{c.subtitle && <div className="text-[11px] text-[#BDBDBD] font-oswald uppercase tracking-widest mt-1">{c.subtitle}</div>}</div>
              </div>
            ))}
          </div>
        )}

        {/* Unlocked media */}
        <h2 className="font-bebas text-3xl mb-4 flex items-center gap-2"><Unlock size={20} className="text-[#B15EFF]" /> UNLOCKED MEDIA ({lib.unlocked.length})</h2>
        {lib.unlocked.length === 0 ? <p className="text-[#BDBDBD] font-poppins text-sm">Exclusive photos & videos you unlock will appear here.</p> : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {lib.unlocked.map((u) => (
              <div key={u.id} className="glass rounded-2xl overflow-hidden group">
                <div className="aspect-video relative overflow-hidden">
                  <img src={u.image} alt={u.title} className="w-full h-full object-cover" />
                  {u.kind === 'video' && <button onClick={() => setPlaying(u.videoId)} className="absolute inset-0 bg-black/40 flex items-center justify-center"><div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#6A0DAD] to-[#8A2BE2] flex items-center justify-center glow"><Play size={20} className="ml-0.5" /></div></button>}
                </div>
                <div className="p-4 flex items-center justify-between gap-2">
                  <div className="font-oswald uppercase tracking-widest text-sm truncate">{u.title}</div>
                  {u.kind === 'photo' && <a href={u.fileUrl + `?t=${token}`} onClick={(e) => { e.preventDefault(); downloadGated(u.fileUrl, token, u.title) }} className="text-[#B15EFF] hover:text-white shrink-0"><Download size={18} /></a>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Download a gated photo using the auth header, then save via blob
async function downloadGated(url, token, title) {
  try {
    const r = await fetch(url, { headers: { Authorization: 'Bearer ' + token } })
    if (!r.ok) return
    const blob = await r.blob()
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `${(title || 'baw-photo').replace(/[^a-z0-9]/gi, '-')}.jpg`
    document.body.appendChild(a); a.click(); a.remove()
    setTimeout(() => URL.revokeObjectURL(a.href), 4000)
  } catch {}
}

/* ============================= THE VAULT (locked media) ============================= */
const LockedVault = ({ nav }) => {
  const { token, fan } = useFan()
  const [list, setList] = useState([])
  const [unlockedIds, setUnlockedIds] = useState([])
  const [active, setActive] = useState(null)
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID

  const load = () => {
    fetch('/api/locked-media').then((r) => r.json()).then((d) => setList(Array.isArray(d) ? d : [])).catch(() => {})
    if (token) fetch('/api/me/library', { headers: { Authorization: 'Bearer ' + token } }).then((r) => r.json()).then((d) => setUnlockedIds((d.unlocked || []).map((u) => u.id))).catch(() => {})
  }
  useEffect(() => { load() }, [token])

  if (list.length === 0) return null
  return (
    <section className="py-16 border-t border-white/8">
      <div className="container mx-auto px-5">
        <SectionHeading overline="Members Only" title="THE VAULT" subtitle="Unlock exclusive photos & videos. Yours forever once unlocked." />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-8">
          {list.map((m) => {
            const owned = unlockedIds.includes(m.id)
            return (
              <div key={m.id} className="glass rounded-2xl overflow-hidden group relative">
                <div className="aspect-[4/5] overflow-hidden relative">
                  <img src={m.previewImage} alt={m.title} className={`w-full h-full object-cover ${owned ? '' : 'blur-md scale-110'}`} />
                  {!owned && (
                    <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-2">
                      <Lock size={26} className="text-white" />
                      <span className="font-bebas text-3xl">${Number(m.price).toFixed(2)}</span>
                    </div>
                  )}
                  {owned && <div className="absolute top-3 right-3 bg-green-500/80 rounded-full px-3 py-1 text-[10px] font-oswald uppercase tracking-widest inline-flex items-center gap-1"><Unlock size={11} /> Unlocked</div>}
                </div>
                <div className="p-4 flex items-center justify-between gap-2">
                  <div className="font-oswald uppercase tracking-widest text-sm truncate">{m.title}</div>
                  {owned ? (
                    <button onClick={() => nav('account')} className="text-[#B15EFF] text-xs font-oswald uppercase tracking-widest hover:underline shrink-0">View</button>
                  ) : (
                    <button onClick={() => setActive(m)} className="shrink-0 px-3 py-1.5 rounded-md bg-gradient-to-r from-[#6A0DAD] to-[#8A2BE2] text-white text-xs font-oswald uppercase tracking-widest inline-flex items-center gap-1"><Unlock size={13} /> Unlock</button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Unlock modal */}
      <AnimatePresence>
        {active && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[95] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setActive(null)}>
            <div className="glass rounded-2xl p-6 w-full max-w-md glow" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setActive(null)} className="float-right text-white/70 hover:text-white"><X size={22} /></button>
              <h3 className="font-bebas text-4xl mb-1">UNLOCK</h3>
              <p className="font-oswald uppercase tracking-widest text-sm text-[#B15EFF] mb-4">{active.title} · ${Number(active.price).toFixed(2)}</p>
              {!fan ? (
                <div className="text-center py-4">
                  <p className="text-[#BDBDBD] font-poppins text-sm mb-4">Please log in (or create a free account) to unlock and keep this item.</p>
                  <GlowButton full onClick={() => { setActive(null); nav('account') }}><User size={16} /> Go to Fan Login</GlowButton>
                </div>
              ) : clientId ? (
                <PayPalScriptProvider options={{ clientId, currency: 'USD', intent: 'capture', components: 'buttons', enableFunding: 'venmo,card' }}>
                  <PayPalButtons
                    style={{ layout: 'vertical', color: 'gold', shape: 'rect', label: 'paypal', height: 44 }}
                    createOrder={async () => {
                      const r = await fetch('/api/paypal/create-order', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ purpose: 'unlock', mediaId: active.id, email: fan.email }) })
                      const d = await r.json(); return d.orderID
                    }}
                    onApprove={async (data) => {
                      await fetch('/api/paypal/capture-order', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderID: data.orderID }) })
                      setActive(null); load()
                    }}
                    onError={(e) => console.error('PayPal error', e)}
                  />
                </PayPalScriptProvider>
              ) : <p className="text-[#BDBDBD] text-sm">Payments are not configured.</p>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

/* ============================= APP ============================= */
export default function App() {
  const [loading, setLoading] = useState(true)
  const [route, setRoute] = useState({ page: 'home', id: null })
  const [scrolled, setScrolled] = useState(false)
  const [showTop, setShowTop] = useState(false)
  const [data, setData] = useState({ events: [], wrestlers: [], news: [], instagram: [], stories: [], media: [] })
  const [selectedEvent, setSelectedEvent] = useState(null)
  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, 'change', (v) => { setScrolled(v > 40); setShowTop(v > 600) })

  const loadData = async () => {
    try {
      const [e, w, n, ig, st, md] = await Promise.all([
        fetch('/api/events').then((r) => r.json()),
        fetch('/api/wrestlers').then((r) => r.json()),
        fetch('/api/news').then((r) => r.json()),
        fetch('/api/instagram').then((r) => r.json()),
        fetch('/api/stories').then((r) => r.json()),
        fetch('/api/media').then((r) => r.json()),
      ])
      setData({
        events: Array.isArray(e) ? e : [],
        wrestlers: Array.isArray(w) ? w : [],
        news: Array.isArray(n) ? n : [],
        instagram: Array.isArray(ig) ? ig : [],
        stories: Array.isArray(st) ? st : [],
        media: Array.isArray(md) ? md : [],
      })
    } catch (err) { console.error(err) }
  }

  useEffect(() => {
    loadData()
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
      case 'media': return <MediaPage data={data} nav={nav} />
      case 'news': return <NewsPage data={data} />
      case 'about': return <AboutPage />
      case 'contact': return <ContactPage />
      case 'merch': return <MerchPage />
      case 'account': return <AccountPage nav={nav} />
      case 'admin': return <AdminPage onDataChange={loadData} events={data.events} />
      case 'privacy': return <SimplePage overline="Legal" title="PRIVACY POLICY"><p>Black Amethyst Wrestling respects your privacy. We collect only the information necessary to deliver our services, process ticket orders, and communicate event updates. We never sell your personal data to third parties.</p><p>By using this website, you consent to our data practices as described in this policy. For any privacy inquiries, contact info@blackamethystwrestling.com.</p></SimplePage>
      case 'terms': return <SimplePage overline="Legal" title="TERMS OF SERVICE"><p>By accessing this website and purchasing tickets, you agree to abide by all venue rules and BAW policies. All ticket sales are final. Black Amethyst Wrestling reserves the right to refuse entry and to modify event lineups without notice.</p><p>All content, logos, and imagery are the property of Black Amethyst Wrestling and may not be reproduced without permission.</p></SimplePage>
      default: return <HomePage nav={nav} data={data} onOpenEvent={openEvent} onOpenWrestler={openWrestler} onTickets={goTickets} />
    }
  }

  const onSaleEvent = data.events.find((e) => e.status !== 'coming-soon')

  return (
    <FanProvider>
    <CartProvider>
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

      <CartDrawer ev={onSaleEvent} />
    </CartProvider>
    </FanProvider>
  )
}
