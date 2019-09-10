import { ICollege } from './college.interface';
import { INameable, ISelectable, ITitleable } from './global.interface';
import { IResult } from './interest-profiler.models';

export interface IStudent extends ISelectable {
  active_task_count: number;
  careers: ITitleable[];
  email: string;
  full_name: string;
  gpa: string;
  graduation_year: number;
  id: number;
  institition: string;
  institutions: ICollege[];
  institutions_followed_count: number;
  interest_profiler_result: IResult[];
  last_name: string;
  meta: any;
  percentage_of_completed_tasks: number;
  phase: string;
  photo_url: string;
  potential_majors: INameable[];
  profile_photo: string;
  recommended_institutions: ICollege[];
  tags: INameable[];
  task_completed_count: number;
}
