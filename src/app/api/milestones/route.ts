import { listMilestoneTemplates } from "@/services/milestones";

export async function GET() {
  const items = await listMilestoneTemplates();
  return Response.json({ items });
}

