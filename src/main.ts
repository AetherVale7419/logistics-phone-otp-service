import { InfraiClient } from "./infrai_client.ts";
import { recordDelivery, type Shipment } from "./shipment_decision.ts";

const key = process.env.INFRAI_API_KEY;
if (!key) throw new Error("Set INFRAI_API_KEY before running the example.");

const shipment: Shipment = {
  id: "SHP-2048",
  recipientPhone: "+15550001111",
  events: [{ kind: "in_transit", occurredAt: "2026-01-01T00:00:00.000Z" }]
};
const client = new InfraiClient(key);
const next = recordDelivery(shipment, { name: "pod-SHP-2048.jpg", contentType: "image/jpeg" });

console.log(JSON.stringify({ shipment: next, login: "auth.phone.send_code", deliveryState: "sms.status" }, null, 2));
void client;
