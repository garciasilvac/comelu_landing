import { TabsContent } from "@/components/ui/tabs";

export type ProductTabValue = "clients" | "orders" | "production" | "payments";

export const PRODUCT_TABS = [
  { value: "clients", label: "Clientes" },
  { value: "orders", label: "Órdenes" },
  { value: "production", label: "Producción" },
  { value: "payments", label: "Pagos" },
] as const satisfies readonly { value: ProductTabValue; label: string }[];

const clients = [
  { initials: "LA", name: "Clínica Los Andes", contact: "Dra. Camila Soto", activity: "6 OT activas" },
  { initials: "OS", name: "Centro Dental Orto Sur", contact: "Dr. Martín Rojas", activity: "3 OT activas" },
  { initials: "SM", name: "Clínica Santa María", contact: "Recepción clínica", activity: "Al día" },
] as const;

const orders = [
  {
    id: "OT-2048",
    client: "Clínica Los Andes",
    work: "Corona zirconia",
    state: "En producción",
    delivery: "18 ago",
  },
  {
    id: "OT-2043",
    client: "Clínica Santa María",
    work: "Prótesis removible",
    state: "Por iniciar",
    delivery: "19 ago",
  },
  {
    id: "OT-2039",
    client: "Centro Dental Orto Sur",
    work: "Puente 3 piezas",
    state: "Control de calidad",
    delivery: "18 ago",
  },
] as const;

const productionStages = [
  { title: "Por iniciar", count: 4, order: "OT-2051", work: "Incrustación cerámica", meta: "Entrega 20 ago" },
  { title: "En producción", count: 7, order: "OT-2048", work: "Corona zirconia", meta: "Clínica Los Andes" },
  { title: "Control de calidad", count: 3, order: "OT-2039", work: "Puente 3 piezas", meta: "Entrega 18 ago" },
] as const;

const payments = [
  { document: "Factura 00481", client: "Clínica Los Andes", order: "OT-2048", state: "Pendiente" },
  { document: "Factura 00476", client: "Centro Dental Orto Sur", order: "OT-2039", state: "Pagada" },
  { document: "Comprobante adjunto", client: "Clínica Santa María", order: "OT-2043", state: "Recibido" },
] as const;

function ProductWindowHeader() {
  return (
    <div className="hero-window-header">
      <div className="hero-window-brand" aria-hidden="true">
        <span className="hero-window-mark">C</span>
        <span>Comelu</span>
      </div>
      <span className="hero-window-context">Operación del laboratorio</span>
      <span className="hero-concept-label">Vista conceptual</span>
    </div>
  );
}

function StatusBadge({ children }: { children: string }) {
  const tone = children === "Pagada" || children === "En producción" || children === "Al día" ? "positive" : "neutral";
  return <span className="hero-status" data-tone={tone}>{children}</span>;
}

function ClientsPanel() {
  return (
    <TabsContent value="clients" className="hero-product-panel">
      <div className="hero-panel-heading">
        <div>
          <span className="hero-panel-eyebrow">Directorio operacional</span>
          <h3>Clientes</h3>
        </div>
        <span className="hero-panel-count">12 clientes activos</span>
      </div>
      <div className="hero-client-list">
        {clients.map((client) => (
          <article key={client.name} className="hero-client-row">
            <span className="hero-client-avatar" aria-hidden="true">{client.initials}</span>
            <div className="hero-client-primary">
              <strong>{client.name}</strong>
              <span>{client.contact}</span>
            </div>
            <StatusBadge>{client.activity}</StatusBadge>
          </article>
        ))}
      </div>
    </TabsContent>
  );
}

function OrdersPanel() {
  const selectedOrder = orders[0];

  return (
    <TabsContent value="orders" className="hero-product-panel">
      <div className="hero-panel-heading">
        <div>
          <span className="hero-panel-eyebrow">Seguimiento por caso</span>
          <h3>Órdenes de trabajo</h3>
        </div>
        <span className="hero-panel-count">18 órdenes activas</span>
      </div>

      <div className="hero-preview-desktop hero-orders-table">
        <div className="hero-table-row hero-table-head" aria-hidden="true">
          <span>Orden</span>
          <span>Cliente</span>
          <span>Trabajo</span>
          <span>Estado</span>
          <span>Entrega</span>
        </div>
        {orders.map((order) => (
          <article key={order.id} className="hero-table-row">
            <strong>{order.id}</strong>
            <span>{order.client}</span>
            <span>{order.work}</span>
            <StatusBadge>{order.state}</StatusBadge>
            <span>{order.delivery}</span>
          </article>
        ))}
      </div>

      <article className="hero-preview-mobile hero-mobile-order">
        <div className="hero-mobile-order-heading">
          <div>
            <span>Orden de trabajo</span>
            <strong>{selectedOrder.id}</strong>
          </div>
          <StatusBadge>{selectedOrder.state}</StatusBadge>
        </div>
        <dl>
          <div><dt>Cliente</dt><dd>{selectedOrder.client}</dd></div>
          <div><dt>Trabajo</dt><dd>{selectedOrder.work}</dd></div>
          <div><dt>Estado</dt><dd>{selectedOrder.state}</dd></div>
          <div><dt>Entrega</dt><dd>{selectedOrder.delivery}</dd></div>
        </dl>
      </article>
    </TabsContent>
  );
}

function ProductionPanel() {
  return (
    <TabsContent value="production" className="hero-product-panel">
      <div className="hero-panel-heading">
        <div>
          <span className="hero-panel-eyebrow">Flujo del laboratorio</span>
          <h3>Producción</h3>
        </div>
        <span className="hero-panel-count">3 entregas hoy</span>
      </div>
      <div className="hero-production-grid">
        {productionStages.map((stage) => (
          <section key={stage.title} className="hero-production-column" aria-label={`${stage.title}, ${stage.count} órdenes`}>
            <header><span>{stage.title}</span><strong>{stage.count}</strong></header>
            <article className="hero-production-order">
              <strong>{stage.order}</strong>
              <span>{stage.work}</span>
              <small>{stage.meta}</small>
            </article>
          </section>
        ))}
      </div>
    </TabsContent>
  );
}

function PaymentsPanel() {
  return (
    <TabsContent value="payments" className="hero-product-panel">
      <div className="hero-panel-heading">
        <div>
          <span className="hero-panel-eyebrow">Contexto financiero</span>
          <h3>Pagos y comprobantes</h3>
        </div>
        <span className="hero-panel-count">Vinculados a cada orden</span>
      </div>
      <div className="hero-payment-list">
        {payments.map((payment) => (
          <article key={payment.document} className="hero-payment-row">
            <div><strong>{payment.document}</strong><span>{payment.client}</span></div>
            <span className="hero-payment-order">{payment.order}</span>
            <StatusBadge>{payment.state}</StatusBadge>
          </article>
        ))}
      </div>
    </TabsContent>
  );
}

export function HeroProductPreview() {
  return (
    <div className="hero-product-window">
      <ProductWindowHeader />
      <div className="hero-window-body">
        <ClientsPanel />
        <OrdersPanel />
        <ProductionPanel />
        <PaymentsPanel />
      </div>
    </div>
  );
}
