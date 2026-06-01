import { createStack, listStacks } from "@/services/stacks";

export async function GET() {
  const items = await listStacks();
  return Response.json({ items });
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as
    | { code?: unknown; title?: unknown }
    | null;

  const code = typeof body?.code === "string" ? body.code : "";
  const title = typeof body?.title === "string" ? body.title : "";

  if (!code.trim()) {
    return Response.json({ error: "code is required" }, { status: 400 });
  }
  if (!title.trim()) {
    return Response.json({ error: "title is required" }, { status: 400 });
  }

  const item = await createStack({ code, title });
  return Response.json({ item }, { status: 201 });
}

