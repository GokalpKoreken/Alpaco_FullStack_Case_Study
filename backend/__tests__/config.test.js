const { computePriorityScore, coeffs } = require('../config');

describe('config.computePriorityScore', () => {
  test('returns a non-negative integer and uses coeffs', () => {
    const res = computePriorityScore({ signup_latency_ms: 1234, account_age_days: 10, rapid_actions: 2, base: 5 });
    expect(Number.isInteger(res)).toBe(true);
    expect(res).toBeGreaterThanOrEqual(0);
    // coeffs should be present
    expect(coeffs).toBeDefined();
  });
});
