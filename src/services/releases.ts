import { query } from "@/db/query";

export type ReleaseRow = {
  id: string;
  key: string;
  title: string;
  release_date: string; // date in ISO (YYYY-MM-DD)
  created_at: string;
};

export async function listReleases(): Promise<ReleaseRow[]> {
  const res = await query<ReleaseRow>(
    `select id, key, title, release_date::text, created_at
     from releases
     order by created_at desc`,
  );
  return res.rows;
}

export async function getReleaseById(id: string): Promise<ReleaseRow | null> {
  const res = await query<ReleaseRow>(
    `select id, key, title, release_date::text, created_at
     from releases
     where id = $1`,
    [id],
  );
  return res.rows[0] ?? null;
}

export async function createRelease(input: {
  key: string;
  title: string;
  releaseDate: string; // YYYY-MM-DD
}): Promise<ReleaseRow> {
  const res = await query<ReleaseRow>(
    `insert into releases (key, title, release_date)
     values ($1, $2, $3::date)
     returning id, key, title, release_date::text, created_at`,
    [input.key.trim(), input.title.trim(), input.releaseDate],
  );
  return res.rows[0]!;
}

