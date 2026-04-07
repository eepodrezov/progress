import { updateReleaseMilestone } from "@/services/releaseMilestones";

function isIsoDateTime(s: string) {
  // very light validation for "YYYY-MM-DDTHH:mm" / "YYYY-MM-DDTHH:mm:ss" (optionally with timezone)
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?/.test(s);
}

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;

  const body = (await req.json().catch(() => null)) as
    | {
        plannedAt?: unknown;
        status?: unknown;
        actualAt?: unknown;
        delayReason?: unknown;
      }
    | null;

  const patch: {
    plannedAt?: string | null;
    status?: "planned" | "done" | "blocked" | "skipped";
    actualAt?: string | null;
    delayReason?: string | null;
  } = {};

  if ("plannedAt" in (body ?? {})) {
    if (body?.plannedAt === null) patch.plannedAt = null;
    else if (typeof body?.plannedAt === "string" && isIsoDateTime(body.plannedAt))
      patch.plannedAt = body.plannedAt;
    else
      return Response.json(
        { error: "plannedAt must be ISO datetime or null" },
        { status: 400 },
      );
  }

  if ("actualAt" in (body ?? {})) {
    if (body?.actualAt === null) patch.actualAt = null;
    else if (typeof body?.actualAt === "string" && isIsoDateTime(body.actualAt))
      patch.actualAt = body.actualAt;
    else
      return Response.json(
        { error: "actualAt must be ISO datetime or null" },
        { status: 400 },
      );
  }

  if ("status" in (body ?? {})) {
    const v = body?.status;
    if (v === "planned" || v === "done" || v === "blocked" || v === "skipped") {
      patch.status = v;
    } else {
      return Response.json({ error: "invalid status" }, { status: 400 });
    }
  }

  if ("delayReason" in (body ?? {})) {
    if (body?.delayReason === null) patch.delayReason = null;
    else if (typeof body?.delayReason === "string")
      patch.delayReason = body.delayReason.trim() || null;
    else
      return Response.json(
        { error: "delayReason must be string or null" },
        { status: 400 },
      );
  }

  if (patch.status === "blocked" && !patch.delayReason) {
    return Response.json(
      { error: "delayReason is required when status is blocked" },
      { status: 400 },
    );
  }

  const updated = await updateReleaseMilestone(id, patch);
  if (!updated) {
    return Response.json({ error: "not found" }, { status: 404 });
  }
  return Response.json({ ok: true });
}

