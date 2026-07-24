import { Job } from "@/types/job";
import { GREENHOUSE_COMPANIES, LEVER_COMPANIES } from "./companies";
import { deriveCountry, deriveJobMode } from "./normalize";
import { isRelevant } from "./relevance";

const TIMEOUT_MS = 8000;

function timeoutSignal() {
  // AbortSignal.timeout is available in Node 18+ / modern runtimes
  return AbortSignal.timeout(TIMEOUT_MS);
}

async function safeJson(url: string) {
  const res = await fetch(url, {
    signal: timeoutSignal(),
    headers: { "User-Agent": "job-finder-demo/1.0" },
    // These public boards change constantly — don't let Next cache stale results
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`${url} -> HTTP ${res.status}`);
  return res.json();
}

/* ---------------------------------------------------------------------- */
/* Greenhouse — real company career pages (job-boards.greenhouse.io/...)  */
/* ---------------------------------------------------------------------- */
async function fetchGreenhouseCompany(
  company: { name: string; token: string },
  query: string
): Promise<Job[]> {
  const data = await safeJson(
    `https://boards-api.greenhouse.io/v1/boards/${company.token}/jobs?content=true`
  );
  const jobs = Array.isArray(data?.jobs) ? data.jobs : [];
  return jobs
    .filter((j: any) => isRelevant(j.title, [], query))
    .map((j: any) => {
      const location = j.location?.name || "Not specified";
      const remote = /remote/i.test(location);
      return {
        id: `gh-${company.token}-${j.id}`,
        title: j.title,
        company: company.name,
        companyLogo: null,
        location,
        country: deriveCountry(location),
        remote,
        jobMode: deriveJobMode(location, remote),
        url: j.absolute_url,
        source: "Greenhouse" as const,
        postedAt: j.updated_at || null,
        tags: [],
        salaryMin: null,
        salaryMax: null,
        salaryCurrency: null,
      };
    });
}

export async function fetchGreenhouse(query: string): Promise<Job[]> {
  const results = await Promise.allSettled(
    GREENHOUSE_COMPANIES.map((c) => fetchGreenhouseCompany(c, query))
  );
  return results.flatMap((r) => (r.status === "fulfilled" ? r.value : []));
}

/* ---------------------------------------------------------------------- */
/* Lever — real company career pages (jobs.lever.co/...)                  */
/* ---------------------------------------------------------------------- */
async function fetchLeverCompany(
  company: { name: string; token: string },
  query: string
): Promise<Job[]> {
  const data = await safeJson(
    `https://api.lever.co/v0/postings/${company.token}?mode=json`
  );
  const jobs = Array.isArray(data) ? data : [];
  return jobs
    .filter((j: any) => isRelevant(j.text, [j.categories?.team], query))
    .map((j: any) => {
      const location = j.categories?.location || "Not specified";
      const remote = /remote/i.test(location);
      return {
        id: `lv-${company.token}-${j.id}`,
        title: j.text,
        company: company.name,
        companyLogo: null,
        location,
        country: deriveCountry(location),
        remote,
        jobMode: deriveJobMode(location, remote),
        url: j.hostedUrl,
        source: "Lever" as const,
        postedAt: j.createdAt ? new Date(j.createdAt).toISOString() : null,
        tags: [j.categories?.team, j.categories?.commitment].filter(Boolean),
        salaryMin: j.salaryRange?.min ?? null,
        salaryMax: j.salaryRange?.max ?? null,
        salaryCurrency: j.salaryRange?.currency ?? null,
      };
    });
}

export async function fetchLever(query: string): Promise<Job[]> {
  const results = await Promise.allSettled(
    LEVER_COMPANIES.map((c) => fetchLeverCompany(c, query))
  );
  return results.flatMap((r) => (r.status === "fulfilled" ? r.value : []));
}

/* ---------------------------------------------------------------------- */
/* Remotive — free public API, worldwide remote jobs                      */
/* ---------------------------------------------------------------------- */
export async function fetchRemotive(query: string): Promise<Job[]> {
  const data = await safeJson(
    `https://remotive.com/api/remote-jobs?search=${encodeURIComponent(query)}`
  );
  const jobs = Array.isArray(data?.jobs) ? data.jobs : [];
  return jobs
    .filter((j: any) => isRelevant(j.title, j.tags, query))
    .map((j: any) => {
    const location = j.candidate_required_location || "Worldwide";
    // Remotive salary is a loose free-text string, e.g. "$60,000 - $80,000"
    const salaryMatch = String(j.salary || "").match(
      /(\d[\d,]*)\s*(?:-|to)\s*(\d[\d,]*)/
    );
    return {
      id: `rm-${j.id}`,
      title: j.title,
      company: j.company_name,
      companyLogo: j.company_logo || null,
      location,
      country: deriveCountry(location),
      remote: true,
      jobMode: "Remote" as const,
      url: j.url,
      source: "Remotive" as const,
      postedAt: j.publication_date || null,
      tags: j.tags || [],
      salaryMin: salaryMatch ? Number(salaryMatch[1].replace(/,/g, "")) : null,
      salaryMax: salaryMatch ? Number(salaryMatch[2].replace(/,/g, "")) : null,
      salaryCurrency: salaryMatch ? "USD" : null,
    };
  });
}

/* ---------------------------------------------------------------------- */
/* Arbeitnow — free public API (EU-heavy, no server-side search)          */
/* ---------------------------------------------------------------------- */
export async function fetchArbeitnow(query: string): Promise<Job[]> {
  const data = await safeJson(`https://www.arbeitnow.com/api/job-board-api`);
  const jobs = Array.isArray(data?.data) ? data.data : [];
  return jobs
    .filter((j: any) => isRelevant(j.title, j.tags, query))
    .map((j: any) => {
      const location = j.location || (j.remote ? "Remote" : "Not specified");
      const remote = Boolean(j.remote);
      return {
        id: `an-${j.slug}`,
        title: j.title,
        company: j.company_name,
        companyLogo: null,
        location,
        country: deriveCountry(location),
        remote,
        jobMode: deriveJobMode(location, remote),
        url: j.url,
        source: "Arbeitnow" as const,
        postedAt: j.created_at
          ? new Date(j.created_at * 1000).toISOString()
          : null,
        tags: j.tags || [],
        salaryMin: null,
        salaryMax: null,
        salaryCurrency: null,
      };
    });
}

/* ---------------------------------------------------------------------- */
/* RemoteOK — free public API                                             */
/* ---------------------------------------------------------------------- */
export async function fetchRemoteOK(query: string): Promise<Job[]> {
  const data = await safeJson(`https://remoteok.com/api`);
  const jobs = Array.isArray(data) ? data.slice(1) : []; // first item is a legal notice, not a job
  return jobs
    .filter((j: any) => isRelevant(j.position, j.tags, query))
    .map((j: any) => {
      const location = j.location || "Worldwide";
      return {
        id: `ro-${j.id}`,
        title: j.position,
        company: j.company,
        companyLogo: j.company_logo || j.logo || null,
        location,
        country: deriveCountry(location),
        remote: true,
        jobMode: "Remote" as const,
        url: j.url ? `https://remoteok.com${j.url}` : j.apply_url,
        source: "RemoteOK" as const,
        postedAt: j.date || null,
        tags: j.tags || [],
        salaryMin: j.salary_min ?? null,
        salaryMax: j.salary_max ?? null,
        salaryCurrency: j.salary_min ? "USD" : null,
      };
    });
}

/* ---------------------------------------------------------------------- */
/* Jobicy — free public API                                               */
/* ---------------------------------------------------------------------- */
export async function fetchJobicy(query: string): Promise<Job[]> {
  const data = await safeJson(
    `https://jobicy.com/api/v2/remote-jobs?count=50&tag=${encodeURIComponent(
      query
    )}`
  );
  const jobs = Array.isArray(data?.jobs) ? data.jobs : [];
  return jobs
    .filter((j: any) =>
      isRelevant(j.jobTitle, [j.jobIndustry, j.jobType].flat(), query)
    )
    .map((j: any) => {
    const location = j.jobGeo || "Worldwide";
    return {
      id: `jc-${j.id}`,
      title: j.jobTitle,
      company: j.companyName,
      companyLogo: j.companyLogo || null,
      location,
      country: deriveCountry(location),
      remote: true,
      jobMode: "Remote" as const,
      url: j.url,
      source: "Jobicy" as const,
      postedAt: j.pubDate || null,
      tags: [j.jobIndustry, j.jobType].flat().filter(Boolean),
      salaryMin: j.annualSalaryMin ?? null,
      salaryMax: j.annualSalaryMax ?? null,
      salaryCurrency: j.salaryCurrency ?? (j.annualSalaryMin ? "USD" : null),
    };
  });
}
