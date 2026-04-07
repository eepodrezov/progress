import { createRelease, listReleases } from "@/services/releases";

export async function GET() {
  const items = await listReleases();
  return Response.json({ items });
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as
    | { key?: unknown; title?: unknown; releaseDate?: unknown }
    | null;

  const key = typeof body?.key === "string" ? body.key : "";
  const title = typeof body?.title === "string" ? body.title : "";
  const releaseDate =
    typeof body?.releaseDate === "string" ? body.releaseDate : "";

  if (!key.trim()) {
    return Response.json({ error: "key is required" }, { status: 400 });
  }
  if (!title.trim()) {
    return Response.json({ error: "title is required" }, { status: 400 });
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(releaseDate)) {
    return Response.json(
      { error: "releaseDate must be YYYY-MM-DD" },
      { status: 400 },
    );
  }

  const created = await createRelease({ key, title, releaseDate });
  return Response.json({ item: created }, { status: 201 });
}

