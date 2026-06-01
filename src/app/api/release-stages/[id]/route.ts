import { updateReleaseStage } from "@/services/releaseStages";

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const body = (await req.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;

  const patch: {
    plannedAt?: string | null;
    suggestedAt?: string | null;
    status?: "planned" | "done" | "blocked" | "skipped";
    actualAt?: string | null;
    delayReason?: string | null;
  } = {};

  if ("plannedAt" in (body ?? {})) {
    patch.plannedAt =
      body?.plannedAt === null
        ? null
        : typeof body?.plannedAt === "string"
          ? body.plannedAt
          : undefined;
  }
  if ("status" in (body ?? {})) {
    const v = body?.status;
    if (v === "planned" || v === "done" || v === "blocked" || v === "skipped") {
      patch.status = v;
    } else {
      return Response.json({ error: "invalid status" }, { status: 400 });
    }
  }
  if ("actualAt" in (body ?? {})) {
    patch.actualAt =
      body?.actualAt === null
        ? null
        : typeof body?.actualAt === "string"
          ? body.actualAt
          : undefined;
  }
  if ("delayReason" in (body ?? {})) {
    patch.delayReason =
      body?.delayReason === null
        ? null
        : typeof body?.delayReason === "string"
          ? body.delayReason.trim() || null
          : null;
  }

  if (patch.status === "blocked" && !patch.delayReason) {
    return Response.json(
      { error: "delayReason is required when status is blocked" },
      { status: 400 },
    );
  }

  const updated = await updateReleaseStage(id, patch);
  if (!updated) {
    return Response.json({ error: "not found" }, { status: 404 });
  }
  return Response.json({ ok: true });
}
