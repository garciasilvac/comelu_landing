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
    <header className="sticky top-0 z-40 border-b border-sky-800/40 bg-sky-700 text-white">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <a
          href="#"
          className="rounded-sm focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-sky-700"
          aria-label="Comelu, inicio"
        >
          <img src="/comelu-horizontal.svg" alt="Comelu" className="h-auto w-28 sm:w-32" />
        </a>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Navegación principal">
          {NAV_LINKS.map((link) => (
            <Button
              key={link.id}
              type="button"
              variant="ghost"
              className="text-sky-50 hover:bg-white/15 hover:text-white focus-visible:ring-white/60"
              onClick={() => onNavigate(link.id)}
            >
              {link.label}
            </Button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="lg"
            className="hidden bg-white text-sky-800 hover:bg-sky-50 hover:text-sky-900 focus-visible:ring-white/60 sm:inline-flex"
            onClick={onWaitlist}
          >
            Lista de espera
          </Button>

          <Sheet>
            <SheetTrigger
              render={
                <Button
                  type="button"
                  variant="outline"
                  size="icon-lg"
                  className="border-white/40 bg-transparent text-white hover:bg-white/15 hover:text-white focus-visible:ring-white/60 lg:hidden"
                />
              }
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
