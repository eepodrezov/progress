import { generateStatusMessage } from "@/services/reports/buildStatusMessage";

export async function GET() {
  try {
    const result = await generateStatusMessage();
    return Response.json(result);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "report failed";
    return Response.json({ error: msg }, { status: 500 });
  }
}
