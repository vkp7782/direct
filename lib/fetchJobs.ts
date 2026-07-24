import { Job, JobSearchResult } from "@/types/job";
import {
  fetchArbeitnow,
  fetchGreenhouse,
  fetchJobicy,
  fetchLever,
  fetchRemoteOK,
  fetchRemotive,
} from "./sources";

const SOURCES: { name: string; run: (q: string) => Promise<Job[]> }[] = [
  { name: "Greenhouse", run: fetchGreenhouse },
  { name: "Lever", run: fetchLever },
  { name: "Remotive", run: fetchRemotive },
  { name: "Arbeitnow", run: fetchArbeitnow },
  { name: "RemoteOK", run: fetchRemoteOK },
  { name: "Jobicy", run: fetchJobicy },
];

function dedupe(jobs: Job[]): Job[] {
  const seen = new Set<string>();
  const out: Job[] = [];
  for (const job of jobs) {
    const key = `${job.title.toLowerCase().trim()}|${job.company
      .toLowerCase()
      .trim()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(job);
  }
  return out;
}

export async function searchJobs(query: string): Promise<JobSearchResult> {
  const settled = await Promise.allSettled(
    SOURCES.map((s) => s.run(query))
  );

  const jobs: Job[] = [];
  const sourceErrors: { source: string; message: string }[] = [];

  settled.forEach((result, i) => {
    if (result.status === "fulfilled") {
      jobs.push(...result.value);
    } else {
      sourceErrors.push({
        source: SOURCES[i].name,
        message:
          result.reason instanceof Error
            ? result.reason.message
            : String(result.reason),
      });
    }
  });

  const deduped = dedupe(jobs).sort((a, b) => {
    const da = a.postedAt ? new Date(a.postedAt).getTime() : 0;
    const db = b.postedAt ? new Date(b.postedAt).getTime() : 0;
    return db - da;
  });

  return { query, count: deduped.length, jobs: deduped, sourceErrors };
}
