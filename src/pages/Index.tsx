import { useState } from "react";
import { Play, Youtube, Instagram, Music2, Check, ArrowRight, Mail, Sparkles } from "lucide-react";
import heroImage from "@/assets/culow-pililarge-hero.jpg";

const SOCIALS = {
  youtube: "https://www.youtube.com/@CulowPililarge",
  tiktok: "https://www.tiktok.com/@culow_pililarge",
  instagram: "https://www.instagram.com/culowpililarge",
};

const NAV = [
  { label: "Quiénes son", href: "#quienes" },
  { label: "Redes", href: "#redes" },
  { label: "Comunidad", href: "#comunidad" },
  { label: "Vídeos", href: "#videos" },
  { label: "Colabora", href: "#colabora" },
];

const PLATFORMS = [
  {
    id: "youtube",
    name: "YouTube",
    Icon: Youtube,
    tagline: "Shorts animados en 3D, sketches, poemas absurdos y homenajes surrealistas.",
    cta: "Ver canal",
    href: SOCIALS.youtube,
    accent: "from-[#ff2d2d] to-[#ff6b6b]",
    glow: "shadow-[0_0_60px_-10px_rgba(255,45,45,0.35)]",
  },
  {
    id: "tiktok",
    name: "TikTok",
    Icon: Music2,
    tagline: "Micro-animaciones virales, humor absurdo servido en menos de 30 segundos.",
    cta: "Seguir en TikTok",
    href: SOCIALS.tiktok,
    accent: "from-[#00f2ea] via-[#ffffff] to-[#ff0050]",
    glow: "shadow-[0_0_60px_-10px_rgba(255,0,80,0.3)]",
  },
  {
    id: "instagram",
    name: "Instagram",
    Icon: Instagram,
    tagline: "Fotogramas, storyboards, memes y el detrás del render de cada escena.",
    cta: "Seguir en Instagram",
    href: SOCIALS.instagram,
    accent: "from-[#feda75] via-[#fa7e1e] via-[#d62976] to-[#4f5bd5]",
    glow: "shadow-[0_0_60px_-10px_rgba(214,41,118,0.35)]",
  },
];

const REASONS = [
  "Humor absurdo y auténtico.",
  "Animación 3D hecha en casa.",
  "Personajes imposibles de olvidar.",
  "Publicaciones frecuentes.",
  "Referencias, homenajes y memes.",
  "Una comunidad muy activa.",
];

const VIDEOS = [
  { id: "1", label: "Chiste chistoso 1", tag: "Short" },
  { id: "2", label: "Poesía olorosa", tag: "Short" },
  { id: "3", label: "Homenaje a Oliver Tree", tag: "Short" },
  { id: "4", label: "Culow poético", tag: "Short" },
];

