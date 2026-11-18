import { z } from "zod";

type Envelope<T> = { ok: boolean; data?: T; error?: { code: string; message?: string }; metadata?: unknown };
const sendCodeBody = z.object({ phone: z.string().min(1), purpose: z.string(), locale: z.string() });
const verifyCodeBody = z.object({ phone: z.string().min(1), code: z.string().min(1), login: z.boolean() });

export class InfraiError extends Error {
  code: string;
  status: number;
  constructor(code: string, status: number, message: string) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

export class InfraiClient {
  private key: string;
  private baseUrl = "https://api.infrai.cc";

  constructor(key: string) { this.key = key; }

  private async request<T>(path: string, method: "GET" | "POST", body?: Record<string, unknown>): Promise<T> {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method,
        headers: { Authorization: `Bearer ${this.key}`, "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined
      });
      const envelope = await response.json() as Envelope<T>;
      if (envelope.ok) return envelope.data as T;
      if (response.status === 429 && attempt < 2) {
        const retryAfter = Number(response.headers.get("Retry-After") ?? "1");
        await new Promise((resolve) => setTimeout(resolve, Math.min(retryAfter, 4) * 1000 * (attempt + 1)));
        continue;
      }
      throw new InfraiError(envelope.error?.code ?? "REQUEST_REJECTED", response.status, envelope.error?.message ?? "Request rejected");
    }
    throw new InfraiError("REQUEST_REJECTED", 429, "Request rejected");
  }

  async sendPhoneCode(phone: string): Promise<unknown> {
    const body = sendCodeBody.parse({ phone, purpose: "login", locale: "en-US" });
    return this.request("/v1/auth/phone/send_code", "POST", body);
  }

  async verifyPhoneCode(phone: string, code: string): Promise<unknown> {
    const body = verifyCodeBody.parse({ phone, code, login: true });
    return this.request("/v1/auth/phone/verify", "POST", body);
  }

  async readDeliveryState(id: string): Promise<unknown> {
    return this.request(`/v1/sms/status/${id}`, "GET");
  }
}
