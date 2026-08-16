import { type CSSProperties, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HeroMeshBackground } from "./HeroMeshBackground";
import { HeroProductPreview, PRODUCT_TABS, type ProductTabValue } from "./HeroProductPreview";

export type HeroSectionProps = {
  onWaitlist: () => void;
  onProblems: () => void;
};

export function HeroSection({ onWaitlist, onProblems }: HeroSectionProps) {
  const [activeTab, setActiveTab] = useState<ProductTabValue>("orders");
  const activeTabIndex = PRODUCT_TABS.findIndex((tab) => tab.value === activeTab);
  const tabListStyle = { "--hero-tab-index": activeTabIndex } as CSSProperties;

  return (
    <section className="hero-section" aria-labelledby="hero-title">
      <HeroMeshBackground />

      <div className="hero-content">
        <div className="hero-copy-block">
          <Badge variant="outline" className="hero-badge" data-hero-enter="badge">
            Software para laboratorios dentales en Chile
          </Badge>
          <h1 id="hero-title" className="hero-title" data-hero-enter="headline">
            Toda la operación de tu laboratorio dental, en un solo lugar.
          </h1>
          <p className="hero-supporting-copy" data-hero-enter="copy">
            Conecta órdenes, archivos, estados de producción y pagos para seguir cada caso sin reconstruirlo entre
            planillas y mensajes.
          </p>
          <div className="hero-actions" data-hero-enter="actions">
            <Button type="button" size="lg" onClick={onWaitlist}>
              Unirme a la lista de espera
            </Button>
            <Button type="button" size="lg" variant="outline" className="hero-secondary-action" onClick={onProblems}>
              Ver qué buscamos resolver
            </Button>
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as ProductTabValue)}
          className="hero-product-tabs"
        >
          <TabsList aria-label="Explorar Comelu" className="hero-tabs-list" style={tabListStyle}>
            <span className="hero-tabs-indicator" aria-hidden="true" />
            {PRODUCT_TABS.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} className="hero-tab-trigger">
                <span className="hero-tab-label">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="hero-preview-stage" data-hero-enter="preview">
            <HeroProductPreview />
          </div>
        </Tabs>
      </div>
    </section>
  );
}
