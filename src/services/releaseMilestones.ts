import { query } from "@/db/query";

export type ReleaseMilestoneRow = {
  id: string;
  release_id: string;
  template_id: string;
  planned_at: string | null;
  status: "planned" | "done" | "blocked" | "skipped";
  actual_at: string | null;
  delay_reason: string | null;
  template_code: string;
  template_title: string;
  template_sort_order: number;
};

export async function listReleaseMilestones(releaseId: string) {
  const res = await query<ReleaseMilestoneRow>(
    `select
        rm.id,
        rm.release_id,
        rm.template_id,
        rm.planned_at::timestamptz::text as planned_at,
        rm.status,
        rm.actual_at::timestamptz::text as actual_at,
        rm.delay_reason,
        mt.code as template_code,
        mt.title as template_title,
        mt.sort_order as template_sort_order
     from release_milestones rm
     join milestone_templates mt on mt.id = rm.template_id
     where rm.release_id = $1
     order by mt.sort_order asc, mt.title asc`,
    [releaseId],
  );
  return res.rows;
}

export async function initReleaseMilestones(input: {
  releaseId: string;
  templateIds?: string[];
}) {
  const templateIds = input.templateIds;
  if (templateIds && templateIds.length > 0) {
    await query(
      `insert into release_milestones (release_id, template_id)
       select $1::uuid, t::uuid
       from unnest($2::uuid[]) as t
       on conflict (release_id, template_id) do nothing`,
      [input.releaseId, templateIds],
    );
    return;
  }

  // "по умолчанию выбраны все": берем справочник, где is_default_selected = true
  await query(
    `insert into release_milestones (release_id, template_id)
     select $1::uuid, mt.id
     from milestone_templates mt
     where mt.is_default_selected = true
     on conflict (release_id, template_id) do nothing`,
    [input.releaseId],
  );
}

export async function updateReleaseMilestone(
  id: string,
  patch: {
    plannedAt?: string | null; // ISO datetime or null
    status?: "planned" | "done" | "blocked" | "skipped";
    actualAt?: string | null; // ISO datetime or null
    delayReason?: string | null;
  },
) {
  const fields: string[] = [];
  const values: unknown[] = [];

  const set = (sql: string, v: unknown) => {
    values.push(v);
    fields.push(`${sql} = $${values.length}`);
  };

  if ("plannedAt" in patch) set("planned_at", patch.plannedAt);
  if ("status" in patch) set("status", patch.status);
  if ("actualAt" in patch) set("actual_at", patch.actualAt);
  if ("delayReason" in patch) set("delay_reason", patch.delayReason);

  if (fields.length === 0) {
    return null;
  }

  values.push(id);
  const res = await query(
    `update release_milestones
     set ${fields.join(", ")}
     where id = $${values.length}
     returning id`,
    values,
  );
  return res.rows[0] ?? null;
}

