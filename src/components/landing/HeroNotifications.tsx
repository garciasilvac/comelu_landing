import { BellRingingIcon } from "@phosphor-icons/react";
import { useState } from "react";

import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";

const notifications = [
  { title: "Entrega programada hoy", detail: "OT-2039 · Centro Dental Orto Sur", tone: "warning" },
  { title: "Orden pendiente de iniciar", detail: "OT-2043 · Clínica Santa María", tone: "warning" },
  { title: "Pago pendiente", detail: "Factura 00481 · Clínica Los Andes", tone: "progress" },
] as const;

export function HeroNotifications() {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        openOnHover
        delay={80}
        closeDelay={120}
        className="hero-notification-trigger"
        aria-label="3 notificaciones"
      >
        <span className="hero-notification-icon" aria-hidden="true">
          <BellRingingIcon />
        </span>
        <span className="hero-notification-count" aria-hidden="true">3</span>
      </PopoverTrigger>
      <PopoverContent side="bottom" align="end" sideOffset={10} className="hero-notification-popover">
        <PopoverHeader>
          <PopoverTitle>Notificaciones</PopoverTitle>
          <PopoverDescription>Actividad ilustrativa del laboratorio</PopoverDescription>
        </PopoverHeader>
        <ul className="hero-notification-list">
          {notifications.map((notification) => (
            <li key={notification.title} className="hero-notification-item" data-tone={notification.tone}>
              <span className="hero-notification-dot" aria-hidden="true" />
              <span>
                <strong>{notification.title}</strong>
                <small>{notification.detail}</small>
              </span>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
