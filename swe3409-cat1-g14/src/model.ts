// src/model.ts
//
// On-device version of the milk rejection model.
//
// The weights and bias below are the ones the Python model (A3, model.py)
// learns when trained on the cleaned delivery dataset with the default
// hyper-parameters (lr=0.1, steps=1000). They match what the live API
// produces from /predict and /risk, so the phone and the laptop return the
// same risk for the same input.
//
// Use this when the Python API cannot be reached, so the collector still gets
// a real risk estimate rather than "Not checked".

/** Weights for the two features: temperature and hours since milking. */
const W0 = 1.36557605; // coefficient for temp_c / 10
const W1 = 0.60047867; // coefficient for hours / 10
const B = -3.694860518180914; // intercept

/** Standard logistic sigmoid. */
function sigmoid(z: number): number {
  return 1 / (1 + Math.exp(-z));
}

/**
 * Predict the rejection probability for one delivery.
 * Returns a value between 0 and 1.
 *
 * Scaling matches the Python model: temp_c and hours are divided by 10
 * before being combined with the weights.
 */
export function predictRiskLocally(tempC: number, hours: number): number {
  const x1 = tempC / 10;
  const x2 = hours / 10;
  const z = W0 * x1 + W1 * x2 + B;
  return sigmoid(z);
}

/**
 * Same thresholds as risk_label() in the Python API and riskLabel() in
 * logic.ts. Kept here so the local model can label its own output.
 */
export function localRiskLabel(risk: number): 'Low' | 'Medium' | 'High' {
  if (risk < 0.3) return 'Low';
  if (risk < 0.6) return 'Medium';
  return 'High';
}