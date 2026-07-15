export type ShippingInput = {
  countryCode: string;
  weightGrams: number;
  subtotalCents: number;
};
export type ShippingQuote = {
  methodId: string;
  label: string;
  priceCents: number;
  daysMin: number;
  daysMax: number;
};

export interface ShippingProvider {
  calculateRates(input: ShippingInput): Promise<ShippingQuote[]>;
  createShipment(input: { orderId: string }): Promise<{ shipmentId: string }>;
  createLabel(input: { shipmentId: string }): Promise<{ labelUrl: string }>;
  getTracking(input: {
    shipmentId: string;
  }): Promise<{ status: string; trackingUrl?: string }>;
  cancelShipment(input: { shipmentId: string }): Promise<void>;
}

export class MockShippingProvider implements ShippingProvider {
  async calculateRates(input: ShippingInput) {
    if (input.countryCode !== "DE") return [];
    return [
      {
        methodId: "de-standard",
        label: "Standard Deutschland",
        priceCents:
          input.subtotalCents >= 6_000
            ? 0
            : input.weightGrams > 2_000
              ? 699
              : 499,
        daysMin: 3,
        daysMax: 4,
      },
    ];
  }
  async createShipment(input: { orderId: string }) {
    return { shipmentId: `mock_${input.orderId}` };
  }
  async createLabel(input: { shipmentId: string }) {
    return { labelUrl: `/admin/shipments/${input.shipmentId}/mock-label` };
  }
  async getTracking(input: { shipmentId: string }) {
    return { status: "PENDING", trackingUrl: `/tracking/${input.shipmentId}` };
  }
  async cancelShipment() {}
}
