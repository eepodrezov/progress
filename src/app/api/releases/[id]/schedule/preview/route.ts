import { previewSchedule } from "@/services/scheduleApi";
import { getReleaseById, updateReleaseFlags } from "@/services/releases";
import type { SchedulingMode } from "@/services/scheduling/types";

function parseFlags(body: Record<string, unknown> | null) {
  const f = body?.flags;
  if (!f || typeof f !== "object") return { INT: false, PSY: false, NT: false };
  const o = f as Record<string, unknown>;
  return {
    INT: Boolean(o.INT),
    PSY: Boolean(o.PSY),
    NT: Boolean(o.NT),
  };
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const release = await getReleaseById(id);
  if (!release) {
    return Response.json({ error: "release not found" }, { status: 404 });
  }

  const body = (await req.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;

  const mode = body?.mode as SchedulingMode | undefined;
  if (mode !== "fromFF" && mode !== "fromREL") {
    return Response.json({ error: "mode must be fromFF or fromREL" }, { status: 400 });
  }

  const flags = parseFlags(body);
  await updateReleaseFlags(id, flags);

  try {
    const result = previewSchedule({
      mode,
      flags,
      ffStartAt:
        typeof body?.ffStartAt === "string" ? body.ffStartAt : undefined,
      releaseWindowStartAt:
        typeof body?.releaseWindowStartAt === "string"
          ? body.releaseWindowStartAt
          : undefined,
      releaseWindowEndAt:
        typeof body?.releaseWindowEndAt === "string"
          ? body.releaseWindowEndAt
          : undefined,
    });
    return Response.json(result);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "calculation failed";
    return Response.json({ error: msg }, { status: 400 });
  }
}
