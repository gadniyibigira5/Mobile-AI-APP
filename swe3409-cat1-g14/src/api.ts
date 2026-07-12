// src/api.ts
//
// All network calls from the app go through this file.
//
// getRisk / sendDelivery: the shape the lecturer's tests use.
// sendMilkDeliveryAssessment / sendChatMessage: the shape the screens use.
//
// Offline behaviour: when the API cannot be reached, the risk is computed on
// the phone by src/model.ts (same weights as the Python model). The delivery
// is still marked "not sent", so it can be retried later.

import { API_URL } from './config.ts';
import { predictRiskLocally, localRiskLabel } from './model.ts';

/* ────────────────────────────────────────────────────────────────────────────
 * Test-shaped functions (M4)
 * ──────────────────────────────────────────────────────────────────────────── */

const DEFAULT_TIMEOUT_MS = 4000;

/**
 * Ask the Python API for a rejection risk.
 *
 * GET /risk?temp_c=<tempC>&hours=<hours>
 * Returns { risk, label } when the server answers, or null when it does not.
 *
 * The function never throws. Offline, bad server, timeout -> null.
 */
export async function getRisk(
  base: string,
  tempC: number,
  hours: number,
  timeoutMs: number = DEFAULT_TIMEOUT_MS,
): Promise<{ risk: number; label: string } | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const url = `${base}/risk?temp_c=${encodeURIComponent(tempC)}&hours=${encodeURIComponent(hours)}`;
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) return null;

    const data = await res.json();
    if (typeof data?.risk !== 'number' || typeof data?.label !== 'string') {
      return null;
    }
    return { risk: data.risk, label: data.label };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Send a delivery to the Python API.
 *
 * POST /deliveries  body: { farmer_id, litres, temp_c, hours }
 * Returns true when the server accepted (200), false otherwise.
 */
export async function sendDelivery(
  base: string,
  delivery: { farmerId: string; litres: number; tempC: number; hours: number },
  timeoutMs: number = DEFAULT_TIMEOUT_MS,
): Promise<boolean> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${base}/deliveries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        farmer_id: delivery.farmerId,
        litres: delivery.litres,
        temp_c: delivery.tempC,
        hours: delivery.hours,
      }),
    });
    return res.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

/* ────────────────────────────────────────────────────────────────────────────
 * Screen-shaped functions
 * ──────────────────────────────────────────────────────────────────────────── */

/**
 * Used by MilkDeliveryScreen.
 *
 * Sends the delivery to the API. If the API answers, the risk is the server's
 * decision. If it does not, the risk is computed on the phone by the same
 * model, and the recommendation explains that the answer is a local estimate.
 */
export async function sendMilkDeliveryAssessment(data: {
  farmer_id: string;
  litres: number;
  temperature: number;
  hours_since_milking: number;
}): Promise<{
  farmer_id: string;
  litres: number;
  risk_probability: number | null;
  label: 'Low' | 'Medium' | 'High' | 'Not checked';
  recommendation: string;
}> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const res = await fetch(`${API_URL}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error(`Server error: ${res.status}`);
    const serverResult = await res.json();
    return serverResult;
  } catch {
    // The API is not reachable. Compute the risk on the phone, using the same
    // weights as the Python model, so the collector still gets an answer.
    const local = predictRiskLocally(data.temperature, data.hours_since_milking);
    const label = localRiskLabel(local);

    return {
      farmer_id: data.farmer_id,
      litres: data.litres,
      risk_probability: Math.round(local * 10000) / 10000,
      label,
      recommendation:
        label === 'High'
          ? 'Offline estimate on this phone. High risk detected - test in lab before processing.'
          : label === 'Medium'
          ? 'Offline estimate on this phone. Accept with caution and cool the milk immediately.'
          : 'Offline estimate on this phone. Delivery looks acceptable, but the lab test is still the final check.',
    };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Used by ChatScreen. If the API is unreachable, returns a short offline note.
 */
export async function sendChatMessage(message: string): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const res = await fetch(`${API_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({ message }),
    });
    if (!res.ok) throw new Error('Chat backend unresponsive');

    const data = await res.json();
    return data.reply;
  } catch {
    return 'Offline: the AI assistant is not reachable right now. Check that the laptop is running the API and the phone is on the same Wi-Fi.';
  } finally {
    clearTimeout(timer);
  }
}