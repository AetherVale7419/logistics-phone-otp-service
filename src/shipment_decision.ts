export type ShipmentEvent = {
  kind: "picked_up" | "in_transit" | "delivered" | "exception";
  occurredAt: string;
  note?: string;
};

export type ProofOfDelivery = { name: string; contentType: string };

export type Shipment = {
  id: string;
  recipientPhone: string;
  events: ShipmentEvent[];
  proof?: ProofOfDelivery;
};

export function recordDelivery(shipment: Shipment, proof: ProofOfDelivery): Shipment {
  const hasException = shipment.events.some((event) => event.kind === "exception");
  if (hasException) return shipment;
  return {
    ...shipment,
    proof,
    events: [...shipment.events, { kind: "delivered", occurredAt: "2026-01-01T00:00:00.000Z" }]
  };
}
