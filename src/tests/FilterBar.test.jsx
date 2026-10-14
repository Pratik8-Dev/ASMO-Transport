import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { FilterBar } from "../components/filters/FilterBar";
import { INITIAL_FILTERS } from "../constants/dashboard";
describe("FilterBar", () => {
  it("reports exact filter changes and reset", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onReset = vi.fn();
    render(
      <FilterBar
        filters={INITIAL_FILTERS}
        onChange={onChange}
        onReset={onReset}
      />,
    );
    await user.type(screen.getByLabelText("Collection Site"), "AMTPJ");
    expect(onChange).toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: /clear filters/i }));
    expect(onReset).toHaveBeenCalledOnce();
  });
});
