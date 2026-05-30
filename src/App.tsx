import { useState, useEffect, useRef, useCallback, type ReactNode } from 'react';
import {
  Mail,
  ChevronDown,
  Heart,
  Menu,
  X,
  ExternalLink,
  Leaf,
  Scissors,
  Palette,
  ShoppingBag,
  Sparkles,
  ArrowRight,
  CheckCircle,
  ChevronUp,
  AlertCircle,
  Send,
  Loader2,
  ZoomIn,
} from 'lucide-react';

// ─── Custom Instagram Icon ─────────────────────────────────────
function Instagram({ size = 24, ...rest }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...rest}>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

// ─── Types ─────────────────────────────────────────────────────
type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface EnquiryForm {
  name: string;
  email: string;
  interest: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
}

// ─── Global App State Context ──────────────────────────────────
// We pass callbacks down instead of using context for simplicity

// ─── Toast System ──────────────────────────────────────────────
let toastId = 0;

function ToastContainer({ toasts, removeToast }: { toasts: Toast[]; removeToast: (id: number) => void }) {
  return (
    <div className="fixed top-24 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl animate-slide-right max-w-sm ${
            t.type === 'success'
              ? 'bg-green-800 text-beige-100'
              : t.type === 'error'
              ? 'bg-red-800 text-red-100'
              : 'bg-green-900 text-beige-200'
          }`}
        >
          {t.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
          ) : t.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-red-300 flex-shrink-0" />
          ) : (
            <Sparkles className="w-5 h-5 text-green-400 flex-shrink-0" />
          )}
          <p className="text-sm font-medium flex-1">{t.message}</p>
          <button onClick={() => removeToast(t.id)} className="text-current opacity-60 hover:opacity-100 transition-opacity">
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

// ─── Image Lightbox ────────────────────────────────────────────
function Lightbox({
  src, alt, onClose,
}: {
  src: string | null;
  alt: string;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!src) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [src, onClose]);

  if (!src) return null;

  return (
    <div
      className="fixed inset-0 z-[90] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors z-10"
      >
        <X className="w-8 h-8" />
      </button>
      <div className="relative max-w-4xl max-h-[85vh] animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <img src={src} alt={alt} className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl" />
        <p className="text-white/60 text-sm text-center mt-4">{alt}</p>
      </div>
    </div>
  );
}

// ─── Intersection Observer Hook ────────────────────────────────
function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.unobserve(el); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

// ─── Animated Section ──────────────────────────────────────────
function Animate({
  children, className = '', animation = 'animate-fade-in-up', delay = '',
}: { children: ReactNode; className?: string; animation?: string; delay?: string }) {
  const { ref, inView } = useInView();
  return (
    <div ref={ref} className={`${className} ${inView ? `${animation} ${delay}` : 'opacity-0'}`}>
      {children}
    </div>
  );
}

// ─── Animated Counter ──────────────────────────────────────────
function Counter({ end, suffix = '', duration = 2000 }: { end: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const { ref, inView } = useInView(0.5);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [inView, end, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
}

// ─── Image URLs ────────────────────────────────────────────────
const img = {
  hero: 'https://images.pexels.com/photos/35009418/pexels-photo-35009418.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
  about: 'https://images.pexels.com/photos/11482148/pexels-photo-11482148.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
  sewing: 'https://images.pexels.com/photos/33706427/pexels-photo-33706427.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
  pins: 'https://images.pexels.com/photos/7778041/pexels-photo-7778041.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
  threadArt: 'https://images.pexels.com/photos/6461523/pexels-photo-6461523.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
  fabrics: 'https://images.pexels.com/photos/19026106/pexels-photo-19026106.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',

  paintedPlate: 'https://images.pexels.com/photos/5567008/pexels-photo-5567008.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
  tiles: 'https://images.pexels.com/photos/34022888/pexels-photo-34022888.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
  cups: 'https://images.pexels.com/photos/30225368/pexels-photo-30225368.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
  studio: 'https://images.pexels.com/photos/7025521/pexels-photo-7025521.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
  fashionDesigner: 'https://images.pexels.com/photos/8484131/pexels-photo-8484131.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800',
  beigeDress: 'https://images.pexels.com/photos/8176602/pexels-photo-8176602.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800',
};

// ─── Navbar ────────────────────────────────────────────────────
function Navbar({ activeSection }: { activeSection: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const links = [
    { label: 'Home', href: '#hero' },
    { label: 'About', href: '#about' },
    { label: 'Collection', href: '#collection' },
    { label: 'Art & Crafts', href: '#artcrafts' },
    { label: 'Shop', href: '#shop' },
    { label: 'Contact', href: '#contact' },
  ];

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-green-900/95 backdrop-blur-md shadow-lg py-3' : 'bg-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <a href="#hero" onClick={(e) => handleClick(e, '#hero')} className="flex items-center gap-2 group">
          <Scissors className="w-5 h-5 text-green-400 group-hover:text-beige-400 transition-colors rotate-[-45deg]" />
          <span className="font-[family-name:var(--font-display)] text-xl font-semibold text-beige-100 tracking-wide">chreby louise</span>
        </a>
        <div className="hidden md:flex items-center gap-8">
          {links.map(l => {
            const id = l.href.replace('#', '');
            const isActive = activeSection === id;
            return (
              <a
                key={l.href}
                href={l.href}
                onClick={(e) => handleClick(e, l.href)}
                className={`nav-link text-sm font-medium tracking-wider uppercase transition-colors ${
                  isActive ? 'text-green-400' : 'text-beige-200 hover:text-beige-50'
                }`}
              >
                {l.label}
              </a>
            );
          })}
          <a href="https://www.instagram.com/chreby_louise/" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 bg-green-700 hover:bg-green-600 text-beige-100 px-5 py-2.5 rounded-full text-sm font-medium transition-all hover:shadow-lg hover:shadow-green-700/30">
            <Instagram size={16} /> Follow
          </a>
        </div>
        <button onClick={() => setOpen(!open)} className="md:hidden text-beige-100 p-2">{open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}</button>
      </div>
      {open && (
        <div className="md:hidden bg-green-900/98 backdrop-blur-lg border-t border-green-700/50 animate-fade-in">
          <div className="px-6 py-6 space-y-4">
            {links.map(l => {
              const id = l.href.replace('#', '');
              const isActive = activeSection === id;
              return (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={(e) => handleClick(e, l.href)}
                  className={`block text-base font-medium tracking-wide py-2 ${
                    isActive ? 'text-green-400' : 'text-beige-200 hover:text-beige-50'
                  }`}
                >
                  {l.label}
                </a>
              );
            })}
            <a href="https://www.instagram.com/chreby_louise/" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 bg-green-700 text-beige-100 px-5 py-3 rounded-full text-sm font-medium w-fit">
              <Instagram size={16} /> Follow on Instagram
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}

// ─── Hero ──────────────────────────────────────────────────────
function Hero() {
  const scrollDown = () => {
    const el = document.querySelector('#about');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="hero" className="relative h-screen min-h-[700px] overflow-hidden">
      <div className="absolute inset-0">
        <img src={img.hero} alt="Handmade fabrics" className="w-full h-full object-cover" />
        <div className="hero-overlay absolute inset-0" />
      </div>
      <div className="absolute top-24 right-12 w-40 h-40 border border-beige-400/15 rounded-full" />
      <div className="absolute bottom-32 left-12 w-28 h-28 border border-beige-400/10 rounded-full" />

      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
        <div className="max-w-3xl">
          <p className="text-beige-400 text-sm md:text-base tracking-[0.3em] uppercase mb-6 font-medium animate-fade-in-up">
            Handmade with Love ✦ Clothing · Art · Crafts
          </p>
          <h1 className="font-[family-name:var(--font-display)] text-5xl md:text-7xl lg:text-8xl text-beige-50 font-bold leading-[1.1] mb-4 animate-fade-in-up animation-delay-200">
            Chreby
            <span className="block font-[family-name:var(--font-accent)] font-normal text-beige-300 text-3xl md:text-5xl lg:text-6xl mt-2 italic">Louise</span>
          </h1>
          <div className="flex items-center justify-center gap-4 mb-8 animate-fade-in-up animation-delay-400">
            <span className="w-12 h-px bg-beige-400/50" />
            <p className="text-beige-200 text-lg md:text-xl font-light font-[family-name:var(--font-accent)] italic tracking-wide">
              Where creativity meets craftsmanship
            </p>
            <span className="w-12 h-px bg-beige-400/50" />
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up animation-delay-600">
            <button
              onClick={() => { const el = document.querySelector('#collection'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }}
              className="bg-beige-100 text-green-900 px-8 py-3.5 rounded-full font-semibold text-sm tracking-wider uppercase hover:bg-white transition-all hover:shadow-xl flex items-center gap-2 cursor-pointer"
            >
              View Collection <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => { const el = document.querySelector('#about'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }}
              className="border border-beige-400/40 text-beige-100 px-8 py-3.5 rounded-full font-medium text-sm tracking-wider uppercase hover:bg-beige-100/10 transition-all cursor-pointer"
            >
              Our Story
            </button>
          </div>
        </div>
        <button onClick={scrollDown} className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce cursor-pointer">
          <ChevronDown className="w-6 h-6 text-beige-400/60" />
        </button>
      </div>
    </section>
  );
}

// ─── About ─────────────────────────────────────────────────────
function About() {
  return (
    <section id="about" className="py-24 md:py-32 bg-beige-100">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <Animate animation="animate-slide-left">
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-full h-full border-2 border-green-700/20 rounded-2xl" />
              <div className="relative overflow-hidden rounded-2xl shadow-2xl shadow-green-900/10">
                <img src={img.about} alt="Hands crafting" className="w-full h-[520px] object-cover hover:scale-105 transition-transform duration-700" />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-green-900 text-beige-100 px-6 py-5 rounded-2xl shadow-xl">
                <div className="text-center">
                  <Sparkles className="w-6 h-6 text-green-400 mx-auto mb-2" />
                  <div className="font-[family-name:var(--font-display)] text-2xl font-bold text-beige-100">
                    <Counter end={241} suffix="+" />
                  </div>
                  <p className="text-beige-300 text-xs uppercase tracking-wider font-medium">Creations</p>
                </div>
              </div>
            </div>
          </Animate>

          <Animate animation="animate-slide-right" delay="animation-delay-200">
            <div className="space-y-6">
              <div>
                <p className="text-green-600 text-sm tracking-[0.25em] uppercase font-semibold mb-3">Our Story</p>
                <div className="decorative-line mb-6" />
              </div>
              <h2 className="font-[family-name:var(--font-display)] text-4xl md:text-5xl font-bold text-green-900 leading-tight">
                Creativity woven
                <span className="text-green-600 font-[family-name:var(--font-accent)] italic font-normal block">into every piece</span>
              </h2>
              <p className="text-green-800/70 text-lg leading-relaxed">
                Chreby Louise is a celebration of handmade artistry — where clothing design,
                original artwork, and handcrafted goods come together. Every piece is thoughtfully
                created with attention to detail and a passion for sustainable craftsmanship.
              </p>
              <p className="text-green-800/70 text-lg leading-relaxed">
                From sketching original designs to selecting the perfect fabrics, from mixing colors
                to painting — we believe that true beauty lies in the process of making
                something by hand.
              </p>

              {/* Animated Stats */}
              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-green-900/10">
                <div className="text-center">
                  <div className="font-[family-name:var(--font-display)] text-3xl font-bold text-green-900">
                    <Counter end={150} suffix="+" />
                  </div>
                  <p className="text-green-800/60 text-xs mt-1 uppercase tracking-wider">Clothing Pieces</p>
                </div>
                <div className="text-center">
                  <div className="font-[family-name:var(--font-display)] text-3xl font-bold text-green-900">
                    <Counter end={80} suffix="+" />
                  </div>
                  <p className="text-green-800/60 text-xs mt-1 uppercase tracking-wider">Artworks</p>
                </div>
                <div className="text-center">
                  <div className="font-[family-name:var(--font-display)] text-3xl font-bold text-green-900">
                    <Counter end={50} suffix="+" />
                  </div>
                  <p className="text-green-800/60 text-xs mt-1 uppercase tracking-wider">Happy Clients</p>
                </div>
              </div>
            </div>
          </Animate>
        </div>
      </div>
    </section>
  );
}

// ─── Collection (Clothing) ─────────────────────────────────────
function Collection({ onImageClick }: { onImageClick: (src: string, alt: string) => void }) {
  const [liked, setLiked] = useState<Record<number, boolean>>({});

  const items = [
    { src: img.beigeDress, title: 'The Linen Blouse', cat: 'Tops', desc: 'Hand-stitched from natural linen with delicate button details' },
    { src: img.fashionDesigner, title: 'Studio Collection', cat: 'Dresses', desc: 'One-of-a-kind pieces designed and made in our studio' },
    { src: img.sewing, title: 'Bespoke Tailoring', cat: 'Custom', desc: 'Precision craftsmanship with attention to every stitch' },
    { src: img.fabrics, title: 'Textile Selection', cat: 'Fabrics', desc: 'Carefully curated fabrics from vibrant artisan markets' },
    { src: img.pins, title: 'Draped Design', cat: 'Process', desc: 'From pin to pattern — each garment begins with a vision' },
    { src: img.threadArt, title: 'Artisan Details', cat: 'Accessories', desc: 'Hand-finished details using quality threads and materials' },
  ];

  const toggleLike = (i: number) => {
    setLiked(prev => ({ ...prev, [i]: !prev[i] }));
  };

  return (
    <section id="collection" className="py-24 md:py-32 bg-green-900">
      <div className="max-w-7xl mx-auto px-6">
        <Animate className="text-center mb-16">
          <p className="text-green-400 text-sm tracking-[0.25em] uppercase font-semibold mb-3">Clothing</p>
          <div className="w-12 h-0.5 bg-green-500 mx-auto mb-6" />
          <h2 className="font-[family-name:var(--font-display)] text-4xl md:text-5xl font-bold text-beige-100 leading-tight">
            The Clothing
            <span className="text-green-400 font-[family-name:var(--font-accent)] italic font-normal block">Collection</span>
          </h2>
          <p className="text-beige-300/70 text-lg mt-4 max-w-2xl mx-auto">
            Each garment is designed, cut, and sewn by hand. From fabric selection to the final stitch —
            every piece carries a story of craftsmanship.
          </p>
        </Animate>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item, i) => (
            <Animate key={i} animation="animate-scale-in" delay={`animation-delay-${Math.min(i * 2, 6) * 100}` as 'animation-delay-200'}>
              <div className="gallery-item group relative rounded-2xl overflow-hidden shadow-lg cursor-pointer aspect-[4/5]">
                <img
                  src={item.src}
                  alt={item.title}
                  className="w-full h-full object-cover"
                  onClick={() => onImageClick(item.src, item.title)}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-green-900/80 via-green-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6 pointer-events-none">
                  <span className="text-green-400 text-xs uppercase tracking-widest font-semibold">{item.cat}</span>
                  <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold text-beige-100 mt-1">{item.title}</h3>
                  <p className="text-beige-300 text-sm mt-1">{item.desc}</p>
                </div>
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleLike(i); }}
                    className={`p-2 rounded-full backdrop-blur-sm transition-colors cursor-pointer ${
                      liked[i] ? 'bg-red-500/80 text-white' : 'bg-green-900/60 text-beige-100 hover:bg-green-900/80'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${liked[i] ? 'fill-current' : ''}`} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onImageClick(item.src, item.title); }}
                    className="p-2 bg-green-900/60 backdrop-blur-sm text-beige-100 rounded-full hover:bg-green-900/80 transition-colors cursor-pointer"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Animate>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Quote Banner ──────────────────────────────────────────────
function QuoteBanner() {
  return (
    <section className="relative py-24 overflow-hidden">
      <div className="absolute inset-0">
        <img src={img.studio} alt="Art studio" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-green-900/90" />
      </div>
      <Animate className="relative z-10 text-center max-w-3xl mx-auto px-6">
        <Leaf className="w-8 h-8 text-green-400 mx-auto mb-6" />
        <blockquote className="font-[family-name:var(--font-accent)] text-2xl md:text-4xl text-beige-100 italic leading-relaxed mb-6">
          "Every thread, every brushstroke, every sculpted form — a piece of soul woven into art."
        </blockquote>
        <div className="flex items-center justify-center gap-3">
          <span className="w-8 h-px bg-green-400" />
          <span className="text-beige-300 font-[family-name:var(--font-display)] font-semibold tracking-wider">CHREBY LOUISE</span>
          <span className="w-8 h-px bg-green-400" />
        </div>
      </Animate>
    </section>
  );
}

// ─── Art & Crafts with Filter Tabs ─────────────────────────────
function ArtCrafts({ onImageClick }: { onImageClick: (src: string, alt: string) => void }) {
  const [activeFilter, setActiveFilter] = useState('All');
  const [liked, setLiked] = useState<Record<number, boolean>>({});

  const works = [
    { src: img.paintedPlate, title: 'Painted Plates', desc: 'Botanical motifs on hand-illustrated dinnerware', tag: 'Art' },
    { src: img.tiles, title: 'Tile Painting', desc: 'Decorative painted tiles inspired by nature', tag: 'Painting' },
    { src: img.cups, title: 'Floral Mugs', desc: 'Handcrafted cups with delicate floral patterns', tag: 'Art' },
    { src: img.studio, title: 'Studio Session', desc: 'Where colors come alive on canvas', tag: 'Painting' },
  ];

  const filters = ['All', 'Art', 'Painting'];

  const filtered = activeFilter === 'All' ? works : works.filter(w => w.tag === activeFilter);

  const toggleLike = (i: number) => {
    setLiked(prev => ({ ...prev, [i]: !prev[i] }));
  };

  return (
    <section id="artcrafts" className="py-24 md:py-32 bg-beige-200">
      <div className="max-w-7xl mx-auto px-6">
        <Animate className="text-center mb-10">
          <p className="text-green-600 text-sm tracking-[0.25em] uppercase font-semibold mb-3">Creative Works</p>
          <div className="decorative-line mx-auto mb-6" />
          <h2 className="font-[family-name:var(--font-display)] text-4xl md:text-5xl font-bold text-green-900 leading-tight">
            Art & Crafts
            <span className="text-green-600 font-[family-name:var(--font-accent)] italic font-normal block">Studio</span>
          </h2>
          <p className="text-green-800/60 text-lg mt-4 max-w-2xl mx-auto">
            From canvas to color — explore the world of handmade art
            and one-of-a-kind craft pieces made in our studio.
          </p>
        </Animate>

        {/* Filter Tabs */}
        <Animate className="flex items-center justify-center gap-3 mb-12 flex-wrap">
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all cursor-pointer ${
                activeFilter === f
                  ? 'bg-green-900 text-beige-100 shadow-lg shadow-green-900/20'
                  : 'bg-beige-50 text-green-800 border border-green-900/10 hover:bg-green-900 hover:text-beige-100'
              }`}
            >
              {f}
            </button>
          ))}
        </Animate>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((w, idx) => {
            const realIdx = works.indexOf(w);
            return (
              <div key={w.title} className="animate-fade-in-up" style={{ animationDelay: `${idx * 100}ms` }}>
                <div className="bg-beige-50 rounded-2xl overflow-hidden shadow-lg shadow-green-900/5 hover:shadow-xl hover:shadow-green-900/10 transition-shadow duration-500 group">
                  <div className="relative h-64 overflow-hidden cursor-pointer" onClick={() => onImageClick(w.src, w.title)}>
                    <img src={w.src} alt={w.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute top-4 left-4">
                      <span className="bg-green-900/80 backdrop-blur-sm text-beige-200 px-3 py-1 rounded-full text-xs font-medium">{w.tag}</span>
                    </div>
                    <div className="absolute top-4 right-4">
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleLike(realIdx); }}
                        className={`p-2 rounded-full backdrop-blur-sm transition-colors cursor-pointer ${
                          liked[realIdx] ? 'bg-red-500/80 text-white' : 'bg-green-900/60 text-beige-100 hover:bg-green-900/80'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${liked[realIdx] ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                    <div className="absolute inset-0 bg-green-900/0 group-hover:bg-green-900/10 transition-colors flex items-center justify-center">
                      <ZoomIn className="w-8 h-8 text-beige-100 opacity-0 group-hover:opacity-70 transition-opacity" />
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold text-green-900 mb-2">{w.title}</h3>
                    <p className="text-green-800/60 text-sm leading-relaxed">{w.desc}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── What We Offer / Services ──────────────────────────────────
function Services({ onEnquire }: { onEnquire: (interest: string) => void }) {
  const services = [
    {
      icon: <Scissors className="w-7 h-7" />,
      title: 'Custom Clothing',
      desc: 'Bespoke garments tailored to your style and measurements. From concept to creation, every piece is uniquely yours.',
      interest: 'Custom Clothing',
    },
    {
      icon: <Palette className="w-7 h-7" />,
      title: 'Original Artwork',
      desc: 'One-of-a-kind paintings and illustrations that bring color and soul to any space. Commission your own masterpiece.',
      interest: 'Art Commission',
    },
    {
      icon: <Sparkles className="w-7 h-7" />,
      title: 'Workshop Sessions',
      desc: 'Join our creative workshops to learn painting, textile art, and basic sewing in a relaxed studio environment.',
      interest: 'Workshop Booking',
    },
  ];

  return (
    <section className="py-24 md:py-32 bg-beige-100">
      <div className="max-w-7xl mx-auto px-6">
        <Animate className="text-center mb-16">
          <p className="text-green-600 text-sm tracking-[0.25em] uppercase font-semibold mb-3">What We Offer</p>
          <div className="decorative-line mx-auto mb-6" />
          <h2 className="font-[family-name:var(--font-display)] text-4xl md:text-5xl font-bold text-green-900 leading-tight">
            Our
            <span className="text-green-600 font-[family-name:var(--font-accent)] italic font-normal block">Services</span>
          </h2>
        </Animate>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((s, i) => (
            <Animate key={i} animation="animate-fade-in-up" delay={`animation-delay-${i * 200}` as 'animation-delay-200'}>
              <div
                onClick={() => onEnquire(s.interest)}
                className="bg-beige-50 border border-green-900/5 rounded-2xl p-8 text-center hover:bg-green-900 hover:border-green-900 group transition-all duration-500 shadow-sm hover:shadow-xl h-full cursor-pointer"
              >
                <div className="text-green-700 group-hover:text-green-400 mb-5 flex justify-center transition-colors">{s.icon}</div>
                <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold text-green-900 group-hover:text-beige-100 mb-3 transition-colors">{s.title}</h3>
                <p className="text-green-800/60 group-hover:text-beige-300/70 text-sm leading-relaxed transition-colors mb-4">{s.desc}</p>
                <span className="inline-flex items-center gap-1 text-green-700 group-hover:text-green-400 text-xs font-semibold uppercase tracking-wider transition-colors">
                  Enquire <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </Animate>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Shop / Featured Products ──────────────────────────────────
function Shop({ onProductEnquire }: { onProductEnquire: (name: string) => void }) {
  const [addedToCart, setAddedToCart] = useState<Record<number, boolean>>({});

  const products = [
    { name: 'Linen Summer Dress', price: '$185', tag: 'Clothing', img: img.beigeDress },
    { name: 'Hand-Painted Vase', price: '$65', tag: 'Art', img: img.paintedPlate },
    { name: 'Artisan Tote Bag', price: '$75', tag: 'Accessories', img: img.threadArt },
  ];

  const handleEnquire = (i: number, name: string) => {
    setAddedToCart(prev => ({ ...prev, [i]: true }));
    onProductEnquire(name);
    setTimeout(() => {
      setAddedToCart(prev => ({ ...prev, [i]: false }));
    }, 3000);
  };

  return (
    <section id="shop" className="py-24 md:py-32 bg-green-900">
      <div className="max-w-7xl mx-auto px-6">
        <Animate className="text-center mb-16">
          <p className="text-green-400 text-sm tracking-[0.25em] uppercase font-semibold mb-3">Shop</p>
          <div className="w-12 h-0.5 bg-green-500 mx-auto mb-6" />
          <h2 className="font-[family-name:var(--font-display)] text-4xl md:text-5xl font-bold text-beige-100 leading-tight">
            Featured
            <span className="text-green-400 font-[family-name:var(--font-accent)] italic font-normal block">Pieces</span>
          </h2>
          <p className="text-beige-300/70 text-lg mt-4 max-w-2xl mx-auto">
            Shop our latest handmade creations. Each piece is unique and made in limited quantities.
          </p>
        </Animate>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((p, i) => (
            <Animate key={i} animation="animate-scale-in" delay={`animation-delay-${i * 200}` as 'animation-delay-200'}>
              <div className="group bg-green-800/50 rounded-2xl overflow-hidden border border-green-700/30 hover:border-green-500/50 transition-all duration-300">
                <div className="relative h-72 overflow-hidden">
                  <img src={p.img} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute top-3 left-3 bg-green-900/80 text-green-400 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm">{p.tag}</div>
                </div>
                <div className="p-5">
                  <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold text-beige-100 mb-2">{p.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-beige-400 font-semibold text-lg">{p.price}</span>
                    <button
                      onClick={() => handleEnquire(i, p.name)}
                      disabled={addedToCart[i]}
                      className={`px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                        addedToCart[i]
                          ? 'bg-green-600 text-green-200'
                          : 'bg-green-700 hover:bg-green-600 text-beige-100'
                      }`}
                    >
                      {addedToCart[i] ? (
                        <><CheckCircle className="w-3 h-3" /> Sent!</>
                      ) : (
                        <><ShoppingBag className="w-3 h-3" /> Enquire</>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </Animate>
          ))}
        </div>

        <Animate className="text-center mt-12">
          <p className="text-beige-300/50 text-sm mb-4">
            DM us on Instagram to order or enquire about custom pieces
          </p>
          <a href="https://www.instagram.com/chreby_louise/" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border-2 border-green-400 text-green-400 px-8 py-3.5 rounded-full font-semibold text-sm tracking-wider uppercase hover:bg-green-400 hover:text-green-900 transition-all">
            <Instagram size={16} /> Shop on Instagram <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </Animate>
      </div>
    </section>
  );
}

// ─── Instagram CTA ─────────────────────────────────────────────
function InstagramCTA() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() && email.includes('@')) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <section className="py-24 md:py-32 bg-beige-100 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-green-700/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-green-700/5 rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="max-w-5xl mx-auto px-6 relative">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <Animate animation="animate-slide-left">
            <div className="relative">
              <img src={img.studio} alt="Art supplies" className="w-full h-80 object-cover rounded-2xl shadow-xl" />
              <div className="absolute -bottom-5 -right-5 bg-green-900 text-beige-100 p-5 rounded-2xl shadow-lg">
                <Instagram size={32} />
              </div>
            </div>
          </Animate>

          <Animate animation="animate-slide-right" delay="animation-delay-200">
            <div className="space-y-5">
              <p className="text-green-600 text-sm tracking-[0.25em] uppercase font-semibold">Stay Connected</p>
              <h2 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-bold text-green-900 leading-tight">
                Follow the
                <span className="text-green-600 font-[family-name:var(--font-accent)] italic font-normal block">creative journey</span>
              </h2>
              <p className="text-green-800/60 text-lg leading-relaxed">
                Follow @chreby_louise on Instagram for behind-the-scenes studio moments,
                new collection drops, work-in-progress shots, and creative inspiration.
              </p>
              <div className="space-y-3">
                {['Behind-the-scenes studio content', 'New collection previews', 'Live crafting sessions', 'Custom order updates'].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-green-800/70 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    {item}
                  </div>
                ))}
              </div>

              {/* Newsletter */}
              <div className="pt-2">
                {subscribed ? (
                  <div className="bg-green-100 border border-green-600/20 rounded-xl p-4 flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <p className="text-green-800 text-sm font-medium">Thanks for subscribing! We'll keep you updated.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubscribe} className="flex gap-2">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Your email for updates..."
                      className="flex-1 bg-beige-50 border border-green-900/10 rounded-full px-5 py-3 text-green-900 text-sm focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 placeholder:text-green-800/30"
                    />
                    <button type="submit" className="bg-green-900 hover:bg-green-800 text-beige-100 px-6 py-3 rounded-full text-sm font-semibold transition-all hover:shadow-lg cursor-pointer">
                      Subscribe
                    </button>
                  </form>
                )}
              </div>

              <div className="flex items-center gap-4 pt-1">
                <a href="https://www.instagram.com/chreby_louise/" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-green-900 hover:bg-green-800 text-beige-100 px-6 py-3 rounded-full font-semibold text-sm transition-all hover:shadow-lg hover:shadow-green-900/30">
                  <Instagram size={16} /> @chreby_louise <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </Animate>
        </div>
      </div>
    </section>
  );
}

// ─── Contact ───────────────────────────────────────────────────
function Contact({
  initialInterest,
  onToast,
}: {
  initialInterest: string;
  onToast: (message: string, type: ToastType) => void;
}) {
  const [form, setForm] = useState<EnquiryForm>({ name: '', email: '', interest: 'Custom Clothing', message: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  // When a product or service triggers an enquiry, update the form
  useEffect(() => {
    if (initialInterest) {
      setForm(prev => ({ ...prev, interest: initialInterest }));
      setSent(false);
      // Scroll to the form
      setTimeout(() => {
        const el = document.querySelector('#contact');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [initialInterest]);

  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Please enter a valid email';
    if (!form.message.trim()) errs.message = 'Please tell us about your project';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      onToast('Please fix the errors in the form', 'error');
      return;
    }
    setSending(true);
    // Simulate sending
    await new Promise(resolve => setTimeout(resolve, 1500));
    setSending(false);
    setSent(true);
    onToast(`Thanks ${form.name}! Your enquiry has been sent successfully. We'll get back to you soon!`, 'success');
    // Reset after a delay
    setTimeout(() => {
      setForm({ name: '', email: '', interest: 'Custom Clothing', message: '' });
      setSent(false);
    }, 4000);
  };

  const updateField = (field: keyof EnquiryForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <section id="contact" className="py-24 md:py-32 bg-beige-200">
      <div className="max-w-4xl mx-auto px-6">
        <Animate className="text-center">
          <p className="text-green-600 text-sm tracking-[0.25em] uppercase font-semibold mb-3">Get in Touch</p>
          <div className="decorative-line mx-auto mb-6" />
          <h2 className="font-[family-name:var(--font-display)] text-4xl md:text-5xl font-bold text-green-900 leading-tight mb-4">
            Let's
            <span className="text-green-600 font-[family-name:var(--font-accent)] italic font-normal block">Connect</span>
          </h2>
          <p className="text-green-800/60 text-lg max-w-xl mx-auto mb-12">
            Want a custom piece? Interested in a workshop? Or just want to say hi?
            We'd love to hear from you!
          </p>
        </Animate>

        <Animate animation="animate-scale-in">
          <div className="grid sm:grid-cols-3 gap-6">
            <a href="https://www.instagram.com/chreby_louise/" target="_blank" rel="noopener noreferrer"
              className="group bg-beige-50 hover:bg-green-900 border border-green-900/10 hover:border-green-900 rounded-2xl p-8 text-center transition-all duration-500 shadow-sm hover:shadow-xl">
              <Instagram size={28} className="text-green-700 group-hover:text-green-400 mx-auto mb-4 transition-colors" />
              <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold text-green-900 group-hover:text-beige-100 mb-2 transition-colors">Instagram</h3>
              <p className="text-green-700/60 group-hover:text-beige-300/70 text-sm transition-colors">@chreby_louise</p>
            </a>

            <button
              onClick={() => { updateField('interest', 'Custom Clothing'); }}
              className="group bg-beige-50 hover:bg-green-900 border border-green-900/10 hover:border-green-900 rounded-2xl p-8 text-center transition-all duration-500 shadow-sm hover:shadow-xl cursor-pointer"
            >
              <Mail className="w-7 h-7 text-green-700 group-hover:text-green-400 mx-auto mb-4 transition-colors" />
              <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold text-green-900 group-hover:text-beige-100 mb-2 transition-colors">Custom Orders</h3>
              <p className="text-green-700/60 group-hover:text-beige-300/70 text-sm transition-colors">Fill the form below</p>
            </button>

            <button
              onClick={() => { updateField('interest', 'Art Commission'); }}
              className="group bg-beige-50 hover:bg-green-900 border border-green-900/10 hover:border-green-900 rounded-2xl p-8 text-center transition-all duration-500 shadow-sm hover:shadow-xl cursor-pointer"
            >
              <Heart className="w-7 h-7 text-green-700 group-hover:text-green-400 mx-auto mb-4 transition-colors" />
              <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold text-green-900 group-hover:text-beige-100 mb-2 transition-colors">Commissions</h3>
              <p className="text-green-700/60 group-hover:text-beige-300/70 text-sm transition-colors">Open for commissions</p>
            </button>
          </div>
        </Animate>

        {/* Enquiry Form */}
        <Animate className="mt-12">
          <div className="bg-beige-50 rounded-2xl p-8 md:p-10 border border-green-900/5 shadow-lg shadow-green-900/5">
            <h3 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-green-900 mb-6 text-center">
              {sent ? 'Enquiry Sent! ✨' : 'Send an Enquiry'}
            </h3>

            {sent ? (
              <div className="text-center py-8 animate-scale-in">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <p className="text-green-800 text-lg font-medium mb-2">Thank you, {form.name}!</p>
                <p className="text-green-800/60 text-sm">We'll get back to you at <strong>{form.email}</strong> soon.</p>
                <button
                  onClick={() => { setSent(false); setForm({ name: '', email: '', interest: 'Custom Clothing', message: '' }); }}
                  className="mt-6 text-green-700 hover:text-green-900 text-sm font-medium underline cursor-pointer"
                >
                  Send another enquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="text-green-800/70 text-sm font-medium mb-1.5 block">Name *</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => updateField('name', e.target.value)}
                      placeholder="Your name"
                      className={`w-full bg-beige-100 border rounded-xl px-4 py-3 text-green-900 text-sm focus:outline-none focus:ring-1 placeholder:text-green-800/30 ${
                        errors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-green-900/10 focus:border-green-600 focus:ring-green-600'
                      }`}
                    />
                    {errors.name && <p className="text-red-600 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.name}</p>}
                  </div>
                  <div>
                    <label className="text-green-800/70 text-sm font-medium mb-1.5 block">Email *</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => updateField('email', e.target.value)}
                      placeholder="Your email"
                      className={`w-full bg-beige-100 border rounded-xl px-4 py-3 text-green-900 text-sm focus:outline-none focus:ring-1 placeholder:text-green-800/30 ${
                        errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-green-900/10 focus:border-green-600 focus:ring-green-600'
                      }`}
                    />
                    {errors.email && <p className="text-red-600 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.email}</p>}
                  </div>
                </div>
                <div className="mt-5">
                  <label className="text-green-800/70 text-sm font-medium mb-1.5 block">Interest</label>
                  <select
                    value={form.interest}
                    onChange={(e) => updateField('interest', e.target.value)}
                    className="w-full bg-beige-100 border border-green-900/10 rounded-xl px-4 py-3 text-green-900 text-sm focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 cursor-pointer"
                  >
                    <option>Custom Clothing</option>
                    <option>Art Commission</option>
                    <option>Workshop Booking</option>
                    <option>General Enquiry</option>
                  </select>
                </div>
                <div className="mt-5">
                  <label className="text-green-800/70 text-sm font-medium mb-1.5 block">Message *</label>
                  <textarea
                    rows={4}
                    value={form.message}
                    onChange={(e) => updateField('message', e.target.value)}
                    placeholder="Tell us about your project or idea..."
                    className={`w-full bg-beige-100 border rounded-xl px-4 py-3 text-green-900 text-sm focus:outline-none focus:ring-1 resize-none placeholder:text-green-800/30 ${
                      errors.message ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-green-900/10 focus:border-green-600 focus:ring-green-600'
                    }`}
                  />
                  {errors.message && <p className="text-red-600 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.message}</p>}
                </div>
                <button
                  type="submit"
                  disabled={sending}
                  className={`mt-6 w-full py-3.5 rounded-full font-semibold text-sm tracking-wider uppercase transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    sending
                      ? 'bg-green-700 text-beige-300 cursor-wait'
                      : 'bg-green-900 hover:bg-green-800 text-beige-100 hover:shadow-lg hover:shadow-green-900/30'
                  }`}
                >
                  {sending ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
                  ) : (
                    <><Send className="w-4 h-4" /> Send Enquiry</>
                  )}
                </button>
              </form>
            )}
          </div>
        </Animate>
      </div>
    </section>
  );
}

