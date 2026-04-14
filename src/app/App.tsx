import { useEffect, useRef, useState, type ReactNode } from 'react';
import { motion, useInView } from 'motion/react';
import { ImageWithFallback } from './components/figma/ImageWithFallback';

/* ─── Scroll-reveal wrapper ─── */
function Reveal({ children, delay = 0, direction = 'up', className = '' }: {
  children: ReactNode; delay?: number; direction?: 'up' | 'left' | 'right' | 'none'; className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const variants: Record<string, Record<string, number>> = {
    up: { y: 60 }, left: { x: 80 }, right: { x: -80 }, none: {},
  };
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, ...variants[direction] }}
      animate={inView ? { opacity: 1, y: 0, x: 0 } : {}}
      transition={{ duration: 0.9, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Parallax image section ─── */
function ParallaxImage({ src, alt, overlay }: { src: string; alt: string; overlay: string }) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <ImageWithFallback src={src} alt={alt} className="w-full h-full object-cover" />
      <div className={`absolute inset-0 ${overlay}`} />
    </div>
  );
}

/* ─── Animated counter ─── */
function Counter({ value, suffix = '', color }: { value: number; suffix?: string; color: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 2000;
    const step = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, value]);

  return (
    <div ref={ref} className={`font-['Crimson_Pro'] text-6xl md:text-8xl ${color}`}>
      {display}{suffix}
    </div>
  );
}

/* ─── Floating particles ─── */
function Particles({ count = 30, color = 'rgba(255,255,255,0.08)' }) {
  const particles = useRef(
    Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 20 + 15,
      delay: Math.random() * -20,
    }))
  ).current;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size, background: color }}
          animate={{ y: [0, -100, 0], opacity: [0, 0.8, 0] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'linear' }}
        />
      ))}
    </div>
  );
}

