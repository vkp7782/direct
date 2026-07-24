export type JobSource =
  | "Greenhouse"
  | "Lever"
  | "Remotive"
  | "Arbeitnow"
  | "RemoteOK"
  | "Jobicy";

export type JobMode = "Remote" | "Hybrid" | "Onsite" | "Unknown";

export interface Job {
  id: string;
  title: string;
  company: string;
  companyLogo?: string | null;
  location: string;
  country: string | null; // best-effort, parsed from location text
  remote: boolean;
  jobMode: JobMode;
  url: string; // direct link to the original posting on the company's career page
  source: JobSource;
  postedAt?: string | null; // ISO date if available
  tags?: string[];
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryCurrency?: string | null;
}

export interface JobSearchResult {
  query: string;
  count: number;
  jobs: Job[];
  sourceErrors: { source: string; message: string }[];
}
