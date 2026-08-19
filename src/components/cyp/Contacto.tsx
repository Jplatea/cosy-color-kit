import { useState } from "react";
import { GoldButton, Sala, SectionTitle } from "./primitives";
import { handles, socials } from "@/config/cyp";

const LINKS = [
  { label: socials.email, action: "Escribir", href: `mailto:${socials.email}` },
  { label: `YouTube · ${handles.youtube}`, action: "Ver", href: socials.youtube },
  { label: `TikTok · ${handles.tiktok}`, action: "Ver", href: socials.tiktok },
  { label: `Instagram · ${handles.instagram}`, action: "Ver", href: socials.instagram },
];

const FIELD =
  "border border-museo-linea bg-museo-papel p-[14px] text-[15px] text-museo-tinta outline-none transition-colors focus:border-museo-tinta";

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
    <section id="contacto" className="px-6 py-[86px] lg:px-8">
      <div className="mx-auto grid max-w-[1180px] items-start gap-12 lg:grid-cols-2">
        <div>
          <Sala n="12">Préstamos y colaboraciones</Sala>
          <SectionTitle className="mb-[16px] mt-4">
            Escríbanos al <span className="italic text-museo-tinta-70">departamento</span>
          </SectionTitle>
          <p className="mb-[26px] max-w-[52ch] text-[16px] leading-[1.7] text-museo-tinta-70">
            Si quiere que Culow abrace su producto o que Pililarge lo mire con desconfianza,
            escriba. Se contesta en cuanto Pililarge consiga sentarse.
          </p>
          <div className="grid">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                target={l.href.startsWith("mailto:") ? undefined : "_blank"}
                rel="noopener"
                className="group flex items-center justify-between gap-4 border-b border-museo-linea py-[15px] transition-colors hover:border-museo-tinta"
              >
                <span className="text-[15px] text-museo-tinta">{l.label}</span>
                <span className="cartela text-museo-tinta-45 transition-colors group-hover:text-museo-laton">
                  {l.action} →
                </span>
              </a>
            ))}
          </div>
        </div>

        <form
          onSubmit={send}
          className="grid gap-4 border border-museo-linea bg-museo-pared p-8"
        >
          <label className="grid gap-2">
            <span className="cartela text-museo-tinta-45">Nombre</span>
            <input
              type="text"
              required
              placeholder="Cómo se llama"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              className={FIELD}
            />
          </label>
          <label className="grid gap-2">
            <span className="cartela text-museo-tinta-45">Correo</span>
            <input
              type="email"
              required
              placeholder="usted@correo.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className={FIELD}
            />
          </label>
          <label className="grid gap-2">
            <span className="cartela text-museo-tinta-45">Asunto</span>
            <textarea
              rows={5}
              required
              placeholder="Cuéntelo sin miedo"
              value={form.mensaje}
              onChange={(e) => setForm({ ...form, mensaje: e.target.value })}
              className={`${FIELD} resize-y leading-[1.5]`}
            />
          </label>
          <GoldButton type="submit" className="w-full py-4 text-base">
            {sent ? "Recibido, gracias" : "Enviar la solicitud"}
          </GoldButton>
        </form>
      </div>
    </section>
  );
}
