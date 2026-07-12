/**
 * M1 · MEMBER 4 · The rules of the app (pure TypeScript, no screens)
 *
 * Owner (your GitHub username): @
 * Your AI task in the swe3513-cat1 repository: A4 (api.py)
 *
 * WHAT MEMBER 4 DOES HERE
 * The collector types a farmer code, litres, temperature and hours since
 * milking. You write the rules that decide whether that input is acceptable,
 * how a risk number becomes a word, and the totals shown under the form.
 * Members 2, 3 and 4 use these functions, so the types below are already
 * written: do not change them. Your tests need nothing else: start at once.
 *
 * Done means: npm run test:logic  -> 6 pass, merged through a reviewed pull request.
 */

/** What the form produces (Member 3). */
export type NewDelivery = {
  farmerId: string; // e.g. "FRM-0012"
  litres: number;
  tempC: number;    // temperature when the milk arrives
  hours: number;    // hours since milking
};

/** What the app keeps in its list (Member 2 adds id, risk and sent). */
export type Delivery = NewDelivery & {
  id: string;
  risk: number | null; // 0..1 from the API, or null when the API could not be reached
  sent: boolean;       // true when the API accepted it
};

/**
 * true if text is exactly "FRM-" followed by 4 digits, e.g. "FRM-0012".
 */
export function isValidFarmerId(text: string): boolean {
  return /^FRM-\d{4}$/.test(text);
}

/**
 * Return '' when the input is fine, otherwise the FIRST problem found.
 *
 * Messages are exact, because the collector sees them on screen:
 *   farmer code           -> 'Enter a farmer code like FRM-0012'
 *   litres                -> 'Litres must be more than 0 and at most 60'
 *   temperature           -> 'Temperature must be 0 to 45 °C'
 *   hours since milking   -> 'Hours since milking must be 0 to 24'
 */
export function checkDelivery(
  farmerId: string,
  litres: string,
  tempC: string,
  hours: string,
): string {
  // Farmer code: trim, upper-case, then check shape.
  const cleanId = farmerId.trim().toUpperCase();
  if (!isValidFarmerId(cleanId)) {
    return 'Enter a farmer code like FRM-0012';
  }

  // Litres: must not be empty, must be a number, must be > 0 and <= 60.
  const l = Number(litres);
  if (litres.trim() === '' || Number.isNaN(l) || !(l > 0 && l <= 60)) {
    return 'Litres must be more than 0 and at most 60';
  }

  // Temperature: must not be empty, must be a number, must be 0..45.
  const t = Number(tempC);
  if (tempC.trim() === '' || Number.isNaN(t) || t < 0 || t > 45) {
    return 'Temperature must be 0 to 45 °C';
  }

  // Hours: must not be empty, must be a number, must be 0..24.
  const h = Number(hours);
  if (hours.trim() === '' || Number.isNaN(h) || h < 0 || h > 24) {
    return 'Hours since milking must be 0 to 24';
  }

  return '';
}

/**
 * Turn a risk number into the word the collector sees.
 *   null            -> 'Not checked'
 *   below 0.3       -> 'Low'
 *   below 0.6       -> 'Medium'
 *   otherwise       -> 'High'
 *
 * These are the same limits as risk_label() in the Python API.
 */
export function riskLabel(risk: number | null): string {
  if (risk === null) return 'Not checked';
  if (risk < 0.3) return 'Low';
  if (risk < 0.6) return 'Medium';
  return 'High';
}

/**
 * Summary line shown at the top of the delivery list.
 *   count    = number of deliveries
 *   litres   = sum of litres, rounded to 1 decimal
 *   highRisk = number of deliveries with risk >= 0.6 (null does not count)
 */
export function totals(deliveries: Delivery[]): {
  count: number;
  litres: number;
  highRisk: number;
} {
  const count = deliveries.length;
  const sumLitres = deliveries.reduce((acc, d) => acc + d.litres, 0);
  const litres = Math.round(sumLitres * 10) / 10;
  const highRisk = deliveries.filter(
    (d) => d.risk !== null && d.risk >= 0.6,
  ).length;

  return { count, litres, highRisk };
}