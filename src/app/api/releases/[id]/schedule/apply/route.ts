import { applyReleaseStages } from "@/services/releaseStages";
import {
  getReleaseById,
  updateReleaseDate,
  updateReleaseFlags,
} from "@/services/releases";

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const release = await getReleaseById(id);
  if (!release) {
    return Response.json({ error: "release not found" }, { status: 404 });
  }

  const body = (await req.json().catch(() => null)) as
    | {
        stages?: unknown;
        flags?: { INT?: boolean; PSY?: boolean; NT?: boolean };
      }
    | null;

  if (body?.flags) {
    await updateReleaseFlags(id, {
      INT: Boolean(body.flags.INT),
      PSY: Boolean(body.flags.PSY),
      NT: Boolean(body.flags.NT),
    });
  }

  const raw = body?.stages;
  if (!Array.isArray(raw) || raw.length === 0) {
    return Response.json({ error: "stages array is required" }, { status: 400 });
  }

  const stages = raw.map((item) => {
    const o = item as Record<string, unknown>;
    const stageCode = typeof o.stageCode === "string" ? o.stageCode : "";
    const titleRu = typeof o.titleRu === "string" ? o.titleRu : stageCode;
    const plannedAt =
      o.plannedAt === null
        ? null
        : typeof o.plannedAt === "string"
          ? o.plannedAt
          : null;
    const suggestedAt =
      o.suggestedAt === null || o.suggestedAt === undefined
        ? undefined
        : typeof o.suggestedAt === "string"
          ? o.suggestedAt
          : undefined;

    if (!stageCode) {
      throw new Error("invalid stageCode");
    }
    return { stageCode, titleRu, plannedAt, suggestedAt };
  });

  try {
    await applyReleaseStages({ releaseId: id, stages });

    const zniDone = stages.find((s) => s.stageCode === "ZNI_DONE");
    const relAt = zniDone?.plannedAt ?? zniDone?.suggestedAt;
    if (relAt) {
      const datePart = relAt.slice(0, 10);
      if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
        await updateReleaseDate(id, datePart);
      }
    }

    return Response.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "apply failed";
    return Response.json({ error: msg }, { status: 400 });
  }
}
