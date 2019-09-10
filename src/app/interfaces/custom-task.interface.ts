import { INote } from '@nte/interfaces/note.interface';

export interface ICustomTaskDetail {
  achievement: any;
  archived: boolean;
  // attachment: string;
  category: any;
  connected_task: any;
  created_on: string;
  custom_creator: number;
  deadline: any;
  deadline_final: any;
  deadline_guard: any;
  deadline_late: any;
  description: string;
  description_override: boolean;
  description_token: string;
  effort: number;
  event_name: any;
  get_deadline: string;
  guard: any;
  high_priority: boolean;
  id: number;
  institution: any;
  institution_name: any;
  is_act: boolean;
  is_application: boolean;
  is_optional: boolean;
  is_sat: boolean;
  is_template: boolean;
  is_universal: boolean;
  is_visible: boolean;
  name: string;
  name_override: boolean;
  // note_count: number;
  offset_anchor: any;
  phase: string;
  phases: number[];
  points: number;
  position: number;
  recommended_completion: number;
  start_date: string;
  task_type: string;
  template_source: any;
  unit_id: any;
}

export interface ICustomTask {
  active: boolean;
  activeAction?: number; // used for details of counselor task page
  assigned_colleges: any[];
  assigned_groups: any[];
  assigned_students: any[];
  custom_attachments: ICustomAttachment[];
  discrete: boolean;
  id: number;
  isExpanded: boolean;
  notes: INote[];
  results: any;
  selectedAssignIndex?: number; // used for assign panel of counselor task page
  specifically_assigned_students: any[];
  task: ICustomTaskDetail;
}

interface ICustomAttachment {
  file: string;
  file_name: string;
  id: number;
  stakeholder: number;
  stakeholder_full_name: string;
}
