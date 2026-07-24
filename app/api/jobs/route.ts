import { NextRequest, NextResponse } from "next/server";
import { searchJobs } from "@/lib/fetchJobs";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const role = req.nextUrl.searchParams.get("role")?.trim();

  if (!role) {
    return NextResponse.json(
      { error: "Query param 'role' is required, e.g. /api/jobs?role=designer" },
      { status: 400 }
    );
  }

  try {
    const result = await searchJobs(role);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: "Something went wrong while searching for jobs." },
      { status: 500 }
    );
  }
}
