import { Eyebrow, SectionTitle, Thumb } from "./primitives";
import { shorts, socials, youtubeThumb, youtubeThumbVertical } from "@/config/cyp";

export function Shorts() {
  return (
    <section id="shorts" className="px-6 py-[100px] lg:px-10">
      <div className="mx-auto max-w-[1200px]">
        <Eyebrow>Shorts &amp; TikTok</Eyebrow>
        <SectionTitle className="mb-[6px] mt-3">Verticales de digestión rápida</SectionTitle>
        <p className="mb-[34px] text-[17px] text-cyp-cream/60">
          Quince segundos, una idea tonta, cero explicación.
        </p>

        <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
          {shorts.map((s, i) => {
            // Preferimos el vertical, que llena el hueco 9:16 sin recortar la cara.
            // Si YouTube no lo generó, el <Thumb> se cae solo al horizontal.
            const img = s.image || youtubeThumbVertical(s.youtubeId);
            const respaldo = s.image ? undefined : youtubeThumb(s.youtubeId);
            const href =
              s.url || (s.youtubeId ? `https://www.youtube.com/shorts/${s.youtubeId}` : socials.tiktok);
            return (
              <a key={`${s.title}-${i}`} href={href} target="_blank" rel="noopener" className="block">
                <div className="relative aspect-[9/16] overflow-hidden rounded-[20px] border border-cyp-cream/[0.09] bg-cyp-card">
                  <Thumb src={img} alt={s.title} label="Miniatura pendiente" fallbackSrc={respaldo} />
                </div>
                <div className="mt-3 text-[14.5px] font-medium text-cyp-cream/[0.82]">{s.title}</div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
