import { useState } from "react";
import { Play, Youtube, Instagram, Music2, Check, ArrowRight, Mail } from "lucide-react";
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
    tagline: "Los vídeos más completos, retos, colaboraciones, especiales y contenido exclusivo.",
    cta: "Ver canal",
    href: SOCIALS.youtube,
    accent: "from-[#ff2d2d] to-[#ff6b6b]",
    glow: "shadow-[0_0_60px_-10px_rgba(255,45,45,0.6)]",
  },
  {
    id: "tiktok",
    name: "TikTok",
    Icon: Music2,
    tagline: "Vídeos virales, humor rápido, tendencias y momentos espontáneos.",
    cta: "Seguir en TikTok",
    href: SOCIALS.tiktok,
    accent: "from-[#00f2ea] via-[#ffffff] to-[#ff0050]",
    glow: "shadow-[0_0_60px_-10px_rgba(255,0,80,0.5)]",
  },
  {
    id: "instagram",
    name: "Instagram",
    Icon: Instagram,
    tagline: "Detrás de cámaras, historias, novedades y contenido diario.",
    cta: "Seguir en Instagram",
    href: SOCIALS.instagram,
    accent: "from-[#feda75] via-[#fa7e1e] via-[#d62976] to-[#4f5bd5]",
    glow: "shadow-[0_0_60px_-10px_rgba(214,41,118,0.55)]",
  },
];

const REASONS = [
  "Humor auténtico.",
  "Contenido original.",
  "Publicaciones frecuentes.",
  "Retos y colaboraciones.",
  "Vídeos que se comparten.",
  "Una comunidad muy activa.",
];

