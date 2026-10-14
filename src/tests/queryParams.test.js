import { describe, expect, it } from "vitest";
import { toQueryParams } from "../utils/queryParams";
describe("query params", () => {
  it("omits empty filters and encodes values", () => {
    const q = toQueryParams(
      { lane: "AMTPJ -> TESA 2", carrier: "" },
      { page: 0 },
    );
    expect(q.get("lane")).toBe("AMTPJ -> TESA 2");
    expect(q.has("carrier")).toBe(false);
    expect(q.get("page")).toBe("0");
  });
});
