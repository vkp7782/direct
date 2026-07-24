import { Job } from "@/types/job";

const SOURCE_STYLE: Record<Job["source"], string> = {
  Greenhouse: "text-signal-dark border-signal-dark/40",
  Lever: "text-navy border-navy/40",
  Remotive: "text-amber border-amber/40",
  Arbeitnow: "text-navy border-navy/40",
  RemoteOK: "text-amber border-amber/40",
  Jobicy: "text-signal-dark border-signal-dark/40",
};

function timeAgo(iso?: string | null) {
  if (!iso) return null;
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return null;
  const days = Math.floor((Date.now() - then) / (1000 * 60 * 60 * 24));
  if (days <= 0) return "today";
  if (days === 1) return "1 day ago";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  return `${months} mo ago`;
}

function formatSalary(job: Job) {
  if (!job.salaryMin && !job.salaryMax) return null;
  const currency = job.salaryCurrency || "USD";
  const fmt = (n: number) =>
    n >= 1000 ? `${Math.round(n / 1000)}k` : String(n);
  if (job.salaryMin && job.salaryMax) {
    return `${currency} ${fmt(job.salaryMin)}\u2013${fmt(job.salaryMax)}`;
  }
  return `${currency} ${fmt((job.salaryMin || job.salaryMax) as number)}+`;
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

export default function JobCard({ job, index }: { job: Job; index: number }) {
  const posted = timeAgo(job.postedAt);
  const salary = formatSalary(job);

  return (
    <li className="border-b border-line last:border-b-0">
      <div className="flex flex-col gap-4 px-4 py-4 transition-colors hover:bg-paper sm:flex-row sm:items-start sm:gap-5 sm:px-5 sm:py-5">
        {/* Avatar / index */}
        <div className="flex items-center gap-3 sm:block sm:pt-0.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line bg-paper font-mono text-[11px] text-ink-soft">
            {initials(job.company) || "•"}
          </div>
          <span className="font-mono text-xs text-ink-soft/60 sm:hidden">
            {String(index + 1).padStart(3, "0")}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={`rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${SOURCE_STYLE[job.source]}`}
              title={`Sourced from ${job.source}`}
            >
              {job.source}
            </span>
            <span className="rounded-full border border-line-strong px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-ink-soft">
              {job.jobMode}
            </span>
            {salary && (
              <span className="rounded-full border border-signal-dark/30 px-2 py-0.5 font-mono text-[10px] text-signal-dark">
                {salary}
              </span>
            )}
            {posted && (
              <span className="font-mono text-[10px] text-ink-soft/70">
                {posted}
              </span>
            )}
          </div>

          <h3 className="mt-1.5 font-display text-base leading-snug text-ink sm:text-lg">
            {job.title}
          </h3>
          <p className="mt-0.5 truncate text-sm text-ink-soft">
            {job.company} <span className="mx-1.5 text-line-strong">·</span>
            {job.location}
          </p>
        </div>

        <a
          href={job.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-full shrink-0 items-center justify-center gap-1.5 rounded-full bg-signal px-4 py-2.5 text-sm font-medium text-paper-raised transition-colors hover:bg-signal-dark sm:w-auto sm:self-center"
        >
          Apply
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            aria-hidden="true"
            className="translate-y-[0.5px]"
          >
            <path
              d="M2.5 9.5L9.5 2.5M9.5 2.5H4M9.5 2.5V8"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </a>
      </div>
    </li>
  );
}
