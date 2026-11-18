import { recordDelivery, type Shipment } from "./shipment_decision.ts";

const shipment: Shipment = {
  id: "SHP-1",
  recipientPhone: "+15550001111",
  events: [{ kind: "exception", occurredAt: "2026-01-01T00:00:00.000Z", note: "damaged carton" }]
};
const result = recordDelivery(shipment, { name: "proof.jpg", contentType: "image/jpeg" });
if (result.proof || result.events.some((event) => event.kind === "delivered")) {
  throw new Error("An exception must prevent a delivered transition.");
}
console.log("shipment exception decision: passed");
