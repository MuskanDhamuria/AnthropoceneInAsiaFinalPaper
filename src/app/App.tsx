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
    { label: 'Chapter 1', color: 'bg-amber-500' },
    { label: 'Chapter 2', color: 'bg-red-500' },
    { label: 'Chapter 3', color: 'bg-blue-500' },
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
          src="https://muskandhamuria.github.io/AnthropoceneInAsiaFinalPaper/intro.jpg"
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
              Somewhere in Jakarta, an old man named Maksim, whose story is drawn from documentary footage of the city's sinking coastline, carefully lowers himself towards the water. Surrounding him is the wreckage of his former residence drifting on the surface. He gets into his weathered fishing boat, which groans and sways beneath him. It is all he has left, where he now sleeps and calls 'home'.

              <span className="block my-10">
                <span className="block rounded-sm overflow-hidden border border-white/10 bg-black/30">
                  <ImageWithFallback
                    src="https://muskandhamuria.github.io/AnthropoceneInAsiaFinalPaper/fig1.png"
                    alt="Maksim getting into his fishing boat"
                    className="w-full h-auto object-cover"
                  />
                </span>
                <span className="block mt-3 text-sm leading-relaxed text-gray-600 text-center">
                  Maksim getting into his fishing boat<br></br> 
                  From ‘Why Jakarta is Sinking’ by Vox, 2021, YouTube 
                  <br></br>https://www.youtube.com/watch?v=Z9cJQN6lw3w

                </span>
              </span>

              <span className="block my-10">
                <span className="block rounded-sm overflow-hidden border border-white/10 bg-black/30">
                  <ImageWithFallback
                    src="https://muskandhamuria.github.io/AnthropoceneInAsiaFinalPaper/fig2.png"
                    alt="Maksim's fishing boat as a home"
                    className="w-full h-auto object-cover"
                  />
                </span>
                <span className="block mt-3 text-sm leading-relaxed text-gray-600 text-center">
                  Maksim's fishing boat for a home<br></br>
                  From ‘Why Jakarta is Sinking’ by Vox, 2021, YouTube 
                  <br></br> https://www.youtube.com/watch?v=Z9cJQN6lw3w
                </span>
              </span>
              Many people across Indonesia, especially fishermen like Maksim, live at the mercy of forces beyond their control. Jakarta, the city he calls home, is sinking each day. The very waters that sustain men like him, that carry his boat out to sea every morning and put food on his table, are the same waters that slowly swallow all he has on land. 
              <br></br><br></br>
              Maksim mentions that to counter this, seawalls have been erected as a promise of protection, for life as they knew it against the encroaching tide. 
              <br></br><br></br>
              But the promise has proven hollow. Even the walls are sinking now.
              <br></br><br></br>
              <i>“Build, add a meter, sink, add another meter…”</i> he says, pointing at the old embankments, which have already been built four times. It is <i>never finished</i>.
              
              <span className="block my-10">
                <span className="block rounded-sm overflow-hidden border border-white/10 bg-black/30">
                  <ImageWithFallback
                    src="https://muskandhamuria.github.io/AnthropoceneInAsiaFinalPaper/fig3.png"
                    alt="Maksim pointing at old embankments in Jakarta"
                    className="w-full h-auto object-cover"
                  />
                </span>
                <span className="block mt-3 text-sm leading-relaxed text-gray-600 text-center">
                  Maksim pointing at old embankments in Jakarta<br></br>
                  From ‘Why Jakarta is Sinking’ by Vox, 2021, YouTube 
                  <br></br> https://www.youtube.com/watch?v=Z9cJQN6lw3w
                </span>
              </span>

              "Never finished" is not merely an observation about construction timelines, but a condition of being. As megaproject after megaproject rises from cleared land and displaced communities, we look at how environmental compromises, history and social hierarchy become sediment into the very promises development makes. Each is announced with the language of transformation, yet it doesn’t seem to do much for the vulnerabilities it claimed to resolve. And as such, some communities remain peripheral, not despite development, but often because of it.
              <br></br><br></br>
              This raises the central question;<i> how is it that development runs so ceaselessly, yet produces such little change for those who need it?</i> To answer this, we’ll explore how the hunger for development is inseparable from the wounds of colonialism, and systematic extraction that leaves regions with the infrastructure of exploitation. We’ll also see how despite unfavourable circumstances, hope seems to continue triumphing among communities and enabling development, in its own way.
              <br></br><br></br>
              This piece argues that Asia’s ‘permanent construction’ reflects a deeper socio-ecological condition, where historical inequalities, environmental harm, and unevenly distributed hope continuously reproduce the need to build.


            </p>
          </Reveal>
        </div>
      </section>

      {/* ═══ CHAPTER I ═══ */}
      <section id="chapter-1" data-chapter className="relative min-h-screen flex items-center">
        <ParallaxImage
          src="https://muskandhamuria.github.io/AnthropoceneInAsiaFinalPaper/chap1.jpg"
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
                
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ TRANSITION ═══ */}
      <section className="relative py-44 px-6 bg-gradient-to-b from-[#060608] via-zinc-950 to-[#060608] overflow-hidden">
        <Particles count={20} color="rgba(239,68,68,0.06)" />
        <div className="max-w-4xl mx-auto ">
          <Reveal>
            <motion.p
              className=" font-['Work_Sans'] text-xl leading-relaxed text-gray-500"
             
              viewport={{ once: true }}
              transition={{ duration: 2 }}
            >
              Maksim has probably heard of Nusantara by now. Since its announcement in 2019, the new capital has been quite the buzz in Indonesian public life. Even its name, an Old Javanese word for "archipelago," evokes the full sweep of Indonesian civilization. Carved out of the rainforests of East Kalimantan, it was conceived as everything Jakarta was not. Green, smart, sustainable, and something worth believing in.
              <br></br><br></br>

              And people<i> do </i>believe. 
              <br></br><br></br>
              The thing about megaprojects is that they aren't just construction endeavours. They seem to arrive carrying the aching hope for folks like Maksim that things are finally about to change. That the better life, the one that always seemed to belong to someone else, somewhere else, is now being built for <i>you</i>. 
              <br></br><br></br>
              However, this is the aforementioned 'dangling carrot' in its architectural form. The renderings do not show what gets cleared to make room for these megaprojects. Development in Asia operates through multiple overlapping governmentalities, pulling simultaneously in different directions (Fletcher, 2017). Nusantara, in particular, is marketed under a neoliberal sustainability discourse - solar panels, electric vehicles, a forest city harmonious with nature - while a sovereign rationality drives the speed and scale of construction, and a disciplinary one manages the communities displaced in the process. These contradictions somehow produce a vision coherent enough to inspire belief, while remaining structurally incompatible in practice.
              <br></br><br></br>
              In Nusantara's case, it is the environment bearing the cost of these competing rationalities. Over 2,000 hectares of mangrove forest are wiped out - an area of forest more than three times the size of Singapore vanished in Indonesia last year, leaving environmental groups and nearby communities deeply concerned. But ironically, the sustainability rhetoric seems to obscure deforestation. This is a form of slow violence, a harm that accumulates gradually and out of sight, subtle enough to be absorbed into the landscape before it can be named as a crisis (Nixon, 2011).

              <br></br><br></br>

              <motion.blockquote
              className="font-['Crimson_Pro'] text-2xl  italic text-center text-gray-400 leading-snug"
              viewport={{ once: true }}
              transition={{ duration: 2 }}
            >
             "Nusantara is just another driver of deforestation. This is contrary to the green city jargon we heard a lot of times. There's nothing green in Nusantara."
              <br></br><br></br>
              - Anggi Putra Prayoga, communications manager at Forest Watch Indonesia (FWI), a non-governmental organisation. 
              <br></br>
            </motion.blockquote>

              <br></br>

              <span className="block my-10">
                <span className="block rounded-sm overflow-hidden border border-white/10 bg-black/30">
                  <ImageWithFallback
                    src="https://muskandhamuria.github.io/AnthropoceneInAsiaFinalPaper/fig4.png"
                    className="w-full h-auto object-cover"
                  />
                </span>
                <span className="block mt-3 text-sm leading-relaxed text-gray-600 text-center">
                  The construction of the Central Government Core Area of Nusantara Capital City, East Kalimantan, 2023<br></br>
                  From ANTARA/M Risyal Hidayat
                  <br></br> https://magz.tempo.co/read/environment/41661/deforestation-in-nusantara-capital-city
                </span>
              </span>

              Environment aside, the human costs are just as stark. The Balik, an indigenous community in Sepaku along the Kalimantan river, report flooded fields and poisoned water and have been actively protesting the very project that claimed to benefit Indonesians. In March 2023, dozens of Balik residents, including traditional leaders, women, and youth, put up banners across their village rejecting forced eviction from ancestral lands they have occupied for generations. 
              <br></br><br></br>
              The notion that they must protest at all is telling. Authoritarian environmental governance suggests this is structurally predictable (Li & Zinda, 2023). States that move fast on development often do so by skipping the conversations that would make those decisions accountable to the people most affected.
              <br></br><br></br>
              When we see such situations, it is worth asking whether the communities or ecosystems that bear these costs aren't simply unfortunate casualties of progress, but structurally positioned to expedite someone else's promise.
              <br></br>

              <span className="block my-10">
                <span className="block rounded-sm overflow-hidden border border-white/10 bg-black/30">
                  <ImageWithFallback
                    src="https://muskandhamuria.github.io/AnthropoceneInAsiaFinalPaper/fig5.png"
                    className="w-full h-auto object-cover"
                  />
                </span>
                <span className="block mt-3 text-sm leading-relaxed text-gray-600 text-center">
                  Indigenous People of Balik Tribes Refuse Eviction of Ancestral Historical Sites, 2023<br></br>
                  From JATAM East Kalimantan & AMAN East Kalimantan
                  <br></br> 
                  https://www.wrm.org.uy/node/20496
                </span>
              </span>
              
              As we travel across the South China Sea to Malaysia, the trajectory reaches a more unsettling perspective - what happens if after all that work, not much actually comes into proportionate fruition? 	A phenomenon often described as ‘ghost cities’.
                <br></br>

              <span className="block my-10">
                <span className="block rounded-sm overflow-hidden border border-white/10 bg-black/30">
                  <ImageWithFallback
                    src="https://muskandhamuria.github.io/AnthropoceneInAsiaFinalPaper/fig6.png"
                    className="w-full h-auto object-cover"
                  />
                </span>
                <span className="block mt-3 text-sm leading-relaxed text-gray-600 text-center">
                  Empty residential towers and deserted public spaces in Forest City, Johor, 2023<br></br>
                  From The BBC News, 2023
                  <br></br> 
                  https://www.bbc.com/news/business-67610677 
                </span>
              </span>

              Introduced as a <i>'dream paradise for all mankind'</i>, Forest City was conceived as an ambitious, future-facing development on reclaimed land in the Straits of Johor (BBC News, 2023). Planned across four artificial islands, it was envisioned as a home for close to a million people, a future-facing city shaped by global mobility and investment (News.com.au, 2023). Yet, much of its appeal was directed toward international buyers. For many Malaysians, the development remained somewhat financially distant. The future it projected seemed to hover just beyond the people living closest to it (The Malaysian Insight, 2018). 
              <br></br><br></br>
              Over time, the conditions that sustained this vision began to shift. Changes in capital flows, the disruptions of the COVID-19 pandemic, and broader economic and political recalibrations gradually reshaped demand (Al Jazeera, 2023). Today, Forest City now stands as a partial realisation of its original ambition. A beachside playground bears the marks of time and weather. A small children’s train continues its quiet circuit through corridors that echo more than they fill. 
              <br></br>
              <span className="block my-10">
                <span className="block rounded-sm overflow-hidden border border-white/10 bg-black/30">
                  <ImageWithFallback
                    src="https://muskandhamuria.github.io/AnthropoceneInAsiaFinalPaper/fig7.png"
                    className="w-full h-auto object-cover"
                  />
                </span>
                <span className="block mt-3 text-sm leading-relaxed text-gray-600 text-center">
                  Image of children's train running through an empty corridor in Forest City
                  <br></br>
                  From "Forest City Commercial Street" [Facebook page], 2023, Facebook
                  <br></br> 
                  https://www.facebook.com/ForestCityCommercial/photos/choo-choo-%E7%81%AB%E8%BD%A6%E6%9D%A5%E4%BA%86-come-join-us-for-some-seaside-fun-and-adventure-with-the-kiddy-ch/897711428370688/
                </span>
              </span>

              What places like this reveal is not just the haunting image of what could've been, but the nature of the vision itself. The 'dangling carrot' of development does not rely on full realisation to exert its force. As it turns out, the hunger to build has a much longer history than any single megaproject. The urgency that drives these visions, and frames development as not just desirable but existentially necessary, did not emerge from nowhere. It was produced, in large part, by the very forces that spent centuries preventing it.

            </motion.p>
          </Reveal>
          <GlowDivider color="via-amber-500/50" />
        </div>
      </section>

      {/* ═══ CHAPTER II═══ */}
      <section id="chapter-2" data-chapter className="relative min-h-screen flex items-center">
        <ParallaxImage
          src="https://muskandhamuria.github.io/AnthropoceneInAsiaFinalPaper/chap2.png"
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
                The Colonial Sediment and Asia's Hunger for Development
              </h2>
              <GlowDivider color="via-red-600/50" />
              
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ chap2content ═══ */}
      <section className="relative py-44 px-6 bg-gradient-to-b from-[#060608] via-zinc-950 to-[#060608] overflow-hidden">
        <Particles count={20} color="rgba(239,68,68,0.06)" />
        <div className="max-w-4xl mx-auto ">
          <Reveal>
            <motion.p
              className=" font-['Work_Sans'] text-xl leading-relaxed text-gray-500"
             
              viewport={{ once: true }}
              transition={{ duration: 2 }}
            >
              
              Colonial rule across Asia goes beyond mere conquering of land and abuse of power. Both of these conditions have seeped into the infrastructure of colonised countries in Asia. In Maksim’s case, his home of Jakarta carries this most literally. 
              <br></br><br></br>      
              When the Dutch East India Company established Batavia in the early seventeenth century, they razed the existing port of Jayakarta and rebuilt it in the image of Amsterdam-esque grid streets and canal networks. But they were used to separate the Dutch and elite populations from everyone else, with kampungs divided by ethnicity on the outside, and restricted bridge access controlling who could move where (Reid, 1988). Similarly with water infrastructure, only Europeans were considered citizens, so a web of pipes served the European neighbourhood while the native population continued drawing from untreated surface water. 
              <br></br><br></br>
              Today, those colonial canals still exist, buried beneath concrete or repurposed into drainage channels, and Jakarta's chronic flooding is partly due to foundations the Dutch built for trade, not for the millions who would eventually inhabit it. The mass housing projects, elevated toll roads threading over dense kampungs, and the constant filling and reclaiming of land at the coast, are the downstream consequences of a city trying to accommodate a population its original infrastructure was designed to exclude (Abeyasekere, 1987).
              <br></br>


              <span className="block my-10">
                <span className="block rounded-sm overflow-hidden border border-white/10 bg-black/30">
                  <ImageWithFallback
                    src="https://muskandhamuria.github.io/AnthropoceneInAsiaFinalPaper/fig8.png"
                    className="w-full h-auto object-cover"
                  />
                </span>
                <span className="block mt-3 text-sm leading-relaxed text-gray-600 text-center">
                  An aerial photo of people in flooded homes in Pasar Minggu district in Jakarta, 2025
                  <br></br>
                  From Chinadailyhk, 2025
                  <br></br> 
                  https://www.chinadailyhk.com/hk/article/606088 
                </span>
              </span>


              Beyond Indonesia, we also see this in the Philippines. Under Spanish rule, land had long been concentrated in the hands of a small elite, and independence did little to disrupt this arrangement. The old system of control was never dismantled, but absorbed into a national political class drawn from many of the same families (Putzel, 1992). Consequently, those with little claim to land found their opportunities in rural areas increasingly limited as access to stable livelihoods remained constrained, and their choices gradually narrowed toward the city, primarily Manila.
              <br></br><br></br>  
              This movement accumulated over time. Informal settlements formed along major roads and riverbanks, taking shape wherever space could be found (World Bank, 2017), while flyovers were layered above to keep the city in motion. New business districts rose on reclaimed land, extending the city outward, even as older neighbourhoods absorbed the strain of long-term neglect.
              <br></br>

              <span className="block my-10">
                <span className="block rounded-sm overflow-hidden border border-white/10 bg-black/30">
                  <ImageWithFallback
                    src="https://muskandhamuria.github.io/AnthropoceneInAsiaFinalPaper/fig91.png"
                    className="w-full h-auto object-cover"
                  />
                </span>
                <span className="block mt-3 text-sm leading-relaxed text-gray-600 text-center">
                  The slums of Manila, n.d
                  <br></br>
                  From Yahoo! News, 2013
                  <br></br> 
                  https://sg.news.yahoo.com/trying-revive-manilas-toxic-river-heart-034851496.html?guccounter=1&guce_referrer=aHR0cHM6Ly93d3cuZ29vZ2xlLmNvbS8&guce_referrer_sig=AQAAAHhFCcy0PE7D8OXGWO9N5MtStKNDEORxlsRMIcbRKJb9Ee5hDh-mQxwrPVVMQ2SRwnM3zjfABDI98EpJDlT0fVQMI0hTEBq2m8xZc49177S_nTlbF0slGA2pPWHs8oOqDOAPK4LcsnsTDtifCuQ3fsv_wbpA86wdbrTA9A9hxCdq
                </span>
              </span>

            <span className="block my-10">
                <span className="block rounded-sm overflow-hidden border border-white/10 bg-black/30">
                  <ImageWithFallback
                    src="https://muskandhamuria.github.io/AnthropoceneInAsiaFinalPaper/fig92.png"
                    className="w-full h-auto object-cover"
                  />
                </span>
                <span className="block mt-3 text-sm leading-relaxed text-gray-600 text-center">
                  Child in a slum in Manila, n.d
                  <br></br>
                  From The Borgen Project, n.d
                  <br></br> 
                  https://borgenproject.org/10-facts-about-slums-in-manila/
                </span>
              </span>

              


             Cases like these begin to suggest where the relentless building comes from. Countries stripped of their capacity to develop on their own terms did not emerge from colonialism with a clean slate, but with an urgency to construct what had once been denied to them (Amin, 1974). Industrialisation, urbanisation, and infrastructure became ways of re-establishing control over a future that had long been shaped by others. This becomes even clearer when we consider how the Anthropocene itself is shaped by uneven histories, a world where some regions were always positioned to bear the environmental and developmental burdens of others (Chakrabarty, 2009).
              <br></br><br></br>      
             Yet the promise of progress, which is so central to these projects, is not experienced in the same way by everyone (Harvey, 2006). It reaches some as tangible improvement, while remaining for others a distant possibility. It is within this uneven terrain that hope continues to circulate, drawing people forward even when its fulfilment remains uncertain. 
            </motion.p>
          </Reveal>
          <GlowDivider color="via-red-600/60" />
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
                The Distribution of Hope, and Why Asia Continues to Build
              </h2>
              <GlowDivider color="via-blue-500/50" />
              
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ chap3content ═══ */}
      <section className="relative py-44 px-6 bg-gradient-to-b from-[#060608] via-zinc-950 to-[#060608] overflow-hidden">
        <Particles count={20} color="rgba(239,68,68,0.06)" />
        <div className="max-w-4xl mx-auto ">
          <Reveal>
            <motion.p
              className=" font-['Work_Sans'] text-xl leading-relaxed text-gray-500"
             
              viewport={{ once: true }}
              transition={{ duration: 2 }}
            >
              
              Hope, it turns out, is not an equally distributed commodity. And that unevenness is itself a form of power.
              <br></br><br></br>
              Development does not end, even in cities that boast the highest skyscrapers and most lavish malls. The reason why we keep seeing cranes and machinery around us is not merely due to ongoing works, but because the conditions that made development urgent have never truly been resolved.
                <br></br><br></br>
              This is the central paradox. Growth and deprivation do not cancel each other out. Rather, they co-produce each other - a dynamic that David Harvey identifies in capitalist urbanisation, where accumulation and displacement occur simultaneously, generating both wealth and marginality within the same spaces. Cities like Jakarta and Manila expanded through an "informal proletariat” (Davis, 2006), which are populations necessary to the city's economy yet perpetually excluded from its protections.
              <br></br><br></br>
              But if development produces the very conditions it claims to resolve, the question becomes whether progress is possible without repeating that violence. The notion of the pluriverse suggests that non-violent progress already exists in the practices that formal development tends to erase. That is, communities maintaining ancestral land relationships, fisherfolk managing coastal ecosystems across generations, informal networks sustaining livelihoods outside the state's legibility (Escobar, 1995). Non-violent progress, then, is less about constructing anew and more about protecting what survives the bulldozer, resourcing existing systems of sustenance rather than clearing them to accommodate someone else's vision of the future.
              <br></br><br></br>
              However, what happens when that logic is ignored is visible along the Ciliwung River. Communities that had existed for generations were evicted in 2015 and 2016 under a flood mitigation programme tied to the development of the Sudirman Central Business District and MRT, which were celebrated elsewhere as a landmark of urban modernisation (The Jakarta Post, 2016). Instead of obtaining new housing, there was simply a concrete riverbank that was cleaner and more manageable for the city. As such, development was not delivered to the Ciliwung community as much as it was over them. And yet the city kept building, and people kept arriving, because Jakarta, for all that it withholds, still offers more than the villages they left behind.
              <br></br>


              <span className="block my-10">
                <span className="block rounded-sm overflow-hidden border border-white/10 bg-black/30">
                  <ImageWithFallback
                    src="https://muskandhamuria.github.io/AnthropoceneInAsiaFinalPaper/fig10.png"
                    className="w-full h-auto object-cover"
                  />
                </span>
                <span className="block mt-3 text-sm leading-relaxed text-gray-600 text-center">
                  Rows of settlements along Ciliwung River in Jakarta, 2019
                  <br></br>
                  From The Jakarta Post, 2019
                  <br></br> 
                  https://www.thejakartapost.com/news/2019/07/27/dry-season-turns-ciliwung-river-black-and-smelly.html 
                </span>
              </span>

              What sustains that preference over time, strangely, is visibility. Jakarta makes mobility legible in ways that rural Kalimantan cannot. You can see who has moved, trace the neighbour who arrived a decade before you and now runs a small workshop, whose daughter is in university. That observability keeps aspiration structurally alive, less a feeling than a social fact, continuously renewed by evidence of real movement around you. And for many, to be in Jakarta, even in its margins, is to be in proximity to something that might compound differently for your children.
              <br></br><br></br>  
              Such communities are therefore not passively banking on hope. Rather, they are using hope to build. Whether it be a house constructed room by room as remittances allow, or a community organisation negotiating with local governments over demolition timelines, or buying years of stability through careful relationship-building (Asian Development Bank, 2014). Across Asia, these small architectures of survival accumulate into a larger, collective insistence on remaining, on persisting, even when circumstances may not be immediately in their favour.
              <br></br>

              <span className="block my-10">
                <span className="block rounded-sm overflow-hidden border border-white/10 bg-black/30">
                  <ImageWithFallback
                    src="https://muskandhamuria.github.io/AnthropoceneInAsiaFinalPaper/fig11.png"
                    className="w-full h-auto object-cover"
                  />
                </span>
                <span className="block mt-3 text-sm leading-relaxed text-gray-600 text-center">
                  A family from rural Indonesia, among many others, moving to Jakarta for a better life, 2025
                  <br></br>
                  From Reuters, via The Straits Times, 2025
                  <br></br> 
                  https://www.straitstimes.com/asia/se-asia/thousands-arriving-in-jakarta-from-rural-areas-after-hari-raya-to-seek-jobs-face-urban-challenges
                </span>
              </span>

             </motion.p>
          </Reveal>
          <GlowDivider color="via-blue-500/50" />
        </div>
      </section>

      {/* ═══ CONCLUSION ═══ */}
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
                Conclusion
              </motion.span>
              
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <p className="font-['Work_Sans'] text-xl leading-relaxed text-gray-500">

              Asia will keep building. And as cranes continue to redraw the skylines of our cities, the more important question is not just what is being built, but who it is ultimately for and whether that can change over time.
                <br></br><br></br>      
              The gap between the ambitions of development and the needs of people is real, but it can be narrowed. As more attention is paid to who benefits, who is consulted, and who is left out, development can become less about distant futures and more about present realities. 
                <br></br><br></br>
               And, to conclude on a personal note, maybe there is reason to be hopeful in that possibility. Because even where large plans fall short, people continue to build lives with what they have. They adapt, rebuild and move forward – even if it means enjoying a simple meal amidst floodwaters (SimpleJoy, 2025). That persistence in and of itself is a form of development, more than the biggest megaprojects could claim.
             
              <span className="block my-10">
                <span className="block rounded-sm overflow-hidden border border-white/10 bg-black/30">
                  <ImageWithFallback
                    src="https://muskandhamuria.github.io/AnthropoceneInAsiaFinalPaper/fig12.png"
                    className="w-full h-auto object-cover"
                  />
                </span>
                <span className="block mt-3 text-sm leading-relaxed text-gray-600 text-center">
                  A man eats noodles amidst a flood in Jakarta, 2025<br></br> 
                  From ANTARA/Muhammad Iqbal, via The Jakarta Post, 2025
                  <br></br>https://adriatni.medium.com/jakarta-is-flooded-again-people-eat-noodles-and-move-on-e50752902f40 

                </span>
              </span>

              And so, Maksim crosses my mind once more. Maybe one day, he won't have to sleep in a fishing boat, rocked to sleep by the same waters that keep taking what little he has on land. But until then, he rows out each morning anyway, carrying with him the same hope that has outlasted every sunken wall. And it is because of  folks like him, and their tenacity, that I believe in the continuous development of Asia. <i>It might never be finished, but neither will he.</i>              
              <br></br><br></br>
              
              <span className="block my-10">
                <span className="block rounded-sm overflow-hidden border border-white/10 bg-black/30">
                  <ImageWithFallback
                    src="https://muskandhamuria.github.io/AnthropoceneInAsiaFinalPaper/fig13.png"
                    className="w-full h-auto object-cover"
                  />
                </span>
                <span className="block mt-3 text-sm leading-relaxed text-gray-600 text-center">
                  A fisherman in Indonesia, rowed out at sea, n.d<br></br>
                  From Pexels Images
                  <br></br> https://www.pexels.com/photo/man-sitting-on-fishing-boat-on-calm-body-of-water-2526652/
                </span>
              </span>

            

            </p>
          </Reveal>
        </div>
      </section>

      {/* ═══ references ═══ */}
      <section className="relative py-48 px-6 bg-gradient-to-b from-[#060608] to-black overflow-hidden">
        <Particles count={30} color="rgba(245,158,11,0.05)" />
        <div className="max-w-4xl mx-auto ">
          <Reveal>
            <h3 className="font-['Crimson_Pro'] text-4xl md:text-7xl mb-12 text-gray-300 leading-snug">
              References            
            </h3>

            <p className="font-['Work_Sans'] text-xl leading-relaxed text-gray-500">
              Abeyasekere, S. (1987). Jakarta: A history. Oxford University Press.
              <br></br><br></br>
              Amin, S. (1974). Accumulation on a world scale. Monthly Review Press.
              <br></br><br></br>
              Chakrabarty, D. (2009). The climate of history: Four theses. Critical Inquiry, 35(2), 197–222.
              <br></br><br></br>
              Davis, M. (2006). Planet of slums. Verso.
              <br></br><br></br>
              Escobar, A. (1995). Encountering development: The making and unmaking of the Third World. Princeton University Press.
              <br></br><br></br>
              Fisk, T. (n.d.). Man sitting on fishing boat on calm body of water [Photograph]. Pexels. https://www.pexels.com/photo/man-sitting-on-fishing-boat-on-calm-body-of-water-2526652/
              <br></br><br></br>
              Fletcher, R. (2017). Environmentality unbound: Multiple governmentalities in environmental politics. Geoforum, 85, 311–315.
              <br></br><br></br>
              Harvey, D. (2006). Spaces of global capitalism. Verso.
              <br></br><br></br>
              Lee, P. (2023). How a focus on Chinese buyers 'doomed' Malaysia's Forest City. Al Jazeera. https://www.aljazeera.com/news/2023/11/23/how-a-focus-on-chinese-buyers-doomed-malaysias-forest-city
              <br></br><br></br>
              Li, Y., & Zinda, J. A. (2023). Introduction: Authoritarian environmental governance in East Asia: Seven theses. Sociology of Development, 9(2), 109–130.
              <br></br><br></br>
              Malakunas, K. (2013). Trying to revive Manila's toxic river heart. Yahoo News. https://sg.news.yahoo.com/trying-revive-manilas-toxic-river-heart-034851496.html
              <br></br><br></br>
              Marsh, N. (2023). Forest City: Inside Malaysia's Chinese-built 'ghost city'. The BBC News. https://www.bbc.com/news/business-67610677
              <br></br><br></br>
              Nixon, R. (2011). Slow violence and the environmentalism of the poor. Harvard University Press.
              <br></br><br></br>
              Putzel, J. (1992). A captive land: The politics of agrarian reform in the Philippines. Catholic Institute for International Relations.
              <br></br><br></br>
              Reid, A. (1988). Southeast Asia in the age of commerce, 1450–1680. Yale University Press.
              <br></br><br></br>
              Severe flooding strikes Jakarta, surrounding cities after heavy rain. (2025). Chinadailyhk. https://www.chinadailyhk.com/hk/article/606088 
              <br></br><br></br>
              SimpleJoy. (2025). Jakarta is flooded again. People eat noodles and move on. Medium. https://adriatni.medium.com/jakarta-is-flooded-again-people-eat-noodles-and-move-on-e50752902f40 
              <br></br><br></br>
              The Borgen Project. (n.d). 10 Facts About Slums in Manila. https://borgenproject.org/10-facts-about-slums-in-manila/ 
              <br></br><br></br>
              The Jakarta Post. (2016). Dozens of Kampung Pulo evictees are at risk of losing new homes. https://www.thejakartapost.com/news/2016/04/12/dozens-of-kampung-pulo-evictees-at-risk-of-losing-new-homes.html 
              <br></br><br></br>
              The Jakarta Post. (2019). Dry season turns Ciliwung River black and smelly. https://www.thejakartapost.com/news/2019/07/27/dry-season-turns-ciliwung-river-black-and-smelly.html 
              <br></br><br></br>
              The Malaysian Insight. (2018). Johor's Forest City 'too expensive' for Malaysians, says developer. The Malaysian Insight. https://www.themalaysianinsight.com/s/94975
              <br></br><br></br>
              The Straits Times. (2025). Thousands arriving in Jakarta from rural areas after Hari Raya to seek jobs face urban challenges. https://www.straitstimes.com/asia/se-asia/thousands-arriving-in-jakarta-from-rural-areas-after-hari-raya-to-seek-jobs-face-urban-challenges 
              <br></br><br></br>
              Vox. (2021). Why Jakarta is sinking. YouTube. https://www.youtube.com/watch?v=Z9cJQN6lw3w 
              <br></br><br></br>
              World Bank. (2017). Promoting inclusive growth by creating opportunities for the urban poor: Philippines urbanization review policy notes. https://hdl.handle.net/10986/27141
              <br></br><br></br>
              World Rainforest Movement. (2023). Indonesia: Indigenous Balik reject the plan to evict their villages along the Sepaku river. World Rainforest Movement. https://www.wrm.org.uy/node/20496 
              <br></br><br></br>
              Zhussupova, A. (2024). Inside abandoned Chinese-made ghost city where hundreds of empty skyscrapers are left to rot in Malaysia. News.com.au. https://www.news.com.au/travel/travel-updates/travel-stories/inside-abandoned-chinesemade-ghost-city-where-hundreds-of-empty-skyscrapers-are-left-to-rot-in-malaysia/news-story/f848960704f727631b5dbbd5d68b4dcc

            </p>



          </Reveal>
          

          <motion.div
            className="w-40 h-px mx-auto mb-20"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 2 }}
            style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)' }}
          />

          
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="border-t border-white/5 py-12 px-6 bg-black">
        <div className="max-w-6xl mx-auto text-center">
          <p className="font-['Work_Sans'] text-lg text-gray-700">
            Muskan Dhamuria
          </p>
        </div>
      </footer>
    </div>
  );
}
