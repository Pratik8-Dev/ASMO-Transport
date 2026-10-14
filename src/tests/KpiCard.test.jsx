import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { KpiCard } from "../components/kpi/KpiCard";
describe("KpiCard", () => {
  it("renders value, supporting information and stand-in badge", () => {
    render(
      <KpiCard
        code="C1"
        title="OTD"
        value="95.0%"
        subtitle="Validated: 97.8%"
        lines={["Late deliveries: 7"]}
        standIn
      />,
    );
    expect(screen.getByText("95.0%")).toBeInTheDocument();
    expect(screen.getByText("Stand-in")).toBeInTheDocument();
  });
});
