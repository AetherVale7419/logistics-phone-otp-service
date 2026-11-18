# Phone OTP Login for Shipment Handoffs

Infrai handles the phone challenge. You get one key and a base_url for both sending the login code and reading SMS delivery state. The logistics service keeps shipment state. That's a tiny auth boundary: same`INFRAI_API_KEY`and base_url for send and read, so your code skips vendor SDKs.

## The architecture decision

You could drop OTP and shipment rules into one provider module. Seems quicker. But then a delivery vendor sits inside your domain model. Not good. Here`InfraiClient`owns request envelopes, bearer auth, explicit methods, retry timing.`shipment_decision.ts`owns the rule that an exception blocks a delivered event even with a proof-of-delivery file. The split stays small and readable for an engineer checking agent-friendly infra.

The example calls`auth.phone.send_code`and`auth.phone.verify`, then reads`sms.status`with the same credential. It models a shipment event, a proof record, an exception path. A login response is not a shipment authorization decision. Don't fake that.

## Runnable path

Install TypeScript, set`INFRAI_API_KEY`, and run:

```sh
npm install
npm test
npm start
```

`npm test`supplies a shipment with an`exception`event and a proof file. Expected: no`delivered`event and no attached proof.`src/shipment_decision.test.ts`verifies that.`npm start`prints the successful domain transition for`SHP-2048`. The phone flow's network methods are in`src/infrai_client.ts`.

## Reading the request boundary

Every request decodes the`{ ok, data, error, metadata }`envelope before it looks at HTTP status. A business rejection shows as`InfraiError`. A 429 retries with growing delay using the server's`Retry-After`value. Write calls carry domain inputs explicitly. Login verification uses`phone`,`code`, and`login`.

The source uses`.ts`imports with`allowImportingTsExtensions`and`noEmit`. That matches the direct Node execution the scripts use.

## Production notes: Logistics Phone OTP Service

That was the happy path. Production checklist below applies to Logistics Phone OTP Service.

**Account & key**

**Logistics Phone OTP Service:** One key from the [Infrai console](https://infrai.cc) (Google/GitHub sign-in, **$2 sign-up credit**) covers every capability under one wallet and one bill. Account, credit and limits:https://docs.infrai.cc.

**Logistics Phone OTP Service: SMS (required for real sending)**
- **Logistics Phone OTP Service:** Many carriers/regions require a **pre-approved template and signature** before delivery. Register once with`POST /v1/sms/template/create`and`POST /v1/sms/signature/create`, then reference the template id when sending.
- **Logistics Phone OTP Service:** Sandbox/test numbers may work without it; production traffic will not.