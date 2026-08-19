import { useLuces } from "@/hooks/useLuces";

/**
 * El interruptor de la sala.
 *
 * No dice «modo claro / modo oscuro» porque en un museo eso no existe: dice si
 * está abierto de día o si han bajado las luces. El icono es el que va a pasar
 * al pulsar —de día enseña la luna—, que es lo que espera cualquiera que haya
 * usado un interruptor.
 */
export function Interruptor({ className }: { className?: string }) {
  const { esDeNoche, cambiar } = useLuces();

  return (
    <button
      type="button"
      onClick={cambiar}
      aria-pressed={esDeNoche}
      title={esDeNoche ? "Subir las luces" : "Bajar las luces"}
      aria-label={esDeNoche ? "Subir las luces de la sala" : "Bajar las luces de la sala"}
      className={
        "group grid h-9 w-9 shrink-0 place-items-center rounded-[2px] border border-museo-linea text-museo-tinta-suave transition-colors hover:border-museo-tinta hover:text-museo-tinta " +
        (className || "")
      }
    >
      {esDeNoche ? (
        // Sol: al pulsar, se abre la sala.
        <svg viewBox="0 0 24 24" className="h-[17px] w-[17px]" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
          <circle cx="12" cy="12" r="4.2" />
          <path
            d="M12 2.4v2.2M12 19.4v2.2M2.4 12h2.2M19.4 12h2.2M5.2 5.2l1.6 1.6M17.2 17.2l1.6 1.6M18.8 5.2l-1.6 1.6M6.8 17.2l-1.6 1.6"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        // Luna: al pulsar, se cierra y quedan los focos.
        <svg viewBox="0 0 24 24" className="h-[17px] w-[17px]" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
          <path
            d="M20.5 14.6A8.6 8.6 0 0 1 9.4 3.5a8.6 8.6 0 1 0 11.1 11.1Z"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}
