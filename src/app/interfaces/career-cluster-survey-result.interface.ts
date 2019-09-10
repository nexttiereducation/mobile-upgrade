import { ISurveyTask } from '@nte/interfaces/survey-task.interface';

interface IAnswer {
  clusters: ICluster[];
  page: number;
  subjects: ISubject[];
}

interface ICluster {
  activities: string[];
  cluster_code: string;
  name: string;
  personal_qualities: string[];
}

interface IQuestion {
  clusters: ICluster[];
  subjects: ISubject[];
}

interface IResult {
  code: string;
  title: string;
  total_points: number;
}

interface ISubject {
  cluster_code: string[];
  name: string;
}

interface ISurveyResult {
  answers: IAnswer;
  questions: IQuestion;
  results: IResult[];
  survey_name: string;
  task_id: number;
  template_source_name: string;
  user_id: number;
}

export interface ICareerClusterSurveyResult {
  archived: boolean;
  completed_on: string;
  id: number;
  status: string;
  survey_results: ISurveyResult;
  task: ISurveyTask;
}
