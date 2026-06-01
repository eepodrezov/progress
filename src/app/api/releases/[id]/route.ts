import { getReleaseById } from "@/services/releases";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const item = await getReleaseById(id);
  if (!item) {
    return Response.json({ error: "not found" }, { status: 404 });
  }
  return Response.json({ item });
}

