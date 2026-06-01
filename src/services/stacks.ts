import { query } from "@/db/query";

export type StackRow = {
  id: string;
  code: string;
  title: string;
  is_active: boolean;
  sort_order: number;
};

export type ReleaseStackRow = {
  release_id: string;
  stack_id: string;
};

export async function listStacks() {
  const res = await query<StackRow>(
    `select id, code, title, is_active, sort_order
     from stacks
     where is_active = true
     order by sort_order asc, title asc`,
  );
  return res.rows;
}

export async function createStack(input: { code: string; title: string }) {
  const res = await query<StackRow>(
    `insert into stacks (code, title)
     values ($1, $2)
     on conflict (code) do update set title = excluded.title
     returning id, code, title, is_active, sort_order`,
    [input.code.trim(), input.title.trim()],
  );
  return res.rows[0]!;
}

export async function listReleaseStackIds(releaseId: string) {
  const res = await query<ReleaseStackRow>(
    `select release_id, stack_id
     from release_stacks
     where release_id = $1`,
    [releaseId],
  );
  return res.rows.map((r) => r.stack_id);
}

export async function setReleaseStacks(input: {
  releaseId: string;
  stackIds: string[];
}) {
  await query(`delete from release_stacks where release_id = $1`, [
    input.releaseId,
  ]);

  if (input.stackIds.length === 0) return;

  await query(
    `insert into release_stacks (release_id, stack_id)
     select $1::uuid, s::uuid
     from unnest($2::uuid[]) as s
     on conflict (release_id, stack_id) do nothing`,
    [input.releaseId, input.stackIds],
  );
}

