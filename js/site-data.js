/**
 * Shared site data: the moments and levers that drive the global nav and default lever
 * selection on every page (REQUIREMENTS §2, §10). Page content itself is authored in HTML.
 *
 * The object between the JSON markers must stay strict JSON: tools/generate_moments.py reads
 * it so the generated pages and the menus share one source.
 */

export const SITE = /* JSON:BEGIN */ {
  "levers": [
    { "slug": "policy", "label": "Policy", "definition": "Secure rights and elevate community voice" },
    { "slug": "behavior-tech", "label": "Behavioral Science & Technology", "definition": "Drive behavior change and improve delivery systems" },
    { "slug": "finance-markets", "label": "Finance & Markets", "definition": "Unlock capital through blended finance and markets" },
    { "slug": "narrative", "label": "Narrative Shift", "definition": "Shift norms and values through storytelling" }
  ],
  "moments": [
    {
      "slug": "1-millionth-farmer",
      "label": "1 Millionth Smallholder Farmer",
      "state": "full",
      "significance": { "policy": "supporting", "behavior-tech": "primary", "finance-markets": "strong", "narrative": "supporting" },
      "significanceDraft": false
    },
    {
      "slug": "coastal-5000-convening",
      "label": "Coastal 5,000 Convening",
      "state": "skeleton",
      "significance": { "narrative": "primary" },
      "significanceDraft": true
    },
    {
      "slug": "impact-bond-iii-launch",
      "label": "Impact Bond III Launch",
      "state": "skeleton",
      "significance": { "finance-markets": "primary" },
      "significanceDraft": true
    },
    {
      "slug": "local-training-partner-led",
      "label": "Local Training: Partner-Led",
      "state": "skeleton",
      "significance": { "behavior-tech": "primary" },
      "significanceDraft": true
    },
    {
      "slug": "policy-win-press-coverage",
      "label": "Policy Win: Press coverage of community",
      "state": "skeleton",
      "significance": { "policy": "primary" },
      "significanceDraft": true
    },
    {
      "slug": "savings-club-1000th-loan",
      "label": "Savings Club makes 1,000th Loan",
      "state": "skeleton",
      "significance": { "finance-markets": "primary" },
      "significanceDraft": true
    },
    {
      "slug": "ngo-partner-credits-bda",
      "label": "NGO partner credits Behavioral Design Agent",
      "state": "skeleton",
      "significance": { "behavior-tech": "primary" },
      "significanceDraft": true
    }
  ]
} /* JSON:END */;

export const LEVERS = SITE.levers;
export const MOMENTS = SITE.moments;

/** Significance levels, strongest first. */
export const SIGNIFICANCE = ['primary', 'strong', 'supporting'];

export const getMoment = (slug) => MOMENTS.find((m) => m.slug === slug) ?? null;
export const getLever = (slug) => LEVERS.find((l) => l.slug === slug) ?? null;

/** The lever with the highest significance for a moment; ties go to the earlier lever (§4.5). */
export function defaultLeverFor(momentSlug) {
  const moment = getMoment(momentSlug);
  if (!moment) return LEVERS[0].slug;
  for (const level of SIGNIFICANCE) {
    const lever = LEVERS.find((l) => moment.significance[l.slug] === level);
    if (lever) return lever.slug;
  }
  return LEVERS[0].slug;
}

/** Path from a moment page (moments/<slug>/) to another moment page. */
export const momentHref = (slug) => `../${slug}/`;