const Index = () => {
  const [collab, setCollab] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleCollab = (e: React.FormEvent) => {
    e.preventDefault();
    if (!collab.name || !collab.email || !collab.message) return;
    const subject = encodeURIComponent(`Propuesta de colaboración — ${collab.name}`);
    const body = encodeURIComponent(`${collab.message}\n\n— ${collab.name} (${collab.email})`);
    window.location.href = `mailto:hola@culowpililarge.com?subject=${subject}&body=${body}`;
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-[#0d0b09] text-white overflow-x-hidden">
      {/* NAV */}
      <header className="fixed top-0 inset-x-0 z-50 glass-navbar">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <a href="#" className="flex items-center gap-3">
            <span className="relative flex items-center justify-center h-9 w-9 rounded-full bg-white">
              <span className="absolute h-5 w-2.5 rounded-full bg-[#0d0b09] top-1.5 right-2" />
              <span className="absolute h-3.5 w-3.5 rounded-full bg-[#0d0b09] bottom-1.5 left-1.5" />
            </span>
            <span className="font-bagel text-xl tracking-wide text-white">
              CULOW <span className="text-white/40">y</span> PILILARGE
            </span>
          </a>
          <nav className="hidden md:flex items-center gap-8 text-sm text-white/70">
            {NAV.map((n) => (
              <a key={n.href} href={n.href} className="story-link hover:text-white gentle-animation">
                {n.label}
              </a>
            ))}
          </nav>
          <a
            href={SOCIALS.youtube}
            target="_blank"
            rel="noopener"
            className="hidden sm:inline-flex items-center gap-2 rounded-full bg-white text-black px-5 py-2 text-sm font-semibold hover:bg-white/90 gentle-animation"
          >
            <Play size={16} /> Ver YouTube
          </a>
        </div>
      </header>

      {/* HERO */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-24 pb-16">
        {/* Spotlight glow */}
        <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[700px] w-[700px] rounded-full bg-[#f5b845]/20 blur-[120px]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(245,184,69,0.12),transparent_60%)]" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-10 items-center w-full">
          <div className="lg:col-span-7 space-y-8 animate-fade-in">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.03] px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-white/70">
              <Sparkles size={14} className="text-[#f5b845]" /> Animación 3D · Humor absurdo
            </span>
            <h1 className="font-bagel text-5xl md:text-7xl lg:text-[6.5rem] leading-[0.92] text-shadow-medium">
              Dos formas.
              <br />
              <span className="text-[#f5b845]">Cero límites.</span>
              <br />
              Mil chistes.
            </h1>
            <p className="text-lg md:text-xl text-white/70 max-w-xl leading-relaxed">
              <strong className="text-white">Culow y Pililarge</strong> son dos personajes animados en 3D
              que convierten lo cotidiano en surrealismo puro. Poesía olorosa, homenajes imposibles y
              chistes que no deberían funcionar… pero funcionan.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href={SOCIALS.youtube}
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-2 rounded-full bg-[#ff2d2d] hover:bg-[#ff4747] px-6 py-3 font-semibold gentle-animation hover-scale"
              >
                <Play size={18} fill="currentColor" /> Ver YouTube
              </a>
              <a
                href={SOCIALS.tiktok}
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-2 rounded-full bg-white text-black hover:bg-white/90 px-6 py-3 font-semibold gentle-animation hover-scale"
              >
                <Music2 size={18} /> Seguir en TikTok
              </a>
              <a
                href={SOCIALS.instagram}
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/5 hover:bg-white/10 px-6 py-3 font-semibold gentle-animation hover-scale"
              >
                <Instagram size={18} /> Seguir en Instagram
              </a>
            </div>
          </div>
          <div className="lg:col-span-5 relative">
            <div className="relative aspect-square rounded-[2rem] overflow-hidden border border-white/10 bg-black/40">
              <img
                src={heroImage}
                alt="Culow y Pililarge: dos personajes 3D minimalistas bajo un foco"
                width={1600}
                height={1600}
                className="w-full h-full object-cover animate-fade-in"
              />
              {/* Character name tags */}
              <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between text-xs uppercase tracking-[0.25em]">
                <div className="flex flex-col items-start gap-1">
                  <span className="h-px w-8 bg-[#f5b845]" />
                  <span className="text-white/80">Culow</span>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="h-px w-8 bg-[#f5b845]" />
                  <span className="text-white/80">Pililarge</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 1 — Quiénes son */}
      <section id="quienes" className="relative py-28 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-12 gap-12 items-start">
          <div className="md:col-span-5">
            <p className="text-xs uppercase tracking-[0.3em] text-[#f5b845] mb-4">01 — Quiénes son</p>
            <h2 className="font-bagel text-4xl md:text-6xl leading-tight">
              Dos personajes. Un universo absurdo.
            </h2>
          </div>
          <div className="md:col-span-7 space-y-6 text-white/75 text-lg leading-relaxed">
            <p>
              <strong className="text-white">Culow</strong> es una figura redonda y rechoncha.{" "}
              <strong className="text-white">Pililarge</strong>, alta y esbelta. Juntos habitan un
              escenario minimalista donde cada corto se rueda, se ilumina y se anima cuadro a cuadro.
            </p>
            <p>
              Cada pieza mezcla animación 3D casera, humor absurdo y referencias inesperadas: poemas
              malolientes, homenajes a Oliver Tree, chistes que no tienen ningún sentido y, aun así,
              se quedan contigo.
            </p>
            <p>
              El resultado: un lenguaje visual reconocible al primer fotograma y una comunidad que ya
              no puede mirar una cápsula blanca sin sonreír.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 2 — Plataformas */}
      <section id="redes" className="relative py-28 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <p className="text-xs uppercase tracking-[0.3em] text-[#f5b845]">02 — Donde sucede todo</p>
            <h2 className="font-bagel text-4xl md:text-6xl">Síguelos en todas sus plataformas</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {PLATFORMS.map(({ id, name, Icon, tagline, cta, href, accent, glow }) => (
              <a
                key={id}
                href={href}
                target="_blank"
                rel="noopener"
                className={`group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-8 gentle-animation hover:-translate-y-2 hover:border-white/25 ${glow}`}
              >
                <div className={`absolute -top-24 -right-24 h-56 w-56 rounded-full bg-gradient-to-br ${accent} opacity-30 blur-3xl group-hover:opacity-60 gentle-animation`} />
                <div className="relative z-10 space-y-6">
                  <div className={`inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-br ${accent} text-white`}>
                    <Icon size={28} />
                  </div>
                  <h3 className="font-bagel text-3xl">{name}</h3>
                  <p className="text-white/70 min-h-[4.5rem]">{tagline}</p>
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-white group-hover:gap-3 gentle-animation">
                    {cta} <ArrowRight size={16} />
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3 — Por qué seguirlos */}
      <section id="comunidad" className="relative py-28 px-6 border-t border-white/5">
        <div className="absolute inset-0 bg-gradient-to-br from-[#f5b845]/10 via-transparent to-[#ff2d2d]/10 pointer-events-none" />
        <div className="relative max-w-6xl mx-auto text-center space-y-14">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.3em] text-[#f5b845]">03 — Por qué seguirlos</p>
            <h2 className="font-bagel text-4xl md:text-6xl">
              Una comunidad que <span className="italic">no deja de crecer</span>
            </h2>
          </div>
          <ul className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {REASONS.map((r) => (
              <li
                key={r}
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-5 text-left gentle-animation hover:border-[#f5b845]/50 hover:bg-white/[0.06]"
              >
                <span className="flex items-center justify-center h-8 w-8 rounded-full bg-[#f5b845]/20 text-[#f5b845] shrink-0">
                  <Check size={16} strokeWidth={3} />
                </span>
                <span className="text-white/90 font-medium">{r}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* SECTION 4 — Últimos vídeos */}
      <section id="videos" className="relative py-28 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-14">
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.3em] text-[#f5b845]">04 — Últimos shorts</p>
              <h2 className="font-bagel text-4xl md:text-6xl max-w-xl">
                No te pierdas sus mejores momentos
              </h2>
            </div>
            <a
              href={SOCIALS.youtube}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-2 text-sm font-semibold text-white/70 hover:text-white gentle-animation"
            >
              Ver todos en YouTube <ArrowRight size={16} />
            </a>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {VIDEOS.map((v, i) => (
              <div
                key={v.id}
                className="group relative aspect-[9/16] overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/[0.02] gentle-animation hover:border-white/30 hover:-translate-y-1"
              >
                <div className={`absolute inset-0 opacity-40 group-hover:opacity-60 gentle-animation bg-gradient-to-br ${
                  i % 3 === 0 ? "from-[#f5b845] to-[#ff2d2d]" :
                  i % 3 === 1 ? "from-[#1a1815] to-[#3a2a1a]" :
                                "from-[#ede4d3] via-[#f5b845] to-[#0d0b09]"
                }`} />
                {/* Silhouette hint */}
                <div className="absolute inset-0 flex items-end justify-center gap-3 pb-16 opacity-30 group-hover:opacity-60 gentle-animation">
                  <div className="w-8 h-6 rounded-full bg-white" />
                  <div className="w-6 h-16 rounded-full bg-white" />
                </div>
                <div className="absolute inset-0 flex flex-col justify-between p-5">
                  <span className="self-start rounded-full bg-black/60 backdrop-blur px-3 py-1 text-[10px] uppercase tracking-widest">
                    {v.tag}
                  </span>
                  <div className="space-y-2">
                    <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-white/90 text-black group-hover:scale-110 gentle-animation">
                      <Play size={20} fill="currentColor" />
                    </div>
                    <p className="font-semibold text-white text-shadow-medium">{v.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-white/50">
            Próximamente: feed automático de YouTube Shorts, TikTok e Instagram Reels.
          </p>
        </div>
      </section>

      {/* SECTION 5 — Colaboraciones */}
      <section id="colabora" className="relative py-28 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <p className="text-xs uppercase tracking-[0.3em] text-[#f5b845]">05 — Colaboraciones</p>
            <h2 className="font-bagel text-4xl md:text-5xl leading-tight">
              ¿Quieres colaborar con Culow y Pililarge?
            </h2>
            <p className="text-white/70 text-lg">
              Si eres una marca, estudio o creador y quieres integrarte en el universo absurdo de
              Culow y Pililarge —branded content animado, cameos o piezas a medida—, cuéntanoslo.
            </p>
            <a
              href="mailto:hola@culowypililarge.com"
              className="inline-flex items-center gap-2 text-[#f5b845] hover:text-white gentle-animation"
            >
              <Mail size={18} /> hola@culowypililarge.com
            </a>
          </div>
          <form onSubmit={handleCollab} className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.03] p-8">
            <div>
              <label className="text-xs uppercase tracking-widest text-white/50">Nombre / Marca</label>
              <input
                type="text"
                value={collab.name}
                onChange={(e) => setCollab({ ...collab, name: e.target.value })}
                className="mt-2 w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 focus:outline-none focus:border-[#f5b845] gentle-animation"
                placeholder="Tu nombre"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-white/50">Email</label>
              <input
                type="email"
                value={collab.email}
                onChange={(e) => setCollab({ ...collab, email: e.target.value })}
                className="mt-2 w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 focus:outline-none focus:border-[#f5b845] gentle-animation"
                placeholder="tu@email.com"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-white/50">Propuesta</label>
              <textarea
                value={collab.message}
                onChange={(e) => setCollab({ ...collab, message: e.target.value })}
                rows={4}
                className="mt-2 w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 focus:outline-none focus:border-[#f5b845] gentle-animation resize-none"
                placeholder="Cuéntanos tu idea..."
              />
            </div>
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#f5b845] text-[#0d0b09] hover:bg-[#ffcf5c] px-6 py-3 font-semibold gentle-animation"
            >
              <Mail size={18} /> {sent ? "¡Enviado!" : "Solicitar colaboración"}
            </button>
          </form>
        </div>
      </section>

      {/* FINAL — Únete */}
      <section className="relative py-32 px-6 border-t border-white/5 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#f5b845]/10 via-[#0d0b09] to-[#0d0b09]" />
        <div className="relative max-w-4xl mx-auto text-center space-y-10">
          <h2 className="font-bagel text-5xl md:text-7xl">Únete a la comunidad</h2>
          <p className="text-white/70 text-lg md:text-xl max-w-2xl mx-auto">
            Cada semana llegan nuevos shorts, nuevas escenas y nuevos disparates. No te pierdas ni un
            fotograma.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href={SOCIALS.youtube}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-3 rounded-2xl bg-[#ff2d2d] hover:bg-[#ff4747] px-8 py-5 text-lg font-bold gentle-animation hover-scale"
            >
              <Youtube size={24} /> YouTube
            </a>
            <a
              href={SOCIALS.tiktok}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-3 rounded-2xl bg-white text-black hover:bg-white/90 px-8 py-5 text-lg font-bold gentle-animation hover-scale"
            >
              <Music2 size={24} /> TikTok
            </a>
            <a
              href={SOCIALS.instagram}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-[#feda75] via-[#d62976] to-[#4f5bd5] hover:brightness-110 px-8 py-5 text-lg font-bold gentle-animation hover-scale"
            >
              <Instagram size={24} /> Instagram
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 px-6 py-12 text-sm text-white/60">
        <div className="max-w-7xl mx-auto grid gap-8 md:grid-cols-3 items-start">
          <div className="space-y-2">
            <p className="font-bagel text-xl text-white">CULOW <span className="text-white/40">y</span> PILILARGE</p>
            <p>Síguenos en nuestras redes y descubre cada nuevo corto animado.</p>
          </div>
          <ul className="space-y-2 md:justify-self-center">
            <li><a href={SOCIALS.youtube} target="_blank" rel="noopener" className="story-link hover:text-white">YouTube: @CulowPililarge</a></li>
            <li><a href={SOCIALS.tiktok} target="_blank" rel="noopener" className="story-link hover:text-white">TikTok: @culow_pililarge</a></li>
            <li><a href={SOCIALS.instagram} target="_blank" rel="noopener" className="story-link hover:text-white">Instagram: @culowpililarge</a></li>
          </ul>
          <p className="md:text-right">© {new Date().getFullYear()} Culow & Pililarge. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;