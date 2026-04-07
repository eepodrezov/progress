import { listReleaseMilestones } from "@/services/releaseMilestones";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ releaseId: string }> },
) {
  const { releaseId } = await ctx.params;
  const items = await listReleaseMilestones(releaseId);
  return Response.json({ items });
}