// ─── Back to Top ───────────────────────────────────────────────
function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const fn = () => setVisible(window.scrollY > 600);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-8 right-8 z-50 bg-green-900 hover:bg-green-800 text-beige-100 w-12 h-12 rounded-full shadow-xl shadow-green-900/30 flex items-center justify-center transition-all hover:scale-110 cursor-pointer animate-fade-in"
      aria-label="Back to top"
    >
      <ChevronUp className="w-5 h-5" />
    </button>
  );
}

// ─── Footer ────────────────────────────────────────────────────
function Footer() {
  const scrollTo = (href: string) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="bg-green-900 border-t border-green-800">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-12 items-center">
          <div>
            <button onClick={() => scrollTo('#hero')} className="flex items-center gap-2 group mb-4 cursor-pointer">
              <Scissors className="w-5 h-5 text-green-400 group-hover:text-beige-400 transition-colors rotate-[-45deg]" />
              <span className="font-[family-name:var(--font-display)] text-xl font-semibold text-beige-100">chreby louise</span>
            </button>
            <p className="text-beige-300/50 text-sm leading-relaxed max-w-xs">
              Handmade clothing, original art, and crafted goods.
              Every piece tells a story of creativity and care.
            </p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-8 flex-wrap">
              {[
                { label: 'Home', href: '#hero' },
                { label: 'About', href: '#about' },
                { label: 'Collection', href: '#collection' },
                { label: 'Art', href: '#artcrafts' },
                { label: 'Shop', href: '#shop' },
                { label: 'Contact', href: '#contact' },
              ].map(l => (
                <button key={l.href} onClick={() => scrollTo(l.href)} className="text-beige-300/60 hover:text-beige-100 text-sm transition-colors cursor-pointer">
                  {l.label}
                </button>
              ))}
            </div>
          </div>
          <div className="text-right">
            <a href="https://www.instagram.com/chreby_louise/" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-beige-300/60 hover:text-green-400 text-sm transition-colors">
              <Instagram size={18} /> @chreby_louise
            </a>
            <p className="text-beige-300/30 text-xs mt-3">Made with ❤️ and creativity</p>
          </div>
        </div>
        <div className="border-t border-green-800 mt-12 pt-8 text-center">
          <p className="text-beige-300/30 text-xs">© {new Date().getFullYear()} Chreby Louise. All rights reserved. ✦ Clothing · Art · Crafts</p>
        </div>
      </div>
    </footer>
  );
}

