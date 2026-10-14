import { isMockApiEnabled } from "../../api/controlTowerApi";
// Development-only indicator so it is obvious the dashboard is showing
// mock data rather than a live backend. Renders nothing in production
// builds or when mock mode is off.
export function MockModeBanner() {
  if (!import.meta.env.DEV || !isMockApiEnabled()) return null;
  const scenario = import.meta.env.VITE_MOCK_SCENARIO || "normal";
  return (
    <p className="mock-banner" role="status">
      Mock data — VITE_USE_MOCK_API=true (scenario: {scenario})
    </p>
  );
}
