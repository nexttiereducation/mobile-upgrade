import { ISelectable } from '@nte/interfaces/global.interface';

export interface IStudentApplication extends ISelectable {
  act_progress: ITestProgress;
  application_task_count: string;
  css_progress: ITaskItem;
  fafsa_progress: ITaskItem;
  full_name: string;
  id: number;
  letters_progress: ITaskItem;
  object_id: number;
  sat_progress: ITestProgress;
  showDropDowns?: boolean;
  stakeholder_photo_url: string;
}

export interface IApplication extends ISelectable {
  application_decision: ITaskItem;
  application_method: IApplicationMethod;
  application_task: ITaskItem;
  application_type: string;
  deadline: string;
  letters_task: ITaskItem;
  name: string;
  object_id: number;
  test_policy: string;
  testing_task: ITaskItem;
  transcript_task: ITaskItem;
}

export interface IApplicationMethod {
  id: number;
  logo_url: string;
  name: string;
}

export interface ITestProgress {
  status: string;
  task_name: string;
}

export interface ITaskItem {
  status: string;
  task_name: string;
  task_tracker_id: number;
}

export interface ITestProgress {
  status: string;
  task_name: string;
}

export interface ICollegeApplication {
  application_count: number;
  id: number;
  name: string;
  photo_url: string;
  upcoming_deadline: string;
}
