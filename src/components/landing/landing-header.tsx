import { ListIcon, XIcon } from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { NAV_LINKS } from "@/components/landing/landing-data";

type LandingHeaderProps = {
  onNavigate: (id: string) => void;
  onWaitlist: () => void;
};

export function LandingHeader({ onNavigate, onWaitlist }: LandingHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/88 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <a href="#" className="flex items-center gap-3 text-foreground" aria-label="Comelu, inicio">
          <span className="grid size-9 place-items-center rounded-lg bg-primary font-heading text-sm font-semibold text-primary-foreground shadow-sm">
            C
          </span>
          <span className="font-heading text-lg font-semibold tracking-tight">Comelu</span>
        </a>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Navegación principal">
          {NAV_LINKS.map((link) => (
            <Button key={link.id} type="button" variant="ghost" onClick={() => onNavigate(link.id)}>
              {link.label}
            </Button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button type="button" size="lg" className="hidden sm:inline-flex" onClick={onWaitlist}>
            Lista de espera
          </Button>

          <Sheet>
            <SheetTrigger
              render={<Button type="button" variant="outline" size="icon-lg" className="lg:hidden" />}
            >
              <ListIcon data-icon="inline-start" />
              <span className="sr-only">Abrir menú</span>
            </SheetTrigger>
            <SheetContent aria-label="Navegación" className="w-[min(22rem,90vw)]" showCloseButton={false}>
              <SheetHeader className="border-b">
                <SheetTitle>Navegación</SheetTitle>
                <SheetDescription>Explora Comelu o súmate a la lista de espera.</SheetDescription>
              </SheetHeader>
              <SheetClose
                render={<Button type="button" variant="ghost" size="icon-sm" className="absolute right-3 top-3" />}
              >
                <XIcon />
                <span className="sr-only">Cerrar</span>
              </SheetClose>
              <nav className="flex flex-col gap-2 px-4" aria-label="Navegación móvil">
                {NAV_LINKS.map((link) => (
                  <SheetClose
                    key={link.id}
                    render={<Button type="button" variant="ghost" className="justify-start" />}
                    onClick={() => onNavigate(link.id)}
                  >
                    {link.label}
                  </SheetClose>
                ))}
              </nav>
              <SheetFooter>
                <SheetClose render={<Button type="button" size="lg" className="w-full" />} onClick={onWaitlist}>
                  Lista de espera
                </SheetClose>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
