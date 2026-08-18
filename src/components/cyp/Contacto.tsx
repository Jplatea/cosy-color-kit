import { useState } from "react";
import { Eyebrow, GoldButton, SectionTitle } from "./primitives";
import { handles, socials } from "@/config/cyp";

const LINKS = [
  { label: socials.email, action: "Escribir", href: `mailto:${socials.email}` },
  { label: `YouTube · ${handles.youtube}`, action: "Ver", href: socials.youtube },
  { label: `TikTok · ${handles.tiktok}`, action: "Ver", href: socials.tiktok },
  { label: `Instagram · ${handles.instagram}`, action: "Ver", href: socials.instagram },
];

const FIELD =
  "rounded-[13px] border border-cyp-cream/[0.16] bg-cyp-ink p-[15px] text-[15.5px] text-cyp-cream outline-none focus:border-cyp-gold";

export function Contacto() {
  const [form, setForm] = useState({ nombre: "", email: "", mensaje: "" });
  const [sent, setSent] = useState(false);

  const complete = form.nombre && form.email && form.mensaje;

  /**
   * Sin backend de correo, el formulario compone el mensaje y lo abre en el
   * cliente de email del visitante. Nada se envía a espaldas de nadie.
   */
  const send = (e: React.FormEvent) => {
    e.preventDefault();
    if (!complete) return;
    const subject = encodeURIComponent(`Colaboración — ${form.nombre}`);
    const body = encodeURIComponent(`${form.mensaje}\n\n— ${form.nombre} (${form.email})`);
    window.location.href = `mailto:${socials.email}?subject=${subject}&body=${body}`;
    setSent(true);
  };

  return (
    <section id="contacto" className="bg-cyp-ink-soft px-6 py-[100px] lg:px-10">
      <div className="mx-auto grid max-w-[1200px] items-start gap-11 lg:grid-cols-2">
        <div>
          <Eyebrow>Contacto</Eyebrow>
          <SectionTitle className="mb-[14px] mt-3">
            Colaboraciones, marcas y recados
          </SectionTitle>
          <p className="mb-[26px] max-w-[480px] text-[17px] leading-[1.65] text-cyp-cream/65">
            Si quieres que Culow abrace tu producto o que Pililarge lo mire con desconfianza,
            escríbenos. Contestamos en cuanto Pililarge consiga sentarse.
          </p>
          <div className="grid gap-3">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                target={l.href.startsWith("mailto:") ? undefined : "_blank"}
                rel="noopener"
                className="flex items-center justify-between rounded-[16px] border border-cyp-cream/10 bg-cyp-card px-[22px] py-[18px] font-semibold transition-colors hover:border-cyp-gold"
              >
                <span>{l.label}</span>
                <span className="text-cyp-gold">{l.action}</span>
              </a>
            ))}
          </div>
        </div>

        <form
          onSubmit={send}
          className="grid gap-4 rounded-[24px] border border-cyp-cream/[0.09] bg-cyp-card p-8"
        >
          <label className="grid gap-2">
            <span className="text-[13px] font-semibold text-cyp-cream/60">Tu nombre</span>
            <input
              type="text"
              required
              placeholder="Cómo te llamas"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              className={FIELD}
            />
          </label>
          <label className="grid gap-2">
            <span className="text-[13px] font-semibold text-cyp-cream/60">Tu email</span>
            <input
              type="email"
              required
              placeholder="tu@email.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className={FIELD}
            />
          </label>
          <label className="grid gap-2">
            <span className="text-[13px] font-semibold text-cyp-cream/60">Qué quieres</span>
            <textarea
              rows={5}
              required
              placeholder="Cuéntanoslo sin miedo"
              value={form.mensaje}
              onChange={(e) => setForm({ ...form, mensaje: e.target.value })}
              className={`${FIELD} resize-y leading-[1.5]`}
            />
          </label>
          <GoldButton type="submit" className="w-full py-4 text-base">
            {sent ? "Recibido, gracias" : "Enviar"}
          </GoldButton>
        </form>
      </div>
    </section>
  );
}
