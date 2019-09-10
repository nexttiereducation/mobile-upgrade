import { ISurveyResult } from '@nte/interfaces/survey-result.interface';
import { ISurveyTask } from '@nte/interfaces/survey-task.interface';

export interface IPhspSurveyResult {
  archived: boolean;
  completed_on: string;
  id: number;
  status: string;
  survey_results: ISurveyResult;
  task: ISurveyTask;
}
