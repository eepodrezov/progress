import { query } from "@/db/query";

export type ReleaseTaskRow = {
  id: string;
  release_id: string;
  title: string;
  hours: string; // numeric comes as string from pg
  created_at: string;
};

export async function listReleaseTasks(releaseId: string) {
  const res = await query<ReleaseTaskRow>(
    `select id, release_id, title, hours::text, created_at
     from release_tasks
     where release_id = $1
     order by created_at asc`,
    [releaseId],
  );
  return res.rows;
}

export async function createReleaseTask(input: {
  releaseId: string;
  title: string;
  hours: number;
}) {
  const res = await query<ReleaseTaskRow>(
    `insert into release_tasks (release_id, title, hours)
     values ($1, $2, $3::numeric)
     returning id, release_id, title, hours::text, created_at`,
    [input.releaseId, input.title.trim(), input.hours],
  );
  return res.rows[0]!;
}

export async function deleteReleaseTask(id: string) {
  const res = await query<{ id: string }>(
    `delete from release_tasks where id = $1 returning id`,
    [id],
  );
  return res.rows[0] ?? null;
}