// ─── App ───────────────────────────────────────────────────────
export default function App() {
  const [activeSection, setActiveSection] = useState('hero');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [lightboxAlt, setLightboxAlt] = useState('');
  const [enquiryInterest, setEnquiryInterest] = useState('');

  // Track active section
  useEffect(() => {
    const sections = ['hero', 'about', 'collection', 'artcrafts', 'shop', 'contact'];
    const observers: IntersectionObserver[] = [];

    sections.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveSection(id);
        },
        { threshold: 0.3 }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach(o => o.disconnect());
  }, []);

  // Toast system
  const addToast = useCallback((message: string, type: ToastType) => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Lightbox
  const openLightbox = useCallback((src: string, alt: string) => {
    setLightboxSrc(src);
    setLightboxAlt(alt);
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxSrc(null);
    setLightboxAlt('');
  }, []);

  // Product/Service enquiry flow
  const handleEnquire = useCallback((interest: string) => {
    setEnquiryInterest(interest);
    addToast(`Enquiring about: ${interest}`, 'info');
  }, [addToast]);

  const handleProductEnquire = useCallback((name: string) => {
    setEnquiryInterest(`General Enquiry — interested in: ${name}`);
    addToast(`Enquiring about "${name}" — form ready below!`, 'info');
  }, [addToast]);

  // Reset enquiry interest after form picks it up
  useEffect(() => {
    if (enquiryInterest) {
      const timer = setTimeout(() => setEnquiryInterest(''), 500);
      return () => clearTimeout(timer);
    }
  }, [enquiryInterest]);

  return (
    <div className="min-h-screen bg-beige-100">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <Lightbox src={lightboxSrc} alt={lightboxAlt} onClose={closeLightbox} />
      <BackToTop />
      <Navbar activeSection={activeSection} />
      <Hero />
      <About />
      <Collection onImageClick={openLightbox} />
      <QuoteBanner />
      <ArtCrafts onImageClick={openLightbox} />
      <Services onEnquire={handleEnquire} />
      <Shop onProductEnquire={handleProductEnquire} />
      <InstagramCTA />
      <Contact initialInterest={enquiryInterest} onToast={addToast} />
      <Footer />
    </div>
  );
}
