import { query } from "@/db/query";

export type ReleaseStatus = "draft" | "active" | "done" | "cancelled";

export type ReleaseRow = {
  id: string;
  key: string;
  title: string;
  release_date: string | null; // YYYY-MM-DD, задаётся при планировании
  status: ReleaseStatus;
  flag_int: boolean;
  flag_psy: boolean;
  flag_nt: boolean;
  created_at: string;
};

export async function listReleases(): Promise<ReleaseRow[]> {
  const res = await query<ReleaseRow>(
    `select id, key, title, release_date::text, status,
            flag_int, flag_psy, flag_nt, created_at
     from releases
     order by created_at desc`,
  );
  return res.rows;
}

export async function getReleaseById(id: string): Promise<ReleaseRow | null> {
  const res = await query<ReleaseRow>(
    `select id, key, title, release_date::text, status,
            flag_int, flag_psy, flag_nt, created_at
     from releases
     where id = $1`,
    [id],
  );
  return res.rows[0] ?? null;
}

export async function createRelease(input: {
  key: string;
  title: string;
}): Promise<ReleaseRow> {
  const res = await query<ReleaseRow>(
    `insert into releases (key, title, release_date)
     values ($1, $2, null)
     returning id, key, title, release_date::text, status,
               flag_int, flag_psy, flag_nt, created_at`,
    [input.key.trim(), input.title.trim()],
  );
  return res.rows[0]!;
}

export async function updateReleaseDate(id: string, releaseDate: string) {
  const res = await query<ReleaseRow>(
    `update releases set release_date = $2::date where id = $1
     returning id, key, title, release_date::text, status,
               flag_int, flag_psy, flag_nt, created_at`,
    [id, releaseDate],
  );
  return res.rows[0] ?? null;
}

export async function updateReleaseFlags(
  id: string,
  flags: { INT: boolean; PSY: boolean; NT: boolean },
) {
  const res = await query<ReleaseRow>(
    `update releases
     set flag_int = $2, flag_psy = $3, flag_nt = $4
     where id = $1
     returning id, key, title, release_date::text, status,
               flag_int, flag_psy, flag_nt, created_at`,
    [id, flags.INT, flags.PSY, flags.NT],
  );
  return res.rows[0] ?? null;
}

export async function listReleasesForStatusReport(): Promise<ReleaseRow[]> {
  const res = await query<ReleaseRow>(
    `select id, key, title, release_date::text, status,
            flag_int, flag_psy, flag_nt, created_at
     from releases
     where status not in ('done', 'cancelled')
     order by release_date asc nulls last, title asc`,
  );
  return res.rows;
}

