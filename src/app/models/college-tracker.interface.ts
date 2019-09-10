import { INameable } from './global.interface';

export interface ICollegeTracker {
  application_group: INameable;
  application_method: string;
  application_type: number;
  decision: string;
  deferred?: boolean;
  due_date: string;
  institution: number;
  institution_name: string;
  isDeleted?: boolean;
  percentage_of_completed_tasks: number;
  photo_url: string;
  selectedOption?: any;
  waitlisted?: boolean;
}
