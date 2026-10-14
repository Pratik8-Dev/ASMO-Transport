import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ShipmentTable } from "../components/table/ShipmentTable";
describe("ShipmentTable", () => {
  it("renders status text without relying on color", () => {
    render(
      <ShipmentTable
        page={{
          content: [
            {
              jobId: "1",
              tripId: "t",
              collectionSite: "A",
              deliverySite: "B",
              legKm: 1,
              createdOn: null,
              poc: null,
              pod: null,
              slaDue: null,
              slaMet: false,
              dataQualityFlags: ["DQ-01"],
            },
          ],
          totalElements: 1,
          totalPages: 1,
          number: 0,
          first: true,
          last: true,
        }}
        onPage={vi.fn()}
        onSort={vi.fn()}
      />,
    );
    expect(screen.getByText("No")).toBeInTheDocument();
    expect(screen.getByText(/DQ-01/)).toBeInTheDocument();
  });
});