const VIDEOS = [
  { id: "1", label: "Último reto", tag: "YouTube" },
  { id: "2", label: "Momento viral", tag: "TikTok" },
  { id: "3", label: "Detrás de cámaras", tag: "Instagram" },
  { id: "4", label: "Colaboración", tag: "YouTube" },
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
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      {/* NAV */}
      <header className="fixed top-0 inset-x-0 z-50 glass-navbar">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <a href="#" className="font-bagel text-2xl tracking-wide bg-gradient-to-r from-[#ff2d2d] via-[#ff0050] to-[#feda75] bg-clip-text text-transparent">
            CULOW & PILILARGE
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
      <section className="relative min-h-screen flex items-end md:items-center overflow-hidden pt-24">
        <img
          src={heroImage}
          alt="Culow y Pililarge, dúo de creadores de contenido"
          width={1600}
          height={1808}
          className="absolute inset-0 w-full h-full object-cover object-center opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/70 to-[#0a0a0a]/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/80 via-transparent to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 pb-20 md:pb-0">
          <div className="max-w-3xl space-y-8 animate-fade-in">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-white/70">
              <span className="w-2 h-2 rounded-full bg-[#ff2d2d] animate-pulse" /> Nuevo vídeo cada semana
            </span>
            <h1 className="font-bagel text-5xl md:text-7xl lg:text-8xl leading-[0.95] text-shadow-strong">
              El dúo que está{" "}
              <span className="bg-gradient-to-r from-[#ff2d2d] via-[#ff0050] to-[#feda75] bg-clip-text text-transparent">
                conquistando
              </span>{" "}
              las redes sociales
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-2xl">
              Humor, entretenimiento, retos y contenido viral. Miles de personas ya siguen las
              aventuras de <strong className="text-white">Culow & Pililarge</strong>, dos creadores que
              convierten cualquier situación cotidiana en un vídeo imposible de olvidar.
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
        </div>
      </section>

      {/* SECTION 1 — Quiénes son */}
      <section id="quienes" className="relative py-28 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-12 gap-12 items-start">
          <div className="md:col-span-5">
            <p className="text-xs uppercase tracking-[0.3em] text-[#ff2d2d] mb-4">01 — Quiénes son</p>
            <h2 className="font-bagel text-4xl md:text-6xl leading-tight">
              Mucho más que dos creadores de contenido
            </h2>
          </div>
          <div className="md:col-span-7 space-y-6 text-white/75 text-lg leading-relaxed">
            <p>
              Culow y Pililarge han construido una comunidad gracias a un estilo propio basado en el
              humor, la espontaneidad y la cercanía.
            </p>
            <p>
              Cada vídeo está pensado para sorprender, entretener y sacar una sonrisa, mezclando
              retos, situaciones inesperadas y momentos que terminan convirtiéndose en contenido viral.
            </p>
            <p>
              Su personalidad y química frente a la cámara hacen que cada publicación sea diferente,
              consiguiendo conectar con públicos de todas las edades.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 2 — Plataformas */}
      <section id="redes" className="relative py-28 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <p className="text-xs uppercase tracking-[0.3em] text-[#ff2d2d]">02 — Donde sucede todo</p>
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
        <div className="absolute inset-0 bg-gradient-to-br from-[#ff2d2d]/10 via-transparent to-[#ff0050]/10 pointer-events-none" />
        <div className="relative max-w-6xl mx-auto text-center space-y-14">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.3em] text-[#feda75]">03 — Por qué seguirlos</p>
            <h2 className="font-bagel text-4xl md:text-6xl">
              Una comunidad que <span className="italic">no deja de crecer</span>
            </h2>
          </div>
          <ul className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {REASONS.map((r) => (
              <li
                key={r}
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-5 text-left gentle-animation hover:border-[#ff2d2d]/50 hover:bg-white/[0.06]"
              >
                <span className="flex items-center justify-center h-8 w-8 rounded-full bg-[#ff2d2d]/20 text-[#ff6b6b] shrink-0">
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
              <p className="text-xs uppercase tracking-[0.3em] text-[#ff2d2d]">04 — Últimos vídeos</p>
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
                  i % 3 === 0 ? "from-[#ff2d2d] to-[#ff0050]" :
                  i % 3 === 1 ? "from-[#00f2ea] to-[#ff0050]" :
                                "from-[#feda75] via-[#d62976] to-[#4f5bd5]"
                }`} />
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
            <p className="text-xs uppercase tracking-[0.3em] text-[#feda75]">05 — Colaboraciones</p>
            <h2 className="font-bagel text-4xl md:text-5xl leading-tight">
              ¿Quieres colaborar con Culow & Pililarge?
            </h2>
            <p className="text-white/70 text-lg">
              Si eres una marca, agencia o creador de contenido y buscas una colaboración auténtica
              con gran impacto en redes sociales, estaremos encantados de escuchar tu propuesta.
            </p>
          </div>
          <form onSubmit={handleCollab} className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.03] p-8">
            <div>
              <label className="text-xs uppercase tracking-widest text-white/50">Nombre / Marca</label>
              <input
                type="text"
                value={collab.name}
                onChange={(e) => setCollab({ ...collab, name: e.target.value })}
                className="mt-2 w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 focus:outline-none focus:border-[#ff2d2d] gentle-animation"
                placeholder="Tu nombre"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-white/50">Email</label>
              <input
                type="email"
                value={collab.email}
                onChange={(e) => setCollab({ ...collab, email: e.target.value })}
                className="mt-2 w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 focus:outline-none focus:border-[#ff2d2d] gentle-animation"
                placeholder="tu@email.com"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-white/50">Propuesta</label>
              <textarea
                value={collab.message}
                onChange={(e) => setCollab({ ...collab, message: e.target.value })}
                rows={4}
                className="mt-2 w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 focus:outline-none focus:border-[#ff2d2d] gentle-animation resize-none"
                placeholder="Cuéntanos tu idea..."
              />
            </div>
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#ff2d2d] hover:bg-[#ff4747] px-6 py-3 font-semibold gentle-animation"
            >
              <Mail size={18} /> {sent ? "¡Enviado!" : "Solicitar colaboración"}
            </button>
          </form>
        </div>
      </section>

      {/* FINAL — Únete */}
      <section className="relative py-32 px-6 border-t border-white/5 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#ff2d2d]/10 via-[#0a0a0a] to-[#0a0a0a]" />
        <div className="relative max-w-4xl mx-auto text-center space-y-10">
          <h2 className="font-bagel text-5xl md:text-7xl">Únete a la comunidad</h2>
          <p className="text-white/70 text-lg md:text-xl max-w-2xl mx-auto">
            Cada semana llegan nuevos vídeos, nuevas historias y nuevos retos. No te pierdas
            ninguna publicación.
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
            <p className="font-bagel text-xl text-white">CULOW & PILILARGE</p>
            <p>Síguenos en nuestras redes sociales y descubre todo el contenido nuevo.</p>
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