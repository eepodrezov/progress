import { query } from "@/db/query";

export async function GET() {
  await query("select 1 as ok");
  return Response.json({ ok: true });
}

