export interface ITask {
  achievement?: any;
  category?: string;
  created_on: string;
  custom_creator?: any;
  custom_creator_name?: string;
  deadline: string;
  deadline_final?: Date;
  deadline_late?: Date;
  description: string;
  description_override: boolean;
  description_token: string;
  effort: number;
  event_name?: string;
  get_deadline: Date[];
  guard?: string;
  high_priority: boolean;
  id: number;
  institution: number;
  institution_name: string;
  is_act: boolean;
  is_application: boolean;
  is_optional: boolean;
  is_sat: boolean;
  is_template: boolean;
  is_universal: boolean;
  is_visible: boolean;
  name: string;
  name_override: boolean;
  offset_anchor?: string;
  phase: string;
  phases: number[];
  points: number;
  position: number;
  recommended_completion: number;
  scholarship?: number;
  scholarship_name?: string;
  task_type: string;
  template_source?: any;
}
