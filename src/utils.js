export function canNext(step, { keyValid, newsletterCount }) {
  if (step === 1) return keyValid === true;
  if (step === 2) return newsletterCount >= 3;
  return true;
}
