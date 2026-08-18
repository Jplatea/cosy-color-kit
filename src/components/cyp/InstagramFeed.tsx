import { Eyebrow, SectionTitle, Thumb } from "./primitives";
import { handles, instagramPosts, socials } from "@/config/cyp";

export function InstagramFeed() {
  return (
    <section id="insta" className="bg-cyp-ink-soft px-6 py-[100px] lg:px-10">
      <div className="mx-auto max-w-[1200px]">
        <div className="mb-[34px] flex flex-wrap items-end justify-between gap-6">
          <div>
            <Eyebrow>Instagram</Eyebrow>
            <SectionTitle className="mt-3">Fotos de ellos quietos</SectionTitle>
          </div>
          <a
            href={socials.instagram}
            target="_blank"
            rel="noopener"
            className="rounded-xl border border-cyp-cream/[0.22] px-[22px] py-[13px] text-[14.5px] font-bold transition-colors hover:border-cyp-gold hover:text-cyp-gold"
          >
            {handles.instagram}
          </a>
        </div>

        <div className="grid grid-cols-3 gap-[14px] lg:grid-cols-6">
          {instagramPosts.map((p, i) => (
            <a
              key={i}
              href={p.url || socials.instagram}
              target="_blank"
              rel="noopener"
              className="relative block aspect-square overflow-hidden rounded-[16px] border border-cyp-cream/[0.09] bg-cyp-card"
            >
              <Thumb src={p.image} alt={`Publicación ${i + 1} de Instagram`} />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
