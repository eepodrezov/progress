import { initReleaseMilestones } from "@/services/releaseMilestones";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as
    | { releaseId?: unknown; templateIds?: unknown }
    | null;

  const releaseId = typeof body?.releaseId === "string" ? body.releaseId : "";
  const templateIds = Array.isArray(body?.templateIds)
    ? body?.templateIds.filter((x) => typeof x === "string")
    : undefined;

  if (!releaseId) {
    return Response.json({ error: "releaseId is required" }, { status: 400 });
  }

  await initReleaseMilestones({ releaseId, templateIds });
  return Response.json({ ok: true });
}

