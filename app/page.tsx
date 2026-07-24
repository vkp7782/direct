"use client";

import { useMemo, useState, useRef, FormEvent } from "react";
import { Job, JobMode, JobSearchResult } from "@/types/job";
import JobCard from "@/components/JobCard";
import Header from "@/components/Header";

const SUGGESTIONS = [
  "Product Designer",
  "Backend Engineer",
  "Data Analyst",
  "Customer Support",
  "Marketing Manager",
];

const MODE_OPTIONS: (JobMode | "Any")[] = ["Any", "Remote", "Hybrid", "Onsite"];

export default function Home() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle"
  );
  const [result, setResult] = useState<JobSearchResult | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const lastQuery = useRef("");

  // ---- filters ----
  const [mode, setMode] = useState<JobMode | "Any">("Any");
  const [country, setCountry] = useState("");
  const [minSalary, setMinSalary] = useState("");

  async function runSearch(role: string) {
    const trimmed = role.trim();
    if (!trimmed) return;
    lastQuery.current = trimmed;
    setStatus("loading");
    try {
      const res = await fetch(`/api/jobs?role=${encodeURIComponent(trimmed)}`);
      if (!res.ok) throw new Error("Search failed");
      const data: JobSearchResult = await res.json();
      setResult(data);
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    runSearch(query);
  }

  const filteredJobs = useMemo(() => {
    if (!result) return [];
    const countryQuery = country.trim().toLowerCase();
    const minSalaryNum = minSalary ? Number(minSalary) : null;

    return result.jobs.filter((job: Job) => {
      if (mode !== "Any" && job.jobMode !== mode) return false;

      if (countryQuery) {
        const haystack = `${job.country || ""} ${job.location}`.toLowerCase();
        if (!haystack.includes(countryQuery)) return false;
      }

      if (minSalaryNum) {
        const jobMax = job.salaryMax ?? job.salaryMin;
        // Jobs with no salary data are excluded once a minimum is set —
        // there's nothing to compare against.
        if (!jobMax || jobMax < minSalaryNum) return false;
      }

      return true;
    });
  }, [result, mode, country, minSalary]);

  const okSources = result ? 6 - result.sourceErrors.length : null;
  const filtersActive =
    mode !== "Any" || country.trim() !== "" || minSalary !== "";
  const activeFilterCount =
    (mode !== "Any" ? 1 : 0) +
    (country.trim() !== "" ? 1 : 0) +
    (minSalary !== "" ? 1 : 0);

  return (
    <div className="flex min-h-full flex-col">
      <Header />

      <main className="flex flex-1 flex-col">
        {/* Hero / search — the search bar is the product */}
        <section className="border-b border-line">
          <div className="mx-auto max-w-3xl px-5 pb-8 pt-10 sm:px-6 sm:pb-14 sm:pt-20">
            <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-signal-dark sm:mb-4 sm:text-xs">
              No aggregators. No repostings.
            </p>
            <h1 className="font-display text-3xl leading-[1.12] text-ink sm:text-5xl sm:leading-[1.08]">
              Search a role.{" "}
              <span className="italic text-ink-soft">
                Apply on the company&rsquo;s own site.
              </span>
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-soft sm:mt-4 sm:text-base">
              Every listing here is pulled live from a company&rsquo;s actual
              career page — Greenhouse and Lever boards, plus worldwide
              remote job feeds. Click apply and you land on the original
              posting, never a middleman.
            </p>

            <form
              onSubmit={onSubmit}
              className="mt-6 flex flex-col gap-2 sm:mt-8 sm:flex-row"
            >
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. product designer, backend engineer, nurse…"
                className="w-full rounded-full border border-line-strong bg-paper-raised px-5 py-3 text-ink placeholder:text-ink-soft/60 outline-none focus:border-signal"
                autoFocus
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="shrink-0 rounded-full bg-ink px-6 py-3 text-sm font-medium text-paper-raised transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {status === "loading" ? "Searching…" : "Search"}
              </button>
            </form>

            <div className="mt-4 flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setQuery(s);
                    runSearch(s);
                  }}
                  className="rounded-full border border-line px-3 py-1 font-mono text-xs text-ink-soft transition-colors hover:border-signal hover:text-signal-dark"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Filters — only meaningful once there's something to filter */}
        {(status === "done" || status === "loading") && (
          <section className="border-b border-line bg-paper-raised/60">
            <div className="mx-auto max-w-3xl px-5 py-4 sm:px-6">
              {/* Mobile: collapsible toggle so the results aren't pushed down */}
              <button
                type="button"
                onClick={() => setFiltersOpen((v) => !v)}
                className="flex w-full items-center justify-between sm:hidden"
              >
                <span className="font-mono text-xs uppercase tracking-wider text-ink-soft">
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="ml-1.5 rounded-full bg-ink px-1.5 py-0.5 text-[10px] text-paper-raised">
                      {activeFilterCount}
                    </span>
                  )}
                </span>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  className={`text-ink-soft transition-transform ${filtersOpen ? "rotate-180" : ""}`}
                >
                  <path
                    d="M3 5l4 4 4-4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              <div
                className={`${filtersOpen ? "mt-4 flex" : "hidden"} flex-col gap-4 sm:mt-0 sm:flex sm:flex-row sm:flex-wrap sm:items-end`}
              >
                <div>
                  <label className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-ink-soft">
                    Job mode
                  </label>
                  <div className="flex flex-wrap gap-1">
                    {MODE_OPTIONS.map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setMode(m)}
                        className={`rounded-full border px-3 py-1.5 font-mono text-xs transition-colors ${
                          mode === m
                            ? "border-ink bg-ink text-paper-raised"
                            : "border-line text-ink-soft hover:border-signal hover:text-signal-dark"
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="country"
                    className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-ink-soft"
                  >
                    Location / country
                  </label>
                  <input
                    id="country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="e.g. Germany, India, London"
                    className="w-full rounded-full border border-line-strong bg-paper-raised px-3 py-1.5 text-sm text-ink outline-none placeholder:text-ink-soft/50 focus:border-signal sm:w-48"
                  />
                </div>

                <div>
                  <label
                    htmlFor="min-salary"
                    className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-ink-soft"
                  >
                    Min salary (annual)
                  </label>
                  <input
                    id="min-salary"
                    type="number"
                    min={0}
                    step={1000}
                    value={minSalary}
                    onChange={(e) => setMinSalary(e.target.value)}
                    placeholder="e.g. 60000"
                    className="w-full rounded-full border border-line-strong bg-paper-raised px-3 py-1.5 text-sm text-ink outline-none placeholder:text-ink-soft/50 focus:border-signal sm:w-36"
                  />
                </div>

                {filtersActive && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode("Any");
                      setCountry("");
                      setMinSalary("");
                    }}
                    className="self-start font-mono text-xs text-ink-soft underline underline-offset-2 hover:text-signal-dark sm:self-auto"
                  >
                    Clear filters
                  </button>
                )}

                {minSalary && (
                  <p className="w-full font-mono text-[10px] text-ink-soft/70">
                    Note: most free sources don&rsquo;t publish salary —
                    setting a minimum hides any listing without salary data.
                  </p>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Results */}
        <section className="mx-auto w-full max-w-3xl flex-1 px-5 py-8 sm:px-6 sm:py-10">
          {status === "idle" && (
            <p className="text-sm text-ink-soft">
              Type a role above to see what&rsquo;s actually open right now.
            </p>
          )}

          {status === "loading" && (
            <div className="overflow-hidden rounded-2xl border border-line bg-paper-raised">
              <ul className="animate-pulse divide-y divide-line">
                {[...Array(5)].map((_, i) => (
                  <li key={i} className="flex items-center gap-4 px-5 py-5">
                    <div className="h-10 w-10 rounded-full bg-line" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-1/3 rounded bg-line" />
                      <div className="h-3 w-1/2 rounded bg-line" />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {status === "error" && (
            <p className="text-sm text-danger">
              Something went wrong reaching the job sources. Try again in a
              moment.
            </p>
          )}

          {status === "done" && result && (
            <>
              <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-0">
                <h2 className="font-display text-lg text-ink sm:text-xl">
                  {filteredJobs.length}{" "}
                  {filteredJobs.length === 1 ? "opening" : "openings"} for
                  &ldquo;{result.query}&rdquo;
                  {filtersActive && (
                    <span className="font-body text-sm text-ink-soft">
                      {" "}
                      ({result.count} before filters)
                    </span>
                  )}
                </h2>
                {okSources !== null && (
                  <span className="font-mono text-[11px] text-ink-soft/70">
                    {okSources}/6 sources responded
                  </span>
                )}
              </div>

              {filteredJobs.length === 0 ? (
                <p className="text-sm text-ink-soft">
                  {result.count === 0
                    ? 'Nothing matched that title right now. Try a broader term — e.g. "engineer" instead of "senior staff platform engineer".'
                    : "No openings match your filters. Try loosening the location, salary, or job mode."}
                </p>
              ) : (
                <ul className="overflow-hidden rounded-2xl border border-line bg-paper-raised shadow-sm">
                  {filteredJobs.map((job: Job, i: number) => (
                    <JobCard key={job.id} job={job} index={i} />
                  ))}
                </ul>
              )}
            </>
          )}
        </section>

        <footer className="border-t border-line">
          <div className="mx-auto max-w-3xl px-5 py-6 font-mono text-xs leading-relaxed text-ink-soft/70 sm:px-6">
            Sources: Greenhouse &amp; Lever company boards, Remotive,
            Arbeitnow, RemoteOK, Jobicy
          </div>
        </footer>
      </main>
    </div>
  );
}
