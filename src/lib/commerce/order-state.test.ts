import { describe, expect, it } from "vitest";
import {
  assertOrderTransition,
  InvalidOrderTransitionError,
} from "./order-state";
describe("order state machine", () => {
  it("accepts a paid order entering processing", () =>
    expect(() => assertOrderTransition("PAID", "PROCESSING")).not.toThrow());
  it("rejects shipping an unpaid order", () =>
    expect(() => assertOrderTransition("PENDING_PAYMENT", "SHIPPED")).toThrow(
      InvalidOrderTransitionError,
    ));
});
