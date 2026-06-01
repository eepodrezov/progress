import { createReleaseTask, listReleaseTasks } from "@/services/tasks";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const items = await listReleaseTasks(id);
  return Response.json({ items });
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const body = (await req.json().catch(() => null)) as
    | { title?: unknown; hours?: unknown }
    | null;

  const title = typeof body?.title === "string" ? body.title : "";
  const hoursNum =
    typeof body?.hours === "number"
      ? body.hours
      : typeof body?.hours === "string"
        ? Number(body.hours)
        : NaN;

  if (!title.trim()) {
    return Response.json({ error: "title is required" }, { status: 400 });
  }
  if (!Number.isFinite(hoursNum) || hoursNum < 0) {
    return Response.json({ error: "hours must be >= 0" }, { status: 400 });
  }

  const item = await createReleaseTask({ releaseId: id, title, hours: hoursNum });
  return Response.json({ item }, { status: 201 });
}

