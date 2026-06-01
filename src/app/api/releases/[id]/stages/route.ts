import { STAGE_DEFINITIONS } from "@/config/scheduling";
import { listReleaseStages } from "@/services/releaseStages";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const items = await listReleaseStages(id);
  const order = STAGE_DEFINITIONS.map((d) => d.stageCode);
  items.sort(
    (a, b) => order.indexOf(a.stage_code) - order.indexOf(b.stage_code),
  );
  return Response.json({ items });
}
