import { query } from "@/db/query";

export type ReleaseStageRow = {
  id: string;
  release_id: string;
  stage_code: string;
  title_ru: string;
  suggested_at: string | null;
  planned_at: string | null;
  status: "planned" | "done" | "blocked" | "skipped";
  actual_at: string | null;
  delay_reason: string | null;
};

export async function listReleaseStages(releaseId: string) {
  const res = await query<ReleaseStageRow>(
    `select
        id,
        release_id,
        stage_code,
        title_ru,
        suggested_at::timestamptz::text as suggested_at,
        planned_at::timestamptz::text as planned_at,
        status,
        actual_at::timestamptz::text as actual_at,
        delay_reason
     from release_stages
     where release_id = $1
     order by created_at asc`,
    [releaseId],
  );
  return res.rows;
}

export async function listStagesForReleaseIds(releaseIds: string[]) {
  if (releaseIds.length === 0) return [];
  const res = await query<ReleaseStageRow>(
    `select
        id,
        release_id,
        stage_code,
        title_ru,
        suggested_at::timestamptz::text as suggested_at,
        planned_at::timestamptz::text as planned_at,
        status,
        actual_at::timestamptz::text as actual_at,
        delay_reason
     from release_stages
     where release_id = any($1::uuid[])
     order by release_id, created_at asc`,
    [releaseIds],
  );
  return res.rows;
}

export type StageApplyItem = {
  stageCode: string;
  titleRu: string;
  suggestedAt?: string | null;
  plannedAt: string | null;
};

export async function applyReleaseStages(input: {
  releaseId: string;
  stages: StageApplyItem[];
}) {
  for (const s of input.stages) {
    await query(
      `insert into release_stages (
          release_id, stage_code, title_ru, suggested_at, planned_at
        )
       values ($1, $2, $3, $4::timestamptz, $5::timestamptz)
       on conflict (release_id, stage_code) do update set
         title_ru = excluded.title_ru,
         suggested_at = coalesce(excluded.suggested_at, release_stages.suggested_at),
         planned_at = excluded.planned_at`,
      [
        input.releaseId,
        s.stageCode,
        s.titleRu,
        s.suggestedAt ?? null,
        s.plannedAt,
      ],
    );
  }
}

export async function updateReleaseStage(
  id: string,
  patch: {
    plannedAt?: string | null;
    suggestedAt?: string | null;
    status?: "planned" | "done" | "blocked" | "skipped";
    actualAt?: string | null;
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
  if ("suggestedAt" in patch) set("suggested_at", patch.suggestedAt);
  if ("status" in patch) set("status", patch.status);
  if ("actualAt" in patch) set("actual_at", patch.actualAt);
  if ("delayReason" in patch) set("delay_reason", patch.delayReason);

  if (fields.length === 0) return null;

  values.push(id);
  const res = await query(
    `update release_stages set ${fields.join(", ")} where id = $${values.length} returning id`,
    values,
  );
  return res.rows[0] ?? null;
}
