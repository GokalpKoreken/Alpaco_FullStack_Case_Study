const fs = require('fs');
const path = require('path');

// Load seed from environment or SEED.txt
let SEED = process.env.SEED || null;
try {
  if (!SEED) {
    const p = path.join(__dirname, 'SEED.txt');
    if (fs.existsSync(p)) SEED = fs.readFileSync(p, 'utf8').trim();
  }
} catch (e) {
  // ignore
}

function deriveCoeffs(seed) {
  if (!seed || seed.length < 6) return { A: 7, B: 13, C: 3 };
  const s = seed.replace(/[^0-9a-f]/gi, '').slice(0, 6);
  const A = 7 + (parseInt(s.slice(0, 2), 16) % 5);
  const B = 13 + (parseInt(s.slice(2, 4), 16) % 7);
  const C = 3 + (parseInt(s.slice(4, 6), 16) % 3);
  return { A, B, C };
}

const coeffs = deriveCoeffs(SEED);

// Compute a priority score using available fields. Lower score -> higher priority.
// This is an adapted formula from the spec. Fields:
// - signup_latency_ms: milliseconds between signup and join
// - account_age_days: days since account creation
// - rapid_actions: heuristic count of rapid actions (0 if unknown)
function computePriorityScore({ signup_latency_ms = 0, account_age_days = 0, rapid_actions = 0, base = 0 }) {
  const { A, B, C } = coeffs;
  // keep numbers small and deterministic
  const partA = (signup_latency_ms % (A || 1));
  const partB = (account_age_days % (B || 1));
  const partC = (rapid_actions % (C || 1));

  // lower is better
  const score = base + partA + partB - partC;
  // ensure integer
  return Math.max(0, Math.floor(score));
}

module.exports = { SEED, coeffs, computePriorityScore };