/* ─── Horizontal divider with glow ─── */
function GlowDivider({ color }: { color: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  return (
    <motion.div
      ref={ref}
      className="relative h-px w-full max-w-xl mx-auto my-4"
      initial={{ scaleX: 0, opacity: 0 }}
      animate={inView ? { scaleX: 1, opacity: 1 } : {}}
      transition={{ duration: 1.5, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <div className={`absolute inset-0 bg-gradient-to-r from-transparent ${color} to-transparent`} />
      <div className={`absolute inset-0 bg-gradient-to-r from-transparent ${color} to-transparent blur-sm`} />
    </motion.div>
  );
}

/* ─── Chapter navigation dots ─── */
function ChapterNav({ active }: { active: number }) {
  const chapters = [
    { label: 'Harmony', color: 'bg-amber-500' },
    { label: 'Acceleration', color: 'bg-red-500' },
    { label: 'Reckoning', color: 'bg-blue-500' },
    { label: 'Hope', color: 'bg-emerald-500' },
  ];
  return (
    <motion.nav
      className="fixed right-6 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-4 items-end"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 1.5, duration: 0.8 }}
    >
      {chapters.map((ch, i) => (
        <a
          key={ch.label}
          href={`#chapter-${i + 1}`}
          className="group flex items-center gap-3"
        >
          <span className={`font-['Work_Sans'] text-xs tracking-widest uppercase transition-all duration-300 ${active === i ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'} text-gray-300`}>
            {ch.label}
          </span>
          <span className={`block rounded-full transition-all duration-500 ${active === i ? `w-3 h-3 ${ch.color}` : 'w-2 h-2 bg-white/20 group-hover:bg-white/50'}`} />
        </a>
      ))}
    </motion.nav>
  );
}

/* ════════════════════════════════════════════════════════════════════════ */

export default function App() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeChapter, setActiveChapter] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(window.scrollY / totalHeight);

      // Determine active chapter
      const sections = document.querySelectorAll('[data-chapter]');
      sections.forEach((s, i) => {
        const rect = s.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.5 && rect.bottom > 0) setActiveChapter(i);
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-[#060608] text-white overflow-x-hidden selection:bg-amber-500/30">
      {/* Progress bar */}
      <motion.div
        className="fixed top-0 left-0 h-[2px] z-50 origin-left"
        style={{
          scaleX: scrollProgress,
          background: 'linear-gradient(90deg, #f59e0b, #ef4444, #3b82f6, #10b981)',
        }}
      />

      <ChapterNav active={activeChapter} />

      {/* ═══ HERO ═══ */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <ParallaxImage
          src="/intro.jpg"
          alt="Urban Asia shrouded in smog"
          overlay="bg-gradient-to-b from-black/80 via-black/50 to-[#060608]"
        />
        <Particles count={40} />

        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <motion.h1
              className="font-['Crimson_Pro'] text-7xl md:text-[10rem] mb-4 tracking-tight leading-none"
              initial={{ opacity: 0, y: 40, letterSpacing: '0.1em' }}
              animate={{ opacity: 1, y: 0, letterSpacing: '-0.02em' }}
              transition={{ duration: 1.6, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              Permanent Construction
            </motion.h1>
          </motion.div>

          <motion.p
            className="font-['Work_Sans'] text-xl md:text-2xl text-amber-400/90 mb-10 tracking-[0.2em] uppercase"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
          >
            Why Asia Is Always Building and Never Finished
          </motion.p>

          <motion.div
            className="w-32 h-px mx-auto"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.5, delay: 1.2 }}
            style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)' }}
          />
        </div>

        <motion.div
          className="absolute bottom-12 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          <motion.div
            className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center pt-2"
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <motion.div
              className="w-1 h-2 bg-white/40 rounded-full"
              animate={{ y: [0, 8, 0], opacity: [1, 0.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>
        </motion.div>
      </section>

      {/* ═══ INTRODUCTION ═══ */}
      <section className="relative py-40 px-6">
        <Particles count={15} color="rgba(245,158,11,0.06)" />
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <p className="font-['Crimson_Pro'] text-3xl md:text-5xl leading-snug mb-12 text-gray-200">
              {' '}
              <motion.span
                className="text-amber-400 italic inline-block"
                whileInView={{ backgroundSize: '100% 2px' }}
                initial={{ backgroundSize: '0% 2px' }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.5 }}
                style={{ backgroundImage: 'linear-gradient(to right, #f59e0b, #f59e0b)', backgroundPosition: 'bottom left', backgroundRepeat: 'no-repeat' }}
              >
                Introduction
              </motion.span>
              
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <p className="font-['Work_Sans'] text-xl leading-relaxed text-gray-500">
              Somewhere in Jakarta, an old man named Maksim, whose story is drawn from documentary footage of the city’s sinking coastline, carefully lowers himself towards the water. Surrounding them is the wreckage of his former residence drifting on the surface. He gets into his weathered fishing boat, which groans and sways beneath him. It is all he has left, where he now sleeps and calls ‘home’.

              <span className="block my-10">
                <span className="block rounded-sm overflow-hidden border border-white/10 bg-black/30">
                  <ImageWithFallback
                    src="/fig1.png"
                    alt="Maksim getting into his fishing boat"
                    className="w-full h-auto object-cover"
                  />
                </span>
                <span className="block mt-3 text-sm leading-relaxed text-gray-600">
                  Maksim getting into his fishing boat (From "Why Jakarta is Sinking" by Vox, 2021, YouTube).
                </span>
              </span>

              <span className="block my-10">
                <span className="block rounded-sm overflow-hidden border border-white/10 bg-black/30">
                  <ImageWithFallback
                    src="/fig2.png"
                    alt="Maksim's fishing boat as a home"
                    className="w-full h-auto object-cover"
                  />
                </span>
                <span className="block mt-3 text-sm leading-relaxed text-gray-600">
                  Maksim's fishing boat for a home (From "Why Jakarta is Sinking" by Vox, 2021, YouTube).
                </span>
              </span>
              Many people across Indonesia, especially fishermen like Maksim, live at the mercy of forces beyond their control. Jakarta, the city he calls home, is sinking each day. The very waters that sustain men like him, that carry his boat out to sea every morning and put food on his table, are the same waters that slowly swallow all he has on land. 
              <br></br><br></br>
              Maksim mentions that to counter this, seawalls have been erected as a promise of protection, for life as they knew it against the encroaching tide. 
              <br></br><br></br>
              But the promise has proven hollow. Even the walls are sinking now.
              <br></br><br></br>
              “Build, add a meter, sink, add another meter…” he says, pointing at the old embankments, which have already been built four times. It is never finished.
              
              <span className="block my-10">
                <span className="block rounded-sm overflow-hidden border border-white/10 bg-black/30">
                  <ImageWithFallback
                    src="/fig3.png"
                    alt="Maksim pointing at old embankments in Jakarta"
                    className="w-full h-auto object-cover"
                  />
                </span>
                <span className="block mt-3 text-sm leading-relaxed text-gray-600">
                  Maksim pointing at old embankments in Jakarta (From "Why Jakarta is Sinking" by Vox, 2021, YouTube).
                </span>
              </span>

              "Never finished" is not merely an observation about construction timelines, but a condition of being. As megaproject after megaproject rises from cleared land and displaced communities, we look at how environmental compromises, history and social hierarchy become sediment into the very promises development makes. Each is announced with the language of transformation, yet it doesn’t seem to do much for the vulnerabilities it claimed to resolve. And as such, some communities remain peripheral, not despite development, but often because of it.
              <br></br><br></br>
              This raises the central question; how is it that development runs so ceaselessly, yet produces such little change for those who need it? To answer this, we’ll explore how the hunger for development is inseparable from the wounds of colonialism, and systematic extraction that leaves regions with the infrastructure of exploitation rather than foundations to flourish. We’ll also see how despite unfavourable circumstances, hope seems to continue triumphing among communities and enabling development, in its own way.
              <br></br><br></br>
              This piece argues that Asia’s ‘permanent construction’ reflects a deeper socio-ecological condition, where historical inequalities, environmental harm, and unevenly distributed hope continuously reproduce the need to build.


            </p>
          </Reveal>
        </div>
      </section>

      {/* ═══ CHAPTER I: HARMONY ═══ */}
      <section id="chapter-1" data-chapter className="relative min-h-screen flex items-center">
        <ParallaxImage
          src="chap1.jpg"
          alt="Zen garden in Asia"
          overlay="bg-gradient-to-r from-black/90 via-black/60 to-black/30"
        />

        <div className="relative z-10 max-w-5xl mx-auto px-6 py-32">
          <Reveal direction="left">
            <div className="backdrop-blur-md bg-black/30 p-10 md:p-16 rounded-sm border border-amber-500/20 shadow-2xl shadow-amber-500/5">
              <motion.span
                className="font-['Work_Sans'] text-amber-500 text-xs tracking-[0.4em] uppercase mb-6 block"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                Chapter I
              </motion.span>
              <h2 className="font-['Crimson_Pro'] text-5xl md:text-8xl mb-8 bg-gradient-to-r from-amber-200 to-amber-500 bg-clip-text text-transparent">
                The Architectural, 'Dangling Carrot' of Promise
              </h2>
              <GlowDivider color="via-amber-500/50" />
              <p className="font-['Work_Sans'] text-lg md:text-xl leading-relaxed text-gray-300 mt-8">
                For millennia, Asia's civilizations lived in delicate balance with nature. Rice terraces carved into mountainsides, monsoon rhythms governing life, and ecosystems that sustained billions. This was not untouched wilderness, but human presence woven into the natural fabric—adaptation, not domination.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ TRANSITION ═══ */}
      <section className="relative py-44 px-6 bg-gradient-to-b from-[#060608] via-zinc-950 to-[#060608] overflow-hidden">
        <Particles count={20} color="rgba(239,68,68,0.06)" />
        <div className="max-w-4xl mx-auto text-center">
          <Reveal>
            <motion.p
              className="font-['Crimson_Pro'] text-5xl md:text-7xl italic text-gray-500"
              whileInView={{ color: '#e5e5e5' }}
              viewport={{ once: true }}
              transition={{ duration: 2 }}
            >
              Then, everything changed.
            </motion.p>
          </Reveal>
          <GlowDivider color="via-red-600/60" />
        </div>
      </section>

      {/* ═══ CHAPTER II: THE GREAT ACCELERATION ═══ */}
      <section id="chapter-2" data-chapter className="relative min-h-screen flex items-center">
        <ParallaxImage
          src="https://images.unsplash.com/photo-1688693098098-27320ad6bb35?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhJTIwaW5kdXN0cmlhbCUyMGZhY3RvcnklMjBwb2xsdXRpb258ZW58MXx8fHwxNzc2MTYxNjc1fDA&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Industrial smokestacks"
          overlay="bg-gradient-to-l from-black/90 via-black/60 to-black/30"
        />

        <div className="relative z-10 max-w-5xl mx-auto px-6 py-32 ml-auto md:ml-auto md:mr-12">
          <Reveal direction="right">
            <div className="backdrop-blur-md bg-black/30 p-10 md:p-16 rounded-sm border border-red-500/20 shadow-2xl shadow-red-500/5">
              <motion.span
                className="font-['Work_Sans'] text-red-500 text-xs tracking-[0.4em] uppercase mb-6 block"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                Chapter II
              </motion.span>
              <h2 className="font-['Crimson_Pro'] text-5xl md:text-8xl mb-8 bg-gradient-to-r from-red-300 to-red-600 bg-clip-text text-transparent">
                The Great Acceleration
              </h2>
              <GlowDivider color="via-red-600/50" />
              <p className="font-['Work_Sans'] text-lg md:text-xl leading-relaxed text-gray-300 mt-8 mb-6">
                In just seven decades, Asia transformed from agrarian societies to industrial superpowers. Factories rose where forests stood. Rivers that once ran clear now carry the byproducts of unprecedented manufacturing.
              </p>
              <p className="font-['Work_Sans'] text-lg md:text-xl leading-relaxed text-gray-300">
                China's GDP grew 75-fold since 1978. India lifted 271 million people out of poverty. Southeast Asia became the world's factory floor. This is human achievement on a staggering scale—and a Faustian bargain whose price is now coming due.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ STATISTICS ═══ */}
      <section className="relative py-40 bg-[#060608] overflow-hidden">
        <Particles count={20} color="rgba(255,255,255,0.04)" />
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { value: 60, suffix: '%', color: 'text-red-500', border: 'border-red-500/10 hover:border-red-500/30', glow: 'hover:shadow-red-500/10', label: 'of global CO₂ emissions now originate from Asia' },
              { value: 99, suffix: '%', color: 'text-orange-500', border: 'border-orange-500/10 hover:border-orange-500/30', glow: 'hover:shadow-orange-500/10', label: 'of Asians breathe air exceeding WHO pollution guidelines' },
              { value: 1.5, suffix: '°C', color: 'text-amber-500', border: 'border-amber-500/10 hover:border-amber-500/30', glow: 'hover:shadow-amber-500/10', label: 'warming threshold we are racing toward' },
            ].map((stat, i) => (
              <Reveal key={stat.label} delay={i * 0.2}>
                <div className={`text-center border ${stat.border} p-10 bg-white/[0.02] backdrop-blur-sm rounded-sm transition-all duration-700 hover:shadow-2xl ${stat.glow} hover:bg-white/[0.04]`}>
                  <Counter value={stat.value === 1.5 ? 15 : stat.value} suffix={stat.value === 1.5 ? '' : stat.suffix} color={stat.color} />
                  {stat.value === 1.5 && (
                    <span className={`font-['Crimson_Pro'] text-6xl md:text-8xl ${stat.color}`}>
                      {/* displayed via counter: shows 15 but we override */}
                    </span>
                  )}
                  <p className="font-['Work_Sans'] text-gray-500 mt-4">{stat.label}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CHAPTER III: THE RECKONING ═══ */}
      <section id="chapter-3" data-chapter className="relative min-h-screen flex items-center">
        <ParallaxImage
          src="https://images.unsplash.com/photo-1741081288260-877057e3fa27?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhJTIwY2xpbWF0ZSUyMGNoYW5nZSUyMGZsb29kaW5nfGVufDF8fHx8MTc3NjE2MTY3NXww&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Flooding in Asia"
          overlay="bg-gradient-to-t from-[#060608] via-black/70 to-blue-950/30"
        />

        <div className="relative z-10 max-w-5xl mx-auto px-6 py-32">
          <Reveal direction="left">
            <div className="backdrop-blur-md bg-black/30 p-10 md:p-16 rounded-sm border border-blue-500/20 shadow-2xl shadow-blue-500/5">
              <motion.span
                className="font-['Work_Sans'] text-blue-400 text-xs tracking-[0.4em] uppercase mb-6 block"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                Chapter III
              </motion.span>
              <h2 className="font-['Crimson_Pro'] text-5xl md:text-8xl mb-8 bg-gradient-to-r from-blue-300 to-blue-600 bg-clip-text text-transparent">
                The Reckoning
              </h2>
              <GlowDivider color="via-blue-500/50" />
              <p className="font-['Work_Sans'] text-lg md:text-xl leading-relaxed text-gray-300 mt-8 mb-6">
                The Mekong Delta, once the rice bowl of Vietnam, is sinking beneath rising seas. Monsoons have become erratic, alternating between catastrophic floods and punishing droughts. The Himalayas—Asia's water tower—are losing their glaciers at an accelerating rate.
              </p>
              <p className="font-['Work_Sans'] text-lg md:text-xl leading-relaxed text-gray-300">
                This is not a distant future. It is happening now. Communities are being displaced, food security is threatened, and the poorest—who contributed least to this crisis—bear its heaviest burden.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ QUOTE ═══ */}
      <section className="relative py-48 px-6 bg-[#060608] overflow-hidden">
        <Particles count={15} color="rgba(255,255,255,0.03)" />
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <motion.blockquote
              className="font-['Crimson_Pro'] text-3xl md:text-5xl italic text-center text-gray-400 leading-snug"
              whileInView={{ color: '#d1d5db' }}
              viewport={{ once: true }}
              transition={{ duration: 2 }}
            >
              "We are the first generation to feel the impact of climate change, and the last generation that can do something about it."
            </motion.blockquote>
          </Reveal>
          <Reveal delay={0.4}>
            <p className="font-['Work_Sans'] text-center mt-10 text-gray-600 tracking-widest text-sm uppercase">— Barack Obama</p>
          </Reveal>
        </div>
      </section>

      {/* ═══ CHAPTER IV: HOPE IN ACTION ═══ */}
      <section id="chapter-4" data-chapter className="relative min-h-screen flex items-center overflow-hidden">
        <ParallaxImage
          src="https://images.unsplash.com/photo-1739389391965-70ff1eb709bf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aW5kJTIwdHVyYmluZXMlMjBncmVlbiUyMGVuZXJneSUyMGZpZWxkfGVufDF8fHx8MTc3NjE2MjMyNHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="Wind turbines green energy"
          overlay="bg-gradient-to-r from-[#060608]/95 via-[#060608]/60 to-emerald-950/20"
        />
        <Particles count={25} color="rgba(16,185,129,0.06)" />

        <div className="relative z-10 max-w-5xl mx-auto px-6 py-32">
          <Reveal direction="left">
            <div className="backdrop-blur-md bg-black/30 p-10 md:p-16 rounded-sm border border-emerald-500/20 shadow-2xl shadow-emerald-500/5">
              <motion.span
                className="font-['Work_Sans'] text-emerald-400 text-xs tracking-[0.4em] uppercase mb-6 block"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                Chapter IV
              </motion.span>
              <h2 className="font-['Crimson_Pro'] text-5xl md:text-8xl mb-8 bg-gradient-to-r from-emerald-300 to-emerald-600 bg-clip-text text-transparent">
                Hope in Action
              </h2>
              <GlowDivider color="via-emerald-500/50" />
              <p className="font-['Work_Sans'] text-lg md:text-xl leading-relaxed text-gray-300 mt-8 mb-6">
                Yet within this crisis lies unprecedented opportunity. Asia is not just the problem—it is also the solution. China leads the world in renewable energy installation. India's solar capacity has increased 17-fold in a decade.
              </p>
              <p className="font-['Work_Sans'] text-lg md:text-xl leading-relaxed text-gray-300 mb-6">
                From urban forests in Singapore to community-led conservation in Bhutan, from Japan's circular economy initiatives to South Korea's green new deal—innovation is flourishing.
              </p>
              <p className="font-['Work_Sans'] text-lg md:text-xl leading-relaxed text-emerald-300/80 italic">
                The question is not whether we can change course. The question is whether we will—with the speed and scale that this moment demands.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ CLOSING ═══ */}
      <section className="relative py-48 px-6 bg-gradient-to-b from-[#060608] to-black overflow-hidden">
        <Particles count={30} color="rgba(245,158,11,0.05)" />
        <div className="max-w-4xl mx-auto text-center">
          <Reveal>
            <h3 className="font-['Crimson_Pro'] text-4xl md:text-7xl mb-12 text-gray-300 leading-snug">
              The Anthropocene is not just about what we've done to the planet.
            </h3>
          </Reveal>
          <Reveal delay={0.4}>
            <motion.p
              className="font-['Work_Sans'] text-2xl md:text-3xl mb-20 leading-relaxed"
              initial={{ backgroundSize: '0% 100%' }}
              whileInView={{ backgroundSize: '100% 100%' }}
              viewport={{ once: true }}
              transition={{ duration: 2, delay: 0.5 }}
              style={{
                background: 'linear-gradient(90deg, #f59e0b, #10b981)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              It's about what we choose to do next.
            </motion.p>
          </Reveal>

          <motion.div
            className="w-40 h-px mx-auto mb-20"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 2 }}
            style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)' }}
          />

          <Reveal delay={0.6}>
            <p className="font-['Work_Sans'] text-xs text-gray-600 tracking-[0.4em] uppercase">
              Asia's story is humanity's story
            </p>
          </Reveal>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="border-t border-white/5 py-12 px-6 bg-black">
        <div className="max-w-6xl mx-auto text-center">
          <p className="font-['Work_Sans'] text-xs text-gray-700">
            Images courtesy of Unsplash contributors
          </p>
        </div>
      </footer>
    </div>
  );
}
