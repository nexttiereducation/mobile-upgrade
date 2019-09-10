import { ITitleable } from './global.interface';

export interface ICareer {
  cluster: ITitleable;
  detailed_work_activities: IListItem[];
  id: number;
  interest_code: string;
  is_bright_outlook: boolean;
  is_green_economy: boolean;
  pathway: ITitleable;
  tasks: IListItem[];
  title: string;
}

export interface ICareerDetail {
  abilities: IListItem[];
  cluster: ITitleable;
  description: string;
  detailed_work_activities: string[];
  education: IDonutChartData[];
  employment_data: IEmploymentData;
  id: number;
  interest_code: string;
  interests: IInterest[];
  is_bright_outlook: boolean;
  is_green_economy: boolean;
  isBookmarked: boolean;
  job_zone: IJobZone;
  knowledge: IListItem[];
  majors: IRelatedMajor[];
  national_wages_data: IWage;
  pathway: ITitleable;
  related_occupations: ITitleable[];
  skills: IListItem[];
  state_wages_data: IWage[];
  tasks: IListItem[];
  technology: ITitleable[];
  title: string;
  tools: ITitleable[];
  work_activities: IListItem[];
  work_context: IListItem[];
  work_styles: IListItem[];
  work_values: IListItem[];
}

export interface IDonutChartData {
  element_name: string;
  percentage_responded: number;
}

export interface IEmploymentData {
  career: number;
  currently_employed: number;
  employment_growth_projection_percentage: number;
  projected_annual_job_openings: number;
  projected_employed: number;
}

export interface IInterest {
  description: string;
  name: string;
  percentage: number;
}

export interface IJobZone {
  education: string;
  job_training: string;
  related_experience: string;
  zone: number;
  zone_description: string;
}

export interface IListItem {
  description: string;
  relevance: number;
  title: string;
}

export interface IRelatedMajor {
  cip_code: string;
  id: number;
  title: string;
}

export interface ISavedCareer {
  archived: boolean;
  created_on: string;
  detail: ICareer;
  id: number;
  status: string;
  student: number;
  type: string;
  updated_on: string;
}

export interface IWage {
  annual_salary_range: IWageRange;
  average_annual_salary: number;
  average_hourly_wage: number;
  career: number;
  hourly_wage_range: IWageRange;
  state?: string;
}

export interface IWageRange {
  fifty_percent: number;
  ninety_percent: number;
  seventy_five_percent: number;
  ten_percent: number;
  twenty_five_percent: number;
}
