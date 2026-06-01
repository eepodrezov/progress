import { listReleaseStackIds, setReleaseStacks } from "@/services/stacks";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const stackIds = await listReleaseStackIds(id);
  return Response.json({ stackIds });
}

export async function PUT(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const body = (await req.json().catch(() => null)) as
    | { stackIds?: unknown }
    | null;

  const stackIds = Array.isArray(body?.stackIds)
    ? body?.stackIds.filter((x) => typeof x === "string")
    : [];

  await setReleaseStacks({ releaseId: id, stackIds });
  return Response.json({ ok: true });
}

