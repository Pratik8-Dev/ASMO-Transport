import { Children, cloneElement } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PerformanceChart } from "../components/charts/PerformanceChart";

vi.mock("recharts", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    ResponsiveContainer: ({ children }) =>
      cloneElement(children, {
        width: 600,
        height: 342,
        children: Children.map(children.props.children, (child) =>
          child.type === actual.Bar
            ? cloneElement(child, { isAnimationActive: false })
            : child,
        ),
      }),
  };
});

afterEach(cleanup);

const data = [
  { name: "AMTPJ -> DMM-PORT", percentage: 95, denominator: 20 },
  { name: "RUH-HUB -> MED-HUB", percentage: 75, denominator: 8 },
];

describe("PerformanceChart", () => {
  it("keeps the default site chart presentation unchanged", () => {
    const { container } = render(
      <PerformanceChart title="By Site" data={data} color="#4b8bc8" />,
    );
    expect(container.querySelector("article")).toHaveClass("panel", "chart");
    expect(container.querySelector("article")).not.toHaveClass(
      "chart--vertical-labels",
    );
    const ticks = container.querySelectorAll(
      ".recharts-xAxis .recharts-cartesian-axis-tick text",
    );
    expect(ticks).toHaveLength(data.length);
    ticks.forEach((tick) => {
      expect(tick).not.toHaveAttribute("transform");
      expect(tick).toHaveAttribute("font-size", "11");
    });
  });

  it.each(["Collection Site", "Delivery Site", "Lane"])(
    "rotates every %s label and preserves full names, order and values",
    (group) => {
      const { container } = render(
        <PerformanceChart
          title={`By ${group}`}
          data={data}
          color="#6863ae"
          verticalLabels
        />,
      );
      expect(container.querySelector("article")).toHaveClass(
        "chart--vertical-labels",
      );
      const ticks = container.querySelectorAll(
        ".recharts-xAxis .recharts-cartesian-axis-tick",
      );
      expect(ticks).toHaveLength(data.length);
      ticks.forEach((tick, index) => {
        expect(tick.querySelector("title")).toHaveTextContent(data[index].name);
        expect(tick.querySelector("text")).toHaveAttribute(
          "transform",
          "rotate(-90, 0, 8)",
        );
        expect(tick.querySelector("text")).toHaveStyle({ fontSize: "11px" });
      });
      expect(container.querySelector(".sr-only")).toHaveTextContent(
        "AMTPJ -> DMM-PORT: 95.0%; RUH-HUB -> MED-HUB: 75.0%",
      );
      expect(
        [...container.querySelectorAll(".recharts-label-list text")].map(
          (label) => label.textContent,
        ),
      ).toEqual(["95.0%", "75.0%"]);
    },
  );

  it("retains an unusually long lane name in its native tooltip and summary", () => {
    const name =
      "A very long collection site name -> A very long delivery site name";
    const { container } = render(
      <PerformanceChart
        title="By Lane"
        data={[{ name, percentage: 100, denominator: 1 }]}
        color="#6863ae"
        verticalLabels
      />,
    );
    expect(container.querySelector(".recharts-xAxis title")).toHaveTextContent(
      name,
    );
    expect(container.querySelector(".sr-only")).toHaveTextContent(
      `${name}: 100.0%`,
    );
  });

  it("renders an empty lane chart without introducing labels", () => {
    const { container } = render(
      <PerformanceChart
        title="By Lane"
        data={[]}
        color="#6863ae"
        verticalLabels
      />,
    );
    expect(
      screen.getByRole("heading", { name: "By Lane" }),
    ).toBeInTheDocument();
    expect(
      container.querySelectorAll(
        ".recharts-xAxis .recharts-cartesian-axis-tick",
      ),
    ).toHaveLength(0);
  });
});
