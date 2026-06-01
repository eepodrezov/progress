import { deleteReleaseTask } from "@/services/tasks";

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const deleted = await deleteReleaseTask(id);
  if (!deleted) {
    return Response.json({ error: "not found" }, { status: 404 });
  }
  return Response.json({ ok: true });
}

