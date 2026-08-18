import { Eyebrow, SectionTitle, Thumb } from "./primitives";
import { socials, videos, youtubeThumb } from "@/config/cyp";

export function Videos() {
  if (!videos.length) return null;

  return (
    <section id="videos" className="bg-cyp-ink-soft px-6 py-[100px] lg:px-10">
      <div className="mx-auto max-w-[1200px]">
        <div className="mb-[38px] flex flex-wrap items-end justify-between gap-6">
          <div>
            <Eyebrow>Últimos vídeos</Eyebrow>
            <SectionTitle className="mt-3">Lo último del canal</SectionTitle>
          </div>
          <a
            href={socials.youtubeVideos}
            target="_blank"
            rel="noopener"
            className="rounded-xl border border-cyp-cream/[0.22] px-[22px] py-[13px] text-[14.5px] font-bold transition-colors hover:border-cyp-gold hover:text-cyp-gold"
          >
            Ver todos en YouTube
          </a>
        </div>

        <div className="grid gap-[22px] sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((v, i) => {
            const img = v.image || youtubeThumb(v.youtubeId);
            const href = v.youtubeId
              ? `https://www.youtube.com/watch?v=${v.youtubeId}`
              : socials.youtubeVideos;
            return (
              <a
                key={`${v.title}-${i}`}
                href={href}
                target="_blank"
                rel="noopener"
                className="block overflow-hidden rounded-[18px] border border-cyp-cream/[0.09] bg-cyp-card transition-colors hover:border-cyp-gold/50"
              >
                <div className="relative h-[210px]">
                  <Thumb src={img} alt={v.title} label="Miniatura pendiente" />
                </div>
                <div className="px-5 pb-[22px] pt-[18px]">
                  <div className="font-bagel text-[20px] leading-[1.2] text-cyp-cream-hi">
                    {v.title}
                  </div>
                  <div className="mt-[10px] text-[13px] text-cyp-cream/50">{v.meta}</div>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
