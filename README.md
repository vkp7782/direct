# Direct — jobs straight from company career pages

Type a job title, get openings pulled live from real company career pages
worldwide, filter by job mode / location / salary, and click **Apply** to
land on the original posting — never a scraped copy or a middleman
"apply with us" page.

## How it works

There is no single free API that indexes *every* company career page on
earth (no paid product offers that either). Instead this app fans out to six
free, public, no-signup-required sources in parallel and merges/dedupes the
results:

| Source | What it is | Why the link is "direct" |
|---|---|---|
| **Greenhouse** | Public JSON API (`boards-api.greenhouse.io`) for any company that hosts its career page on Greenhouse | The URL returned *is* the company's own career page |
| **Lever** | Public JSON API (`api.lever.co/v0/postings/...`) for companies on Lever | Same — `jobs.lever.co/...` is their real career site |
| **Remotive** | Free public API of remote roles, many sourced directly from company boards | Links to the original listing |
| **Arbeitnow** | Free public API, strong European/remote coverage | Links to the original listing |
| **RemoteOK** | Free public API of remote roles | Links to the original listing |
| **Jobicy** | Free public API of remote roles | Links to the original listing |

Greenhouse and Lever don't offer a global "search every company" endpoint —
you query one company's board at a time. So `lib/companies.ts` holds a small,
easily-extendable list of companies known to run their career page on one of
these platforms. Add any company's Greenhouse or Lever token there and it's
automatically included in every search.

**To find a company's token:** open their careers page — if the URL looks
like `job-boards.greenhouse.io/{token}` or `jobs.lever.co/{token}`, that's it.

## Relevance filtering

Every source's raw results are passed through `lib/relevance.ts` before
they're shown. It splits the search query into words and requires the real
skill/domain word (e.g. "react") to appear in the job's title or tags, while
treating generic role words ("developer", "engineer", "senior", etc.) as
flexible — so searching "react developer" correctly surfaces "React
Engineer" or "Frontend Developer (React)" too, and just as importantly,
filters out unrelated roles that some sources' own search/tag endpoints let
through unfiltered.

## Filters

Once results load, a filter bar appears (collapsible on mobile) with:

- **Job mode** — Remote / Hybrid / Onsite, inferred from each source's
  location text (see `lib/normalize.ts`)
- **Location / country** — free-text match against the parsed country and
  raw location string
- **Min salary (annual)** — only Lever, RemoteOK, Jobicy, and Remotive ever
  expose salary; Greenhouse and Arbeitnow don't, so setting a minimum will
  hide any listing with no published salary. The UI says so.

All filtering happens client-side on the already-fetched result set, so it's
instant — no re-fetching on filter change.

## Project structure

```
app/
  api/jobs/route.ts     # GET /api/jobs?role=... — runs the aggregated search
  page.tsx               # Search UI, filters, results list
  layout.tsx               # Root layout, metadata
  globals.css                # Design tokens (paper/ink/signal palette)
lib/
  companies.ts             # Curated Greenhouse/Lever company tokens
  sources.ts                 # One fetcher+normalizer per source
  relevance.ts                 # Query-relevance filter (fixes irrelevant results)
  normalize.ts                   # Country + job-mode inference from location text
  fetchJobs.ts                     # Runs all sources in parallel, dedupes, sorts
types/job.ts                       # Shared Job / JobSearchResult / JobMode types
components/
  Header.tsx                         # Sticky top bar
  JobCard.tsx                          # Single job row — avatar, badges, Apply button
```

## Running it

```bash
npm install
npm run dev
```

Open http://localhost:3000, type a role (e.g. "product designer"), and
results stream in from all sources at once. Apply buttons open the original
posting in a new tab. Fully responsive — the filter bar collapses behind a
toggle on small screens, and job cards stack vertically with a full-width
Apply button for easy tapping.

## Notes & honest limitations

- **Coverage isn't literally "every company worldwide."** It's every company
  in the curated list, plus whatever the four aggregator APIs currently
  index. Extending `companies.ts` is the main lever for growing coverage —
  add the companies you personally care about.
- **Some sources rate-limit or occasionally block requests** (e.g. RemoteOK
  can 403 aggressive/datacenter IPs). The app is built to degrade gracefully:
  if a source fails, the others still return, and `sourceErrors` in the API
  response tells you which ones didn't respond.
- **Arbeitnow's API doesn't support server-side search**, so that source is
  filtered by title/tag after fetching its most recent postings — deep
  historical results from it won't show up.
- **Jobicy's `tag` param only matches its own fixed taxonomy** — searches
  that don't match a known tag get client-side re-filtered by
  `lib/relevance.ts` so you never see its unfiltered fallback list.
- All six sources are free and require no API key. If you later want true
  worldwide breadth (Indeed, LinkedIn, etc.), that requires paid,
  rate-limited, or partner-only APIs — those weren't used here to keep this
  100% free to run.
