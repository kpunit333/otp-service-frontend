import { DeliveryChannel, ProviderName } from "./otp";

export interface ProviderStatus {
  id: ProviderName;
  displayName: string;
  channel: DeliveryChannel;
  status: "operational" | "degraded" | "down";
  latencyMs: number;
  deliverySuccessRate: number;
  priority: number; // 1 = Primary, 2 = Secondary failover, 3 = Tertiary
  balance?: string;
  isConfigured: boolean;
}
