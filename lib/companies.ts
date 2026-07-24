// Companies whose *actual* career pages are powered by Greenhouse or Lever.
// Both platforms expose a free, public, read-only JSON API for the boards
// they host — so hitting these endpoints returns jobs straight from the
// company's own career site, and the "apply" link sent back points at that
// same career site (job-boards.greenhouse.io/... or jobs.lever.co/...).
//
// This list is intentionally small and easy to extend — add a `token` here
// and it's automatically included in every search.

export const GREENHOUSE_COMPANIES: { name: string; token: string }[] = [
  { name: "Stripe", token: "stripe" },
  { name: "Airbnb", token: "airbnb" },
  { name: "Coinbase", token: "coinbase" },
  { name: "Robinhood", token: "robinhood" },
  { name: "DoorDash", token: "doordash" },
  { name: "Pinterest", token: "pinterest" },
  { name: "Asana", token: "asana" },
  { name: "GitLab", token: "gitlab" },
  { name: "Databricks", token: "databricks" },
  { name: "Figma", token: "figma" },
  { name: "Discord", token: "discord" },
  { name: "Reddit", token: "reddit" },
  { name: "Affirm", token: "affirm" },
  { name: "Squarespace", token: "squarespace" },
  { name: "Twitch", token: "twitch" },
  { name: "Lyft", token: "lyft" },
  { name: "Cloudflare", token: "cloudflare" },
  { name: "Elastic", token: "elastic" },
  { name: "DocuSign", token: "docusign" },
  { name: "HashiCorp", token: "hashicorp" },
];

export const LEVER_COMPANIES: { name: string; token: string }[] = [
  { name: "Netflix", token: "netflix" },
  { name: "Box", token: "box" },
  { name: "Plaid", token: "plaid" },
  { name: "Brex", token: "brex" },
  { name: "Rippling", token: "rippling" },
  { name: "Attentive", token: "attentive" },
  { name: "Buzzfeed", token: "buzzfeed" },
  { name: "Postman", token: "postman" },
  { name: "Genesys", token: "genesys" },
  { name: "Sprinklr", token: "sprinklr" },
];
