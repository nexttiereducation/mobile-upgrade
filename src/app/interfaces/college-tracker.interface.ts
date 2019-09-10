import { ICollegeItem } from '@nte/interfaces/college.interface';
import { INameable } from '@nte/interfaces/global.interface';

export interface ICollegeTracker {
  application_group: INameable;
  application_method: string;
  application_type: number;
  decision: string;
  deferred?: boolean;
  due_date: string;
  id?: number;
  institution: number; // id
  institution_name: string;
  isDeleted?: boolean;
  percentage_of_completed_tasks: number;
  photo_url: string;
  selectedOption?: any;
  waitlisted?: boolean;
}

export interface ICollegeTrackerItem {
  created_on: string;
  id: number;
  institution: ICollegeItem;
  updated_on: string;
}
