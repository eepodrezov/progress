import { query } from "@/db/query";

export type MilestoneTemplateRow = {
  id: string;
  code: string;
  title: string;
  default_offset_workdays: number;
  is_default_selected: boolean;
  sort_order: number;
};

export async function listMilestoneTemplates(): Promise<MilestoneTemplateRow[]> {
  const res = await query<MilestoneTemplateRow>(
    `select id, code, title, default_offset_workdays, is_default_selected, sort_order
     from milestone_templates
     order by sort_order asc, title asc`,
  );
  return res.rows;
}

